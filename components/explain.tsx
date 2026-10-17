"use client";

import { FormEvent, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Maximize2, Minimize2, Send, Sparkles, X } from "lucide-react";

type ExplainResponse = { text: string } | { error: string };

function isExplainResponse(value: unknown): value is ExplainResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Record<string, unknown>;
  return typeof response.text === "string" || typeof response.error === "string";
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_|~~[^~]+~~/g;
  let cursor = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) parts.push(text.slice(cursor, start));

    const key = `${keyPrefix}-${matchIndex++}`;
    if (token.startsWith("**") || token.startsWith("__")) {
      parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("~~")) {
      parts.push(<del key={key}>{token.slice(2, -2)}</del>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    cursor = start + token.length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function normalizeMath(text: string) {
  return text
    .replace(/\\boxed\{([^}]*)\}/g, "$1")
    .replace(/\\overline\{([^}]*)\}/g, "$1̅")
    .replace(/\\(?:,|;|!|quad|qquad)/g, " ")
    .replace(/\\(?:text|mathrm)\{([^}]*)\}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let index = 0;
  let blockIndex = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    if (text) blocks.push(<p key={`p-${blockIndex++}`}>{renderInline(text, `inline-${blockIndex}`)}</p>);
    paragraph = [];
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !lines[index].trim().startsWith("```")) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={`code-${blockIndex++}`}><code>{code.join("\n")}</code></pre>);
      continue;
    }

    if (trimmed === "\\[" || trimmed.startsWith("\\[")) {
      flushParagraph();
      const equation: string[] = [];
      const first = trimmed.slice(2).replace(/\\\]$/, "");
      if (first) equation.push(first);
      index += 1;
      while (index < lines.length && !lines[index].trim().endsWith("\\]")) equation.push(lines[index++].trim());
      if (index < lines.length) {
        const last = lines[index].trim().replace(/\\\]$/, "");
        if (last) equation.push(last);
        index += 1;
      }
      blocks.push(<div className="answer-equation" key={`math-${blockIndex++}`}>{normalizeMath(equation.join(" "))}</div>);
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      const level = Math.min(heading[1].length + 1, 5);
      const children = renderInline(heading[2], `heading-${blockIndex}`);
      if (level === 2) blocks.push(<h3 key={`heading-${blockIndex++}`}>{children}</h3>);
      else if (level === 3) blocks.push(<h4 key={`heading-${blockIndex++}`}>{children}</h4>);
      else blocks.push(<h5 key={`heading-${blockIndex++}`}>{children}</h5>);
      index += 1;
      continue;
    }

    if (trimmed.includes("|") && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      flushParagraph();
      const headers = splitCells(trimmed);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().includes("|")) rows.push(splitCells(lines[index++]));
      blocks.push(
        <div className="answer-table-scroll" key={`table-${blockIndex++}`} role="region" aria-label="Explanation table" tabIndex={0}>
          <table>
            <thead><tr>{headers.map((cell, cellIndex) => <th key={`h-${cellIndex}`}>{renderInline(cell, `th-${blockIndex}-${cellIndex}`)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => (
              <tr key={`r-${rowIndex}`}>{headers.map((_, cellIndex) => (
                <td key={`c-${cellIndex}`}>{renderInline(row[cellIndex] ?? "", `td-${rowIndex}-${cellIndex}`)}</td>
              ))}</tr>
            ))}</tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      const ordered = /^\d+[.)]\s+/.test(trimmed);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        const item = ordered ? /^\d+[.)]\s+(.+)$/.exec(current) : /^[-*+]\s+(.+)$/.exec(current);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={`list-${blockIndex++}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `li-${blockIndex}-${itemIndex}`)}</li>)}</List>);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) quote.push(lines[index++].trim().replace(/^>\s?/, ""));
      blocks.push(<blockquote key={`quote-${blockIndex++}`}>{quote.map((text, quoteIndex) => <p key={quoteIndex}>{renderInline(text, `quote-${quoteIndex}`)}</p>)}</blockquote>);
      continue;
    }

    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      flushParagraph();
      blocks.push(<hr key={`rule-${blockIndex++}`} />);
      index += 1;
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph();
  return blocks;
}

export function Explain({
  context,
  label = "Ask Vera to explain",
}: {
  context: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("Explain this to me step by step");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const titleId = useId();
  const questionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      if (requestRef.current) closeButtonRef.current?.focus();
      else questionRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => () => {
    requestIdRef.current += 1;
    requestRef.current?.abort();
  }, []);

  function close() {
    setOpen(false);
    setMaximized(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function cancelRequest() {
    if (!requestRef.current) return;
    requestIdRef.current += 1;
    requestRef.current.abort();
    requestRef.current = null;
    setBusy(false);
    setError("Request canceled. Your question is still here and ready to send again.");
  }

  async function ask(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const prompt = question.trim();
    if (!prompt || busy) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const requestId = ++requestIdRef.current;
    setBusy(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, context }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message = isExplainResponse(payload) && "error" in payload
          ? payload.error
          : "Vera could not prepare the explanation. Please try again.";
        throw new Error(message);
      }

      if (!isExplainResponse(payload) || !("text" in payload) || !payload.text.trim()) {
        throw new Error("The teaching model returned an empty response. Please try again.");
      }

      if (requestIdRef.current === requestId) setAnswer(payload.text);
    } catch (cause) {
      if (requestIdRef.current !== requestId) return;
      if (cause instanceof DOMException && cause.name === "AbortError") {
        setError("The request was interrupted. Your question is still here and ready to send again.");
      } else {
        setError(cause instanceof Error ? cause.message : "Could not load the explanation. Please try again.");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        requestRef.current = null;
        setBusy(false);
      }
    }
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="button button-quiet explain-trigger"
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Sparkles size={15} aria-hidden="true" />{label}
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              <div
                style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) close();
                }}
              >
                <motion.section
                  ref={dialogRef}
                  className={maximized ? "explain-modal is-maximized" : "explain-modal"}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  onKeyDown={handleDialogKeyDown}
                  initial={{ y: 12, opacity: 0, scale: .99 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 8, opacity: 0, scale: .99 }}
                  transition={{ duration: .22, ease: [.22, .7, .25, 1] }}
                >
                <header className="explain-modal-header">
                  <div className="eyebrow"><Sparkles size={13} aria-hidden="true" /> VERA · YOUR LOGIC GUIDE</div>
                  <div className="explain-modal-tools">
                    <button
                      className="explain-modal-tool"
                      type="button"
                      onClick={() => setMaximized((value) => !value)}
                      aria-label={maximized ? "Restore explanation viewer" : "Maximize explanation viewer"}
                      aria-pressed={maximized}
                      title={maximized ? "Restore size" : "Maximize"}
                    >
                      {maximized
                        ? <Minimize2 size={18} aria-hidden="true" />
                        : <Maximize2 size={18} aria-hidden="true" />}
                    </button>
                    <button
                      ref={closeButtonRef}
                      className="modal-close explain-modal-tool"
                      type="button"
                      onClick={close}
                      aria-label="Close explanation"
                      title="Close"
                    >
                      <X size={19} aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div className="explain-modal-body">
                <h2 id={titleId}>Let’s make it <em>click.</em></h2>
                <p className="modal-desc">Ask about the concept in front of you. Vera uses the current lesson or result as context.</p>

                <form onSubmit={ask}>
                  <label className="explain-question-label" htmlFor={questionId}>Your question</label>
                  <textarea
                    ref={questionRef}
                    id={questionId}
                    value={question}
                    onChange={(event) => {
                      setQuestion(event.target.value);
                      setAnswer("");
                      setError("");
                    }}
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void ask();
                    }}
                    maxLength={800}
                    rows={3}
                    disabled={busy}
                    aria-describedby={`${questionId}-hint`}
                  />
                  <div className="explain-question-meta" id={`${questionId}-hint`}>
                    <span>Press Ctrl/⌘ + Enter to send</span>
                    <span>{question.length} / 800</span>
                  </div>

                  <div className="explain-actions">
                    <button className="button button-primary ask-submit" type="submit" disabled={busy || !question.trim()}>
                      {busy
                        ? <><LoaderCircle className="spin" size={16} aria-hidden="true" /> Thinking through it…</>
                        : <>Ask Vera <Send size={15} aria-hidden="true" /></>}
                    </button>
                    {busy && <button className="explain-cancel" type="button" onClick={cancelRequest}>Cancel request</button>}
                  </div>
                </form>

                <div className="explain-status" role="status" aria-live="polite" aria-atomic="true">
                  {busy && <span>Preparing an explanation of the current design…</span>}
                  {error && <span className="explain-error">{error}</span>}
                </div>

                {answer && (
                  <div className="explain-answer" role="region" aria-label="Vera’s explanation" aria-live="polite">
                    <div className="answer-label">VERA’S EXPLANATION</div>
                    <div className="answer-markdown">{renderMarkdown(answer)}</div>
                  </div>
                )}
                </div>
                </motion.section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
