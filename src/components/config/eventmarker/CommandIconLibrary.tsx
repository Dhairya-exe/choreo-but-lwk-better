import {
  Adjust,
  Autorenew,
  Bolt,
  Build,
  CallSplit,
  CenterFocusStrong,
  Flag,
  Home,
  Lightbulb,
  Merge,
  Navigation,
  PanTool,
  Place,
  PlayArrow,
  PrecisionManufacturing,
  RocketLaunch,
  Shield,
  Speed,
  SportsBasketball,
  Stop,
  SwapHoriz,
  SyncAlt,
  Timer,
  TrackChanges,
  VerticalAlignBottom,
  VerticalAlignTop,
  type AppleIconComponent,
  type AppleIconProps
} from "../../icons/AppleIcons";

export type CommandIconDefinition = {
  id: string;
  label: string;
  Icon: AppleIconComponent;
};

export const CommandIcons: CommandIconDefinition[] = [
  { id: "bolt", label: "Action", Icon: Bolt },
  { id: "robot", label: "Robot", Icon: PrecisionManufacturing },
  { id: "intake", label: "Intake", Icon: VerticalAlignBottom },
  { id: "eject", label: "Eject", Icon: VerticalAlignTop },
  { id: "shoot", label: "Shoot", Icon: SportsBasketball },
  { id: "target", label: "Target", Icon: TrackChanges },
  { id: "align", label: "Align", Icon: CenterFocusStrong },
  { id: "drive", label: "Drive", Icon: Navigation },
  { id: "speed", label: "Speed", Icon: Speed },
  { id: "place", label: "Place", Icon: Place },
  { id: "score", label: "Score", Icon: Flag },
  { id: "launch", label: "Launch", Icon: RocketLaunch },
  { id: "hold", label: "Hold", Icon: PanTool },
  { id: "wait", label: "Wait", Icon: Timer },
  { id: "light", label: "Lights", Icon: Lightbulb },
  { id: "home", label: "Home", Icon: Home },
  { id: "shield", label: "Defense", Icon: Shield },
  { id: "build", label: "Mechanism", Icon: Build },
  { id: "repeat", label: "Repeat", Icon: Autorenew },
  { id: "swap", label: "Swap", Icon: SwapHoriz },
  { id: "sync", label: "Parallel", Icon: SyncAlt },
  { id: "split", label: "Split", Icon: CallSplit },
  { id: "merge", label: "Merge", Icon: Merge },
  { id: "play", label: "Start", Icon: PlayArrow },
  { id: "stop", label: "Stop", Icon: Stop },
  { id: "point", label: "Point", Icon: Adjust }
];

export const CommandHighlightColors = [
  "#64d2ff",
  "#ff9f0a",
  "#30d158",
  "#ff6482",
  "#bf5af2",
  "#5e9cff",
  "#ffd60a",
  "#63e6be"
];

export function CommandVisualIcon({
  icon,
  ...props
}: AppleIconProps & { icon: string }) {
  const Icon =
    CommandIcons.find((definition) => definition.id === icon)?.Icon ?? Bolt;
  return <Icon {...props} />;
}
