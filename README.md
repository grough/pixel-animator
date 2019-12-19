**Pixel Animator** is a toy for making colorful, animated pixel art with JavaScript. It's like graphics programming, but less powerful and more fun.

[![Rainbow sine wave 256×5×16](examples/1576377638058.gif)](https://glitch.com/~wavey-spectrum)

## Getting Started

### The "easy" way

1. Start with a template on [CodeSandbox](https://codesandbox.io/s/pixel-animator-starter-od1oy) or [Glitch](https://glitch.com/edit/#!/remix/pixel-animator)
2. Read the [tutorial](https://github.com/grough/pixel-animator/wiki/Pixel-Animator-Tutorial)
3. Enjoy?

If you want to make your own web page or install the Node.js module, take a look at the [installation notes](https://github.com/grough/pixel-animator/wiki/Installation).

## Make an animation

The least you can do to make an animation is write a special function named `colorize`, similar in principle to a [shader](https://thebookofshaders.com/01/). Your `colorize` function's job is to convert a pixel's position on the screen into a color. You can learn how to write one by reading the [Pixel Animator Tutorial](https://github.com/grough/pixel-animator/wiki/Pixel-Animator-Tutorial), or play with some working examples on [Glitch](https://glitch.com/@grough/pixel-art).

A less important, optional function named `evolve` is responsible for communicating data from one frame to the next.

## There's more…

The [wiki](https://github.com/grough/pixel-animator/wiki) is under development.

<!-- ## TODO: Why does this exist? -->
