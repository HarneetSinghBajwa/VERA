"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Hexagon, Menu, X } from "lucide-react";

const links = [
  { href: "/fundamentals", label: "Fundamentals" },
  { href: "/verilog", label: "Verilog" },
  { href: "/minimization", label: "Minimization" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="Vera home">
        <span className="brand-mark" aria-hidden="true"><Hexagon size={17} /></span>
        vera<span className="brand-dot">.</span>
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            className={path.startsWith(href) ? "active" : ""}
            aria-current={path.startsWith(href) ? "page" : undefined}
            href={href}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="nav-actions">
        <span className="status"><i aria-hidden="true" /> LAB ONLINE</span>
        <Link href="/minimization" className="nav-cta">Open the lab <span aria-hidden="true">↗</span></Link>
        <button
          ref={menuButton}
          className="mobile-toggle"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id={menuId}
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: .2, ease: [.22, .7, .25, 1] }}
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={path.startsWith(href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}<span aria-hidden="true">↗</span>
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
