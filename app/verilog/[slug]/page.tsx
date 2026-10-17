import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CodeView } from "@/components/code-view";
import { designs } from "@/lib/catalog";
import { getDesign } from "@/lib/verilog";

type DesignPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return designs.map((design) => ({ slug: design.name }));
}

export async function generateMetadata({ params }: DesignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const design = getDesign(slug);
  if (!design) return { title: "Design not found" };
  return {
    title: design.title,
    description: design.description,
  };
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { slug } = await params;
  const design = getDesign(slug);
  if (!design) notFound();

  const related = designs
    .filter((item) => item.name !== design.name && item.category === design.category)
    .slice(0, 3);

  return (
    <div className="page-shell wrap detail-page">
      <Link className="back-link" href="/verilog">
        <ArrowLeft size={15} aria-hidden="true" /> ALL DESIGNS / {design.category.toUpperCase()}
      </Link>

      <header className="detail-head">
        <div className="eyebrow"><span className="pulse-dot" aria-hidden="true" /> {design.category.toUpperCase()} / {design.level.toUpperCase()}</div>
        <h1>{design.title}<em aria-hidden="true">.</em></h1>
        <p>{design.description}</p>
        <div className="concept-pills" aria-label="Concepts in this design">
          {design.concepts.map((concept) => <span key={concept}>{concept.replaceAll("_", " ")}</span>)}
        </div>
      </header>

      <div className="detail-content">
        <section className="detail-main" aria-label={`${design.title} Verilog source`}>
          <CodeView code={design.code} testbenchCode={design.testbenchCode} />
        </section>

        <aside className="detail-aside" aria-label="Design information">
          <section className="aside-panel" aria-labelledby="design-profile-heading">
            <span id="design-profile-heading">DESIGN PROFILE</span>
            <dl>
              <dt>MODULE</dt><dd>{design.name}</dd>
              <dt>CATEGORY</dt><dd>{design.category}</dd>
              <dt>LEVEL</dt><dd>{design.level}</dd>
              <dt>TESTBENCH</dt><dd>{design.testbench ? "Included" : "Not included"}</dd>
            </dl>
          </section>

          {related.length > 0 && (
            <section className="aside-panel related-panel" aria-labelledby="related-designs-heading">
              <span id="related-designs-heading">RELATED DESIGNS</span>
              {related.map((item) => (
                <Link key={item.name} href={`/verilog/${item.name}`}>
                  {item.name.replaceAll("_", " ")}<ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              ))}
            </section>
          )}

          <p className="source-note">
            The Vera RTL catalog is the source of truth for this design.<br />
            <a href="https://github.com/HarneetSinghBajwa/vera-verilog-codes" target="_blank" rel="noreferrer">
              Open source repository ↗
            </a>
          </p>
        </aside>
      </div>
    </div>
  );
}
