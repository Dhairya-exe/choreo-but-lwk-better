import { observer } from "mobx-react";
import { doc, uiState } from "../../../document/DocumentManager";
import { sample } from "../../../util/MathUtil";
import { getPathLayerColor } from "../PathLayerColors";

function FieldSweepPreview() {
  const path = doc.pathlist.activePath;
  if (
    uiState.sweepPreviewPathUUID !== path.uuid ||
    uiState.sweepPreviewRange.length !== 2
  ) {
    return null;
  }

  const from = uiState.sweepPreviewRange[0];
  const to = uiState.sweepPreviewRange[1];
  const trajectory = path.trajectory.samples;
  const fromTime = path.trajectory.waypoints[from];
  const toTime = path.trajectory.waypoints[to];
  const color = getPathLayerColor(path.sweeps.length);

  if (
    trajectory.length >= 2 &&
    fromTime !== undefined &&
    toTime !== undefined
  ) {
    const start = Math.min(fromTime, toTime);
    const end = Math.max(fromTime, toTime);
    const startPoint = sample(start, trajectory);
    const endPoint = sample(end, trajectory);
    if (startPoint === undefined || endPoint === undefined) return null;
    const points = [
      startPoint,
      ...trajectory.filter((point) => point.t > start && point.t < end),
      endPoint
    ];
    const pointString = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");
    return (
      <g style={{ pointerEvents: "none" }}>
        <polyline
          points={pointString}
          fill="none"
          stroke="rgba(4, 5, 10, 0.82)"
          strokeWidth={0.18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={pointString}
          fill="none"
          stroke={color}
          strokeWidth={0.105}
          strokeDasharray="0.2 0.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[startPoint, endPoint].map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={0.14}
            fill="rgba(4, 5, 10, 0.82)"
            stroke={color}
            strokeWidth={0.055}
          />
        ))}
      </g>
    );
  }

  const points = path.params.waypoints
    .slice(from, to + 1)
    .map((point) => `${point.x.value},${point.y.value}`)
    .join(" ");
  return (
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={0.09}
      strokeDasharray="0.2 0.1"
      style={{ pointerEvents: "none" }}
    />
  );
}

export default observer(FieldSweepPreview);
