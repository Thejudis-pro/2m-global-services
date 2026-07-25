import { Facebook } from "lucide-react";
import { CONTACT } from "@/lib/categories";
import { useAllCategories } from "@/lib/category-store";

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.83a8.16 8.16 0 0 0 4.77 1.52V6.89a4.85 4.85 0 0 1-1.84-.2z" />
    </svg>
  );
}

export function Footer() {
  const categories = useAllCategories();

  return (
    <footer className="mt-16 border-t border-border bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-[13.6px] pb-[20.4px] pt-[27.2px]">
        <div className="grid grid-cols-1 gap-[27.2px] text-[13px] md:grid-cols-[2fr_1fr_1fr]">
          <section aria-labelledby="footer-contact">
            <h2
              id="footer-contact"
              className="mb-[6.8px] font-display text-[16px] font-semibold uppercase tracking-[0.02em]"
            >
              Techno Office
            </h2>
            <div className="leading-[1.8] text-[color:var(--muted-foreground)]">
              {CONTACT.address}
              <br />
              {CONTACT.phones.map((p, i) => (
                <span key={p.tel}>
                  <a href={`tel:${p.tel}`} className="hover:text-primary">
                    {p.label}
                  </a>
                  {i < CONTACT.phones.length - 1 && " / "}
                </span>
              ))}
              <br />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-primary">
                {CONTACT.email}
              </a>
            </div>
            <div className="mt-[13.6px] flex gap-[6.8px]">
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez-nous sur Facebook"
                className="inline-flex h-9 w-9 items-center justify-center border border-border text-foreground hover:border-primary hover:text-primary"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={CONTACT.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez-nous sur TikTok"
                className="inline-flex h-9 w-9 items-center justify-center border border-border text-foreground hover:border-primary hover:text-primary"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </section>

          <nav aria-labelledby="footer-products">
            <h2
              id="footer-products"
              className="mb-[6.8px] font-display text-[14px] font-semibold uppercase tracking-[0.02em]"
            >
              Produits
            </h2>
            <ul className="flex flex-col gap-[6px] text-[color:var(--muted-foreground)]">
              {categories.map((c) => (
                <li key={c.slug}>
                  <a href={`/produits?category=${c.slug}`} className="hover:text-primary">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-informed">
            <h2
              id="footer-informed"
              className="mb-[6.8px] font-display text-[14px] font-semibold uppercase tracking-[0.02em]"
            >
              Restez informé
            </h2>
            <p className="text-[color:var(--muted-foreground)]">
              Recevez nos offres et nouveautés.
            </p>
          </section>
        </div>

        <hr className="rule-hr mt-[27.2px]" />
        <p className="mt-[10.2px] text-[12px] text-[color:var(--muted-foreground)]">
          © {new Date().getFullYear()} Techno Office — La Qualité à moindre Coût.
        </p>
      </div>
    </footer>
  );
}
