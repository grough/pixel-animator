import { mod, createCellReader, animator } from ".";

it("should wrap positive and negative numbers", () => {
  expect(mod(5, 4)).toBe(1);
  expect(mod(-3, 4)).toBe(1);
});

it("should create an array accessor", () => {
  // prettier-ignore
  const cellData = [
    0,0,0,0,0,0,1,0,
    0,0,2,0,0,0,0,0,
    0,0,0,0,3,0,0,0,
    0,0,0,4,0,0,0,0,
  ];
  const cells = createCellReader(8, 4, cellData);
  expect(cells(0, 0)).toBe(0);
  expect(cells(6, 0)).toBe(1);
  expect(cells(4, 2)).toBe(3);
  expect(cells(3, 3)).toBe(4);
  expect(cells(3, 3)).toBe(4);
  expect(cells(2, 1)).toBe(2);
  expect(cells(2, 5)).toBe(2);
  expect(cells(2, -3)).toBe(2);
});

it("should generate a stateless 2×2×2 animation", () => {
  // @ts-ignore
  const gen = animator({
    columns: 2,
    rows: 2,
    frames: 2,
    colorize: ({ column, row, frame, columns, rows, frames }) => ({
      red: column / columns,
      green: row / rows,
      blue: frame / frames,
    }),
  });
  // prettier-ignore
  const outputFrame1 = new Uint8ClampedArray([
    0, 0, 0, 255,
    128, 0, 0, 255,
    0, 128, 0, 255,
    128, 128, 0, 255
  ]);
  // prettier-ignore
  const outputFrame2 = new Uint8ClampedArray([
    0, 0, 128, 255,
    128, 0, 128, 255,
    0, 128, 128, 255,
    128, 128, 128, 255
  ]);
  expect(gen.next().value).toEqual(outputFrame1);
  expect(gen.next().value).toEqual(outputFrame2);
  // Expect generator to loop back to the first frame
  expect(gen.next().value).toEqual(outputFrame1);
});

it("should generate a stateful/evolving 2×2×2 animation", () => {
  // @ts-ignore
  const gen = animator<boolean>({
    columns: 2,
    rows: 2,
    frames: 2,
    evolve: ({ column, row, frame, cells }) => {
      if (frame === 0) return false;
      return !cells(column, row);
    },
    colorize: cell => (cell ? 1 : 0),
  });
  // prettier-ignore
  const outputFrame1 = new Uint8ClampedArray([
    0, 0, 0, 255,
    0, 0, 0, 255,
    0, 0, 0, 255,
    0, 0, 0, 255
  ]);
  // prettier-ignore
  const outputFrame2 = new Uint8ClampedArray([
    255, 255, 255, 255,
    255, 255, 255, 255,
    255, 255, 255, 255,
    255, 255, 255, 255
  ]);
  expect(gen.next().value).toEqual(outputFrame1);
  expect(gen.next().value).toEqual(outputFrame2);
  // Expect generator to loop back to the first frame
  expect(gen.next().value).toEqual(outputFrame1);
});
