const PixelAnimator = require("../pixel-animator");

it("should iterate over frames", () => {
  const frameIterator = PixelAnimator({
    columns: 2,
    rows: 2,
    frames: 2,
    colorize: ({ column, row, frame, columns, rows, frames }) => ({
      red: column / columns,
      green: row / rows,
      blue: frame / frames
    })
  });
  const frame1 = frameIterator();
  const frame2 = frameIterator();
  const frame3 = frameIterator();
  expect([frame1, frame2]).toMatchSnapshot();
  expect(frame1).toEqual(frame3);
});

it("should generate a stateless 2×2×2 animation", () => {
  document.body.innerHTML = `<div id="root"></div>`;
  const rootElement = document.getElementById("root");
  const transport = PixelAnimator(
    {
      columns: 2,
      rows: 2,
      frames: 2,
      colorize: ({ column, row, frame, columns, rows, frames }) => ({
        red: column / columns,
        green: row / rows,
        blue: frame / frames
      })
    },
    rootElement
  );
  transport.pause();
  transport.next();
  expect(rootElement).toMatchSnapshot("first frame");
  transport.next();
  expect(rootElement).toMatchSnapshot("second frame");
});

it("should generate a stateful or evolving 2×2×2 animation", () => {
  document.body.innerHTML = `<div id="root"></div>`;
  const rootElement = document.getElementById("root");
  const transport = PixelAnimator(
    {
      columns: 2,
      rows: 2,
      frames: 2,
      frameRate: 1,
      evolve: ({ column, row, frame, cells }) => {
        if (frame === 0) return false;
        return !cells(column, row);
      },
      colorize: cell => (cell ? 1 : 0)
    },
    rootElement
  );
  transport.pause();
  transport.next();
  expect(rootElement).toMatchSnapshot("first frame");
  transport.next();
  expect(rootElement).toMatchSnapshot("second frame");
});
