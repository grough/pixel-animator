// https://github.com/grough/pixel-animator
(function(root, factory) {
  if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") module.exports = factory();
  else root.PixelAnimator = factory();
})(this, function() {
  function mod(x, n) {
    return ((x % n) + n) % n;
  }

  function index(column, row, columns, rows) {
    return mod(row, rows) * columns + mod(column, columns);
  }

  function createCellReader(columns, rows, cellData) {
    return (column, row) => cellData[index(column, row, columns, rows)];
  }

  function fit(columns, rows, target) {
    const scale = target / Math.max(columns, rows);
    if (scale >= 1) {
      return {
        width: Math.floor(columns * scale),
        height: Math.floor(rows * scale)
      };
    }
    return { width: columns, height: rows };
  }

  function decimalToRgb(decimal) {
    return {
      red: (decimal >> 16) & 255,
      green: (decimal >> 8) & 255,
      blue: decimal & 255
    };
  }

  const baseColor = { red: 0, green: 0, blue: 0, alpha: 1 };

  /**
   * Convert a RGB hexadecimal color string to RGBA components in range 0..1.
   * The alpha channel is ignored and made opaque.
   */
  function stringToColor(userHex) {
    const hex = userHex.indexOf("#") === 0 ? userHex.substring(1) : userHex;
    if (hex.length > 6) return baseColor;
    const decimal = parseInt(hex, 16);
    const { red, green, blue } = decimalToRgb(decimal);
    return {
      red: red / 255,
      green: green / 255,
      blue: blue / 255,
      alpha: 1
    };
  }

  /*
   * Normalize a color given in one of the following formats:
   *
   * - A number is treated as a grayscale value.
   * - A string is treated as a hexadecimal RGB color code (no alpha for now).
   * - null is treated as transparent.
   *
   * Anything else is assumed to be an object containing RGBA components in the
   * range 0..1. Any missing components are filled in from `baseColor`.
   */
  function normalizeColor(color) {
    if (typeof color === "number") {
      return { red: color, green: color, blue: color, alpha: 1 };
    }
    if (typeof color === "string") {
      return stringToColor(color);
    }
    if (color === null) {
      return Object.assign({}, baseColor, { alpha: 0 });
    }
    return Object.assign({}, baseColor, color, {
      alpha: typeof color.alpha === "number" ? Math.round(color.alpha) : 1
    });
  }

  /*
   * Schedule a callback function for execution on an interval in milliseconds.
   * Similar to `setInterval` but can be controlled using the returned transport
   * object. `requestAnimationFrame` is meant to prevent calls while the page is
   * in the background.
   */
  function createLooper(interval, callback) {
    let playing;
    let timeoutId;

    function loop() {
      requestAnimationFrame(() => {
        callback();
        timeoutId = setTimeout(loop, interval);
      });
    }

    return {
      play: () => {
        playing = true;
        clearTimeout(timeoutId);
        timeoutId = loop();
      },
      pause: () => {
        playing = false;
        clearTimeout(timeoutId);
      },
      next: () => {
        playing = false;
        clearTimeout(timeoutId);
        callback();
      },
      playing: () => playing
    };
  }

  /*
   * This is a default animation that will render if no user animation is
   * given. It looks like an alternating checkerboard.
   */
  const baseAnimation = {
    columns: 16,
    rows: 16,
    frames: Infinity,
    frameRate: 8,
    colorize: ({ column, row, frame }) =>
      Math.floor(column + row + frame / 8) % 2 === 0
        ? frame % 2 === 0
          ? 0.92
          : 0.94
        : 0.975
  };

  /*
   * Return a function that, when called, will advance to the next animation
   * frame, calculate all the cell colours for that frame and return them.
   * Calling the function again will return the subsequent frame, and so on.
   */
  function createFrameIterator(animation) {
    const { columns, rows, frames, evolve, colorize } = animation;
    let cellData = [];
    let cellDataPrevious;
    let cellColors;
    let cellReader;
    let frame = 0;
    return function generateNextFrame() {
      cellDataPrevious = cellData;
      cellReader = createCellReader(columns, rows, cellDataPrevious);
      cellData = [];
      cellColors = [];
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const context = {
            columns,
            rows,
            frames,
            column,
            row,
            frame: frame % frames,
            cells: cellReader
          };
          const cell = evolve ? evolve(context) : context;
          cellData.push(cell);
          const color = colorize(cell);
          cellColors = cellColors.concat(normalizeColor(color));
        }
      }
      frame++;
      return cellColors;
    };
  }

  function renderAnimatedDom(animation, rootElement) {
    rootElement.classList = rootElement.classList + " pixel-animator";
    const size = fit(
      animation.columns,
      animation.rows,
      rootElement.clientWidth || 320
    );
    rootElement.style.width = size.width + "px";
    rootElement.style.height = size.height + "px";
    const cellWidth = (1 / animation.columns) * 100 + "%";
    const cellHeight = (1 / animation.rows) * 100 + "%";
    for (let index = 0; index < animation.rows * animation.columns; index++) {
      const cellElement = document.createElement("div");
      cellElement.classList = "pa-cell " + "pa-cell-" + index;
      cellElement.style.width = cellWidth;
      cellElement.style.height = cellHeight;
      cellElement.style.display = "inline-block";
      rootElement.appendChild(cellElement);
    }
    const frameIterator = createFrameIterator(animation);
    const transport = createLooper(
      1000 / animation.frameRate,
      function renderNextFrame() {
        frameIterator().forEach((color, index) => {
          const cellElement = rootElement.children[index];
          cellElement.style.backgroundColor =
            "rgba(" +
            [
              Math.floor(color.red * 255),
              Math.floor(color.green * 255),
              Math.floor(color.blue * 255),
              color.alpha
            ].join(",") +
            ")";
        });
      }
    );
    transport.play();
    return transport;
  }

  return function PixelAnimator(userAnimation, domNode) {
    const animation = Object.assign({}, baseAnimation, userAnimation);
    if (domNode) return renderAnimatedDom(animation, domNode);
    return createFrameIterator(animation);
  };
});
