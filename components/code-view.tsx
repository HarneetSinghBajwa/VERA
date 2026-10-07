"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Highlight, Prism } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";

type Source = "rtl" | "testbench";

Prism.languages.verilog = {
  comment: [
    { pattern: /\/\*[\s\S]*?\*\//, greedy: true },
    /\/\/.*|^\s*\*.*$/m,
  ],
  string: { pattern: /"(?:\\.|[^"\\])*"/, greedy: true },
  keyword: /\b(?:always_comb|always_ff|always_latch|always|assign|automatic|begin|buf|case|casex|casez|default|disable|else|end|endcase|endfunction|endgenerate|endmodule|endtask|for|forever|function|generate|if|initial|input|inout|integer|localparam|logic|module|negedge|output|parameter|posedge|reg|repeat|signed|task|time|unsigned|wait|while|wire)\b/,
  number: /\b(?:\d+)?'[sS]?[bBoOdDhH][\da-fA-F_xXzZ?]+|\b\d+\b/,
  operator: /(?:===|!==|==|!=|<=|>=|&&|\|\||<<|>>>?|\*\*|[=<>!~?:&|^*/%+-])/,
  punctuation: /[{}\[\];(),.:]/,
};

const verilogTheme = {
  plain: { color: "#ffffff", backgroundColor: "#31586b" },
  styles: [
    { types: ["comment"], style: { color: "#e4f1f6", fontStyle: "italic" as const } },
    { types: ["keyword"], style: { color: "#a6f0ff", fontWeight: "600" as const } },
    { types: ["number"], style: { color: "#ffe6bf" } },
    { types: ["string"], style: { color: "#def8cb" } },
    { types: ["operator"], style: { color: "#ffd0a8" } },
    { types: ["punctuation"], style: { color: "#f4f9fc" } },
  ],
};

const HighlightedSource = memo(function HighlightedSource({ code }: { code: string }) {
  return (
    <Highlight prism={Prism} theme={verilogTheme} code={code} language="verilog">
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className="code-body" aria-label="Verilog source code">
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="line-no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {line.map((token, j) => <span key={j} {...getTokenProps({ token })} />)}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
});

export function CodeView({
  code,
  testbenchCode,
}: {
  code: string;
  testbenchCode: string | null;
}) {
  const [source, setSource] = useState<Source>("rtl");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rtlTab = useRef<HTMLButtonElement>(null);
  const testbenchTab = useRef<HTMLButtonElement>(null);
  const hasTestbench = Boolean(testbenchCode);
  const activeCode = source === "testbench" ? testbenchCode : code;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function selectSource(next: Source) {
    setSource(next);
    setCopied(false);
  }

  function moveTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next: Source = event.key === "Home"
      ? "rtl"
      : event.key === "End"
        ? "testbench"
        : source === "rtl" ? "testbench" : "rtl";
    selectSource(next);
    (next === "rtl" ? rtlTab : testbenchTab).current?.focus();
  }

  async function copy() {
    if (!activeCode) return;
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="code-window">
        <div className="code-toolbar">
          <div className="code-toolbar-start">
            <span className="code-status"><i aria-hidden="true" /> VERILOG</span>
            <div className="source-tabs" role="tablist" aria-label="Verilog source files" onKeyDown={moveTab}>
              <button
                ref={rtlTab}
                id="rtl-source-tab"
                type="button"
                role="tab"
                aria-selected={source === "rtl"}
                aria-controls="verilog-source-panel"
                tabIndex={source === "rtl" ? 0 : -1}
                onClick={() => selectSource("rtl")}
              >RTL SOURCE</button>
              <button
                ref={testbenchTab}
                id="testbench-source-tab"
                type="button"
                role="tab"
                aria-selected={source === "testbench"}
                aria-controls="verilog-source-panel"
                tabIndex={source === "testbench" ? 0 : -1}
                onClick={() => selectSource("testbench")}
              >TESTBENCH</button>
            </div>
          </div>
          <button className="copy-source" type="button" onClick={copy} disabled={!activeCode}>
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? "COPIED" : "COPY CODE"}
          </button>
        </div>
        <div
          id="verilog-source-panel"
          role="tabpanel"
          aria-labelledby={source === "rtl" ? "rtl-source-tab" : "testbench-source-tab"}
          className="code-source-panel"
        >
          {activeCode ? (
            <HighlightedSource code={activeCode} />
          ) : (
            <div className="testbench-empty" role="status">
              <span className="testbench-empty-mark" aria-hidden="true">—</span>
              <strong>TESTBENCH NOT INCLUDED</strong>
              <span>This design has no testbench in the Vera source catalog.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
