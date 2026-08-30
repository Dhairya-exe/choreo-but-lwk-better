import { observer } from "mobx-react";
import React, { Component } from "react";
import { doc, uiState } from "../../document/DocumentManager";
import Slider from "@mui/material/Slider";
import { Tooltip } from "@mui/material";
import { NavbarItemData } from "../../document/UIData";
import { IEventMarkerStore } from "../../document/EventMarkerStore";
import { CommandVisualIcon } from "../config/eventmarker/CommandIconLibrary";
import { getCommandAppearance } from "../config/eventmarker/CommandAppearance";
import {
  markerHoldDuration,
  playbackToPreviewTime,
  previewPlaybackDuration,
  previewToPlaybackTime,
  trajectoryTimeIsInPreview,
  trajectoryToPlaybackTime
} from "./PlaybackTiming";

type Props = object;

type State = object;

class PathAnimationSlider extends Component<Props, State> {
  totalTime = 0;
  private marksSignature = "";
  private cachedMarks:
    | Array<{ value: number; label: React.ReactNode }>
    | false = false;

  render() {
    const activePath = doc.pathlist.activePath;
    this.totalTime = previewPlaybackDuration(activePath);
    const nextMarksSignature = [
      activePath.trajectory.fullTrajectory.length,
      activePath.trajectory.waypoints.join(","),
      activePath.selectedSweepIds.join(","),
      uiState.sweepPreviewPathUUID ?? "",
      uiState.sweepPreviewRange.join(","),
      activePath.snapshot.waypoints
        .map((point) => `${point.fixHeading}:${point.fixTranslation}`)
        .join(","),
      activePath.markers
        .map(
          (marker) =>
            `${marker.uuid}:${marker.from.timestamp ?? ""}:${marker.selected}:${markerHoldDuration(marker)}:${JSON.stringify(getCommandAppearance(marker.event))}`
        )
        .join(",")
    ].join("|");

    if (nextMarksSignature !== this.marksSignature) {
      this.marksSignature = nextMarksSignature;
      this.cachedMarks =
        activePath.trajectory.fullTrajectory.length > 0
          ? activePath.snapshot.waypoints
              .flatMap((point, idx) => {
                const trajectoryTimestamp =
                  activePath.trajectory.waypoints[idx];
                if (
                  trajectoryTimestamp === undefined ||
                  !trajectoryTimeIsInPreview(activePath, trajectoryTimestamp)
                ) {
                  return [];
                }
                let type = 0;

                if (point.fixHeading) {
                  type = 0;
                } else if (point.fixTranslation) {
                  type = 1;
                } else {
                  type = 2;
                }
                if (type == 3 || type == 2) {
                  return [];
                }
                let color = "white";
                if (idx === 0) {
                  color = "green";
                } else if (idx === activePath.snapshot.waypoints.length - 1) {
                  color = "red";
                }
                return [
                  {
                    value: playbackToPreviewTime(
                      activePath,
                      trajectoryToPlaybackTime(activePath, trajectoryTimestamp)
                    ),
                    label: (
                      <Tooltip disableInteractive title={idx + 1} key={idx + 1}>
                        <span>
                          {React.cloneElement(NavbarItemData[type].icon, {
                            htmlColor: color
                          })}
                        </span>
                      </Tooltip>
                    )
                  }
                ];
              })
              .concat(
                activePath.markers.flatMap((marker: IEventMarkerStore) => {
                  if (marker.from.timestamp === undefined) {
                    return [];
                  }
                  if (
                    !trajectoryTimeIsInPreview(
                      activePath,
                      marker.from.timestamp
                    )
                  ) {
                    return [];
                  }
                  return {
                    value: playbackToPreviewTime(
                      activePath,
                      trajectoryToPlaybackTime(
                        activePath,
                        marker.from.timestamp
                      )
                    ),
                    label: (
                      <span>
                        <CommandVisualIcon
                          icon={getCommandAppearance(marker.event).icon}
                          htmlColor={
                            marker.selected
                              ? "var(--select-yellow)"
                              : getCommandAppearance(marker.event).color
                          }
                          fontSize={28}
                          style={{
                            filter:
                              "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.78)) drop-shadow(0 0 3px rgba(0, 0, 0, 0.42))",
                            transform: "translateY(calc(-5px - 50%))"
                          }}
                        />
                      </span>
                    )
                  };
                })
              )
          : false;
    }
    return (
      <>
        <Slider
          defaultValue={0}
          step={0.01}
          min={0}
          max={this.totalTime}
          marks={this.cachedMarks}
          aria-label="Default"
          valueLabelDisplay="auto"
          valueLabelFormat={(x: number) => x.toFixed(2)}
          value={playbackToPreviewTime(
            activePath,
            uiState.pathAnimationTimestamp
          )}
          onChange={(_e, newVal) =>
            uiState.setPathAnimationTimestamp(
              previewToPlaybackTime(activePath, newVal as number)
            )
          }
          sx={{
            flexGrow: "1",
            width: "2",
            marginInline: "10px",
            ".MuiSlider-track, .MuiSlider-thumb": {
              transition: "unset",
              WebkitTransition: "unset"
            },
            ".MuiSlider-rail": {
              height: "6px",
              opacity: 1,
              backgroundColor: "rgba(255, 255, 255, 0.12)"
            },
            ".MuiSlider-track": {
              height: "6px",
              border: 0,
              background: "linear-gradient(90deg, #64a8ff, #a99cff)"
            },
            ".MuiSlider-thumb": {
              width: "18px",
              height: "18px",
              zIndex: 2,
              color: "white",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.38), 0 0 0 3px rgba(100, 168, 255, 0.2)",
              ":hover,:active": {
                width: "18px",
                height: "18px",
                boxShadow:
                  "0 2px 8px rgba(0, 0, 0, 0.38), 0 0 0 5px rgba(100, 168, 255, 0.25)"
              }
            },
            ".MuiSlider-mark": {
              display: "none"
            },
            ".MuiSlider-markLabel": {
              top: "unset",
              transform: "translateX(-50%) translateY(-10px)",
              zIndex: 1
            }
          }}
        />
        <span
          style={{
            width: "min-content",
            minWidth: "86px",
            padding: "5px 8px",
            color: "var(--text-secondary)",
            fontSize: "0.74rem",
            fontVariantNumeric: "tabular-nums",
            textAlign: "center",
            whiteSpace: "nowrap",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "9px",
            background: "rgba(0, 0, 0, 0.16)"
          }}
        >{`${playbackToPreviewTime(
          activePath,
          uiState.pathAnimationTimestamp
        ).toFixed(1)} s / ${this.totalTime.toFixed(1)} s`}</span>
      </>
    );
  }
}
export default observer(PathAnimationSlider);
