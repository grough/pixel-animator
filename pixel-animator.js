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
    return function(column, row) {
      return cellData[index(column, row, columns, rows)];
    };
  }

  function decimalToRgb(decimal) {
    return {
      red: (decimal >> 16) & 255,
      green: (decimal >> 8) & 255,
      blue: decimal & 255
    };
  }

  var baseColor = { red: 0, green: 0, blue: 0, alpha: 1 };

  /**
   * Convert a RGB hexadecimal color string to RGBA components in range 0..1.
   * The alpha channel is ignored and made opaque.
   */
  function stringToColor(userHex) {
    var hex = userHex.indexOf("#") === 0 ? userHex.substring(1) : userHex;
    if (hex.length > 6) return baseColor;
    var decimal = parseInt(hex, 16);
    var color = decimalToRgb(decimal);
    return {
      red: color.red / 255,
      green: color.green / 255,
      blue: color.blue / 255,
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
   * Anything else is assumed to be an object containing  RGBA components in the
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
    var playing;
    var timeoutId;

    function loop() {
      requestAnimationFrame(function next() {
        callback();
        timeoutId = setTimeout(loop, interval);
      });
    }

    return {
      play: function() {
        playing = true;
        clearTimeout(timeoutId);
        timeoutId = loop();
      },
      pause: function() {
        playing = false;
        clearTimeout(timeoutId);
      },
      next: function() {
        playing = false;
        clearTimeout(timeoutId);
        callback();
      },
      playing: function() {
        return playing;
      }
    };
  }

  /*
   * This is a default animation that will render if no user animation is
   * given. It looks like an alternating checkerboard.
   */
  var baseAnimation = {
    columns: 16,
    rows: 16,
    frames: Infinity,
    frameRate: 8,
    colorize: function(context) {
      return Math.floor(context.column + context.row + context.frame / 8) %
        2 ===
        0
        ? context.frame % 2 === 0
          ? 0.92
          : 0.94
        : 0.975;
    }
  };

  /*
   * Return a function that, when called, will advance to the next animation
   * frame, calculate all the cell colours for that frame and return them.
   * Calling the function again will return the subsequent frame, and so on.
   */
  function createFrameIterator(animation) {
    var cellData = [];
    var cellDataPrevious;
    var cellColors;
    var cellReader;
    var frame = 0;
    return function generateNextFrame() {
      cellDataPrevious = cellData;
      cellReader = createCellReader(
        animation.columns,
        animation.rows,
        cellDataPrevious
      );
      cellData = [];
      cellColors = [];
      for (var row = 0; row < animation.rows; row++) {
        for (var column = 0; column < animation.columns; column++) {
          var context = {
            columns: animation.columns,
            rows: animation.rows,
            frames: animation.frames,
            column: column,
            row: row,
            frame: frame % animation.frames,
            cells: cellReader
          };
          var cell = animation.evolve ? animation.evolve(context) : context;
          cellData.push(cell);
          var color = animation.colorize(cell);
          cellColors = cellColors.concat(normalizeColor(color));
        }
      }
      frame++;
      return cellColors;
    };
  }

  function renderAnimatedDom(animation, rootElement) {
    rootElement.classList = rootElement.classList + " pixel-animator";
    var widthStyle = (1 / animation.columns) * 100 + "%";
    var heightStyle = (1 / animation.rows) * 100 + "%";
    for (var index = 0; index < animation.rows * animation.columns; index++) {
      var cellElement = document.createElement("div");
      cellElement.classList = "pa-cell " + "pa-cell-" + index;
      cellElement.style.width = widthStyle;
      cellElement.style.height = heightStyle;
      rootElement.appendChild(cellElement);
    }
    var frameIterator = createFrameIterator(animation);
    var transport = createLooper(
      1000 / animation.frameRate,
      function renderNextFrame() {
        frameIterator().forEach(function(color, index) {
          var cellElement = rootElement.children[index];
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
    var animation = Object.assign({}, baseAnimation, userAnimation);
    if (domNode) return renderAnimatedDom(animation, domNode);
    return createFrameIterator(animation);
  };
});
