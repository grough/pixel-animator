import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'src/main.js',
    output: {
      file: __dirname + '/main.js',
      format: 'umd',
      name: 'PixelAnimator',
    },
    plugins: [babel()],
  },
  {
    input: 'src/extra.js',
    output: {
      file: __dirname + '/extra.js',
      format: 'umd',
      name: 'PixelAnimatorExtra',
    },
    plugins: [babel()],
  },
];
