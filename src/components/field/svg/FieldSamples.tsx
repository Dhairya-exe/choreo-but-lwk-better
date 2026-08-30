import { Component } from "react";
import { doc } from "../../../document/DocumentManager";

import { observer } from "mobx-react";
import { trajectoryTimeIsVisible } from "../PathSweepUtils";

type Props = object;

type State = object;

class FieldSamples extends Component<Props, State> {
  state = {};
  render() {
    const path = doc.pathlist.activePath;
    const trajectory = path.ui.generating
      ? path.ui.generationProgress
      : path.trajectory.fullTrajectory;
    // preserve the access of generationIterationNumber
    // to trigger rerenders when mutating the in-progress trajectory in place
    const _ = path.ui.generationIterationNumber;
    const radius = 0.02;
    // One compound SVG path is substantially cheaper to paint and reconcile
    // than hundreds (or thousands) of individual circle nodes.
    const samplePath = trajectory
      .filter((point) =>
        path.ui.generating ? true : trajectoryTimeIsVisible(path, point.t)
      )
      .map(
        (point) =>
          `M${point.x - radius},${point.y}a${radius},${radius} 0 1,0 ${
            radius * 2
          },0a${radius},${radius} 0 1,0 ${-radius * 2},0`
      )
      .join("");
    return (
      <path d={samplePath} fill="black" style={{ pointerEvents: "none" }} />
    );
  }
}
export default observer(FieldSamples);
