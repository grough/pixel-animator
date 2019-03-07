/// <reference types="typescript" />

export type CellReader<C> = (column: number, row: number) => C;

export type MutatorContext<C> = {
  column: number;
  row: number;
  frame: number;
  cells: CellReader<C>;
};

export type Mutator<C> = (context: MutatorContext<C>) => C;

export interface Color {
  red: number;
  green: number;
  blue: number;
}

export type Colorizer<C> = (cell: C) => Color;

interface Renderable<C> {
  colorizer: Colorizer<C>;
  mutator: Mutator<C>;
  width: number;
  height: number;
  frames: number;
}

export type Address = {
  column: number;
  row: number;
  frame: number;
};
