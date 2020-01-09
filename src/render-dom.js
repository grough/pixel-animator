import { createFrameIterator } from './create-frame-iterator';

/*
 * Schedule a callback function for execution on an interval in milliseconds.
 * Similar to `setInterval` but can be controlled using the returned transport
 * object. `requestAnimationFrame` is meant to prevent calls while the page is
 * in the background.
 */
function createLooper(interval, callback) {
  let playing;
  let timeoutId;

  function loop() {
    requestAnimationFrame(() => {
      callback();
      timeoutId = setTimeout(loop, interval);
    });
  }

  return {
    play: () => {
      playing = true;
      clearTimeout(timeoutId);
      timeoutId = loop();
    },
    pause: () => {
      playing = false;
      clearTimeout(timeoutId);
    },
    next: () => {
      playing = false;
      clearTimeout(timeoutId);
      callback();
    },
    playing: () => playing,
  };
}

function fit(columns, rows, target) {
  const scale = target / Math.max(columns, rows);
  if (scale >= 1) {
    return {
      width: Math.floor(columns * scale),
      height: Math.floor(rows * scale),
    };
  }
  return { width: columns, height: rows };
}

export function renderAnimatedDom(animation, rootElement) {
  rootElement.classList = rootElement.classList + ' pixel-animator';
  const size = fit(
    animation.columns,
    animation.rows,
    rootElement.clientWidth || 320,
  );
  rootElement.style.width = size.width + 'px';
  rootElement.style.height = size.height + 'px';
  const cellWidth = 100 / animation.columns + '%';
  const cellHeight = 100 / animation.rows + '%';
  for (let index = 0; index < animation.rows * animation.columns; index++) {
    const cellElement = document.createElement('div');
    cellElement.classList = 'pa-cell ' + 'pa-cell-' + index;
    cellElement.style.width = cellWidth;
    cellElement.style.height = cellHeight;
    cellElement.style.display = 'inline-block';
    cellElement.style.verticalAlign = 'top';
    rootElement.appendChild(cellElement);
  }
  const frameIterator = createFrameIterator(animation);
  const transport = createLooper(
    1000 / animation.frameRate,
    function renderNextFrame() {
      frameIterator().forEach((color, index) => {
        const cellElement = rootElement.children[index];
        cellElement.style.backgroundColor = `rgba(${color.red},${color.green},${color.blue},${color.alpha})`;
      });
    },
  );
  transport.play();
  return transport;
}
