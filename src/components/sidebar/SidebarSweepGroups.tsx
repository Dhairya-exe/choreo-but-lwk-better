import {
  Add,
  Check,
  Delete,
  ExpandMore,
  LayersOutlined,
  Visibility,
  VisibilityOff
} from "../icons/AppleIcons";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { doc, uiState } from "../../document/DocumentManager";
import { getUnusedPathLayerColor } from "../field/PathLayerColors";
import styles from "./Sidebar.module.css";

function SidebarSweepGroups() {
  const path = doc.pathlist.activePath;
  const selectedIndices =
    uiState.sweepSelectionPathUUID === path.uuid
      ? Array.from(uiState.sweepSelectionWaypointIndices)
      : [];
  const [name, setName] = useState("");
  const sweepColorSignature = path.sweeps
    .map((sweep) => `${sweep.id}:${sweep.color}`)
    .join("|");

  useEffect(() => {
    const usedColors: string[] = [];
    path.sweeps.forEach((sweep) => {
      const savedColor = sweep.color.trim();
      const colorAlreadyUsed = usedColors.some(
        (color) => color.toLowerCase() === savedColor.toLowerCase()
      );
      const resolvedColor =
        savedColor.length > 0 && !colorAlreadyUsed
          ? savedColor
          : getUnusedPathLayerColor(usedColors);
      if (resolvedColor !== sweep.color) sweep.setColor(resolvedColor);
      usedColors.push(resolvedColor);
    });
  }, [path, sweepColorSignature]);

  useEffect(() => {
    if (selectedIndices.length === 1) {
      setName(`Sweep ${path.sweeps.length + 1}`);
    }
  }, [path.uuid, path.sweeps.length, selectedIndices.length]);

  if (path.sweeps.length === 0 && selectedIndices.length === 0) return null;

  const from = selectedIndices[0];
  const to = selectedIndices[selectedIndices.length - 1];
  const createSweep = () => {
    if (from === undefined || to === undefined || from === to || !name.trim()) {
      return;
    }
    path.addSweep(
      name.trim(),
      from,
      to,
      getUnusedPathLayerColor(path.sweeps.map((sweep) => sweep.color))
    );
    uiState.clearSweepSelection();
    setName("");
  };

  return (
    <div className={styles.SweepGroups} aria-label="Waypoint sweep groups">
      {selectedIndices.length > 0 && (
        <div className={styles.SweepSelectionCreator}>
          <span className={styles.SweepSelectionRange}>
            {selectedIndices.length === 1
              ? `Waypoint ${from + 1} selected — Shift-click the last waypoint`
              : `Waypoints ${from + 1}–${to + 1} selected`}
          </span>
          <input
            aria-label="Sweep group name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") createSweep();
              if (event.key === "Escape") uiState.clearSweepSelection();
            }}
          />
          <button
            type="button"
            disabled={selectedIndices.length < 2 || !name.trim()}
            onClick={createSweep}
          >
            <Add fontSize="small" /> Group
          </button>
          <button type="button" onClick={() => uiState.clearSweepSelection()}>
            Cancel
          </button>
        </div>
      )}

      {path.sweeps.length > 0 && (
        <button
          type="button"
          className={`${styles.SweepGroup} ${
            path.selectedSweepIds.length === 0 ? styles.SweepGroupSelected : ""
          }`}
          onClick={() => path.showEntirePath()}
        >
          <LayersOutlined fontSize="small" />
          <span>All waypoints</span>
          <span className={styles.SweepRange}>
            1–{path.params.waypoints.length}
          </span>
          {path.selectedSweepIds.length === 0 && <Check fontSize="small" />}
        </button>
      )}

      {path.sweeps.map((sweep) => {
        const selected = path.selectedSweepIds.includes(sweep.id);
        const waypointIndices = Array.from(
          { length: sweep.toWaypoint - sweep.fromWaypoint + 1 },
          (_, index) => sweep.fromWaypoint + index
        );
        return (
          <details className={styles.SweepDropdown} key={sweep.id}>
            <summary>
              <ExpandMore className={styles.SweepExpandIcon} fontSize="small" />
              <span
                className={styles.SweepSwatch}
                style={{ backgroundColor: sweep.color, color: sweep.color }}
              />
              <span className={styles.SweepName}>{sweep.name}</span>
              <span className={styles.SweepRange}>
                {sweep.fromWaypoint + 1}–{sweep.toWaypoint + 1}
              </span>
              <button
                type="button"
                aria-label={`${selected ? "Hide" : "Show"} ${sweep.name}`}
                title={`${selected ? "Hide" : "Show"} this sweep on the field`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  path.toggleSweepSelected(sweep.id);
                }}
              >
                {selected ? (
                  <Visibility fontSize="small" htmlColor={sweep.color} />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </button>
              <button
                type="button"
                className={styles.DeleteSweepButton}
                aria-label={`Delete ${sweep.name}`}
                title={`Delete ${sweep.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  path.deleteSweep(sweep.id);
                }}
              >
                <Delete fontSize="small" />
              </button>
            </summary>
            <div className={styles.SweepDropdownWaypoints}>
              {waypointIndices.map((waypointIndex) => {
                const waypoint = path.params.waypoints[waypointIndex];
                if (waypoint === undefined) return null;
                const rangeSelected =
                  uiState.sweepSelectionPathUUID === path.uuid &&
                  uiState.sweepSelectionWaypointIndices.includes(waypointIndex);
                return (
                  <button
                    type="button"
                    key={waypoint.uuid}
                    className={
                      rangeSelected ? styles.SweepWaypointRangeSelected : ""
                    }
                    onClick={(event) => {
                      if (event.shiftKey) {
                        uiState.extendSweepSelection(path.uuid, waypointIndex);
                        return;
                      }
                      uiState.clearSweepSelection();
                      doc.setSelectedSidebarItem(waypoint);
                      uiState.setSelectedNavbarItem(waypoint.type);
                    }}
                    onMouseEnter={() => doc.setHoveredSidebarItem(waypoint)}
                    onMouseLeave={() => doc.setHoveredSidebarItem(undefined)}
                  >
                    <span
                      className={styles.WaypointSweepDot}
                      style={{
                        backgroundColor: sweep.color,
                        boxShadow: `0 0 7px ${sweep.color}`
                      }}
                    />
                    <span>Waypoint {waypointIndex + 1}</span>
                    <span className={styles.SweepWaypointType}>
                      {waypoint.typeName}
                    </span>
                  </button>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export default observer(SidebarSweepGroups);
