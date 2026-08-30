import { observer } from "mobx-react";
import { Component } from "react";
import { doc, uiState } from "../../document/DocumentManager";
import PathAnimationSlider from "./PathAnimationSlider";
import IconButton from "@mui/material/IconButton";
import { Pause as PauseIcon, PlayArrow as PlayIcon } from "../icons/AppleIcons";
import { autorun, IReactionDisposer } from "mobx";
import { Tooltip } from "@mui/material";
import hotkeys from "hotkeys-js";
import {
  playbackToPreviewTime,
  previewPlaybackDuration,
  previewToPlaybackTime
} from "./PlaybackTiming";

type Props = object;

type State = {
  running: boolean;
};

class PathAnimationPanel extends Component<Props, State> {
  state = {
    running: false
  };

  timerId = 0;
  totalTime = 0;
  then = 0;
  private pathChangeDisposer?: IReactionDisposer;
  step = (dt: number) => this.incrementTimer(dt);
  private shortcutHandler = (e: KeyboardEvent) => {
    e.preventDefault();
    if (this.state.running) {
      this.onStop();
    } else {
      this.onStart();
    }
  };

  onStart() {
    const path = doc.pathlist.activePath;
    let previewTimestamp = playbackToPreviewTime(
      path,
      uiState.pathAnimationTimestamp
    );
    if (Math.abs(this.totalTime - previewTimestamp) < 0.05) {
      previewTimestamp = 0;
    }
    uiState.setPathAnimationTimestamp(
      previewToPlaybackTime(path, previewTimestamp)
    );
    window.cancelAnimationFrame(this.timerId);
    this.setState({ running: true }, () => {
      this.then = performance.now();
      this.timerId = requestAnimationFrame(this.step);
    });
  }

  incrementTimer(now: number) {
    const dt = Math.min(now - this.then, 100);
    this.then = now;
    if (this.state.running) {
      const path = doc.pathlist.activePath;
      const previewTimestamp = playbackToPreviewTime(
        path,
        uiState.pathAnimationTimestamp
      );
      const nextTimestamp = previewTimestamp + dt / 1e3;
      if (nextTimestamp >= this.totalTime) {
        uiState.setPathAnimationTimestamp(
          previewToPlaybackTime(path, this.totalTime)
        );
        this.onStop();
      } else {
        uiState.setPathAnimationTimestamp(
          previewToPlaybackTime(path, nextTimestamp)
        );
        this.timerId = requestAnimationFrame(this.step);
      }
    }
  }

  onStop() {
    this.setState({ running: false });
    if (this.timerId !== 0) {
      window.cancelAnimationFrame(this.timerId);
    }
  }
  componentDidMount(): void {
    hotkeys("space", "all", this.shortcutHandler);
    this.pathChangeDisposer = autorun(() => {
      const _ = doc.pathlist.activePathUUID;
      this.onStop();
    });
  }
  componentWillUnmount(): void {
    window.cancelAnimationFrame(this.timerId);
    hotkeys.unbind("space", "all", this.shortcutHandler);
    this.pathChangeDisposer?.();
  }
  render() {
    const activePath = doc.pathlist.activePath;
    this.totalTime = previewPlaybackDuration(activePath);
    return (
      <div className="animation-dock">
        <span
          className="animation-controls"
          style={{
            display:
              activePath.trajectory.fullTrajectory.length >= 2 ? "flex" : "none"
          }}
        >
          <Tooltip
            disableInteractive
            title={
              this.state.running
                ? "Pause Path Animation"
                : "Play Path Animation"
            }
          >
            <IconButton
              color="default"
              onClick={() => {
                if (this.state.running) {
                  this.onStop();
                } else {
                  this.onStart();
                }
              }}
            >
              {this.state.running ? (
                <PauseIcon></PauseIcon>
              ) : (
                <PlayIcon></PlayIcon>
              )}
            </IconButton>
          </Tooltip>
          <PathAnimationSlider></PathAnimationSlider>
        </span>
      </div>
    );
  }
}
export default observer(PathAnimationPanel);
