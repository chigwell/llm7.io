declare module 'd3-array' {
  export type Accessor<T, U> = (
    datum: T,
    index: number,
    array: ArrayLike<T>,
  ) => U;

  export function max<T>(
    iterable: Iterable<T>,
    accessor?: Accessor<T, number | null | undefined>,
  ): number | undefined;

  export function extent<T>(iterable: Iterable<T>): [T | undefined, T | undefined];
  export function extent<T, U>(
    iterable: Iterable<T>,
    accessor: Accessor<T, U | null | undefined>,
  ): [U | undefined, U | undefined];

  export interface Bisector<T, U> {
    left(array: ArrayLike<T>, x: U, lo?: number, hi?: number): number;
    right(array: ArrayLike<T>, x: U, lo?: number, hi?: number): number;
    center(array: ArrayLike<T>, x: U, lo?: number, hi?: number): number;
  }

  export function bisector<T, U>(accessor: (datum: T) => U): Bisector<T, U>;
  export function bisector<T, U>(comparator: (a: T, b: U) => number): Bisector<T, U>;
}

declare module 'd3-time-format' {
  export function timeFormat(specifier: string): (date: Date | number) => string;
}
