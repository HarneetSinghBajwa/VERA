import type { QMInput, QMResult } from "./qm";
import createQMEngine from "./qm-engine.mjs";
import type { QMEngineModule as WasmModule } from "./qm-engine.mjs";

let modulePromise: Promise<WasmModule> | undefined;
let minimizeFunction:
  | ((variableCount: number, minterms: string, dontCares: string) => string)
  | undefined;

async function getModule(): Promise<WasmModule> {
  if (!modulePromise) {
    modulePromise = createQMEngine().catch((error: unknown) => {
      modulePromise = undefined;
      throw new Error(
        `Could not initialize the QM_METHOD WebAssembly engine: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    });
  }
  return modulePromise;
}

/** Call the single C++ QM_METHOD engine and adapt its JSON to Vera's UI contract. */
export async function minimize(input: QMInput): Promise<QMResult> {
  const wasm = await getModule();
  minimizeFunction ??= wasm.cwrap("vera_qm_minimize", "string", [
    "number",
    "string",
    "string",
  ]);

  let result: QMResult | { error: string };
  try {
    result = JSON.parse(
      minimizeFunction(
        input.variableCount,
        input.minterms.join(","),
        input.dontCares.join(","),
      ),
    ) as QMResult | { error: string };
  } catch (error) {
    throw new Error(
      `QM_METHOD returned an invalid response: ${error instanceof Error ? error.message : "invalid JSON"}`,
    );
  }

  if ("error" in result) {
    throw new Error(result.error);
  }
  if (!result.verified) {
    throw new Error("QM_METHOD could not verify its minimized result.");
  }
  return result;
}
