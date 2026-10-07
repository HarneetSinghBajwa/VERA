import fs from "node:fs";
import path from "node:path";
import { designs } from "@/lib/catalog";

const root = path.join(process.cwd(), "data/verilog");
export function getDesign(slug: string) {
  const design = designs.find((item) => item.name === slug);
  if (!design) return null;
  const code = fs.readFileSync(path.join(root, design.file), "utf8");
  const testbenchCode = design.testbench
    ? fs.readFileSync(path.join(root, design.testbench), "utf8")
    : null;
  const title = design.name.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
  return { ...design, title, code, testbenchCode, description: descriptions[slug] ?? `A ${design.level} ${design.category.toLowerCase()} design demonstrating ${design.concepts.join(", ").replaceAll("_", " ")}.` };
}
const descriptions: Record<string,string> = {
  and_gate: "The AND gate outputs HIGH only when both inputs are HIGH. It is the smallest building block for expressing logical conditions in hardware.",
  xor_gate: "XOR is HIGH when its inputs differ. That makes it the sum bit in a half adder and a useful parity detector.",
  mux_2to1: "A 2-to-1 multiplexer routes one of two data inputs to its output, selected by a single control bit.",
  half_adder: "A half adder adds two one-bit values. XOR produces the sum, while AND produces the carry.",
  full_adder: "A full adder adds two data bits and an incoming carry, producing a sum bit and the carry for the next stage.",
  alu_4bit: "A compact four-bit arithmetic logic unit selects between core arithmetic and logic operations.",
  d_flip_flop: "A D flip-flop captures its input on the active clock edge and holds that value until the next edge.",
};
