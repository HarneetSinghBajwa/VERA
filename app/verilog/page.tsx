"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Code2, Search } from "lucide-react";
import { designs } from "@/lib/catalog";

const categories = ["All designs", ...new Set(designs.map((design) => design.category))];

export default function Verilog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All designs");
  const searchRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return designs.filter((design) => {
      const matchesCategory = category === "All designs" || design.category === category;
      const searchable = `${design.name.replaceAll("_", " ")} ${design.category} ${design.concepts.join(" ")}`.toLowerCase();
      return matchesCategory && searchable.includes(normalizedQuery);
    });
  }, [category, query]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <div className="page-shell wrap">
      <div className="page-hero">
        <div className="eyebrow"><span className="pulse-dot" /> VERA RTL CATALOG / {designs.length} DESIGNS</div>
        <h1>Read the <em>hardware.</em></h1>
        <p>Small, real Verilog designs that connect an idea to the circuit it becomes.</p>
      </div>

      <div className="library-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <input
            ref={searchRef}
            aria-label="Search Verilog designs and concepts"
            placeholder="Find a design or concept…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>CTRL K</kbd>
        </label>
        <span className="result-count" role="status" aria-live="polite" aria-atomic="true">
          {items.length} / {designs.length} DESIGNS
        </span>
      </div>

      <div className="category-strip" role="group" aria-label="Filter designs by category">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "filter-chip active" : "filter-chip"}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state" role="status">
          <Code2 size={24} aria-hidden="true" />
          <p>No designs match that search.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("All designs"); }}>Clear filters</button>
        </div>
      ) : (
        <div className="library-grid" aria-label={`${items.length} Verilog designs`}>
          {items.map((design, index) => (
            <Link
              href={`/verilog/${design.name}`}
              className="design-card"
              key={design.name}
              style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
            >
              <div className="design-meta"><span>{design.category}</span><span>{design.level.toUpperCase()}</span></div>
              <div className="design-glyph"><Code2 size={21} aria-hidden="true" /><span>RTL / {String(index + 1).padStart(2, "0")}</span></div>
              <h2>{design.name.replaceAll("_", " ")}</h2>
              <p>{design.concepts.map((concept) => concept.replaceAll("_", " ")).join(" · ")}</p>
              <div className="design-card-bottom"><span>View design</span><ArrowUpRight size={15} aria-hidden="true" /></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
