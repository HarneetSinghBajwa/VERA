export type QMInput = { variableCount: number; minterms: number[]; dontCares: number[] };
type Implicant = { pattern: string; covered: number[] };
export type QMResult = { expression: string; primeImplicants: Implicant[]; rounds: Implicant[][]; essential: number[]; selected: number[]; truthTable: { bits: number[]; value: number; minimized: number }[] };

// Adapter mirrors the rounds, prime chart, essential-prime selection and minimum
// cover behavior of the preserved C++ implementation in vendor/QM_Method.
export function minimize(input: QMInput): QMResult {
  const { variableCount: n } = input;
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error("Choose between 1 and 6 variables.");
  const max = 2 ** n;
  const clean = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);
  const minterms = clean(input.minterms), dontCares = clean(input.dontCares);
  if ([...minterms, ...dontCares].some((x) => !Number.isInteger(x) || x < 0 || x >= max)) throw new Error(`Terms must be between 0 and ${max - 1} for ${n} variables.`);
  if (minterms.some((x) => dontCares.includes(x))) throw new Error("A term cannot be both a minterm and a don't-care.");
  const all = [...minterms, ...dontCares];
  let current: Implicant[] = all.map((value) => ({ pattern: value.toString(2).padStart(n, "0"), covered: [value] }));
  const rounds: Implicant[][] = [current];
  const primes: Implicant[] = [];
  while (current.length) {
    const used = new Set<number>(); const next: Implicant[] = [];
    for (let i = 0; i < current.length; i++) for (let j = i + 1; j < current.length; j++) {
      const a = current[i], b = current[j]; let diff = -1, valid = true;
      for (let k = 0; k < n; k++) if (a.pattern[k] !== b.pattern[k]) { if (a.pattern[k] === "-" || b.pattern[k] === "-" || diff !== -1) { valid = false; break; } diff = k; }
      if (!valid || diff === -1) continue;
      used.add(i); used.add(j);
      const pattern = a.pattern.slice(0, diff) + "-" + a.pattern.slice(diff + 1);
      const covered = [...new Set([...a.covered, ...b.covered])].sort((x,y)=>x-y);
      if (!next.some((item) => item.pattern === pattern)) next.push({ pattern, covered });
    }
    current.forEach((item, i) => { if (!used.has(i) && !primes.some((p) => p.pattern === item.pattern)) primes.push(item); });
    current = next; if (current.length) rounds.push(current);
  }
  const chart = minterms.map((m) => primes.flatMap((p, i) => p.covered.includes(m) ? [i] : []));
  const essential = [...new Set(chart.filter((row) => row.length === 1).map((row) => row[0]))];
  const covered = new Set(essential.flatMap((i) => primes[i].covered));
  const uncovered = minterms.filter((m) => !covered.has(m));
  let products: Set<number>[] = [new Set()];
  for (const m of uncovered) {
    const options = primes.flatMap((p,i) => p.covered.includes(m) && !essential.includes(i) ? [i] : []);
    const expanded = products.flatMap((product) => options.map((i) => new Set([...product, i])));
    const unique = expanded.filter((p, i) => !expanded.slice(0, i).some((q) => [...q].every((x) => p.has(x)) && p.size >= q.size));
    products = unique;
  }
  const best = products.sort((a,b) => a.size-b.size || [...a].reduce((s,i)=>s+primes[i].pattern.replaceAll("-","").length,0)-[...b].reduce((s,i)=>s+primes[i].pattern.replaceAll("-","").length,0))[0] ?? new Set<number>();
  const selected = [...new Set([...essential, ...best])].sort((a,b)=>a-b);
  const letters = Array.from({length:n},(_,i)=>String.fromCharCode(65+i));
  const terms = selected.map((i) => primes[i].pattern.split("").map((bit,k)=>bit === "1" ? letters[k] : bit === "0" ? `${letters[k]}'` : "").join("")).filter(Boolean);
  const expression = selected.some((i) => primes[i].pattern.split("").every((bit) => bit === "-")) ? "1" : terms.length ? terms.join(" + ") : "0";
  const truthTable = Array.from({length:max},(_,value)=>{ const bits=value.toString(2).padStart(n,"0").split("").map(Number); const minimized=selected.some((i)=>primes[i].pattern.split("").every((bit,k)=>bit==="-"||Number(bit)===bits[k]))?1:0; return {bits,value,minimized}; });
  return { expression, primeImplicants: primes, rounds, essential, selected, truthTable };
}
