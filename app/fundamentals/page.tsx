"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Lightbulb, Signal } from "lucide-react";
import { Explain } from "@/components/explain";
import { fundamentals } from "@/data/fundamentals";

const gateNames = ["AND GATE","OR GATE","NOT GATE","NAND GATE","NOR GATE","XOR GATE","XNOR GATE"];
const gateFormulas: Record<string,string> = {"AND GATE":"Y = A · B","OR GATE":"Y = A + B","NOT GATE":"Y = A′","NAND GATE":"Y = (A · B)′","NOR GATE":"Y = (A + B)′","XOR GATE":"Y = A ⊕ B","XNOR GATE":"Y = (A ⊕ B)′"};
function gateValue(gate: string, a: number, b: number) {
  if (gate === "AND GATE") return a & b;
  if (gate === "OR GATE") return a | b;
  if (gate === "NOT GATE") return 1-a;
  if (gate === "NAND GATE") return 1-(a & b);
  if (gate === "NOR GATE") return 1-(a | b);
  if (gate === "XNOR GATE") return Number(a === b);
  return Number(a !== b);
}

export default function Fundamentals() {
  const [active, setActive] = useState(0);
  const [inputs, setInputs] = useState<[number, number]>([1, 0]);
  const [binaryBits, setBinaryBits] = useState<[number,number,number,number]>([1,0,1,0]);
  const [gate, setGate] = useState("XOR GATE");
  const topic = fundamentals[active];
  const selected = topic.truth.find((row) => row[0] === inputs[0] && row[1] === inputs[1]) ?? topic.truth[0];
  const gateOutput = gateValue(gate, inputs[0], inputs[1]);
  const liveTruth = topic.id === "gates" ? (gate === "NOT GATE" ? [[0,0,1],[1,0,0]] : [[0,0],[0,1],[1,0],[1,1]].map(([a,b])=>[a,b,gateValue(gate,a,b)])) : topic.truth;
  const columns: string[] = topic.id === "gates" ? gate === "NOT GATE" ? ["A","Y = NOT A"] : ["A","B",gate] : topic.columns;
  const binaryValue = binaryBits.reduce((total, bit, index) => total + bit * 2 ** (3-index), 0);
  const currentOutput = topic.id === "binary" ? binaryValue : topic.id === "gates" ? gateOutput : selected[2];
  const next = fundamentals[(active + 1) % fundamentals.length];

  useEffect(() => { setInputs([1, 0]); setGate("XOR GATE"); }, [active]);

  return <div className="page-shell wrap fundamentals-page">
    <div className="page-hero">
      <div className="eyebrow"><span className="pulse-dot"/> FOUNDATIONS / {String(fundamentals.length).padStart(2,"0")} CONCEPTS</div>
      <h1>Start with the <em>signal.</em></h1>
      <p>A guided path from binary signals to circuits that remember—and the Verilog used to describe them.</p>
    </div>
    <div className="fundamental-layout">
      <aside className="lesson-nav" aria-label="Fundamentals learning path">
        {fundamentals.map((item, index) => <button key={item.id} className={active === index ? "lesson-link selected" : "lesson-link"} aria-current={active === index ? "step" : undefined} onClick={() => setActive(index)}>
          <span>{String(index + 1).padStart(2,"0")}</span>{item.title}<ChevronRight size={15}/>
        </button>)}
        <div className="lesson-nav-note"><Lightbulb size={17}/><span>Follow the sequence, or jump to any concept when you need a refresher.</span></div>
      </aside>
      <motion.article key={topic.id} className="lesson-panel" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.35}}>
        <div className="lesson-kicker">CONCEPT {String(active+1).padStart(2,"0")} <span>·</span> DIGITAL LOGIC</div>
        <h2>{topic.title}</h2>
        <p className="lesson-subtitle">{topic.subtitle}</p>
        <p className="lesson-copy">{topic.intuition}</p>

        <div className="lesson-definition-grid">
          <section><h3>Why it matters</h3><p>{topic.why}</p></section>
          <section><h3>Formal model</h3><p>{topic.definition}</p></section>
        </div>

        <section className="lesson-demo" aria-label="Interactive lesson demonstration">
          <div className="demo-head"><span><Signal size={15}/> INTERACTIVE MODEL</span><span className="demo-active"><i/> {topic.visual}</span></div>
          {topic.id === "binary" ? <div className="binary-demo">
            <div className="binary-bit-row">{binaryBits.map((bit,index) => <button key={index} className={bit ? "binary-bit is-one" : "binary-bit"} type="button" aria-label={`Bit ${3-index}, value ${bit}; toggle`} aria-pressed={bit===1} onClick={() => setBinaryBits((current) => { const next:[number,number,number,number]=[...current]; next[index]=next[index]?0:1; return next; })}><small>2<sup>{3-index}</sup></small><b>{bit}</b></button>)}</div>
            <div className="binary-readout"><span>BINARY</span><strong>{binaryBits.join("")}<sub>2</sub></strong><i>→</i><span>DECIMAL</span><strong>{binaryValue}<sub>10</sub></strong><small>HEX {binaryValue.toString(16).toUpperCase()}</small></div>
          </div> : <>
            {topic.id === "gates" && <div className="gate-chooser" aria-label="Choose a logic gate">{gateNames.map((name)=><button type="button" key={name} className={gate===name?"gate-choice selected":"gate-choice"} aria-pressed={gate===name} onClick={()=>setGate(name)}>{name}</button>)}</div>}
            <div className="demo-body">
              <div className="signal-inputs">{([0,1] as const).filter((bit)=>topic.id!=="gates"||gate!=="NOT GATE"||bit===0).map((bit) => <button key={bit} type="button" className="signal-toggle" aria-pressed={inputs[bit] === 1} onClick={() => setInputs((current) => { const value: [number,number] = [...current]; value[bit] = value[bit] ? 0 : 1; return value; })}>{topic.id === "gates" ? String.fromCharCode(65+bit) : topic.columns[bit]} <i className={inputs[bit] ? "signal-on" : "signal-off"}/><b>{inputs[bit]}</b></button>)}</div>
              <div className="demo-wires">{([0,1] as const).filter((bit)=>topic.id!=="gates"||gate!=="NOT GATE"||bit===0).map((bit)=><i key={bit}/>)}</div><div className="gate-shape"><b>{topic.id === "signals" ? "THRESHOLD" : topic.id === "boolean" ? "OR" : topic.id === "gates" ? gate.replace(" GATE", "") : topic.id === "sequential" || topic.id === "flip-flops" ? "D" : topic.id === "multiplexers" ? "MUX" : topic.id === "arithmetic" ? "Σ" : "LOGIC"}</b></div>
              <div className="demo-output"><span>{topic.id === "gates" ? "Y" : "F"}</span><strong key={currentOutput}>{currentOutput}</strong></div>
            </div></>}
          <div className="equation-row"><span>{topic.id === "binary" ? "PLACE VALUE" : "LOGIC MODEL"}</span><code>{topic.id === "binary" ? `${binaryBits.join("")}₂ = ${binaryValue}₁₀ = ${binaryValue.toString(16).toUpperCase()}₁₆` : topic.id === "gates" ? gateFormulas[gate] : topic.equation}</code><span className="current-state">CURRENT OUTPUT <b>{currentOutput}</b></span></div>
        </section>

        <div className="lesson-lower">
          {topic.id === "binary" ? <div className="truth-box"><div className="box-heading"><span>BIT PLACE VALUES</span><span>TOGGLE ANY BIT TO CHANGE TOTAL</span></div><table><thead><tr><th>BIT</th><th>WEIGHT</th><th>CONTRIBUTION</th></tr></thead><tbody>{binaryBits.map((bit,index)=><tr key={index} className={bit?"active-truth-row":""}><td>{bit}</td><td>{2**(3-index)}</td><td>{bit*(2**(3-index))}</td></tr>)}</tbody></table></div> : <div className="truth-box"><div className="box-heading"><span>TRUTH TABLE</span><span>SELECT AN INPUT ROW ABOVE</span></div>
            <table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
              <tbody>{liveTruth.map((row,index) => <tr key={index} className={row[0] === inputs[0] && (gate === "NOT GATE" || row[1] === inputs[1]) ? "active-truth-row" : ""}><td>{row[0]}</td>{topic.id!=="gates"||gate!=="NOT GATE"?<td>{row[1]}</td>:null}<td className={row[2] ? "value-one" : ""}>{row[2]}</td></tr>)}</tbody>
            </table></div>}
          <div className="takeaway"><span>THE INTUITION</span><p>{topic.takeaway}</p><div className="takeaway-rule"/><Explain label="Ask Vera to explain" context={`${topic.title}. Intuition: ${topic.intuition} Why it matters: ${topic.why} Formal model: ${topic.definition} Example: ${topic.example} Common mistake: ${topic.commonMistake} Key takeaway: ${topic.takeaway} Equation: ${topic.id === "gates" ? gateFormulas[gate] : topic.equation} Selected gate: ${topic.id === "gates" ? gate : "not applicable"}. Current inputs: ${topic.id === "binary" ? binaryBits.join("") : inputs.join(", ")}. Current output: ${currentOutput}.`}/></div>
        </div>

        <div className="lesson-practice-grid">
          <section><h3>Worked example</h3><p>{topic.example}</p></section>
          <section><h3>Common mistake</h3><p>{topic.commonMistake}</p></section>
        </div>
        <div className="lesson-related"><span>CONNECTED IDEAS</span>{topic.related.map((concept) => <span className="related-chip" key={concept}>{concept}</span>)}</div>
        <div className="lesson-next"><span>{active === fundamentals.length-1 ? "LEARNING PATH COMPLETE" : `UP NEXT · ${String((active+2)).padStart(2,"0")} / ${fundamentals.length}`}</span><button onClick={() => setActive((active+1)%fundamentals.length)}>{next.title}<ArrowRight size={16}/></button></div>
      </motion.article>
    </div>
  </div>;
}
