This is a tool for creating low resolution animated imagery. It employs the concept of a fragment shader from graphics programming, but, not being GPU accelerated, is only suitable for creating low-res content.

## Stateless Example: Animated Gradient

```typescript
import { animator } from "ts-pixel-animator";

const width = 16;
const height = 16;
const frames = 30;

const gradient = (column, row, frame) => ({
  red: column / width,
  green: row / height,
  blue: frame / frames,
});

const frames = animator({
  mutator: context => context
  colorizer: gradient,
  width,
  height,
  frames,
});

// Consume the frame generator
let imageData = frames.next();
…
```

## Stateful Example: Flipping Bits

```typescript
import { animator } from "ts-pixel-animator";

const flipSometimes = ({ column, row, frame, cells }) => {
  const self = cells(column, row);
  if (typeof self === "undefined") return Math.random() > 0.5;
  return Math.random() > 0.5 ? self : !self;
};

const blackOrWhite = cell => {
  const shade = cell ? 1 : 0;
  return {
    red: shade,
    green: shade,
    blue: shade,
  };
};

const frames = animator({
  width: 16,
  height: 16,
  frames: 30,
  mutator: flipSometimes,
  colorizer: blackOrWhite,
});

// Consume the frame generator
let imageData = frames.next();
…
```

## Things to do

- [ ] Add gif examples
- [ ] Additional image processing stage (e.g. to support dithering)
