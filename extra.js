// https://github.com/grough/pixel-animator
(function(root, factory) {
  if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") module.exports = factory();
  else root.PixelAnimatorExtra = factory();
})(this, function() {
  function scale(v, a, b, c, d) {
    return (-v * c + c * b + v * d - a * d) / (b - a);
  }

  /*
   * Add polar coordinates `angle` and `distance` with respect to an origin
   * at the center of the frame.
   */
  function polar(colorize) {
    return ({ column, row, columns, rows, ...rest }) => {
      const x = scale(column, 0, columns - 1, -1, 1);
      const y = scale(row, 0, rows - 1, -1, 1);
      const theta = Math.atan2(y, x);
      const angle = theta > 0 ? theta : theta + 2 * Math.PI;
      const distance = Math.sqrt(x * x + y * y);
      return colorize({
        ...rest,
        column,
        row,
        columns,
        rows,
        angle,
        distance,
        x,
        y
      });
    };
  }

  /*
   * Given a bounding box, return a function that tells you whether a given
   * point intersects with that box.
   */
  function intersect(boundary) {
    const { left, right, top, bottom } = {
      left: -Infinity,
      right: Infinity,
      top: -Infinity,
      bottom: Infinity,
      ...boundary
    };
    return function(x, y) {
      return x >= left && x <= right && y >= top && y <= bottom;
    };
  }

  /*
   * Add `phase` property to express time from the beginning to the end of an
   * an animation as a number between 0 and 1.
   */
  function phase(colorize) {
    return ({ frame, frames, ...rest }) => {
      return colorize({
        ...rest,
        frame,
        frames,
        phase: frames === Infinity ? 0 : scale(frame, 0, frames - 1, 0, 1)
      });
    };
  }

  return { scale: scale, polar: polar, intersect: intersect, phase: phase };
});
