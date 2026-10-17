"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  RotateCcw,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { Explain } from "@/components/explain";
import type { QMInput, QMResult } from "@/lib/qm";

type TraceTab = "rounds" | "chart" | "table";
type FormValues = { variableCount: number; minterms: string; dontCares: string };

const example: FormValues = {
  variableCount: 4,
  minterms: "0, 2, 5, 7, 8, 10, 13, 15",
  dontCares: "",
};

const traceTabs: { id: TraceTab; label: string }[] = [
  { id: "rounds", label: "Combine rounds" },
  { id: "chart", label: "Prime chart" },
  { id: "table", label: "Truth table" },
];

function parseTerms(value: string): number[] {
  const terms = value.trim().split(/[\s,]+/).filter(Boolean);
  if (terms.some((term) => !/^-?\d+$/.test(term))) {
    throw new Error("Use whole-number indices separated by commas or spaces.");
  }
  return terms.map(Number);
}

function isQMResult(value: unknown): value is QMResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<QMResult>;
  return (
    typeof result.expression === "string" &&
    Array.isArray(result.primeImplicants) &&
    Array.isArray(result.rounds) &&
    Array.isArray(result.essential) &&
    Array.isArray(result.selected) &&
    Array.isArray(result.optimalCovers) &&
    Array.isArray(result.primeChart) &&
    Array.isArray(result.truthTable) &&
    result.verified === true
  );
}

export default function Minimization() {
  const [variableCount, setVariableCount] = useState(example.variableCount);
  const [minterms, setMinterms] = useState(example.minterms);
  const [dontCares, setDontCares] = useState(example.dontCares);
  const [result, setResult] = useState<QMResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TraceTab>("rounds");
  const requestId = useRef(0);
  const requestController = useRef<AbortController | null>(null);

  function invalidateRequest() {
    requestId.current += 1;
    requestController.current?.abort();
    requestController.current = null;
    setLoading(false);
    setResult(null);
    setError("");
    setTab("rounds");
  }

  async function run(values: FormValues = { variableCount, minterms, dontCares }) {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setResult(null);
    setTab("rounds");

    try {
      const input: QMInput = {
        variableCount: values.variableCount,
        minterms: parseTerms(values.minterms),
        dontCares: parseTerms(values.dontCares),
      };
      const response = await fetch("/api/qm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "The minimizer could not process that input. Please try again.";
        throw new Error(message);
      }
      if (!isQMResult(payload)) {
        throw new Error("Vera could not verify the minimization result. Please try again.");
      }
      if (requestId.current === currentRequest) setResult(payload);
    } catch (cause) {
      if (requestId.current !== currentRequest) return;
      if (cause instanceof DOMException && cause.name === "AbortError") {
        setError("This calculation was canceled. Review the inputs and run it again.");
      } else {
        setError(cause instanceof Error ? cause.message : "Could not minimize that function. Please try again.");
      }
    } finally {
      if (requestId.current === currentRequest) {
        requestController.current = null;
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void run(example);
    return () => {
      requestId.current += 1;
      requestController.current?.abort();
    };
  }, []);

  function updateValues(update: () => void) {
    invalidateRequest();
    update();
  }

  function restoreExample() {
    invalidateRequest();
    setVariableCount(example.variableCount);
    setMinterms(example.minterms);
    setDontCares(example.dontCares);
    void run(example);
  }

  function selectTraceTab(next: TraceTab) {
    setTab(next);
  }

  function handleTabKey(event: React.KeyboardEvent<HTMLButtonElement>, current: TraceTab) {
    const index = traceTabs.findIndex((item) => item.id === current);
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % traceTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + traceTabs.length) % traceTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = traceTabs.length - 1;
    else return;
    event.preventDefault();
    const nextTab = traceTabs[nextIndex];
    setTab(nextTab.id);
    document.getElementById(`trace-tab-${nextTab.id}`)?.focus();
  }

  const variableEnd = String.fromCharCode(64 + variableCount);

  return (
    <div className="page-shell wrap qm-page">
      <div className="page-hero">
        <div className="eyebrow"><span className="pulse-dot" /> LOGIC LAB / QUINE–MCCLUSKEY</div>
        <h1>Less logic.<br /><em>More clarity.</em></h1>
        <p>Follow a function from its minterms to its minimal sum-of-products form.</p>
      </div>

      <div className="qm-workspace">
        <section className="qm-controls" aria-labelledby="qm-input-heading">
          <div className="panel-topline" id="qm-input-heading"><span>01 / DEFINE A FUNCTION</span><ScanLine size={17} aria-hidden="true" /></div>

          <div className="field-label" id="variable-count-label">VARIABLES <span>UP TO 6</span></div>
          <div className="variable-select" role="group" aria-labelledby="variable-count-label">
            {Array.from({ length: 6 }, (_, index) => {
              const count = index + 1;
              return (
                <button
                  key={count}
                  type="button"
                  className={variableCount === count ? "var-chip selected" : "var-chip"}
                  aria-label={`${count} ${count === 1 ? "variable" : "variables"}`}
                  aria-pressed={variableCount === count}
                  onClick={() => updateValues(() => setVariableCount(count))}
                >
                  {String.fromCharCode(64 + count)}
                </button>
              );
            })}
          </div>

          <label className="field-label" htmlFor="minterms">MINTERMS <span>OUTPUT = 1</span></label>
          <input
            id="minterms"
            className="logic-input"
            value={minterms}
            onChange={(event) => updateValues(() => setMinterms(event.target.value))}
            placeholder="0, 2, 5, 7"
            aria-describedby="minterms-hint"
          />
          <div className="input-hint" id="minterms-hint">Separate indices with commas or spaces.</div>

          <label className="field-label" htmlFor="dontcares">DON’T-CARE TERMS <span>OPTIONAL</span></label>
          <input
            id="dontcares"
            className="logic-input"
            value={dontCares}
            onChange={(event) => updateValues(() => setDontCares(event.target.value))}
            placeholder="e.g. 3, 11"
            aria-describedby="dontcares-hint"
          />
          <div className="input-hint" id="dontcares-hint">Conditions whose output does not matter.</div>

          {error && <div className="qm-error" role="alert">{error}</div>}

          <button className="button button-primary calculate-button" type="button" onClick={() => void run()} disabled={loading}>
            {loading
              ? <><LoaderCircle size={16} className="spin" aria-hidden="true" /> Reducing the logic…</>
              : <>Minimize function <ArrowRight size={16} aria-hidden="true" /></>}
          </button>
          <button className="reset-button" type="button" onClick={restoreExample}>
            <RotateCcw size={13} aria-hidden="true" /> RESTORE EXAMPLE
          </button>

          <div className="qm-method-note">
            <span className="method-icon" aria-hidden="true">∑</span>
            <p>Powered by deterministic Quine–McCluskey with Petrick’s method for minimum cover.</p>
          </div>
        </section>

        <section className="qm-results" aria-labelledby="qm-trace-heading" aria-busy={loading}>
          <div className="panel-topline" id="qm-trace-heading">
            <span>02 / MINIMIZATION TRACE</span>
            <span className="result-status" role="status" aria-live="polite">
              <i aria-hidden="true" />{result?.verified ? "RESULT VERIFIED" : loading ? "CALCULATING" : "AWAITING INPUT"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={`${result.expression}-${variableCount}`}
                className="result-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: .24, ease: [.22, .7, .25, 1] }}
              >
                <div className="expression-panel">
                  <div className="expression-label">MINIMUM SUM OF PRODUCTS <span>F(A–{variableEnd})</span></div>
                  <div className="expression-value">F = <strong>{result.expression}</strong></div>
                  <div className="expression-meta">
                    <span><Check size={12} aria-hidden="true" /> {result.selected.length} PRODUCT {result.selected.length === 1 ? "TERM" : "TERMS"}</span>
                    <span>{result.primeImplicants.length} PRIME IMPLICANTS</span>
                  </div>
                </div>

                <div className="trace-tabs" role="tablist" aria-label="Minimization result views">
                  {traceTabs.map(({ id, label }) => (
                    <button
                      key={id}
                      id={`trace-tab-${id}`}
                      type="button"
                      role="tab"
                      className={tab === id ? "trace-tab active" : "trace-tab"}
                      aria-selected={tab === id}
                      aria-controls="trace-panel"
                      tabIndex={tab === id ? 0 : -1}
                      onClick={() => selectTraceTab(id)}
                      onKeyDown={(event) => handleTabKey(event, id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="trace-panel" id="trace-panel" role="tabpanel" aria-labelledby={`trace-tab-${tab}`} tabIndex={0}>
                  <AnimatePresence mode="wait">
                    {tab === "rounds" && (
                      <motion.div key="rounds" className="rounds-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {result.rounds.map((round, roundIndex) => (
                          <div className="round-row" key={roundIndex}>
                            <div className="round-label">ROUND {String(roundIndex + 1).padStart(2, "0")}<span>{round.length} GROUPS</span></div>
                            <div className="implicant-chips">
                              {round.map((implicant, implicantIndex) => (
                                <span className="implicant-chip" key={`${implicant.pattern}-${implicantIndex}`}>
                                  {implicant.pattern.split("").map((bit, bitIndex) => (
                                    <i key={bitIndex} className={bit === "-" ? "dash-bit" : bit === "1" ? "one-bit" : "zero-bit"}>{bit}</i>
                                  ))}
                                  <b>{implicant.covered.join(", ")}</b>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {tab === "chart" && (
                      <motion.div key="chart" className="chart-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p>Each prime implicant covers the minterms below. <span className="chart-key"><i aria-hidden="true" /> selected for minimum cover</span></p>
                        <div className="chart-scroller" role="region" aria-label="Prime implicant chart" tabIndex={0}>
                          <table className="prime-chart">
                            <thead><tr><th scope="col">PRIME</th>{result.primeChart.map(({ minterm: value }) => <th scope="col" key={value}>{value}</th>)}</tr></thead>
                            <tbody>{result.primeImplicants.map((prime, primeIndex) => (
                              <tr key={prime.pattern}>
                                <th scope="row" className={result.selected.includes(primeIndex) ? "selected-prime" : ""}>{prime.pattern}</th>
                                {result.primeChart.map((entry) => (
                                  <td key={entry.minterm}>
                                    {entry.primes.includes(primeIndex) && <i className={result.selected.includes(primeIndex) ? "covered selected" : "covered"} aria-label="Covered" />}
                                  </td>
                                ))}
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}

                    {tab === "table" && (
                      <motion.div key="table" className="truth-table-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="chart-scroller" role="region" aria-label="Complete truth table" tabIndex={0}>
                          <table className="qm-truth">
                            <thead><tr>{Array.from({ length: variableCount }, (_, index) => <th scope="col" key={index}>{String.fromCharCode(65 + index)}</th>)}<th scope="col">MINTERM</th><th scope="col">F</th></tr></thead>
                            <tbody>{result.truthTable.map((row) => (
                              <tr key={row.value}>{row.bits.map((bit, index) => <td key={index}>{bit}</td>)}<td>{row.value}</td><td className={row.minimized ? "value-one" : ""}>{row.minimized}</td></tr>
                            ))}</tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="result-footer">
                  <div><Sparkles size={15} aria-hidden="true" /><span>Want to know why these terms remain?</span></div>
                  <Explain
                    context={`Quine–McCluskey minimization result. Variables: ${variableCount}. Minterms: ${minterms}. Don't-care terms: ${dontCares || "none"}. Deterministic minimum expression: F = ${result.expression}. Prime implicants: ${JSON.stringify(result.primeImplicants)}. Essential implicants: ${JSON.stringify(result.essential)}. Selected implicants: ${JSON.stringify(result.selected)}. Combination rounds: ${JSON.stringify(result.rounds)}. Explain this exact result; do not calculate a different one.`}
                    label="Explain the result"
                  />
                </div>
              </motion.div>
            ) : (
              <div className={`results-placeholder${loading ? " is-loading" : ""}`} role="status" aria-live="polite" aria-atomic="true">
                {loading && <LoaderCircle className="spin" size={22} aria-hidden="true" />}
                {!loading && <div className="placeholder-orbit" aria-hidden="true" />}
                {!loading && <div className="placeholder-symbol" aria-hidden="true">Σ</div>}
                <span>{loading ? "CALCULATING WITH THE C++ ENGINE" : error ? "UPDATE THE INPUTS AND RUN AGAIN" : "YOUR MINIMIZATION TRACE APPEARS HERE"}</span>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <div className="method-ribbon" aria-label="Minimization method">
        <div><span>01</span><b>COMBINE</b><small>Terms that differ by one bit merge.</small></div>
        <ArrowRight size={14} aria-hidden="true" />
        <div><span>02</span><b>COVER</b><small>Prime implicants cover each minterm.</small></div>
        <ArrowRight size={14} aria-hidden="true" />
        <div><span>03</span><b>REDUCE</b><small>Choose a minimum cover of the chart.</small></div>
      </div>
    </div>
  );
}
