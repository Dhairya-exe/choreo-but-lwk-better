import { Close } from "../../icons/AppleIcons";
import { IconButton, Popover, TextField, Tooltip } from "@mui/material";
import { observer } from "mobx-react";
import { useMemo, useState } from "react";
import {
  CommandHighlightColors,
  CommandIcons,
  CommandVisualIcon
} from "./CommandIconLibrary";
import styles from "./CommandIconPicker.module.css";

type Props = {
  icon: string;
  color: string;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
};

function CommandIconPicker({ icon, color, setIcon, setColor }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query.length === 0
      ? CommandIcons
      : CommandIcons.filter((icon) =>
          `${icon.id} ${icon.label}`.toLowerCase().includes(query)
        );
  }, [search]);

  return (
    <>
      <Tooltip disableInteractive title="Command icon and field highlight">
        <IconButton
          size="small"
          aria-label="Choose command icon"
          onClick={(event) => {
            event.stopPropagation();
            setAnchor(event.currentTarget);
          }}
          sx={{ color }}
        >
          <CommandVisualIcon icon={icon} fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        onClick={(event) => event.stopPropagation()}
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <div className={styles.Picker}>
          <div className={styles.Header}>
            <span className={styles.Title}>Command appearance</span>
            <IconButton size="small" onClick={() => setAnchor(null)}>
              <Close fontSize="small" />
            </IconButton>
          </div>
          <TextField
            fullWidth
            autoFocus
            size="small"
            placeholder="Search icons"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className={styles.Grid}>
            {filteredIcons.map(({ id, label }) => (
              <Tooltip key={id} disableInteractive title={label}>
                <button
                  type="button"
                  aria-label={label}
                  className={`${styles.IconButton} ${
                    icon === id ? styles.IconButtonSelected : ""
                  }`}
                  style={{ color }}
                  onClick={() => setIcon(id)}
                >
                  <CommandVisualIcon icon={id} fontSize="small" />
                </button>
              </Tooltip>
            ))}
          </div>
          <span className={styles.SectionLabel}>Highlight color</span>
          <div className={styles.Colors}>
            {CommandHighlightColors.map((colorChoice) => (
              <button
                key={colorChoice}
                type="button"
                aria-label={`Use ${colorChoice}`}
                className={`${styles.Color} ${
                  color === colorChoice ? styles.ColorSelected : ""
                }`}
                style={{ color: colorChoice }}
                onClick={() => setColor(colorChoice)}
              />
            ))}
          </div>
          <span className={styles.Hint}>
            This appearance is global for the command and saved in the project
            .chor file.
          </span>
        </div>
      </Popover>
    </>
  );
}

export default observer(CommandIconPicker);
