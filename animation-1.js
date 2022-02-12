const rainbow = [
  "#009CDF",
  "#5EBD3E",
  "#FFB900",
  "#F78200",
  "#E23838",
  "#973999",
];

function scale(v, a, b, c, d) {
  return (-v * c + c * b + v * d - a * d) / (b - a);
}

function wave({ column, columns, row, rows, frame, frames }) {
  const t = scale(frame, 0, frames, 0, 1);
  const x = scale(column, 0, columns, 0, 2 * Math.PI);
  const f = 1 - Math.abs(x);
  return Math.sin(1 * x - t * Math.PI * 2);
}

function wave2({ column, columns, row, rows, frame, frames }) {
  const t = scale(frame, 0, frames, 0, 1);
  const x = scale(column, 0, columns, 0, 2 * Math.PI);
  return Math.sin(1 * x + t * Math.PI * 2);
}

function colorize({ column, columns, row, rows, frame, frames }) {
  const x = column / columns;
  const y = row / rows;
  const s = 0;

  const i = Math.round(
    scale(
      wave2({ column, columns, row, rows, frame, frames }),
      -1,
      1,
      0,
      rainbow.length - 1
    )
  );

  const ph = wave({ column, columns, row, rows, frame, frames });
  const sph = scale(ph, -1, 1, s, rows - 1 - s);
  const e = row === Math.round(sph);
  return e ? rainbow[i] : null;
}

PixelAnimator(
  {
    colorize,
    frameRate: 2 ** 4,
    frames: 16,
    columns: 128,
    rows: 5,
  },
  document.getElementById("animation-1")
);
