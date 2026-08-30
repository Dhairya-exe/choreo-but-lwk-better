import { doc, uiState } from "../../../document/DocumentManager";

import { observer } from "mobx-react";
import {
  PathGradientArgs,
  PathGradients
} from "../../config/robotconfig/PathGradient";
import { getSelectedSweepTimeRanges } from "../PathSweepUtils";

function FieldGeneratedLines() {
  const path = doc.pathlist.activePath;
  const trajectory = path.ui.generating
    ? path.ui.generationProgress
    : path.trajectory.fullTrajectory;
  const sweepTimeRanges = path.ui.generating
    ? []
    : getSelectedSweepTimeRanges(path);
  // preserve the access of generationIterationNumber
  // to trigger rerenders when mutating the in-progress trajectory in place
  const _ = path.ui.generationIterationNumber;
  const key = uiState.selectedPathGradient as keyof typeof PathGradients;
  const pathGradient = PathGradients[key];
  const maxVisibleSegments = 1600;
  const stride = Math.max(
    1,
    Math.ceil((trajectory.length - 1) / maxVisibleSegments)
  );
  const segments = [];
  for (let i = 0; i < trajectory.length - 1; i += stride) {
    const nextIndex = Math.min(i + stride, trajectory.length - 1);
    const sample = trajectory[i];
    const nextSample = trajectory[nextIndex];
    const matchingRangeIndex = sweepTimeRanges.findIndex(
      ([from, to]) => nextSample.t >= from && sample.t <= to
    );
    if (sweepTimeRanges.length > 0 && matchingRangeIndex === -1) {
      continue;
    }
    const args: PathGradientArgs<any> = {
      samples: path.ui.generating
        ? path.ui.generationProgress
        : path.trajectory.samples,
      index: i,
      section: path.ui.generating
        ? 0
        : (path.trajectory.getIdxOfFullTrajectory(i) ?? [0, 0])[0],
      documentModel: doc
    };
    segments.push(
      <line
        key={i}
        x1={sample.x}
        y1={sample.y}
        x2={nextSample.x}
        y2={nextSample.y}
        strokeWidth={0.05}
        stroke={
          pathGradient === undefined ||
          uiState.selectedPathGradient == PathGradients.None.name
            ? "var(--select-yellow)"
            : pathGradient.function(args)
        }
        style={{ pointerEvents: "none" }}
      />
    );
  }
  return <g>{segments}</g>;
}
export default observer(FieldGeneratedLines);
