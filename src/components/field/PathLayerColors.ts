const PATH_LAYER_COLORS = [
  "#64d2ff",
  "#ff9f0a",
  "#30d158",
  "#ff6482",
  "#bf5af2",
  "#5e9cff",
  "#ffd60a",
  "#63e6be"
] as const;

export function getPathLayerColor(index: number): string {
  return PATH_LAYER_COLORS[index % PATH_LAYER_COLORS.length];
}

export function getUnusedPathLayerColor(usedColors: string[]): string {
  const used = new Set(usedColors.map((color) => color.toLowerCase()));
  return (
    PATH_LAYER_COLORS.find((color) => !used.has(color.toLowerCase())) ??
    getPathLayerColor(usedColors.length)
  );
}
