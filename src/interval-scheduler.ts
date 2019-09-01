type RenderFunction = (...args: any[]) => any;

export function createIntervalScheduler(interval: number): any {
  return (renderNext: RenderFunction) => {
    let playing: boolean;
    let intervalId: any;
    return {
      play: () => {
        playing = true;
        intervalId = setInterval(
          () => requestAnimationFrame(renderNext),
          interval,
        );
      },
      pause: () => {
        playing = false;
        clearInterval(intervalId);
      },
      next: () => {
        playing = false;
        clearInterval(intervalId);
        renderNext();
      },
      playing: () => playing,
    };
  };
}
