import { observer } from "mobx-react";
import { doc } from "../../../document/DocumentManager";
import { sample } from "../../../util/MathUtil";
import { getCommandAppearance } from "../../config/eventmarker/CommandAppearance";
import { getSelectedSweepTimeRanges } from "../PathSweepUtils";

function spanPoints(
  start: number,
  end: number,
  trajectory: typeof doc.pathlist.activePath.trajectory.samples
) {
  const startPoint = sample(start, trajectory);
  const endPoint = sample(end, trajectory);
  if (startPoint === undefined || endPoint === undefined) return [];
  return [
    startPoint,
    ...trajectory
      .filter(
        (trajectorySample) =>
          trajectorySample.t > start && trajectorySample.t < end
      )
      .map((trajectorySample) => ({
        x: trajectorySample.x,
        y: trajectorySample.y
      })),
    endPoint
  ];
}

type PathPoint = { x: number; y: number };

function directionArrows(points: PathPoint[], spacing = 0.55) {
  const arrows: Array<{ x: number; y: number; angle: number }> = [];
  let distanceUntilArrow = spacing * 0.55;
  for (let index = 1; index < points.length; index++) {
    const start = points[index - 1];
    const end = points[index];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const segmentLength = Math.hypot(dx, dy);
    if (segmentLength < 0.0001) continue;
    while (distanceUntilArrow <= segmentLength) {
      const interpolation = distanceUntilArrow / segmentLength;
      arrows.push({
        x: start.x + dx * interpolation,
        y: start.y + dy * interpolation,
        angle: (Math.atan2(dy, dx) * 180) / Math.PI
      });
      distanceUntilArrow += spacing;
    }
    distanceUntilArrow -= segmentLength;
  }
  return arrows;
}

function FieldCommandHighlights() {
  const path = doc.pathlist.activePath;
  const trajectory = path.trajectory.samples;
  if (trajectory.length < 2) return null;

  const totalTime = path.trajectory.getTotalTimeSeconds();
  const sweepRanges = getSelectedSweepTimeRanges(path);
  const visibleRanges =
    sweepRanges.length > 0
      ? sweepRanges
      : ([[0, totalTime]] as Array<[number, number]>);
  const markers = path.markers
    .filter(
      (marker) => marker.from.timestamp !== undefined && !marker.event.isNone
    )
    .slice()
    .sort((a, b) => a.from.timestamp! - b.from.timestamp!);

  return (
    <g id="command-highlights" style={{ pointerEvents: "none" }}>
      {markers.flatMap((marker, markerIndex) => {
        const start = marker.from.timestamp!;
        const end = markers[markerIndex + 1]?.from.timestamp ?? totalTime;
        const appearance = getCommandAppearance(marker.event);
        const label = marker.event.isNamed
          ? marker.event.name || marker.name
          : marker.event.type;
        const spans = visibleRanges.flatMap(([visibleStart, visibleEnd]) => {
          const clippedStart = Math.max(start, visibleStart);
          const clippedEnd = Math.min(end, visibleEnd);
          return clippedEnd > clippedStart
            ? [[clippedStart, clippedEnd] as [number, number]]
            : [];
        });

        const lines = spans.map(([spanStart, spanEnd], spanIndex) => {
          const points = spanPoints(spanStart, spanEnd, trajectory);
          if (points.length < 2) return null;
          const pointString = points
            .map((point) => point.x + "," + point.y)
            .join(" ");
          const arrows = directionArrows(points);
          return (
            <g key={marker.uuid + "-" + spanIndex}>
              <title>
                {label +
                  ": " +
                  spanStart.toFixed(1) +
                  "–" +
                  spanEnd.toFixed(1) +
                  " s"}
              </title>
              <polyline
                points={pointString}
                fill="none"
                stroke="rgba(4, 5, 10, 0.86)"
                strokeWidth={0.15}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={pointString}
                fill="none"
                stroke={appearance.color}
                strokeWidth={0.095}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {arrows.map((arrow, arrowIndex) => (
                <path
                  key={arrowIndex}
                  d="M -0.075 -0.055 L 0.09 0 L -0.075 0.055 Z"
                  transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`}
                  fill="rgba(4, 5, 10, 0.92)"
                  stroke={appearance.color}
                  strokeWidth={0.022}
                  strokeLinejoin="round"
                />
              ))}
            </g>
          );
        });

        if (!marker.from.waitsInPlace && marker.event.stayDurationSeconds <= 0)
          return lines;
        const point = sample(start, trajectory);
        if (point === undefined) return lines;
        return [
          ...lines,
          <circle
            key={"hold-" + marker.uuid}
            cx={point.x}
            cy={point.y}
            r={0.21}
            fill={appearance.color}
            fillOpacity={0.22}
            stroke={appearance.color}
            strokeWidth={0.065}
          />
        ];
      })}
    </g>
  );
}

export default observer(FieldCommandHighlights);
