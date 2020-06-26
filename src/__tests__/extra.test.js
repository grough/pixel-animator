import { scale, intersect } from "../extra";

it("should map a value from one range to another", () => {
  expect(scale(0.5, 0, 1, 10, 20)).toBe(15);
  expect(scale(1.5, 1, 2, 0, 1)).toBe(0.5);
});

it("should determine whether a point intersects a space", () => {
  const square = intersect({ left: -1, right: 1, top: -1, bottom: 1 });
  expect(square(0, 0)).toBe(true);
  expect(square(-0.999, 0.999)).toBe(true);
  expect(square(-1, 1)).toBe(true);
  expect(square(-1.001, 1.001)).toBe(false);
  expect(square(1, 1)).toBe(true);

  const right = intersect({ left: 0 });
  expect(right(0, 0)).toBe(true);
  expect(right(1, 0)).toBe(true);
  expect(right(-1, 0)).toBe(false);
  expect(right(-1, 1)).toBe(false);
  expect(right(-1, -1)).toBe(false);
});
