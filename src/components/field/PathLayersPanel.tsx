import { Add, Close, LayersOutlined } from "../icons/AppleIcons";
import {
  Button,
  Chip,
  IconButton,
  Slider,
  TextField,
  Tooltip
} from "@mui/material";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { doc, uiState } from "../../document/DocumentManager";
import { getPathLayerColor } from "./PathLayerColors";
import styles from "./PathLayersPanel.module.css";

function PathLayersPanel() {
  const path = doc.pathlist.activePath;
  const waypointCount = path.params.waypoints.length;
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [range, setRange] = useState<[number, number]>([
    0,
    Math.max(0, waypointCount - 1)
  ]);

  useEffect(() => {
    setCreating(false);
    setName("");
    setRange([0, Math.max(0, waypointCount - 1)]);
    uiState.clearSweepPreview();
    return () => uiState.clearSweepPreview();
  }, [path.uuid, waypointCount]);

  const createSweep = () => {
    if (!name.trim() || waypointCount < 2 || range[0] === range[1]) return;
    path.addSweep(
      name.trim(),
      range[0],
      range[1],
      getPathLayerColor(path.sweeps.length)
    );
    setName("");
    setCreating(false);
    uiState.clearSweepPreview();
  };

  return (
    <>
      <Button
        className={styles.Trigger}
        startIcon={<LayersOutlined />}
        aria-expanded={uiState.pathLayersPanelOpen}
        aria-controls="path-layers-panel"
        onClick={() =>
          uiState.setPathLayersPanelOpen(!uiState.pathLayersPanelOpen)
        }
      >
        Sweeps
      </Button>
      {uiState.pathLayersPanelOpen && (
        <section
          id="path-layers-panel"
          className={styles.Panel}
          aria-label="Path sweeps"
        >
          <header className={styles.Header}>
            <span className={styles.Title}>
              <LayersOutlined fontSize="small" /> {path.name} sweeps
            </span>
            <Tooltip disableInteractive title="Close sweeps">
              <IconButton
                size="small"
                onClick={() => uiState.setPathLayersPanelOpen(false)}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </header>
          <div className={styles.SimpleBody}>
            <div className={styles.Chips}>
              <Chip
                label="Entire path"
                size="small"
                color={
                  path.selectedSweepIds.length === 0 ? "primary" : "default"
                }
                variant={
                  path.selectedSweepIds.length === 0 ? "filled" : "outlined"
                }
                onClick={() => path.showEntirePath()}
              />
              {path.sweeps.map((sweep) => {
                const selected = path.selectedSweepIds.includes(sweep.id);
                return (
                  <Chip
                    key={sweep.id}
                    label={
                      sweep.name +
                      " · " +
                      (sweep.fromWaypoint + 1) +
                      "–" +
                      (sweep.toWaypoint + 1)
                    }
                    size="small"
                    variant={selected ? "filled" : "outlined"}
                    onClick={() => path.toggleSweepSelected(sweep.id)}
                    onDelete={() => path.deleteSweep(sweep.id)}
                    sx={{
                      color: selected ? "#07080d" : sweep.color,
                      borderColor: sweep.color,
                      backgroundColor: selected ? sweep.color : "transparent",
                      "& .MuiChip-deleteIcon": {
                        color: selected ? "rgba(7,8,13,.62)" : sweep.color
                      }
                    }}
                  />
                );
              })}
              {!creating && (
                <Chip
                  icon={<Add />}
                  label="New sweep"
                  size="small"
                  variant="outlined"
                  disabled={waypointCount < 2}
                  onClick={() => {
                    setName("Sweep " + (path.sweeps.length + 1));
                    setCreating(true);
                    const nextRange: [number, number] = [
                      0,
                      Math.max(0, waypointCount - 1)
                    ];
                    setRange(nextRange);
                    uiState.setSweepPreview(
                      path.uuid,
                      nextRange[0],
                      nextRange[1]
                    );
                  }}
                />
              )}
            </div>
            {creating && (
              <div className={styles.SimpleCreator}>
                <div className={styles.CreatorTop}>
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    label="Sweep name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") createSweep();
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setCreating(false);
                      uiState.clearSweepPreview();
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </div>
                <span className={styles.RangeLabel}>
                  Waypoints {range[0] + 1}–{range[1] + 1}
                </span>
                <Slider
                  min={0}
                  max={Math.max(1, waypointCount - 1)}
                  step={1}
                  value={range}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value + 1}
                  onChange={(_event, value) => {
                    const nextRange = (value as number[]).slice(0, 2) as [
                      number,
                      number
                    ];
                    setRange(nextRange);
                    uiState.setSweepPreview(
                      path.uuid,
                      nextRange[0],
                      nextRange[1]
                    );
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  disabled={!name.trim() || range[0] === range[1]}
                  onClick={createSweep}
                >
                  Create
                </Button>
              </div>
            )}
            {!creating && path.sweeps.length === 0 && (
              <span className={styles.SweepHint}>
                Add a sweep, choose its waypoint range, then tap it to show or
                hide that section.
              </span>
            )}
          </div>
        </section>
      )}
    </>
  );
}

export default observer(PathLayersPanel);
