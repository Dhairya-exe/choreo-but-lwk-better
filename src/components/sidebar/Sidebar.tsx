import { Component, Fragment } from "react";
import { doc, uiState } from "../../document/DocumentManager";
import { observer } from "mobx-react";
import styles from "./Sidebar.module.css";
import { Divider, IconButton, Tooltip } from "@mui/material";
import WaypointList from "./WaypointList";
import PathSelector from "./PathSelector";
import {
  Add,
  ContentCopy,
  Menu as MenuIcon,
  Redo,
  ShapeLine,
  Polyline,
  Undo
} from "../icons/AppleIcons";
import SidebarConstraint from "./SidebarConstraint";
import SidebarEventMarker from "./SidebarEventMarker";
import { IEventMarkerStore } from "../../document/EventMarkerStore";
import { ConstraintDefinitions } from "../../document/ConstraintDefinitions";

import ProjectSaveStatusIndicator from "./ProjectSaveStatusIndicator";
import SidebarSweepGroups from "./SidebarSweepGroups";

type Props = object;

type State = object;

class Sidebar extends Component<Props, State> {
  state = {};
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { toggleMainMenu } = uiState;
    const activePath = doc.pathlist.activePath;
    const waypoints = activePath.params.waypoints;
    const constraintTypeOrder = new Map(
      Object.keys(ConstraintDefinitions).map((type, index) => [type, index])
    );
    const sortedConstraints = Array.from(
      activePath.params.constraints,
      (constraint, originalIndex) => ({ constraint, originalIndex })
    ).sort((a, b) => {
      const typeDifference =
        (constraintTypeOrder.get(a.constraint.getType()) ??
          Number.MAX_SAFE_INTEGER) -
        (constraintTypeOrder.get(b.constraint.getType()) ??
          Number.MAX_SAFE_INTEGER);
      if (typeDifference !== 0) return typeDifference;
      const waypointDifference =
        (a.constraint.getStartWaypointIndex(waypoints) ??
          Number.MAX_SAFE_INTEGER) -
        (b.constraint.getStartWaypointIndex(waypoints) ??
          Number.MAX_SAFE_INTEGER);
      if (waypointDifference !== 0) return waypointDifference;
      const endWaypointDifference =
        (a.constraint.getEndWaypointIndex(waypoints) ??
          Number.MAX_SAFE_INTEGER) -
        (b.constraint.getEndWaypointIndex(waypoints) ??
          Number.MAX_SAFE_INTEGER);
      return endWaypointDifference || a.originalIndex - b.originalIndex;
    });
    const sortedMarkers = Array.from(
      activePath.markers,
      (marker, originalIndex) => ({ marker, originalIndex })
    ).sort(
      (a, b) =>
        (a.marker.from.getTargetIndex() ?? Number.MAX_SAFE_INTEGER) -
          (b.marker.from.getTargetIndex() ?? Number.MAX_SAFE_INTEGER) ||
        a.originalIndex - b.originalIndex
    );

    return (
      <div className={styles.Container}>
        <div
          className="sidebar-brandbar"
          style={{ justifyContent: "space-between", zIndex: 5 }}
        >
          <span>
            <Tooltip disableInteractive title="Main Menu">
              <IconButton
                onClick={() => {
                  toggleMainMenu();
                }}
              >
                <MenuIcon></MenuIcon>
              </IconButton>
            </Tooltip>
            Choreo
          </span>

          <span>
            <ProjectSaveStatusIndicator
              savingState={uiState.projectSavingState}
            ></ProjectSaveStatusIndicator>
            <Tooltip disableInteractive title="Undo">
              <span>
                <IconButton
                  disabled={!doc.history.canUndo}
                  onClick={() => {
                    doc.undo();
                  }}
                >
                  <Undo></Undo>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip disableInteractive title="Redo">
              <span>
                <IconButton
                  disabled={!doc.history.canRedo}
                  onClick={() => {
                    doc.redo();
                  }}
                >
                  <Redo></Redo>
                </IconButton>
              </span>
            </Tooltip>
          </span>
        </div>
        <div
          className={styles.SidebarHeading}
          style={{ gridTemplateColumns: "auto 33.6px 33.6px 33.6px 33.6px" }}
        >
          PATHS
          <Tooltip disableInteractive title="Generate All">
            <span>
              <IconButton
                size="small"
                color="default"
                style={{
                  float: "right"
                }}
                disabled={Object.keys(doc.pathlist.paths).length == 0}
                onClick={() => doc.generateAll()}
              >
                <Polyline fontSize="small"></Polyline>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip disableInteractive title="Generate All Outdated">
            <span>
              <IconButton
                size="small"
                color="default"
                style={{
                  float: "right"
                }}
                disabled={Object.keys(doc.pathlist.paths).length == 0}
                onClick={() => doc.generateAllOutdated()}
              >
                <ShapeLine fontSize="small"></ShapeLine>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip disableInteractive title="Duplicate Path">
            <span>
              <IconButton
                size="small"
                color="default"
                style={{
                  float: "right"
                }}
                disabled={Object.keys(doc.pathlist.paths).length == 0}
                onClick={() =>
                  doc.pathlist.duplicatePath(doc.pathlist.activePathUUID)
                }
              >
                <ContentCopy fontSize="small"></ContentCopy>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip disableInteractive title="Add Path">
            <IconButton
              size="small"
              color="default"
              style={{
                float: "right"
              }}
              onClick={() => doc.pathlist.addPath("NewPath", true)}
            >
              <Add fontSize="small"></Add>
            </IconButton>
          </Tooltip>
        </div>
        <Divider></Divider>
        <div
          className={styles.Sidebar}
          style={{ maxHeight: "300px", minHeight: "50px" }}
        >
          <PathSelector></PathSelector>
        </div>
        <Divider></Divider>
        <div className={styles.SidebarHeading}>FEATURES</div>
        <Divider flexItem></Divider>
        <div className={styles.Sidebar}>
          <Divider className={styles.SidebarDivider} textAlign="left" flexItem>
            <span>WAYPOINTS</span>
          </Divider>

          <SidebarSweepGroups />
          <WaypointList></WaypointList>
          <Divider className={styles.SidebarDivider} textAlign="left" flexItem>
            <span>CONSTRAINTS</span>
          </Divider>
          <div className={styles.WaypointList}>
            {sortedConstraints.map(({ constraint }, index) => {
              const previous = sortedConstraints[index - 1]?.constraint;
              const startsType =
                previous === undefined ||
                previous.getType() !== constraint.getType();
              return (
                <Fragment key={constraint.uuid}>
                  {startsType && (
                    <div className={styles.SidebarTypeLabel}>
                      {constraint.data.def.name}
                    </div>
                  )}
                  <SidebarConstraint
                    path={activePath}
                    constraint={constraint}
                  ></SidebarConstraint>
                </Fragment>
              );
            })}
          </div>
          {activePath.params.constraints.length == 0 && (
            <div className={styles.SidebarItem + " " + styles.Noninteractible}>
              <span></span>
              <span style={{ color: "gray", fontStyle: "italic" }}>
                No Constraints
              </span>
            </div>
          )}
          <Divider className={styles.SidebarDivider} textAlign="left" flexItem>
            <span>MARKERS</span>
          </Divider>
          <div className={styles.WaypointList}>
            {sortedMarkers.map(({ marker }: { marker: IEventMarkerStore }) => {
              return (
                <SidebarEventMarker
                  marker={marker}
                  key={marker.uuid}
                ></SidebarEventMarker>
              );
            })}
          </div>
          {activePath.markers.length == 0 && (
            <div className={styles.SidebarItem + " " + styles.Noninteractible}>
              <span></span>
              <span style={{ color: "gray", fontStyle: "italic" }}>
                No Event Markers
              </span>
            </div>
          )}
          <Divider></Divider>
        </div>
      </div>
    );
  }
}
export default observer(Sidebar);
