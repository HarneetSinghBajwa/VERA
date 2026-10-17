"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const CircuitScene = dynamic(() => import("./circuit-scene"), {
  ssr: false,
  loading: () => <div className="scene scene-loading" aria-hidden="true" />,
});

export function Hero({ designCount }: { designCount: number }) {
  const reducedMotion = useReducedMotion();
  const entrance = (delay = 0) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: .42, delay, ease: [.22, .7, .25, 1] as const },
  });

  return (
    <section className="hero wrap" aria-label="Vera digital design laboratory">
      <div aria-hidden="true"><CircuitScene /></div>

      <div className="hero-copy">
        <motion.div className="eyebrow" {...entrance()}>
          <span className="pulse-dot" aria-hidden="true" /> A LIVING DIGITAL DESIGN LAB
        </motion.div>
        <motion.h1 {...entrance(.04)}>Logic, brought<br />into <em>light.</em></motion.h1>
        <motion.p className="hero-sub" {...entrance(.08)}>
          See digital design from the inside. Feel a signal move. Follow an idea all the way to hardware.
        </motion.p>
        <motion.div className="hero-buttons" {...entrance(.12)}>
          <Link className="button button-primary" href="/fundamentals">Enter the lab <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link className="button button-quiet" href="/verilog">Explore real designs <span aria-hidden="true">→</span></Link>
        </motion.div>
      </div>

      <div className="hero-side-index" aria-hidden="true"><span>V / 01</span><i /><span>INPUT</span><span>PROCESS</span><span>OUTPUT</span></div>
      <div className="hero-coordinate coordinate-left" aria-hidden="true">A · B · C <span>001101</span></div>
      <div className="hero-coordinate coordinate-right" aria-hidden="true">SIGNAL FIELD <span>{designCount} DESIGNS</span></div>
      <div className="hero-bottom">
        <span><ArrowDown size={13} aria-hidden="true" /> FOLLOW THE SIGNAL</span>
        <span>LOGIC IS A PLACE YOU CAN ENTER.</span>
        <span>01 — 03</span>
      </div>
    </section>
  );
}
