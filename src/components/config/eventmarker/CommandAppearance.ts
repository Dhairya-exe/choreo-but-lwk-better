import { ICommandStore } from "../../../document/CommandStore";
import { doc } from "../../../document/DocumentManager";

export type CommandAppearance = { icon: string; color: string };

const builtInAppearances: Record<string, CommandAppearance> = {
  stay: { icon: "hold", color: "#ff9f0a" },
  wait: { icon: "wait", color: "#64d2ff" },
  sequential: { icon: "play", color: "#bf5af2" },
  parallel: { icon: "sync", color: "#5e9cff" },
  deadline: { icon: "stop", color: "#ff6482" },
  race: { icon: "speed", color: "#ffd60a" },
  none: { icon: "bolt", color: "#64d2ff" }
};

export function getCommandAppearance(
  command: ICommandStore
): CommandAppearance {
  if (command.isNamed) {
    const global = doc.getCommandAppearance(command.name);
    return global?.serialize ?? builtInAppearances.none;
  }
  if (command.isGroup) {
    const firstMeaningful = command.commands.find((child) => !child.isNone);
    if (firstMeaningful) return getCommandAppearance(firstMeaningful);
  }
  return builtInAppearances[command.type] ?? builtInAppearances.none;
}
