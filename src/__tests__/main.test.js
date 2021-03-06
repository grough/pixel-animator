import PixelAnimator from "../main";

it("should iterate over frames", () => {
  const frameIterator = PixelAnimator({
    columns: 2,
    rows: 2,
    frames: 2,
    colorize: ({ column, row, frame, columns, rows, frames }) => ({
      red: column / columns,
      green: row / rows,
      blue: frame / frames,
    }),
  });
  const frame1 = frameIterator();
  const frame2 = frameIterator();
  const frame3 = frameIterator();
  expect([frame1, frame2]).toMatchSnapshot();
  expect(frame1).toEqual(frame3);
});

it("should maintain state between frames", () => {
  const frameIterator = PixelAnimator({
    columns: 2,
    rows: 2,
    frames: 2,
    evolve: ({ column, row, frame, cells }) => {
      if (frame === 0) return false;
      const self = cells(column, row);
      return !self;
    },
    colorize: ({ cell }) => (cell ? 1 : 0),
  });
  const frame1 = frameIterator();
  const frame2 = frameIterator();
  expect([frame1, frame2]).toMatchSnapshot();
});

it("should wrap when referencing out of bounds cell", () => {
  const frameIterator = PixelAnimator({
    columns: 2,
    rows: 2,
    evolve: ({ column, row, frame, cells }) => {
      if (frame === 0) return [column, row];
      return cells(column - 1, row + 1);
    },
    colorize: ({ cell }) => {
      return { red: cell[0] / 2, green: cell[1] / 2 };
    },
  });
  const frame1 = frameIterator();
  const frame2 = frameIterator();
  expect([frame1, frame2]).toMatchSnapshot();
});

it("should generate HTML when given a DOM node", () => {
  document.body.innerHTML = '<div id="root"></div>';
  const rootElement = document.getElementById("root");
  const transport = PixelAnimator(
    {
      columns: 2,
      rows: 2,
      frames: 2,
      colorize: ({ column, row, frame, columns, rows, frames }) => ({
        red: column / columns,
        green: row / rows,
        blue: frame / frames,
      }),
    },
    rootElement,
  );
  transport.pause();
  transport.next();
  expect(rootElement).toMatchSnapshot("first frame");
  transport.next();
  expect(rootElement).toMatchSnapshot("second frame");
});
