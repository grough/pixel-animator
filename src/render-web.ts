import { animator, Animation, UserAnimation } from "./animator";
import { baseAnimation } from "./defaults";
import { createIntervalScheduler } from "./interval-scheduler";

export function render(
  userAnimation: UserAnimation,
  canvas: HTMLCanvasElement,
  userScheduler?: any,
) {
  let imageData;
  const animation: Animation = { ...baseAnimation, ...userAnimation };
  canvas.width = animation.columns;
  canvas.height = animation.rows;
  const context = canvas.getContext("2d");
  const renderScheduler =
    userScheduler || createIntervalScheduler(1000 / animation.frameRate);
  let frameGenerator = animator(animation);

  function renderNext() {
    const frame = frameGenerator.next();
    if (frame.done || !context) return;
    imageData = new ImageData(frame.value, animation.columns, animation.rows);
    context.putImageData(imageData, 0, 0);
  }

  const scheduler = renderScheduler(renderNext);
  scheduler.play();
  return scheduler;
}
