**[pixel-animator](https://www.npmjs.com/package/pixel-animator)** is a library for creating small, colorful, pixel-based animations with JavaScript. It's pretty much the same idea as a [fragment shader](https://en.wikipedia.org/wiki/Shader#Pixel_shaders) from graphics programming, but much, much slower.

_This guide is a work in progress - only essential features have been covered so far_.

## Getting Started

All you need to start animating pixels is a [`<canvas />`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas) and a special kind of function that we'll call `colorize`.

Each pixel in an animation has a unique coordinate identified by its `column`, `row` and `frame` numbers. Your `colorize` function, whose purpose is to take the coordinate of a pixel and assign a color to it, will be run once for every pixel in your animation.

### Example 1: White pixel blinking on a grey background

![White pixel blinking on a grey background 8×8×2](examples/1566165863155.gif)

```typescript
import { render } from "pixel-animator";

function colorize({ column, row, frame }) {
  if (column === 5 && row === 2 && frame % 2 === 0) {
    return 1;
  } else {
    return 0.25;
  }
}

render({ colorize }, document.getElementById("my-canvas"));
```

[[Run this code](https://codesandbox.io/s/bright-green-dot-blinking-on-a-dark-blue-background-9dwjg)]

In this function, each pixel says to itself: _If I'm in the sixth column, third row, and my frame number is even, I should be white. If not, make me dark grey_. The values `1` and `0.25` represent white and dark grey.

We also included a little extra code here that's needed to connect the function to a canvas.

---

### Example 2: Green pixel moving across a blue background

![Green pixel moving across a blue background 8×8×8](examples/1566159876842.gif)

```typescript
function colorize({ column, row, frame }) {
  if (column === frame && row === frame) return { green: 1 };
  return { blue: 0.5 };
}
```

[[Run this code](https://codesandbox.io/s/green-dot-moving-on-a-diagonal-path-v6gpt)]

Here each pixel says to itself: _If both my column and row numbers are equal to my frame number, I should be bright green. If not, make me dark blue_. And it just happens to trace a diagonal line as the frame number increases over time.

---

### Example 3: Animated gradient

![Animated Gradient 8×8×8](examples/1566072376597.gif)

```typescript
function colorize({
  // Current pixel coordinates
  column,
  row,
  frame,
  // Overall dimensions for comparison
  columns,
  rows,
  frames,
}) {
  return {
    red: column / columns,
    green: row / rows,
    blue: frame / frames,
  };
}
```

[[Run this code](https://codesandbox.io/s/example-animated-gradient-c0gnl)]

## "Help, my pixels are blurry!"

You might notice that things don't look so sharp when rendering to your canvas element. The following CSS will stop the browser from smoothing things out as you scale the canvas up:

```css
canvas {
  width: 320px;
  height: 320px;
  image-rendering: pixelated;
}
```
