import { animator, Animation } from ".";

let playing = false;
let fps = 10;
let imageData;

export function render(userAnimation: Animation, canvas: HTMLCanvasElement) {
  const animation = {
    columns: 16,
    rows: 16,
    frames: Infinity,
    ...userAnimation,
  };
  canvas.width = animation.columns;
  canvas.height = animation.rows;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get canvas rendering context.");
  const getAnimator = () => animator(animation);
  let frames = getAnimator();

  function paint() {
    const frame = frames.next();
    imageData = frame.value;
    if (frame.done) {
      frames = getAnimator();
      imageData = frames.next().value;
    }
    context.putImageData(
      new ImageData(imageData, animation.columns, animation.rows),
      0,
      0,
    );
    if (playing)
      setTimeout(() => {
        requestAnimationFrame(paint);
      }, 1000 / fps);
  }

  return {
    play: (params: { framesPerSecond: number }) => {
      if (params && params.framesPerSecond) fps = params.framesPerSecond;
      playing = true;
      paint();
    },
    pause: () => {
      playing = false;
    },
    next: () => {
      playing = false;
      paint();
    },
    playing: () => playing,
  };
}
