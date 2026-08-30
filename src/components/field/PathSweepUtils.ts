import { IHolonomicPathStore } from "../../document/path/HolonomicPathStore";

export function getSelectedSweepWaypointRanges(
  path: IHolonomicPathStore
): Array<[number, number]> {
  const waypointCount = path.params.waypoints.length;
  if (waypointCount === 0) return [];
  return path.selectedSweeps.map((sweep) => {
    const from = Math.max(0, Math.min(sweep.fromWaypoint, waypointCount - 1));
    const to = Math.max(from, Math.min(sweep.toWaypoint, waypointCount - 1));
    return [from, to];
  });
}

export function getSelectedSweepTimeRanges(
  path: IHolonomicPathStore
): Array<[number, number]> {
  return getSelectedSweepWaypointRanges(path).flatMap(([from, to]) => {
    const fromTime = path.trajectory.waypoints[from];
    const toTime = path.trajectory.waypoints[to];
    if (fromTime === undefined || toTime === undefined) return [];
    return [[Math.min(fromTime, toTime), Math.max(fromTime, toTime)]];
  });
}

export function waypointIsVisible(path: IHolonomicPathStore, index: number) {
  const ranges = getSelectedSweepWaypointRanges(path);
  return (
    ranges.length === 0 ||
    ranges.some(([from, to]) => index >= from && index <= to)
  );
}

export function trajectoryTimeIsVisible(
  path: IHolonomicPathStore,
  time: number
) {
  const ranges = getSelectedSweepTimeRanges(path);
  return (
    ranges.length === 0 ||
    ranges.some(([from, to]) => time >= from && time <= to)
  );
}
