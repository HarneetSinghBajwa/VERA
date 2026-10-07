"use client";

import { useEffect, useRef } from "react";

export function AmbientField() {
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = field.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const move = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        element.style.setProperty("--pointer-x", `${(pointerX / window.innerWidth) * 100}%`);
        element.style.setProperty("--pointer-y", `${(pointerY / window.innerHeight) * 100}%`);
        element.style.setProperty("--shift-x", `${(pointerX / window.innerWidth - .5) * -18}px`);
        element.style.setProperty("--shift-y", `${(pointerY / window.innerHeight - .5) * -12}px`);
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); };
  }, []);

  return <div className="ambient-bg" ref={field} aria-hidden="true">
    <div className="ambient-plane"/>
    <svg className="ambient-ribbons" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spectrum" x1="0" x2="1">
          <stop offset="0" stopColor="#228eff"/><stop offset=".3" stopColor="#57d8ff"/><stop offset=".52" stopColor="#e7fbff"/><stop offset=".69" stopColor="#ffbf88"/><stop offset="1" stopColor="#ad6bff"/>
        </linearGradient>
        <filter id="refract" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="13"/></filter>
      </defs>
      <g className="ribbon-parallax">
        <path className="ribbon-glow" d="M-80 700 C180 610 240 640 430 520 S780 390 950 485 1260 660 1680 390"/>
        <path className="ribbon-color" d="M-80 700 C180 610 240 640 430 520 S780 390 950 485 1260 660 1680 390"/>
        <path className="ribbon-pulse" d="M-80 700 C180 610 240 640 430 520 S780 390 950 485 1260 660 1680 390"/>
        <path className="ribbon-core" d="M-80 700 C180 610 240 640 430 520 S780 390 950 485 1260 660 1680 390"/>
        <path className="ribbon-glow ribbon-second" d="M-80 820 C230 720 400 795 590 670 S900 510 1060 610 1340 720 1680 540"/>
        <path className="ribbon-color ribbon-second" d="M-80 820 C230 720 400 795 590 670 S900 510 1060 610 1340 720 1680 540"/>
        <path className="ribbon-pulse ribbon-second" d="M-80 820 C230 720 400 795 590 670 S900 510 1060 610 1340 720 1680 540"/>
      </g>
    </svg>
    <div className="ambient-vignette"/>
  </div>;
}
