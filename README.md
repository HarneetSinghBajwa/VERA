# Vera

> **Vera is an interactive, beginner-first digital design laboratory for learning digital logic, reading real Verilog RTL, and understanding Boolean minimization through deterministic computation and contextual AI explanations.**

Vera V1 is intentionally focused. It is not a full HDL simulator, waveform viewer, FPGA toolchain, or general-purpose AI coding environment. It connects four workflows: Fundamentals, Verilog Codes, Minimization, and Ask Vera.

---

## What Vera is

Vera connects digital-design concepts to inspectable computation:

**behavior → representation → logic → circuit → RTL → verification → explanation**

The application combines a Next.js/React frontend, a C++ Boolean-minimization engine compiled to WebAssembly, a data-driven Verilog corpus, and a server-side Gemini explanation route.

## Current capabilities

### Fundamentals

The `/fundamentals` route contains a structured **22-concept** learning path covering digital signals, binary, Boolean logic, gates, combinational logic, multiplexers, decoders/encoders, arithmetic, sequential logic, clocks/timing, flip-flops, registers, shift registers, counters, FSMs, Verilog/RTL, minimization, and recap.

Each lesson includes intuition, why it matters, a formal model, a worked example, common mistakes, a takeaway, connected ideas, an interactive model, a truth/place-value table where applicable, an equation, and contextual Ask Vera support.

The demonstrations are implemented in the client application. For example, the binary lesson exposes four toggleable bits and calculates decimal and hexadecimal values directly in the browser. Logic-gate lessons provide selectable gates and live truth-table / output updates.

### Verilog Codes

The `/verilog` route is a searchable, categorized browser over a curated corpus of **39 Verilog designs**.

Current categories include Logic Gates, Multiplexers, Decoders, Encoders, Arithmetic, ALU, Sequential Logic, Registers, Counters, and Finite State Machines.

Representative designs include AND/OR/NOT/NAND/NOR/XOR/XNOR gates, multiplexers, decoders, encoders, adders/subtractors, a 4-bit ALU, latches/flip-flops, registers, shift registers, counters, and Moore/Mealy 1011 sequence detectors.

The source of truth is `data/verilog/modules.json`, while RTL and optional testbenches live under `data/verilog/`.

### Verilog design pages

Each design is available at `/verilog/<design-name>` and presents its title, category, level, concepts, description, RTL, optional testbench, related designs, and the upstream source repository.

The code viewer provides:

- Verilog syntax highlighting
- line numbers
- RTL / TESTBENCH tabs
- copy-to-clipboard support
- accessible tab semantics
- keyboard navigation between source tabs

Code is read from the checked-in corpus. The AI layer does not generate the displayed RTL.

### Boolean minimization

The `/minimization` route is a deterministic Quine–McCluskey laboratory for **1–6 variables** with optional don't-care terms.

Users enter minterms and optional don't-cares using comma- or whitespace-separated indices. The UI exposes:

- combination rounds
- prime implicants
- prime implicant chart
- essential implicants
- selected minimum cover
- minimum SOP expression
- complete truth table
- verification state

The default UI example is `F(A,B,C,D)=Σm(0,2,5,7,8,10,13,15)`.

### Deterministic C++ engine

The minimizer is not reimplemented in JavaScript. The project includes the QM_Method C++ implementation under `vendor/QM_Method/` and compiles it with Emscripten to `lib/qm-engine.mjs`.

The bundled C++ pipeline currently provides parsing, implicant manipulation, Quine–McCluskey prime generation, prime-chart construction, essential-prime detection, Petrick's method, SOP expression generation, and truth-table verification.

`lib/qm-wasm.ts` is a thin adapter around the exported C function `vera_qm_minimize`; `lib/qm.ts` contains the shared TypeScript contracts.

## Architecture

### Minimization request flow

`/minimization`

→ `POST /api/qm`

→ server-side validation

→ `lib/qm-wasm.ts`

→ Emscripten WebAssembly

→ `vera_qm_minimize`

→ C++ parser / Quine–McCluskey / Petrick / expression / truth-table pipeline

→ JSON

→ result trace and verification in the UI

Conceptually:

`Input → Parse → Initial implicants → Combine → Prime implicants → Prime chart → Essential primes → Petrick minimum cover → SOP expression → Truth-table verification`

### Explanation flow

`Fundamentals` and `Minimization` create structured context locally. `Explain` posts that context to `/api/explain`. The route calls Gemini and returns an explanation.

The model is instructed to treat supplied deterministic calculation results as authoritative, explain them without changing them, and never claim to execute Verilog.

> **C++ computes. Vera presents. Gemini explains.**

## API

### `POST /api/qm`

Request:

```json
{
  "variableCount": 4,
  "minterms": [0, 2, 5, 7, 8, 10, 13, 15],
  "dontCares": []
}
```

Validation currently enforces:

- `variableCount` is an integer from 1 through 6
- `minterms` is an array
- `dontCares`, when supplied, is an array
- each list contains at most 64 terms
- every term is an integer
- every term is in `0 ... 2^n - 1`
- a term cannot be both a minterm and a don't-care

Successful responses contain `expression`, `primeImplicants`, `rounds`, `essential`, `selected`, `optimalCovers`, `primeChart`, `truthTable`, and `verified`.

Invalid input returns HTTP 400. Downstream minimization failures return HTTP 500. The route uses the Node.js runtime.

### `POST /api/explain`

Accepts a question and contextual text. Current limits are 800 characters for the question and 8000 characters for context.

Missing `GEMINI_API_KEY` returns 503. Invalid input returns 400. Upstream model failures return 502. Unexpected server errors return 500.

The key is consumed only on the server-side route and should never be exposed through a `NEXT_PUBLIC_` variable.

## Verilog data architecture

`data/verilog/modules.json` defines the catalogue entries. Each entry contains a name, source file, category, level, concepts, and optional testbench.

`lib/catalog.ts` loads the manifest.

`lib/verilog.ts` resolves a design, reads its RTL/testbench from disk, generates the display title, and provides a description.

This separation makes the catalogue data-driven rather than hard-coded into the page component.

## Repository structure

```text
VERA/
├── app/
│   ├── api/
│   │   ├── explain/route.ts
│   │   └── qm/route.ts
│   ├── fundamentals/page.tsx
│   ├── minimization/page.tsx
│   ├── verilog/page.tsx
│   ├── verilog/[slug]/page.tsx
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── explain.tsx
│   ├── code-view.tsx
│   ├── circuit-scene.tsx
│   ├── hero.tsx
│   ├── nav.tsx
│   └── motion-provider.tsx
├── data/
│   ├── fundamentals.ts
│   └── verilog/
│       ├── modules.json
│       ├── src/
│       └── LICENSE
├── lib/
│   ├── catalog.ts
│   ├── verilog.ts
│   ├── qm.ts
│   ├── qm-wasm.ts
│   └── qm-engine.mjs
├── scripts/
│   ├── build-qm-wasm.ps1
│   └── build-qm-native.ps1
├── tests/
│   ├── qm-cases.mjs
│   ├── validate-qm-wasm.mjs
│   └── qm-native-runner.cpp
└── vendor/
    └── QM_Method/
        ├── include/
        └── src/
```

## Frontend stack

Vera currently uses Next.js 15, React 19, TypeScript 5, Three.js, React Three Fiber, Framer Motion, Prism React Renderer, and Lucide React.

The homepage includes a dynamically loaded, pointer-responsive circuit scene. Motion components account for reduced-motion preferences.

## QM WebAssembly build

`scripts/build-qm-wasm.ps1` compiles the C++ QM sources with C++17 and `-O2`, enables C++ exceptions, emits a modularized ES module, embeds the WASM payload into a single file, disables the Emscripten filesystem, enables memory growth, exports only `vera_qm_minimize`, and exposes `cwrap`.

The generated `lib/qm-engine.mjs` is checked into the repository, so a normal production deployment does not require Emscripten.

Emscripten is only needed when rebuilding the generated artifact.

## Native / WASM validation

`scripts/build-qm-native.ps1` builds the same QM source files as a native C++ runner using Visual Studio C++ Build Tools.

`tests/validate-qm-wasm.mjs` executes representative inputs through both the native runner and WebAssembly and asserts deep equality of their JSON payloads.

The current suite covers simple functions, multi-round combination, don't-care optimization, essential primes, Petrick-required covers, multiple equally optimal covers, constant-zero, constant-one, invalid terms, and the six-variable boundary.

The validation also checks truth-table verification, full truth-table size, expected round history, selected edge-case expressions, and expected cover properties.

## Local setup

### Requirements

For normal development:

- Node.js 20+
- npm

For rebuilding / validating the C++ engine:

- Emscripten SDK
- Visual Studio C++ Build Tools

### Install

```bash
npm install
```

### Configure Gemini

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Then add:

```text
GEMINI_API_KEY=your_key_here
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Validation commands

Application checks:

```bash
npm run check
npm run build
npm run start
```

QM engine build / cross-check:

```powershell
npm run build:qm-wasm -- -EmsdkPath C:\path\to\emsdk
npm run build:qm-native
npm run validate:qm-wasm
```

The Emscripten path may also be provided through the `EMSDK` environment variable.

## Deployment

Vera is structured for standard Next.js hosting such as Vercel.

Use the repository with the normal Next.js build command, and provide `GEMINI_API_KEY` as a server-side environment variable.

The checked-in QM WebAssembly artifact means the deployment environment does not need Emscripten for the normal application build.

## Security and input boundaries

The QM route validates request shape, arrays, variable count, term types, term ranges, overlap, and list size before invoking the engine.

The WebAssembly adapter rejects invalid JSON and refuses to return an unverified result.

The explanation route validates the API key, question/context types, and their size limits.

These are application-level safeguards, not a claim of a full security audit.

## Source repositories

### QM_Method

Upstream: https://github.com/HarneetSinghBajwa/QM_Method

Vera vendors the C++ implementation under `vendor/QM_Method/` for the current WebAssembly build.

Review the upstream licensing terms before redistributing the vendored source outside this project.

### vera-verilog-codes

Upstream: https://github.com/HarneetSinghBajwa/vera-verilog-codes

The current manifest, RTL corpus, testbenches, and corpus license are included under `data/verilog/`.

## Current V1 boundaries

Vera V1 does **not currently**:

- execute arbitrary Verilog
- simulate arbitrary Verilog
- compile arbitrary Verilog
- generate waveforms
- provide FPGA synthesis
- provide a general EDA flow
- provide timing analysis
- provide gate-level simulation
- provide CPU architecture tooling
- provide advanced RTL automation
- generate complete Verilog designs from natural language
- function as a general autonomous coding agent
- use Gemini as the Boolean minimization engine

The Verilog catalogue is a curated learning corpus, not an arbitrary HDL execution environment.

The AI feature is a contextual explanation layer, not a Verilog execution or formal verification engine.

## Current scope limits

The Boolean minimizer is intentionally bounded to six variables.

The web API accepts at most 64 minterms and 64 don't-care terms per request.

Ask Vera accepts questions up to 800 characters and supplied context up to 8000 characters.

These limits reflect the current educational scope and implementation boundaries of V1.

## Project status

**Vera V1 is an active, evolving project.**

The repository currently contains a 22-concept fundamentals route, a 39-design Verilog catalogue, individual RTL pages, a deterministic C++ QM engine, a checked-in WebAssembly artifact, native-vs-WASM validation, a Gemini explanation route, animated interactive UI, and a data-driven RTL manifest.

Vera is best described as a **digital design learning lab with a deterministic hardware-logic core and an AI teaching layer**.

## Attribution and licensing

Vera combines application code with source material from separate projects. The QM_Method implementation and the Verilog corpus should be reviewed under their respective upstream licensing and attribution terms rather than assumed to share one license.

## Future direction

The architecture leaves room for deeper RTL analysis, richer hardware visualization, stronger verification tooling, and more capable AI-assisted learning.

Those are future directions only and are not current V1 capabilities.

---

Repository: https://github.com/HarneetSinghBajwa/VERA

<<<<<<< HEAD
**Vera — Digital Design, Explained Visually.**
=======
**Vera — Digital Design, Explained Visually.**
>>>>>>> e76faa7 (STABLIZING API)
