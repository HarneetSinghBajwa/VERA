import { NextResponse } from "next/server";
import { minimize } from "@/lib/qm-wasm";
import type { QMInput } from "@/lib/qm";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !Array.isArray(body.minterms) || (body.dontCares !== undefined && !Array.isArray(body.dontCares))) {
      return NextResponse.json({ error: "Minterms and don't-care terms must be lists of whole-number indices." }, { status: 400 });
    }
    if (body.minterms.length > 64 || (body.dontCares?.length ?? 0) > 64) return NextResponse.json({ error: "Enter at most 64 terms in each list." }, { status: 400 });
    const input = {
      variableCount: body.variableCount,
      minterms: body.minterms,
      dontCares: body.dontCares ?? [],
    } as QMInput;
    if (!Number.isInteger(input.variableCount) || input.variableCount < 1 || input.variableCount > 6) {
      return NextResponse.json({ error: "Choose between 1 and 6 variables." }, { status: 400 });
    }
    if ([...input.minterms, ...input.dontCares].some((term) => !Number.isInteger(term))) {
      return NextResponse.json({ error: "Minterms and don't-care terms must be whole-number indices." }, { status: 400 });
    }
    const max = 2 ** input.variableCount;
    if ([...input.minterms, ...input.dontCares].some((term) => term < 0 || term >= max)) {
      return NextResponse.json({ error: `Terms must be between 0 and ${max - 1} for ${input.variableCount} variables.` }, { status: 400 });
    }
    if (input.minterms.some((term) => input.dontCares.includes(term))) {
      return NextResponse.json({ error: "A term cannot be both a minterm and a don't-care." }, { status: 400 });
    }
    const result = await minimize(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The minimizer could not process that input." }, { status: 500 });
  }
}
