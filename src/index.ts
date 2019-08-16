type Boundaries = {
  columns: number;
  rows: number;
  frames: number;
};

type Position = {
  column: number;
  row: number;
  frame: number;
};

type FrameContext = Boundaries & Position;

type CellReader<Cell> = (column: number, row: number) => Cell;

export type Animation<Cell = FrameContext> = {
  columns: number;
  rows: number;
  frames: number;
  frameRate: number;
  evolve?: (context: FrameContext & { cells: CellReader<Cell> }) => Cell;
  colorize: (cell: Cell) => UserColor;
};

export type UserAnimation<Cell = FrameContext> = {
  columns?: number;
  rows?: number;
  frames?: number;
  frameRate?: number;
  evolve?: (context: FrameContext & { cells: CellReader<Cell> }) => Cell;
  colorize: (cell: Cell) => UserColor;
};

type UserColor = { red?: number; green?: number; blue?: number } | number;

type Color = {
  red: number;
  green: number;
  blue: number;
};

type Pixel = [number, number, number, number];

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

function normalizeColor(color: UserColor): Color {
  if (typeof color === "number") {
    return { red: color, green: color, blue: color };
  }
  return { red: 0, green: 0, blue: 0, ...color };
}

function userColorToPixel(userColor: UserColor): Pixel {
  const color: Color = normalizeColor(userColor);
  return [
    Math.floor(color.red),
    Math.floor(color.green),
    Math.floor(color.blue),
    255,
  ];
}

export function* animator<Cell = FrameContext>(animation: Animation<Cell>) {
  const { columns, rows, frames, evolve, colorize } = animation;
  let cellData: Cell[] = [];
  let cellDataPrevious: Cell[];
  let imageData: number[];
  let cellReader: CellReader<Cell>;
  let frame = 0;
  while (true) {
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
          frame: frame % frames,
          cells: cellReader,
        };
        const cell = evolve ? evolve(context) : context;
        // @ts-ignore FIXME
        cellData.push(cell);
        // @ts-ignore FIXME
        const color = colorize(cell);
        imageData = imageData.concat(userColorToPixel(color));
      }
    }
    yield new Uint8ClampedArray(imageData);
    frame += 1;
  }
}

export { render } from "./render-web";
