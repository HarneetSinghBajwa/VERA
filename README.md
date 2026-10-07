# Vera

Vera is a beginner-first digital design learning lab. The first release covers digital logic fundamentals, an educational browser for the Vera Verilog corpus, deterministic Boolean minimization, and server-side Gemini explanations.

## Product

- **Fundamentals:** a 22-concept learning path from digital signals and binary through sequential design, Verilog, and minimization. Lessons include formal models, worked examples, common pitfalls, interactive logic/gate/binary views, truth or place-value tables, related concepts, and contextual Vera explanations.
- **Verilog Codes:** search and category filters across the curated RTL corpus, with individual code pages and copy controls.
- **Minimization:** an interactive Quine–McCluskey trace, prime chart, and truth table.
- **Ask Vera:** contextual beginner-focused explanations through a server route. Gemini explains the deterministic QM output; it does not calculate it.

The interface is built with Next.js, React, TypeScript, CSS, Motion, and React Three Fiber. The homepage circuit scene is dynamically loaded and pointer responsive. Reduced-motion preferences are honored.

## Source repositories

- [QM_Method](https://github.com/HarneetSinghBajwa/QM_Method): original C++ Quine–McCluskey, implicant, prime chart, Petrick, and truth-table source is preserved in `vendor/QM_Method`. `lib/qm.ts` is a TypeScript adapter/port of the combination and minimum-cover path so the application can run in a Vercel Node.js function. Keep the C++ project as the algorithm reference when changing this adapter.
- [vera-verilog-codes](https://github.com/HarneetSinghBajwa/vera-verilog-codes): the repository's module manifest, synthesizable RTL, and license are included in `data/verilog`. Module metadata is loaded directly from the manifest.

The QM_Method repository does not currently provide a machine-readable web library or license file. Its source is retained with repository attribution. Review its licensing with its maintainer before redistributing beyond this project.

## Local setup

Requires Node.js 20 or newer and npm.

```bash
npm install
Copy-Item .env.example .env.local
# Add your Gemini API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Name | Required for | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Gemini explanations | Server-side Google Gemini API key. Never prefix this with `NEXT_PUBLIC_`. |

Without a key, all non-AI features remain available and the explanation panel displays a clear setup message.

## Validation

```bash
npm run build
npm run start
```

The deterministic minimizer is also exposed at `POST /api/qm`, accepting `variableCount`, `minterms`, and optional `dontCares` and returning combination rounds, prime implicants, essential/selected cover, a minimized expression, and truth table.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel; the Next.js framework and build command are detected automatically (`npm run build`).
3. Add `GEMINI_API_KEY` under Project Settings → Environment Variables for the desired environments.
4. Deploy. The key is used only inside `/api/explain` on the server.

## V1 boundaries

Vera V1 does not run or simulate arbitrary Verilog, generate waveforms, or include FPGA/EDA, CPU, or advanced tooling.
