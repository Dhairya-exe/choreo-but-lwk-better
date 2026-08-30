import { Instance, types } from "mobx-state-tree";
import { PathSweepMetadata } from "../schema/DocumentTypes";

export const PathSweepStore = types
  .model("PathSweepStore", {
    id: types.identifier,
    name: types.string,
    fromWaypoint: types.integer,
    toWaypoint: types.integer,
    color: types.string
  })
  .views((self) => ({
    get serialize(): PathSweepMetadata {
      return {
        id: self.id,
        name: self.name,
        fromWaypoint: self.fromWaypoint,
        toWaypoint: self.toWaypoint,
        color: self.color
      };
    }
  }))
  .actions((self) => ({
    setName(name: string) {
      self.name = name;
    },
    setRange(fromWaypoint: number, toWaypoint: number) {
      self.fromWaypoint = Math.min(fromWaypoint, toWaypoint);
      self.toWaypoint = Math.max(fromWaypoint, toWaypoint);
    },
    setColor(color: string) {
      self.color = color;
    }
  }));

export type IPathSweepStore = Instance<typeof PathSweepStore>;
