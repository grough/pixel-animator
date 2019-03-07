import { Color, CellReader, Renderable, Mutator } from "./index.d";

export const mod = (x: number, n: number): number => ((x % n) + n) % n;

export const index = (
  column: number,
  row: number,
  width: number,
  height: number,
) => mod(row, height) * width + mod(column, width);

export const createCellReader = <C>(
  width: number,
  height: number,
  cellData: C[],
): CellReader<C> => (column, row) =>
  cellData[index(column, row, width, height)];

const colorToPixel = (color: Color): [number, number, number, number] => {
  return [
    Math.floor(color.red * 255),
    Math.floor(color.green * 255),
    Math.floor(color.blue * 255),
    255,
  ];
};

export function* animator<C>({
  mutator,
  colorizer,
  width,
  height,
  frames,
}: Renderable<C>) {
  let cellData: C[] = [];
  let cellDataPrevious: C[];
  let imageData: number[];
  let cellReader: CellReader<C>;
  for (let frame = 0; frame < frames; frame++) {
    cellDataPrevious = cellData;
    cellReader = createCellReader(width, height, cellDataPrevious);
    cellData = [];
    imageData = [];
    for (let row = 0; row < height; row++) {
      for (let column = 0; column < width; column++) {
        const cell: C = mutator({ column, row, frame, cells: cellReader });
        cellData.push(cell);
        const color = colorizer(cell);
        imageData = imageData.concat(colorToPixel(color));
      }
    }
    yield new Uint8ClampedArray(imageData);
  }
}
