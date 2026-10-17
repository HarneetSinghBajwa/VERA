import Link from "next/link";
import { ArrowUpRight, BookOpen, Braces, ScanLine, Sparkles } from "lucide-react";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";
import { designs } from "@/lib/catalog";

const modules = [
  {
    number: "01",
    icon: BookOpen,
    title: "Fundamentals",
    description: "Build intuition from Boolean basics to the circuits that remember.",
    href: "/fundamentals",
    tags: ["GATES", "TRUTH TABLES", "SEQUENTIAL LOGIC"],
  },
  {
    number: "02",
    icon: Braces,
    title: "Verilog codes",
    description: "Explore readable, real RTL from gates to finite state machines.",
    href: "/verilog",
    tags: ["CURATED RTL", "CODE NOTES", "DESIGN LIBRARY"],
  },
  {
    number: "03",
    icon: ScanLine,
    title: "Minimization",
    description: "Trace Quine–McCluskey from minterms to a smaller expression.",
    href: "/minimization",
    tags: ["QUINE–MCCLUSKEY", "PETRICK’S METHOD", "LIVE TABLE"],
  },
];

const featuredDesignNames = [
  "and_gate",
  "mux_2to1",
  "full_adder",
  "d_flip_flop",
  "sequence_detector_1011_moore",
];

export default function Home() {
  const featuredDesigns = designs.filter((design) => featuredDesignNames.includes(design.name));

  return (
    <>
      <Hero designCount={designs.length} />

      <Reveal className="section wrap module-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="tiny-square" aria-hidden="true" /> THE LEARNING SYSTEM</div>
            <h2>Three ways to <em>get it.</em></h2>
          </div>
          <p>Move from first principles to working designs, with the tools to see why each piece works.</p>
        </div>

        <div className="module-grid">
          {modules.map(({ number, icon: Icon, title, description, href, tags }) => (
            <Link href={href} key={number} className="module-card">
              <div className="card-top"><span>{number} / MODULE</span><Icon size={19} aria-hidden="true" /></div>
              <div className="module-symbol" aria-hidden="true"><Icon size={43} strokeWidth={1} /><div className="symbol-ring" /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="tag-row" aria-label={`${title} topics`}>
                {tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <span className="card-link">Open module <ArrowUpRight size={15} aria-hidden="true" /></span>
              <div className="card-orb" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Reveal>

      <section className="feature-band" aria-labelledby="feature-heading">
        <div className="feature-inner wrap">
          <div>
            <div className="eyebrow"><span className="pulse-dot" aria-hidden="true" /> A BETTER WAY TO SEE LOGIC</div>
            <h2 id="feature-heading">Not just what it does.<br /><em>Why it works.</em></h2>
            <p>Tap through a truth table. Follow a signal through a mux. Watch implicants combine. Vera makes the invisible structure of digital design feel tangible.</p>
            <Link className="text-link" href="/fundamentals">Get into the fundamentals <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>

          <div className="feature-visual" aria-hidden="true">
            <div className="visual-grid" />
            <div className="logic-chip">
              <span>A</span><span className="chip-gate">&amp;</span><span>B</span><span className="chip-out">Y</span>
              <div className="wire wire-a" /><div className="wire wire-b" /><div className="wire wire-y" />
              <i className="flow flow-a" /><i className="flow flow-b" /><i className="flow flow-y" />
            </div>
            <div className="float-note note-top">INPUTS <b>2</b></div>
            <div className="float-note note-bottom">OUTPUT <b>A · B</b></div>
          </div>
        </div>
      </section>

      <Reveal className="section wrap catalog-peek">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="tiny-square" aria-hidden="true" /> FROM THE VERA LIBRARY</div>
            <h2>Real designs. <em>Readable code.</em></h2>
          </div>
          <Link href="/verilog" className="text-link">Explore all {designs.length} modules <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>

        <div className="peek-grid" aria-label="Featured Verilog designs">
          {featuredDesigns.map((design, index) => (
            <Link key={design.name} className="peek-item" href={`/verilog/${design.name}`}>
              <span className="peek-num">{String(index + 1).padStart(2, "0")}</span>
              <div><span className="peek-category">{design.category}</span><h3>{design.name.replaceAll("_", " ")}</h3></div>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Reveal>

      <section className="ask-band" aria-labelledby="ask-heading">
        <div className="ask-orbit orbit-one" aria-hidden="true" />
        <div className="ask-orbit orbit-two" aria-hidden="true" />
        <div className="ask-content">
          <div className="eyebrow"><Sparkles size={13} aria-hidden="true" /> A TEACHER WHEN YOU NEED ONE</div>
          <h2 id="ask-heading">Ask Vera to <em>explain it.</em></h2>
          <p>Context-aware explanations for the exact gate, design, or minimization result you’re exploring.</p>
          <Link className="button button-primary" href="/minimization">Try the minimizer <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="wrap bottom-metrics" aria-label="Vera at a glance">
        <div><strong>01</strong><span>DETERMINISTIC MINIMIZATION</span></div>
        <div><strong>{designs.length}</strong><span>CURATED RTL DESIGNS</span></div>
        <div><strong>∞</strong><span>WAYS TO MAKE IT CLICK</span></div>
      </section>
    </>
  );
}
