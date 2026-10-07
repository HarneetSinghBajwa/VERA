/** Request and response types shared by the minimization route and UI. */
export type QMInput = {
  variableCount: number;
  minterms: number[];
  dontCares: number[];
};

export type QMImplicant = {
  pattern: string;
  covered: number[];
};

export type QMResult = {
  expression: string;
  primeImplicants: QMImplicant[];
  rounds: QMImplicant[][];
  essential: number[];
  selected: number[];
  optimalCovers: number[][];
  primeChart: { minterm: number; primes: number[] }[];
  truthTable: { bits: number[]; value: number; minimized: number }[];
  verified: boolean;
};
