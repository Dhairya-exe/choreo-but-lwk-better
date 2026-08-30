import { Instance, types } from "mobx-state-tree";
import { CommandAppearanceMetadata } from "./schema/DocumentTypes";

export const CommandAppearanceStore = types
  .model("CommandAppearanceStore", {
    name: types.identifier,
    icon: types.string,
    color: types.string
  })
  .views((self) => ({
    get serialize(): CommandAppearanceMetadata {
      return { icon: self.icon, color: self.color };
    }
  }))
  .actions((self) => ({
    setIcon(icon: string) {
      self.icon = icon;
    },
    setColor(color: string) {
      self.color = color;
    }
  }));

export type ICommandAppearanceStore = Instance<typeof CommandAppearanceStore>;
