import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { cases } from "./qm-cases.mjs";

const nativePath = process.argv[2] ?? "build/qm-native-runner.exe";
const wasmPath = process.argv[3] ?? "lib/qm-engine.mjs";
const { default: createQMEngine } = await import(pathToFileURL(wasmPath));
const engine = await createQMEngine();
const minimize = engine.cwrap("vera_qm_minimize", "string", ["number", "string", "string"]);

for (const test of cases) {
  const native = spawnSync(
    nativePath,
    [String(test.variables), test.minterms, test.dontCares],
    { encoding: "utf8" },
  );
  assert.equal(native.status, 0, `${test.name}: native runner exited ${native.status}: ${native.stderr}`);
  const nativeResult = JSON.parse(native.stdout);
  const wasmResult = JSON.parse(minimize(test.variables, test.minterms, test.dontCares));
  assert.deepEqual(wasmResult, nativeResult, `${test.name}: native and WASM payloads differ`);

  if (test.name === "invalid term") {
    assert.match(wasmResult.error, /Invalid minterm: 8/);
    console.log(`PASS ${test.name}: both report ${wasmResult.error}`);
    continue;
  }

  assert.equal(wasmResult.verified, true, `${test.name}: C++ truth-table verification failed`);
  assert.equal(wasmResult.truthTable.length, 2 ** test.variables);
  assert.equal(wasmResult.primeChart.length, test.minterms ? test.minterms.split(",").length : 0);
  assert.ok(wasmResult.rounds.length >= 1, `${test.name}: missing C++ round history`);

  if (test.name === "multiple combination rounds") {
    assert.ok(wasmResult.rounds.length >= 3, "expected more than one combine generation");
  }
  if (test.name === "essential prime implicants") {
    assert.ok(wasmResult.essential.length > 0, "expected at least one essential prime");
  }
  if (test.name === "Petrick-required cover") {
    assert.ok(wasmResult.selected.length > wasmResult.essential.length, "expected Petrick to select an additional prime");
  }
  if (test.name === "multiple equally optimal covers") {
    assert.ok(wasmResult.optimalCovers.length > 1, "expected multiple equal-cost Petrick covers");
  }
  if (test.name === "don't-care optimization") {
    assert.equal(wasmResult.expression, "C");
    assert.ok(wasmResult.primeImplicants.some((prime) => prime.covered.includes(5)));
  }
  if (test.name === "constant zero") assert.equal(wasmResult.expression, "0");
  if (test.name === "constant one") assert.equal(wasmResult.expression, "1");
  if (test.name === "six-variable boundary") assert.equal(wasmResult.truthTable.length, 64);

  console.log(`PASS ${test.name}: ${wasmResult.expression} (${wasmResult.primeImplicants.length} prime implicants, ${wasmResult.rounds.length} rounds)`);
}

console.log(`Validated ${cases.length} native C++/WASM cases.`);
