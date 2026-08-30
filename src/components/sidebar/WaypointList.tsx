import { observer } from "mobx-react";
import { Component } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { doc } from "../../document/DocumentManager";
import { IHolonomicWaypointStore } from "../../document/HolonomicWaypointStore";
import styles from "./Sidebar.module.css";
import SidebarWaypoint from "./SidebarWaypoint";
import { waypointIsVisible } from "../field/PathSweepUtils";

const getListStyle = (isDraggingOver: boolean) => ({
  outline: isDraggingOver ? "2px solid var(--darker-purple)" : "transparent"
});

type Props = object;

type State = object;

class WaypointList extends Component<Props, State> {
  state = {};
  constructor(props: Props) {
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  reorder(startIndex: number, endIndex: number) {
    doc.pathlist.activePath.params.reorderWaypoint(startIndex, endIndex);
  }

  waypointIsUngrouped(index: number) {
    const path = doc.pathlist.activePath;
    return !path.sweeps.some(
      (sweep) => index >= sweep.fromWaypoint && index <= sweep.toWaypoint
    );
  }

  waypointBelongsInList(index: number) {
    return (
      this.waypointIsUngrouped(index) &&
      waypointIsVisible(doc.pathlist.activePath, index)
    );
  }

  onDragEnd(result: any) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const path = doc.pathlist.activePath;
    const visibleIndices = path.params.waypoints.flatMap((_waypoint, index) =>
      this.waypointBelongsInList(index) ? [index] : []
    );
    const sourceIndex = visibleIndices[result.source.index];
    const destinationIndex = visibleIndices[result.destination.index];
    if (sourceIndex === undefined || destinationIndex === undefined) return;
    this.reorder(sourceIndex, destinationIndex);
  }

  newWaypoint(): void {
    doc.pathlist.activePath.addWaypoint();
  }
  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    const waypoints = doc.pathlist.activePath.params.waypoints;
    const waypointsLength = waypoints.length;
    if (waypointsLength == 0) {
      return (
        <div className={styles.SidebarItem + " " + styles.Noninteractible}>
          <span></span>
          <span style={{ color: "gray", fontStyle: "italic" }}>
            No Waypoints
          </span>
        </div>
      );
    }
    const waypointElements = waypoints.flatMap(
      (holonomicWaypoint: IHolonomicWaypointStore, index: number) => {
        if (!this.waypointBelongsInList(index)) return [];
        let issue = "";
        if (holonomicWaypoint.type == 2) {
          if (index == 0) {
            issue = "Cannot start with an empty waypoint.";
          } else if (index == waypoints.length - 1) {
            issue = "Cannot end with an empty waypoint.";
          }
        }
        return (
          <SidebarWaypoint
            delete={() => {
              doc.pathlist.activePath.params.deleteWaypoint(
                holonomicWaypoint.uuid
              );
            }}
            waypoint={holonomicWaypoint}
            index={index}
            dragIndex={
              waypoints
                .slice(0, index)
                .filter((_waypoint, priorIndex) =>
                  this.waypointBelongsInList(priorIndex)
                ).length
            }
            issue={issue}
            pathLength={waypoints.length}
            key={holonomicWaypoint.uuid}
          ></SidebarWaypoint>
        );
      }
    );

    if (waypointElements.length === 0) return null;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={styles.WaypointList}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {doc.pathlist.activePath.sweeps.length > 0 && (
                <div className={styles.UngroupedLabel}>UNGROUPED</div>
              )}
              {waypointElements}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
export default observer(WaypointList);
