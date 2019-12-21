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

  const namedColors = {
    navy: "001f3f",
    blue: "0074D9",
    aqua: "7FDBFF",
    teal: "39CCCC",
    olive: "3D9970",
    green: "2ECC40",
    lime: "01FF70",
    yellow: "FFDC00",
    orange: "FF851B",
    red: "FF4136",
    maroon: "85144b",
    fuchsia: "F012BE",
    purple: "B10DC9",
    black: "111111",
    gray: "AAAAAA",
    silver: "DDDDDD"
  };

  function decimalToRgb(decimal) {
    return {
      red: (decimal >> 16) & 255,
      green: (decimal >> 8) & 255,
      blue: decimal & 255
    };
  }

  function hexToRgba(hex) {
    const decimal = parseInt(hex, 16);
    const { red, green, blue } = decimalToRgb(decimal);
    return { red: red, green: green, blue: blue, alpha: 1 };
  }

  /**
   * Convert a RGB hexadecimal color string like "#FF4136" or human color name
   * like "red" to RGBA components in range 0..1. The alpha channel is ignored.
   */
  function stringToColor(userString) {
    const string = userString.trim().toLowerCase();
    const namedColor = namedColors[string];
    if (namedColor) {
      return hexToRgba(namedColor);
    }
    if (string.indexOf("#") === 0 && string.length > 6) {
      return hexToRgba(string.substring(1, 7));
    }
    return { red: 0, green: 0, blue: 0, alpha: 1 };
  }

  function scale(number) {
    return Math.floor(255 * number);
  }

  /*
   * Normalize a color given in one of the following formats:
   *
   * - A string is treated as a hexadecimal RGB color code (no alpha for now).
   * - A number is treated as a grayscale value.
   * - null is treated as transparent.
   *
   * Anything else is assumed to be an object containing RGBA components
   * in the range 0..1.
   */
  function normalizeColor(color) {
    if (typeof color === "string") {
      return stringToColor(color);
    }
    if (typeof color === "number") {
      return {
        red: scale(color),
        green: scale(color),
        blue: scale(color),
        alpha: 1
      };
    }
    if (color === null) {
      return { red: 0, green: 0, blue: 0, alpha: 0 };
    }
    return {
      red: color.red ? scale(color.red) : 0,
      green: color.green ? scale(color.green) : 0,
      blue: color.blue ? scale(color.blue) : 0,
      alpha: typeof color.alpha === "number" ? Math.round(color.alpha) : 1
    };
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
      cellElement.style.verticalAlign = "top";
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
            [color.red, color.green, color.blue, color.alpha].join(",") +
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
