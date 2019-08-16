import { animator, Animation, UserAnimation } from ".";
import { baseAnimation } from "./defaults";

let playing = true;
let imageData;
let currentAnimationFrame;

export function render(
  userAnimation: UserAnimation,
  canvas: HTMLCanvasElement,
) {
  const animation: Animation = { ...baseAnimation, ...userAnimation };
  canvas.width = animation.columns;
  canvas.height = animation.rows;
  const context = canvas.getContext("2d");
  const getAnimator = () => animator(animation);
  let frames = getAnimator();

  function schedule(fn: any) {
    setTimeout(fn, 1000 / animation.frameRate);
  }

  function paint(frameNumber: number) {
    const frame = frames.next();
    imageData = frame.value;
    if (frame.done) {
      frames = getAnimator();
      imageData = frames.next().value;
    }
    // @ts-ignore
    context.putImageData(
      // @ts-ignore
      new ImageData(imageData, animation.columns, animation.rows),
      0,
      0,
    );
    if (playing)
      schedule(() => {
        currentAnimationFrame = requestAnimationFrame(() =>
          paint((frameNumber + 1) % animation.frames),
        );
      });
  }

  return {
    play: () => {
      playing = true;
      paint(0);
    },
    pause: () => {
      playing = false;
    },
    next: () => {
      playing = false;
      paint(0);
    },
    playing: () => playing,
  };
}
