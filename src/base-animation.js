/*
 * This is a default animation that will render if no user animation is
 * given. It looks like an alternating checkerboard.
 */
export const baseAnimation = {
  columns: 16,
  rows: 16,
  frames: Infinity,
  frameRate: 8,
  colorize: ({ column, row, frame }) =>
    Math.floor(column + row + frame / 8) % 2 === 0
      ? frame % 2 === 0
        ? 0.92
        : 0.94
      : 0.975,
};
