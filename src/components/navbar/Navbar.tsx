import { Component } from "react";
import {
  doc,
  generateWithToastsAndExport,
  uiState
} from "../../document/DocumentManager";
import Tooltip from "@mui/material/Tooltip";
import styles from "./Navbar.module.css";
import { observer } from "mobx-react";
import {
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { NavbarItemData, NavbarItemSectionEnds } from "../../document/UIData";
import { PlayArrow, Stop } from "../icons/AppleIcons";
import { Commands } from "../../document/tauriCommands";

type Props = object;

type State = object;

class Navbar extends Component<Props, State> {
  state = {};

  render() {
    const { selectedNavbarItem, setSelectedNavbarItem } = uiState;
    const activePath = doc.pathlist.activePath;
    const activePathUUID = doc.pathlist.activePathUUID;
    const isDefaultPath = activePathUUID === doc.pathlist.defaultPath?.uuid;
    const canGenerate = !isDefaultPath && activePath?.canGenerate();
    const isGenerating = activePath?.ui.generating ?? false;

    return (
      <div className={styles.Container}>
        <div className={styles.ToolGroups}>
          {NavbarItemSectionEnds.map((endSplit, sectionIdx) => (
            <ToggleButtonGroup
              className={styles.ToggleGroup}
              exclusive
              value={`${selectedNavbarItem}`}
              onChange={(_e, newSelection: string | null) => {
                if (newSelection !== null) {
                  setSelectedNavbarItem(Number.parseInt(newSelection));
                }
              }}
              key={sectionIdx}
            >
              {NavbarItemData.map(
                (item, index) =>
                  index <= endSplit &&
                  index > (NavbarItemSectionEnds[sectionIdx - 1] ?? -1) && (
                    <Tooltip
                      disableInteractive
                      //@ts-expect-error needs a value prop for ToggleButtonGroup
                      value={`${index}`}
                      title={item.name}
                      key={item.name}
                    >
                      <ToggleButton
                        className={styles.ToolButton}
                        value={`${index}`}
                        aria-label={item.name}
                      >
                        {item.icon}
                      </ToggleButton>
                    </Tooltip>
                  )
              )}
            </ToggleButtonGroup>
          ))}
        </div>

        <div className={styles.ActionArea}>
          <span className={styles.ActionLabel}>PATH</span>
          <Tooltip
            disableInteractive
            title={
              isGenerating
                ? "Cancel Generation"
                : canGenerate
                  ? "Generate Path"
                  : "Generate Path (needs 2 waypoints)"
            }
          >
            <span>
              <Button
                className={`${styles.GenerateButton} ${isGenerating ? styles.CancelButton : ""}`}
                variant="contained"
                disableElevation
                disabled={!isGenerating && !canGenerate}
                startIcon={
                  isGenerating ? (
                    <Stop fontSize={18} />
                  ) : (
                    <PlayArrow fontSize={18} fill="currentColor" />
                  )
                }
                onClick={() => {
                  if (isGenerating && activePath !== undefined) {
                    void Commands.cancel(activePath.handle);
                  } else if (canGenerate) {
                    void generateWithToastsAndExport(activePathUUID);
                  }
                }}
              >
                {isGenerating ? "Cancel" : "Generate"}
                {isGenerating && (
                  <CircularProgress
                    className={styles.GenerateProgress}
                    size={15}
                    thickness={5}
                  />
                )}
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    );
  }
}
export default observer(Navbar);
