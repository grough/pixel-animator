import { animator, Animation, UserAnimation } from "./animator";
import { baseAnimation } from "./defaults";

export function render(
  userAnimation: UserAnimation,
  canvas: HTMLCanvasElement,
) {
  let playing = true;
  let imageData;
  let timeoutId: number;
  const animation: Animation = { ...baseAnimation, ...userAnimation };
  const interval = 1000 / animation.frameRate;
  canvas.width = animation.columns;
  canvas.height = animation.rows;
  const context = canvas.getContext("2d");
  let frameGenerator = animator(animation);

  function paint() {
    const frame = frameGenerator.next();
    if (frame.done || !context) return;
    imageData = new ImageData(frame.value, animation.columns, animation.rows);
    context.putImageData(imageData, 0, 0);
    if (playing) {
      // @ts-ignore FIXME "Type NodeJS.Timeout is not assignable to number"
      timeoutId = setTimeout(() => requestAnimationFrame(paint), interval);
    }
  }

  // Perform initial paint
  if (playing) paint();

  return {
    play: () => {
      playing = true;
      paint();
    },
    pause: () => {
      clearTimeout(timeoutId);
      playing = false;
    },
    next: () => {
      playing = false;
      paint();
    },
    playing: () => playing,
  };
}
