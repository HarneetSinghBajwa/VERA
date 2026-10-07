import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { MotionProvider } from "@/components/motion-provider";
import { AmbientField } from "@/components/ambient-field";
import "./globals.css";
import "./design-rework.css";
import "./typography.css";
export const metadata: Metadata = { title: { default: "Vera — Digital Design, Explained Visually", template: "%s · Vera" }, description: "Learn digital logic, explore real Verilog designs, and understand Boolean minimization in an interactive digital design lab.", icons: { icon: "/favicon.svg" }, openGraph: { title: "Vera — Digital Design, Explained Visually", description: "A living digital design lab for logic, Verilog, and minimization.", type: "website" } };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><MotionProvider><AmbientField/><Nav/><main>{children}</main><footer className="footer wrap"><Link href="/" className="brand"><span className="brand-mark">◈</span>vera<span className="brand-dot">.</span></Link><span>MADE FOR THE MOMENT LOGIC CLICKS.</span><span>VERA V1 · DIGITAL DESIGN LAB</span></footer></MotionProvider></body></html>}
import Link from "next/link";
