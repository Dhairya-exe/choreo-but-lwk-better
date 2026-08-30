import "@fontsource-variable/roboto-mono/wght-italic";
import "@fontsource-variable/roboto-mono";
import "@fontsource/roboto";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Body from "./Body";

// Keep one stable theme so workspace updates do not rebuild MUI's style graph.
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#9f92ff" },
    secondary: { main: "#7565ee" },
    background: {
      default: "#080a10",
      paper: "rgba(29, 31, 43, 0.78)"
    },
    text: {
      primary: "#f7f7fb",
      secondary: "rgba(235, 235, 245, 0.68)"
    }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Roboto, sans-serif',
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "-0.01em" }
  },
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          transition:
            "background-color 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease",
          "&:focus-visible": {
            outline: "2px solid var(--ios-blue)",
            outlineOffset: 2
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 34,
          borderRadius: 12,
          color: "var(--text-primary)",
          border: "1px solid var(--glass-border)",
          background: "var(--glass-control)",
          boxShadow: "inset 0 1px 0 var(--glass-highlight)",
          "&:hover": { background: "var(--glass-control-hover)" },
          "&:active": { transform: "scale(0.97)" }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 36,
          height: 36,
          padding: 7,
          marginInline: 2,
          color: "var(--text-primary)",
          borderRadius: 12,
          "&:hover": { background: "var(--glass-control-hover)" },
          "&:active": { transform: "scale(0.92)" },
          "&.Mui-disabled": { color: "var(--text-disabled)" }
        }
      }
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          padding: 3,
          gap: 2,
          borderRadius: 14,
          border: "1px solid var(--glass-border)",
          background: "rgba(0, 0, 0, 0.18)",
          boxShadow: "inset 0 1px 1px rgba(0, 0, 0, 0.2)"
        },
        grouped: {
          border: "0 !important",
          borderRadius: "10px !important"
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minWidth: 38,
          minHeight: 38,
          padding: 7,
          color: "var(--accent-purple)",
          "&:hover": { background: "rgba(255, 255, 255, 0.09)" },
          "&.Mui-selected": {
            color: "white",
            background:
              "linear-gradient(180deg, rgba(176, 164, 255, 0.96), rgba(113, 94, 235, 0.96))",
            boxShadow:
              "0 3px 12px rgba(82, 65, 211, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.34)",
            "&:hover": { background: "var(--darker-purple)" }
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { width: 30, height: 30, color: "var(--text-secondary)" }
      }
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: "var(--divider-gray)" } }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "var(--glass-surface-strong)",
          backgroundImage: "var(--glass-sheen)",
          borderRight: "1px solid var(--glass-border)",
          boxShadow: "18px 0 48px rgba(0, 0, 0, 0.38)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--glass-surface-strong)",
          backgroundImage: "var(--glass-sheen)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)"
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "rgba(32, 34, 44, 0.92)",
          border: "1px solid var(--glass-border)",
          borderRadius: 9,
          boxShadow: "0 8px 22px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(14px)"
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        rail: { opacity: 1, background: "rgba(255, 255, 255, 0.12)" },
        track: { border: 0, background: "var(--accent-gradient)" },
        thumb: {
          background: "#fff",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.32)"
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Body />
    </ThemeProvider>
  );
}

export default App;
