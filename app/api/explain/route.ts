import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Vera’s teaching connection is not configured yet. Add GEMINI_API_KEY to the server environment." }, { status: 503 });
  try {
    const { question, context } = await request.json();
    if (typeof question !== "string" || question.length > 800 || typeof context !== "string" || context.length > 8000) return NextResponse.json({ error: "Please shorten your question and try again." }, { status: 400 });
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, cache: "no-store",
      body: JSON.stringify({ systemInstruction: { parts: [{ text: "You are Vera, a patient digital logic and Verilog teacher. Explain concepts clearly for beginners, use short paragraphs and examples. Treat provided calculation results as authoritative and explain them without changing or recomputing them. Never claim to execute Verilog." }] }, contents: [{ role: "user", parts: [{ text: `Context:\n${context}\n\nQuestion: ${question}` }] }] }),
    });
    if (!response.ok) return NextResponse.json({ error: "Vera couldn’t reach the teaching model. Please try again in a moment." }, { status: 502 });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((part: {text?: string})=>part.text ?? "").join("");
    if (!text) return NextResponse.json({ error: "The teaching model returned an empty response. Please try again." }, { status: 502 });
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Something went wrong while preparing the explanation. Please retry." }, { status: 500 });
  }
}
