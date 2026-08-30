import { Add, RestartAlt } from "../../icons/AppleIcons";
import { Button, IconButton, TextField, Tooltip } from "@mui/material";
import { observer } from "mobx-react";
import { useState } from "react";
import { doc } from "../../../document/DocumentManager";
import CommandIconPicker from "../eventmarker/CommandIconPicker";
import styles from "./CommandsConfigPanel.module.css";

function CommandsConfigPanel() {
  const [newName, setNewName] = useState("");
  const names = doc.globalCommandNames;
  const addCommand = () => {
    doc.ensureCommandAppearance(newName);
    setNewName("");
  };

  return (
    <div className={styles.Panel}>
      <p className={styles.Intro}>
        Command icons and colors are shared across every path in this project.
        Colored trajectory spans can be toggled from View Layers.
      </p>
      <div className={styles.AddRow}>
        <TextField
          size="small"
          label="Command name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addCommand();
          }}
        />
        <Button
          startIcon={<Add />}
          disabled={!newName.trim()}
          onClick={addCommand}
        >
          Add
        </Button>
      </div>
      <div className={styles.List}>
        {names.length === 0 && (
          <div className={styles.Empty}>No named commands yet.</div>
        )}
        {names.map((name) => {
          const appearance = doc.getCommandAppearance(name);
          const icon = appearance?.icon ?? "bolt";
          const color = appearance?.color ?? "#64d2ff";
          return (
            <div className={styles.Row} key={name}>
              <CommandIconPicker
                icon={icon}
                color={color}
                setIcon={(nextIcon) =>
                  doc.setCommandAppearanceIcon(name, nextIcon)
                }
                setColor={(nextColor) =>
                  doc.setCommandAppearanceColor(name, nextColor)
                }
              />
              <span className={styles.Name}>{name}</span>
              {appearance ? (
                <Tooltip disableInteractive title="Reset appearance">
                  <IconButton
                    size="small"
                    onClick={() => doc.deleteCommandAppearance(name)}
                  >
                    <RestartAlt fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <span className={styles.Status}>Default</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default observer(CommandsConfigPanel);
