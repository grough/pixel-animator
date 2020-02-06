const namedColors = {
  navy: '001f3f',
  blue: '0074D9',
  aqua: '7FDBFF',
  teal: '39CCCC',
  olive: '3D9970',
  green: '2ECC40',
  lime: '01FF70',
  yellow: 'FFDC00',
  orange: 'FF851B',
  red: 'FF4136',
  maroon: '85144b',
  fuchsia: 'F012BE',
  purple: 'B10DC9',
  black: '111111',
  gray: 'AAAAAA',
  silver: 'DDDDDD',
};

function decimalToRgb(decimal) {
  return {
    red: (decimal >> 16) & 255,
    green: (decimal >> 8) & 255,
    blue: decimal & 255,
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
  if (string.indexOf('#') === 0 && string.length > 6) {
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
export function normalizeColor(color) {
  if (typeof color === 'string') {
    return stringToColor(color);
  }
  if (typeof color === 'number') {
    return {
      red: scale(color),
      green: scale(color),
      blue: scale(color),
      alpha: 1,
    };
  }
  if (color === null) {
    return { red: 0, green: 0, blue: 0, alpha: 0 };
  }
  return {
    red: color.red ? scale(color.red) : 0,
    green: color.green ? scale(color.green) : 0,
    blue: color.blue ? scale(color.blue) : 0,
    alpha: typeof color.alpha === 'number' ? Math.round(color.alpha) : 1,
  };
}
