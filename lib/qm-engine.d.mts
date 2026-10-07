export type QMEngineModule = {
  cwrap(
    name: string,
    returnType: string,
    argumentTypes: string[],
  ): (variableCount: number, minterms: string, dontCares: string) => string;
};

export default function createQMEngine(): Promise<QMEngineModule>;
