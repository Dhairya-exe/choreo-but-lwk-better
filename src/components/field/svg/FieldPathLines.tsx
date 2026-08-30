import { Component } from "react";
import { doc } from "../../../document/DocumentManager";

import { observer } from "mobx-react";
import { getSelectedSweepWaypointRanges } from "../PathSweepUtils";

type Props = object;

type State = object;

class FieldPathLines extends Component<Props, State> {
  state = {};

  render() {
    const path = doc.pathlist.activePath;
    const ranges = getSelectedSweepWaypointRanges(path);
    const visibleRanges =
      ranges.length > 0
        ? ranges
        : ([[0, path.params.waypoints.length - 1]] as Array<[number, number]>);
    return (
      <>
        {visibleRanges.map(([from, to], index) => (
          <polyline
            key={`${from}-${to}-${index}`}
            points={path.params.waypoints
              .slice(from, to + 1)
              .map((point) => `${point.x.value},${point.y.value}`)
              .join(" ")}
            stroke="grey"
            strokeWidth={0.05}
            fill="transparent"
            style={{ pointerEvents: "none" }}
          />
        ))}
      </>
    );
  }
}
export default observer(FieldPathLines);
