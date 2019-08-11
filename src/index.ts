type Boundaries = {
  columns: number;
  rows: number;
  frames: number;
};

type Coordinate = {
  column: number;
  row: number;
  frame: number;
};

type FrameContext = Boundaries & Coordinate;

type CellReader<Cell> = (column: number, row: number) => Cell;

type Color = {
  red: number;
  green: number;
  blue: number;
};

export type Animation<Cell = FrameContext> = {
  columns?: number;
  rows?: number;
  frames?: number;
  evolve?: (context: FrameContext & { cells: CellReader<Cell> }) => Cell;
  colorize: (cell: Cell) => Color;
};

export function mod(x: number, n: number): number {
  return ((x % n) + n) % n;
}

export function index(
  column: number,
  row: number,
  columns: number,
  rows: number,
) {
  return mod(row, rows) * columns + mod(column, columns);
}

export function createCellReader<Cell>(
  columns: number,
  rows: number,
  cellData: Cell[],
): CellReader<Cell> {
  return (column, row) => cellData[index(column, row, columns, rows)];
}

function colorToPixel(color: Color): [number, number, number, number] {
  return [
    Math.floor(color.red),
    Math.floor(color.green),
    Math.floor(color.blue),
    255,
  ];
}

export function* animator<Cell = FrameContext>(animation: Animation<Cell>) {
  const { columns, rows, frames, evolve, colorize } = {
    columns: 16,
    rows: 16,
    frames: 16,
    ...animation,
  };
  let cellData: Cell[] = [];
  let cellDataPrevious: Cell[];
  let imageData: number[];
  let cellReader: CellReader<Cell>;
  for (let frame = 0; frame < frames; frame++) {
    cellDataPrevious = cellData;
    cellReader = createCellReader<Cell>(columns, rows, cellDataPrevious);
    cellData = [];
    imageData = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const context = {
          columns,
          rows,
          frames,
          column,
          row,
          frame,
          cells: cellReader,
        };
        const cell = evolve ? evolve(context) : context;
        // @ts-ignore FIXME
        cellData.push(cell);
        // @ts-ignore FIXME
        const color = colorize(cell);
        imageData = imageData.concat(colorToPixel(color));
      }
    }
    yield new Uint8ClampedArray(imageData);
  }
}

export { render } from "./render-web";
