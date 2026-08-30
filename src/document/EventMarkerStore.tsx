import { Instance, getEnv, getParent, isAlive, types } from "mobx-state-tree";
import {
  EventMarker,
  EventMarkerData,
  WaypointUUID
} from "./schema/DocumentTypes";
import { CommandStore, CommandType } from "./CommandStore";
import { WaypointScope } from "./ConstraintStore";
import { Env, EnvConstructors } from "./DocumentManager";
import { ExpressionStore } from "./ExpressionStore";
import { IChoreoTrajectoryStore } from "./path/ChoreoTrajectoryStore";
import { IHolonomicPathStore } from "./path/HolonomicPathStore";
import {
  findUUIDIndex,
  getByWaypointID,
  savedWaypointIdToWaypointId,
  waypointIdToSavedWaypointId
} from "./path/utils";

function markMatchingWaitAsStay(
  command: Instance<typeof CommandStore>,
  durationSeconds: number
) {
  const waits: Array<Instance<typeof CommandStore>> = [];
  const visit = (candidate: Instance<typeof CommandStore>) => {
    if (candidate.type === "wait") waits.push(candidate);
    candidate.commands.forEach(visit);
  };
  visit(command);
  const matching =
    waits.find(
      (wait) => Math.abs(Math.abs(wait.time.value) - durationSeconds) < 0.001
    ) ?? waits[0];
  matching?.setType("stay");
}

function findStayCommand(
  command: Instance<typeof CommandStore>
): Instance<typeof CommandStore> | undefined {
  if (command.isStay) return command;
  for (const child of command.commands) {
    const stay = findStayCommand(child);
    if (stay !== undefined) return stay;
  }
  return undefined;
}

// When adding new fields, consult
// https://choreo.autos/contributing/schema-upgrade/
// to see all the places that change with every schema upgrade.
export const EventMarkerDataStore = types
  .model("EventMarkerData", {
    target: types.maybe(WaypointScope),
    targetTimestamp: types.maybe(types.number),
    offset: ExpressionStore,
    uuid: types.identifier
  })
  .volatile((self) => ({
    /** Just used to preserve the index of the target during generation */
    trajectoryTargetIndex: undefined as number | undefined
  }))
  .views((self) => ({
    /**
     * Negative offsets are the on-disk signal used by the position follower
     * for commands that pause the path and run in place.
     */
    get waitsInPlace(): boolean {
      return self.offset.value < 0;
    },
    get waitDurationSeconds(): number {
      return self.offset.value < 0 ? Math.abs(self.offset.value) : 0;
    },
    getPath(): IHolonomicPathStore {
      const path: IHolonomicPathStore = getParent<IHolonomicPathStore>(
        getParent<IChoreoTrajectoryStore>(getParent<IEventMarkerStore[]>(self))
      );
      return path;
    },
    get timestamp(): number | undefined {
      if (self.targetTimestamp === undefined) {
        return undefined;
      }
      // A negative value represents a hold duration, not a time shift. Keep
      // the marker visually anchored to its selected waypoint.
      if (self.offset.value < 0) {
        return self.targetTimestamp;
      }
      return self.targetTimestamp + self.offset.value;
    },
    getTargetIndex(): number | undefined {
      const path: IHolonomicPathStore = this.getPath();
      if (path === undefined) {
        return undefined;
      }
      const startScope = self.target;
      if (startScope === undefined) {
        return undefined;
      }
      const waypoint = getByWaypointID(startScope, path.params.waypoints);
      if (waypoint === undefined) return undefined;
      return findUUIDIndex(waypoint.uuid, path.params.waypoints);
    }
  }))
  .views((self) => ({
    get serialize(): EventMarkerData {
      const points = self.getPath().params.waypoints;
      return {
        target: waypointIdToSavedWaypointId(self.target, points),
        offset: self.offset.serialize,
        targetTimestamp: self.targetTimestamp
      };
    }
  }))
  .actions((self) => ({
    deserialize(ser: EventMarkerData) {
      const points = self.getPath().params.waypoints;
      self.target = savedWaypointIdToWaypointId(ser.target, points);
      self.targetTimestamp = self.targetTimestamp ?? undefined;
      self.offset.deserialize(ser.offset);
    },
    setTarget(target: WaypointUUID) {
      self.target = target;
    },
    setTargetTimestamp(timestamp: number | undefined) {
      self.targetTimestamp = timestamp;
    },
    setTrajectoryTargetIndex(index: number | undefined) {
      self.trajectoryTargetIndex = index;
    },
    setWaitsInPlace(enabled: boolean) {
      if (enabled) {
        const currentDuration = Math.abs(self.offset.value);
        self.offset.set(-(currentDuration > 0 ? currentDuration : 1));
      } else {
        self.offset.set(0);
      }
    },
    setWaitDurationSeconds(durationSeconds: number) {
      if (!Number.isFinite(durationSeconds)) {
        return;
      }
      // Keep the value strictly negative while the hold is enabled so the
      // follower can distinguish it from a regular marker.
      self.offset.set(-Math.max(0.01, Math.abs(durationSeconds)));
    }
  }))
  .views((self) => ({
    /**
     *
     * @returns Returns undefined if the marker does not have both a timestamp and a target timestamp.
     * Otherwise, returns whether the target waypoint and the marker timestamp are on the same split part.
     */
    isInSameSegment(traj: IChoreoTrajectoryStore): boolean | undefined {
      let retVal: boolean | undefined = true;
      const targetTimestamp = self.targetTimestamp;
      const timestamp = self.timestamp;
      if (targetTimestamp === undefined || timestamp === undefined) {
        retVal = undefined;
        return undefined;
      } else if (self.offset.value <= 0) {
        // Zero is at the waypoint; negative values are hold durations whose
        // trigger also remains at the waypoint.
        return true;
      } else {
        const splitTimes = traj.splits.map((idx) => traj.samples[idx]?.t);
        [0, ...splitTimes, traj.getTotalTimeSeconds()].forEach(
          (stopTimestamp) => {
            if (
              (targetTimestamp < stopTimestamp && timestamp > stopTimestamp) ||
              (targetTimestamp > stopTimestamp && timestamp < stopTimestamp)
            ) {
              retVal = false;
            }
          }
        );
      }
      return retVal;
    }
  }));
// When adding new fields, consult
// https://choreo.autos/contributing/schema-upgrade/
// to see all the places that change with every schema upgrade.
export const EventMarkerStore = types
  .model("GeneralMarker", {
    name: types.string,
    from: EventMarkerDataStore,
    uuid: types.identifier,
    event: CommandStore
  })
  .views((self) => ({
    get serialize(): EventMarker {
      const from = self.from.serialize;
      if (self.event.stayDurationSeconds > 0) {
        const stay = findStayCommand(self.event);
        const wait = stay?.time.serialize;
        const duration = Math.abs(wait?.val ?? self.event.stayDurationSeconds);
        from.offset = {
          exp: wait ? `-(${wait.exp})` : `-${duration} s`,
          val: -Math.max(0.01, duration)
        };
      }
      return {
        name: self.name,
        from,
        event: self.event.serialize
      };
    },
    get selected(): boolean {
      if (!isAlive(self)) {
        return false;
      }
      return self.uuid === getEnv<Env>(self).selectedSidebar();
    }
  }))
  .actions((self) => ({
    setName(name: string) {
      self.name = name;
    },
    deserialize(
      ser: EventMarker,
      commandConstructor: EnvConstructors["CommandStore"]
    ) {
      self.name = ser.name;
      self.from.deserialize(ser.from);
      self.event.deserialize(ser.event, commandConstructor);
      if (self.from.waitsInPlace) {
        if (self.event.isWait) {
          self.event.setType("stay");
        } else {
          markMatchingWaitAsStay(self.event, self.from.waitDurationSeconds);
        }
      }
    },
    setSelected(selected: boolean) {
      if (selected && !self.selected) {
        getEnv<Env>(self).select(
          getParent<IEventMarkerStore[]>(self)?.find(
            (point) => self.uuid == point.uuid
          )
        );
      }
    },
    setCommandType(type: CommandType) {
      const wasStay = self.event.isStay;
      const wasNamedHold = self.event.isNamed && self.from.waitsInPlace;
      self.event.setType(type);
      if (type === "stay") {
        if (self.event.time.value <= 0) {
          self.event.time.set(1);
        }
        self.from.setWaitsInPlace(true);
        self.from.setWaitDurationSeconds(self.event.time.value);
      } else if (wasStay || (wasNamedHold && type !== "named")) {
        self.from.setWaitsInPlace(false);
      }
    }
  }));
export type IEventMarkerStore = Instance<typeof EventMarkerStore>;
