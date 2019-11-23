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

  function decimalToRgb(decimal) {
    return {
      red: (decimal >> 16) & 255,
      green: (decimal >> 8) & 255,
      blue: decimal & 255
    };
  }

  function stringToColor(userHex) {
    const hex = userHex.indexOf("#") === 0 ? userHex.substring(1) : userHex;
    if (hex.length > 6) {
      return { red: 0, green: 0, blue: 0 };
    }
    const decimal = parseInt(hex, 16);
    const { red, green, blue } = decimalToRgb(decimal);
    return {
      red: red / 255,
      green: green / 255,
      blue: blue / 255
    };
  }

  function normalizeColor(color) {
    if (typeof color === "number") {
      return { red: color, green: color, blue: color };
    }
    if (typeof color === "string") {
      return stringToColor(color);
    }
    return { red: 0, green: 0, blue: 0, ...color };
  }

  /**
   * Schedule a callback function for execution on an interval in milliseconds.
   * Similar to `setInterval` but it can be controlled using the returned
   * transport object. `requestAnimationFrame` should prevent calls while the
   * page is in the background.
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

  /**
   * Here's a default animation that will render if no user animation is
   * provided. It looks like an alternating checkerboard.
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

  /**
   * Return a function that, when called, will advance to the next animation
   * frame, calculate all the cell colours for that frame and return them.
   * Calling the function again with return the subsequent frame, and so on.
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
    const widthStyle = (1 / animation.columns) * 100 + "%";
    const heightStyle = (1 / animation.rows) * 100 + "%";
    for (let index = 0; index < animation.rows * animation.columns; index++) {
      const cellElement = document.createElement("div");
      cellElement.classList = "pa-cell " + "pa-cell-" + index;
      cellElement.style.width = widthStyle;
      cellElement.style.height = heightStyle;
      rootElement.appendChild(cellElement);
    }
    const frameIterator = createFrameIterator(animation);
    const transport = createLooper(
      1000 / animation.frameRate,
      function renderNextFrame() {
        frameIterator().forEach((color, index) => {
          const cellElement = rootElement.children[index];
          cellElement.style.backgroundColor =
            "rgb(" +
            [
              Math.floor(color.red * 255),
              Math.floor(color.green * 255),
              Math.floor(color.blue * 255)
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
