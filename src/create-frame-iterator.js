import { normalizeColor } from './color';

function mod(x, n) {
  return ((x % n) + n) % n;
}

function index(column, row, columns, rows) {
  return mod(row, rows) * columns + mod(column, columns);
}

function createCellReader(columns, rows, cellData) {
  return (column, row) => cellData[index(column, row, columns, rows)];
}

/*
 * Return a function that, when called, will advance to the next animation
 * frame, calculate all the cell colours for that frame and return them.
 * Calling the function again will return the subsequent frame, and so on.
 */
export function createFrameIterator(animation) {
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
          cells: cellReader,
        };
        const cell = evolve ? evolve(context) : undefined;
        cellData.push(cell);
        const color = colorize({ ...context, cell });
        cellColors = cellColors.concat(normalizeColor(color));
      }
    }
    frame++;
    return cellColors;
  };
}
