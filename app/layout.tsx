import type { Metadata } from "next";
import Link from "next/link";
import { AmbientField } from "@/components/ambient-field";
import { MotionProvider } from "@/components/motion-provider";
import { Nav } from "@/components/nav";
import "./globals.css";
import "./design-rework.css";
import "./typography.css";
import "./verilog-polish.css";
import "./product-system.css";

export const metadata: Metadata = {
  title: {
    default: "Vera — Digital Design, Explained Visually",
    template: "%s · Vera",
  },
  description:
    "Learn digital logic, explore real Verilog designs, and understand Boolean minimization in an interactive digital design lab.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Vera — Digital Design, Explained Visually",
    description: "A living digital design lab for logic, Verilog, and minimization.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>
          <a className="skip-link" href="#main-content">Skip to main content</a>
          <AmbientField />
          <Nav />
          <main id="main-content">{children}</main>
          <footer className="footer wrap">
            <Link href="/" className="brand" aria-label="Vera home">
              <span className="brand-mark" aria-hidden="true">◈</span>
              vera<span className="brand-dot">.</span>
            </Link>
            <span>MADE FOR THE MOMENT LOGIC CLICKS.</span>
            <span>VERA V1 · DIGITAL DESIGN LAB</span>
          </footer>
        </MotionProvider>
      </body>
    </html>
  );
}
