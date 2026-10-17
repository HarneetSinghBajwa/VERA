import { NextResponse } from "next/server";

export const runtime = "nodejs";

const QUESTION_LIMIT = 800;
const CONTEXT_LIMIT = 8000;
const UPSTREAM_TIMEOUT_MS = 30_000;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return errorResponse(
      "Vera’s teaching connection is not configured yet. Add GROQ_API_KEY to the server environment.",
      503,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 48_000) {
    return errorResponse("That explanation request is too large. Please shorten the context and try again.", 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("The explanation request was not valid JSON. Please try again.", 400);
  }

  if (!body || typeof body !== "object") {
    return errorResponse("Please enter a question about the current design.", 400);
  }

  const { question, context } = body as Record<string, unknown>;
  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.length > QUESTION_LIMIT ||
    typeof context !== "string" ||
    context.length > CONTEXT_LIMIT
  ) {
    return errorResponse("Please enter a question (up to 800 characters) and try again.", 400);
  }

  const controller = new AbortController();
  let timedOut = false;
  const onClientAbort = () => controller.abort();
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, UPSTREAM_TIMEOUT_MS);
  request.signal.addEventListener("abort", onClientAbort, { once: true });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are Vera, a patient digital logic and Verilog teacher. Explain concepts clearly for beginners, using short paragraphs and examples. Treat supplied calculation results as authoritative and explain them without changing or recomputing them. Never claim to execute or verify Verilog.",
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion: ${question.trim()}`,
          },
        ],
      }),
    });

    if (response.status === 429) {
      return errorResponse("The teaching service is busy. Wait a moment, then try again.", 429);
    }
    if (response.status === 401 || response.status === 403) {
      return errorResponse("Vera’s teaching connection needs attention. Please check the server configuration.", 503);
    }
    if (!response.ok) {
      return errorResponse("Vera couldn’t reach the teaching model. Please try again in a moment.", 502);
    }

    const data: unknown = await response.json().catch(() => null);
    const text = data && typeof data === "object"
      ? (data as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content
      : undefined;

    if (typeof text !== "string" || !text.trim()) {
      return errorResponse("The teaching model returned an empty response. Please try again.", 502);
    }

    return NextResponse.json({ text: text.trim() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    if (timedOut) {
      return errorResponse("The explanation took too long to arrive. Your question is saved; please try again.", 504);
    }
    if (request.signal.aborted) {
      return errorResponse("The explanation request was canceled.", 499);
    }
    return errorResponse("Vera couldn’t connect to the teaching service. Check your connection and try again.", 502);
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", onClientAbort);
  }
}
