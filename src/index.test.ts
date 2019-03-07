import { Address } from "./index.d";
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

it("should generate a 2×2×2 animation", () => {
  const width = 2;
  const height = 2;
  const frames = 2;
  const gen = animator({
    mutator: context => context,
    colorizer: (cell: Address) => ({
      red: cell.column / width,
      green: cell.row / height,
      blue: cell.frame / frames,
    }),
    width,
    height,
    frames,
  });
  expect(gen.next().value).toEqual(
    // prettier-ignore
    new Uint8ClampedArray([
      0, 0, 0, 255,
      127, 0, 0, 255,
      0, 127, 0, 255,
      127, 127, 0, 255
    ]),
  );
  expect(gen.next().value).toEqual(
    // prettier-ignore
    new Uint8ClampedArray([
      0, 0, 127, 255,
      127, 0, 127, 255,
      0, 127, 127, 255,
      127, 127, 127, 255
    ]),
  );
  expect(gen.next().done).toBe(true);
});
