import { Animation } from "./index";

export const baseAnimation: Animation = {
  columns: 16,
  rows: 16,
  frames: 16,
  frameRate: 8,
  colorize: ({ column, row, frame }) =>
    Math.floor(column + row + frame / 8) % 2 === 0
      ? frame % 2 === 0
        ? 0.92
        : 0.94
      : 0.975,
};
