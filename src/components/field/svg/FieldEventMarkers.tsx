import { observer } from "mobx-react";
import { Component } from "react";
import { doc } from "../../../document/DocumentManager";

import { sample } from "../../../util/MathUtil";
import { CommandVisualIcon } from "../../config/eventmarker/CommandIconLibrary";
import { trajectoryTimeIsVisible } from "../PathSweepUtils";
import { getCommandAppearance } from "../../config/eventmarker/CommandAppearance";

type MarkerProps = {
  x: number;
  y: number;
  selected: boolean;
  icon: string;
  color: string;
  onSelect: () => void;
};

type MarkerState = object;

type Props = object;
type State = object;
class FieldEventMarker extends Component<MarkerProps, MarkerState> {
  render() {
    return (
      <g
        transform={`translate(${this.props.x}, ${this.props.y}) scale(${
          0.5 / 24
        }, ${-0.5 / 24})`}
        pointerEvents="visible"
        onClick={(_e) => this.props.onSelect()}
      >
        <g transform={`translate(-12, -22)`}>
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            stroke="black"
            strokeWidth={1}
            fill={
              this.props.selected ? "var(--select-yellow)" : this.props.color
            }
          />
          <g transform="translate(8.4 5.3) scale(0.3)">
            <CommandVisualIcon
              icon={this.props.icon}
              htmlColor="white"
              sx={{ width: 24, height: 24 }}
            />
          </g>
        </g>
      </g>
    );
  }
}

class FieldEventMarkers extends Component<Props, State> {
  state = {};

  render() {
    const path = doc.pathlist.activePath;
    const markers = path.markers;
    return markers.flatMap((marker) => {
      if (marker.from.timestamp === undefined) {
        return [];
      }
      if (!trajectoryTimeIsVisible(path, marker.from.timestamp)) {
        return [];
      }
      const marked = sample(marker.from.timestamp, path.trajectory.samples);
      if (marked === undefined) {
        return <></>;
      }
      const appearance = getCommandAppearance(marker.event);
      return (
        <FieldEventMarker
          key={marker.uuid}
          x={marked.x}
          y={marked.y}
          selected={marker.selected}
          icon={appearance.icon}
          color={appearance.color}
          onSelect={() => doc.setSelectedSidebarItem(marker)}
        ></FieldEventMarker>
      );
    });
  }
}
export default observer(FieldEventMarkers);
