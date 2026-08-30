import { IEventMarkerStore } from "../../document/EventMarkerStore";
import { IHolonomicPathStore } from "../../document/path/HolonomicPathStore";
import { uiState } from "../../document/DocumentManager";
import { getSelectedSweepTimeRanges } from "./PathSweepUtils";

export function markerHoldDuration(marker: IEventMarkerStore) {
  if (marker.event.stayDurationSeconds > 0) {
    return marker.event.stayDurationSeconds;
  }
  return marker.from.waitsInPlace ? marker.from.waitDurationSeconds : 0;
}

export function playbackHolds(path: IHolonomicPathStore) {
  return path.markers
    .flatMap((marker) => {
      const trajectoryTime = marker.from.timestamp;
      const duration = markerHoldDuration(marker);
      return trajectoryTime !== undefined && duration > 0
        ? [{ trajectoryTime, duration }]
        : [];
    })
    .sort((a, b) => a.trajectoryTime - b.trajectoryTime);
}

export function playbackDuration(path: IHolonomicPathStore) {
  return (
    path.trajectory.getTotalTimeSeconds() +
    playbackHolds(path).reduce((sum, hold) => sum + hold.duration, 0)
  );
}

export function playbackToTrajectoryTime(
  path: IHolonomicPathStore,
  playbackTime: number
) {
  let accumulatedHoldTime = 0;
  for (const hold of playbackHolds(path)) {
    const playbackHoldStart = hold.trajectoryTime + accumulatedHoldTime;
    const playbackHoldEnd = playbackHoldStart + hold.duration;
    if (playbackTime < playbackHoldStart) break;
    if (playbackTime <= playbackHoldEnd) return hold.trajectoryTime;
    accumulatedHoldTime += hold.duration;
  }
  return Math.max(0, playbackTime - accumulatedHoldTime);
}

export function trajectoryToPlaybackTime(
  path: IHolonomicPathStore,
  trajectoryTime: number
) {
  const earlierHoldTime = playbackHolds(path)
    .filter((hold) => hold.trajectoryTime < trajectoryTime)
    .reduce((sum, hold) => sum + hold.duration, 0);
  return trajectoryTime + earlierHoldTime;
}

/** Playback-time ranges represented by the currently visible sweep filters. */
export function previewPlaybackRanges(
  path: IHolonomicPathStore
): Array<[number, number]> {
  const previewRange =
    uiState.sweepPreviewPathUUID === path.uuid &&
    uiState.sweepPreviewRange.length === 2 &&
    uiState.sweepPreviewRange[0] !== uiState.sweepPreviewRange[1]
      ? (() => {
          const start = path.trajectory.waypoints[uiState.sweepPreviewRange[0]];
          const end = path.trajectory.waypoints[uiState.sweepPreviewRange[1]];
          return start === undefined || end === undefined
            ? []
            : ([[Math.min(start, end), Math.max(start, end)]] as Array<
                [number, number]
              >);
        })()
      : [];
  const sweepRanges =
    previewRange.length > 0 ? previewRange : getSelectedSweepTimeRanges(path);
  if (sweepRanges.length === 0) return [[0, playbackDuration(path)]];

  const ranges = sweepRanges
    .map(
      ([start, end]) =>
        [
          trajectoryToPlaybackTime(path, start),
          trajectoryToPlaybackTime(path, end)
        ] as [number, number]
    )
    .sort((left, right) => left[0] - right[0]);

  return ranges.reduce<Array<[number, number]>>((merged, range) => {
    const previous = merged[merged.length - 1];
    if (previous === undefined || range[0] > previous[1]) {
      merged.push([...range]);
    } else {
      previous[1] = Math.max(previous[1], range[1]);
    }
    return merged;
  }, []);
}

export function previewPlaybackDuration(path: IHolonomicPathStore) {
  return previewPlaybackRanges(path).reduce(
    (duration, [start, end]) => duration + Math.max(0, end - start),
    0
  );
}

export function trajectoryTimeIsInPreview(
  path: IHolonomicPathStore,
  trajectoryTime: number
) {
  const playbackTime = trajectoryToPlaybackTime(path, trajectoryTime);
  return previewPlaybackRanges(path).some(
    ([start, end]) => playbackTime >= start && playbackTime <= end
  );
}

/** Convert the global playback clock to the compressed visible-sweep clock. */
export function playbackToPreviewTime(
  path: IHolonomicPathStore,
  playbackTime: number
) {
  let previewTime = 0;
  for (const [start, end] of previewPlaybackRanges(path)) {
    if (playbackTime <= start) return previewTime;
    if (playbackTime <= end) return previewTime + playbackTime - start;
    previewTime += end - start;
  }
  return previewTime;
}

/** Convert the compressed visible-sweep clock back to the global clock. */
export function previewToPlaybackTime(
  path: IHolonomicPathStore,
  previewTime: number
) {
  let remaining = Math.max(0, previewTime);
  const ranges = previewPlaybackRanges(path);
  for (const [start, end] of ranges) {
    const duration = end - start;
    if (remaining <= duration) return start + remaining;
    remaining -= duration;
  }
  return ranges[ranges.length - 1]?.[1] ?? 0;
}
