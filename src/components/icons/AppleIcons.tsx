import {
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Ban,
  Blend,
  Bot,
  Check as LucideCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsRight,
  Circle as LucideCircle,
  CircleArrowDown,
  CircleDot,
  CircleStop,
  Copy,
  Crosshair,
  Download,
  Dribbble,
  ExternalLink,
  Eye,
  EyeOff,
  FilePlus2,
  Flag as LucideFlag,
  FlipHorizontal2,
  Focus,
  FolderOpen,
  FolderX,
  Gauge,
  GitFork,
  GitMerge,
  GripVertical,
  Grid3X3,
  Hand,
  Hash,
  House,
  Layers3,
  Lightbulb as LucideLightbulb,
  MapPin,
  Maximize2,
  Menu as LucideMenu,
  MoveDown,
  MoveUp,
  Navigation as LucideNavigation,
  Palette,
  Pause as LucidePause,
  Play,
  Plus,
  Redo2,
  RectangleHorizontal,
  RefreshCcw,
  Repeat2,
  Rocket,
  RotateCcw,
  RotateCw,
  Route as LucideRoute,
  Ruler,
  Save as LucideSave,
  Scan,
  Settings as LucideSettings,
  Shield as LucideShield,
  Spline,
  Square,
  SquareCheck,
  Target,
  Timer as LucideTimer,
  Trash2,
  TriangleAlert,
  Undo2,
  Upload,
  WandSparkles,
  Wrench,
  X,
  Zap,
  type LucideIcon,
  type LucideProps
} from "lucide-react";
import { forwardRef } from "react";

export type AppleIconProps = Omit<LucideProps, "color" | "size"> & {
  color?: string;
  htmlColor?: string;
  fontSize?: string | number;
  sx?: Record<string, string | number | undefined>;
};

export type AppleIconComponent = ReturnType<typeof appleIcon>;

const iconSizes = { inherit: "1em", small: 19, medium: 23, large: 31 };

function appleIcon(Icon: LucideIcon) {
  return forwardRef<SVGSVGElement, AppleIconProps>(function AppleIcon(
    {
      color,
      htmlColor,
      fontSize = "medium",
      strokeWidth = 1.75,
      style,
      sx,
      ...props
    },
    ref
  ) {
    const size =
      typeof fontSize === "number"
        ? fontSize
        : (iconSizes[fontSize as keyof typeof iconSizes] ?? fontSize);
    return (
      <Icon
        ref={ref}
        aria-hidden={props["aria-label"] === undefined ? true : undefined}
        size={size}
        color={htmlColor ?? color ?? "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ ...style, ...sx }}
        {...props}
      />
    );
  });
}

export const Add = appleIcon(Plus);
export const Adjust = appleIcon(CircleDot);
export const ArrowCircleDown = appleIcon(CircleArrowDown);
export const ArrowDropDown = appleIcon(ChevronDown);
export const ArrowDropUp = appleIcon(ChevronUp);
export const AspectRatio = appleIcon(Maximize2);
export const Autorenew = appleIcon(RefreshCcw);
export const Bolt = appleIcon(Zap);
export const Build = appleIcon(Wrench);
export const CallSplit = appleIcon(GitFork);
export const CenterFocusStrong = appleIcon(Focus);
export const Check = appleIcon(LucideCheck);
export const CheckBoxOutlined = appleIcon(SquareCheck);
export const CheckBoxOutlineBlankOutlined = appleIcon(Square);
export const Circle = appleIcon(CircleDot);
export const CircleOutlined = appleIcon(LucideCircle);
export const Close = appleIcon(X);
export const ColorLensOutlined = appleIcon(Palette);
export const ContentCopy = appleIcon(Copy);
export const CopyAll = appleIcon(Copy);
export const CropFree = appleIcon(Scan);
export const Delete = appleIcon(Trash2);
export const DoNotDisturb = appleIcon(Ban);
export const DragHandle = appleIcon(GripVertical);
export const ExpandMore = appleIcon(ChevronDown);
export const Flag = appleIcon(LucideFlag);
export const Flip = appleIcon(FlipHorizontal2);
export const FolderOff = appleIcon(FolderX);
export const FolderOpenIcon = appleIcon(FolderOpen);
export const Gradient = appleIcon(Blend);
export const Grid4x4 = appleIcon(Grid3X3);
export const Home = appleIcon(House);
export const KeyboardArrowDown = appleIcon(ChevronDown);
export const KeyboardArrowRight = appleIcon(ChevronRight);
export const KeyboardDoubleArrowRight = appleIcon(ChevronsRight);
export const LayersOutlined = appleIcon(Layers3);
export const Lightbulb = appleIcon(LucideLightbulb);
export const Menu = appleIcon(LucideMenu);
export const Merge = appleIcon(GitMerge);
export const Navigation = appleIcon(LucideNavigation);
export const NearMe = appleIcon(LucideNavigation);
export const NoteAddOutlined = appleIcon(FilePlus2);
export const Numbers = appleIcon(Hash);
export const OpenInNew = appleIcon(ExternalLink);
export const PanTool = appleIcon(Hand);
export const Pause = appleIcon(LucidePause);
export const Place = appleIcon(MapPin);
export const PlayArrow = appleIcon(Play);
export const Polyline = appleIcon(Spline);
export const PrecisionManufacturing = appleIcon(Bot);
export const PriorityHigh = appleIcon(TriangleAlert);
export const Redo = appleIcon(Redo2);
export const RestartAlt = appleIcon(RotateCcw);
export const RocketLaunch = appleIcon(Rocket);
export const Room = appleIcon(MapPin);
export const RotateLeftOutlined = appleIcon(RotateCcw);
export const Route = appleIcon(LucideRoute);
export const Save = appleIcon(LucideSave);
export const ScatterPlot = appleIcon(Crosshair);
export const Settings = appleIcon(LucideSettings);
export const ShapeLine = appleIcon(WandSparkles);
export const Shield = appleIcon(LucideShield);
export const Speed = appleIcon(Gauge);
export const SportsBasketball = appleIcon(Dribbble);
export const SquareOutlined = appleIcon(RectangleHorizontal);
export const Stop = appleIcon(Square);
export const StopCircleOutlined = appleIcon(CircleStop);
export const Straighten = appleIcon(Ruler);
export const SwapHoriz = appleIcon(FlipHorizontal2);
export const SyncAlt = appleIcon(Repeat2);
export const SyncOutlined = appleIcon(RotateCw);
export const SystemUpdateAlt = appleIcon(Download);
export const Timer = appleIcon(LucideTimer);
export const TimerOutlined = appleIcon(LucideTimer);
export const TrackChanges = appleIcon(Target);
export const Undo = appleIcon(Undo2);
export const UploadFile = appleIcon(Upload);
export const VerticalAlignBottom = appleIcon(AlignVerticalJustifyEnd);
export const VerticalAlignTop = appleIcon(AlignVerticalJustifyStart);
export const Visibility = appleIcon(Eye);
export const VisibilityOff = appleIcon(EyeOff);
export const MoveToBottom = appleIcon(MoveDown);
export const MoveToTop = appleIcon(MoveUp);
