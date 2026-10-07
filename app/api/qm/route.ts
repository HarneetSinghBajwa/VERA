import { NextResponse } from "next/server";
import { minimize } from "@/lib/qm";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.minterms) || (body.dontCares !== undefined && !Array.isArray(body.dontCares))) {
      return NextResponse.json({ error: "Minterms and don't-care terms must be lists of whole-number indices." }, { status: 400 });
    }
    if (body.minterms.length > 64 || (body.dontCares?.length ?? 0) > 64) return NextResponse.json({ error: "Enter at most 64 terms in each list." }, { status: 400 });
    const result = minimize({ variableCount: Number(body.variableCount), minterms: body.minterms, dontCares: body.dontCares ?? [] });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The minimizer could not process that input." }, { status: 400 });
  }
}
