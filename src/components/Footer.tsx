import { MapPin, Phone, Mail, Facebook } from "lucide-react";
import { CATEGORIES, CONTACT } from "@/lib/categories";
import { Newsletter } from "./Newsletter";

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.83a8.16 8.16 0 0 0 4.77 1.52V6.89a4.85 4.85 0 0 1-1.84-.2z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
              Contactez-nous
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="flex flex-wrap gap-x-2">
                  {CONTACT.phones.map((p, i) => (
                    <span key={p.tel}>
                      <a href={`tel:${p.tel}`} className="hover:text-primary hover:underline">
                        {p.label}
                      </a>
                      {i < CONTACT.phones.length - 1 && <span aria-hidden="true"> /</span>}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all hover:text-primary hover:underline"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez-nous sur Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={CONTACT.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez-nous sur TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </section>

          <nav aria-labelledby="footer-products">
            <h2 id="footer-products" className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
              Nos Produits
            </h2>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/produits/${c.slug}`}
                    className="text-muted-foreground hover:text-primary hover:underline"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-newsletter">
            <h2 id="footer-newsletter" className="sr-only">Newsletter</h2>
            <Newsletter />
          </section>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Techno Office Sarl — La Qualité à moindre Coût.
        </div>
      </div>
    </footer>
  );
}
