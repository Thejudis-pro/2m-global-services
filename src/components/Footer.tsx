import { MapPin, Phone, Mail, Facebook } from "lucide-react";
import { CONTACT } from "@/lib/categories";
import { useAllCategories } from "@/lib/category-store";
import { Newsletter } from "./Newsletter";

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
    <footer className="mt-16 border-t-4 border-accent bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-display font-bold text-accent-foreground">
            TO
          </div>
          <span className="font-display text-lg font-semibold">Techno Office Sarl</span>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-3 md:divide-x md:divide-primary-foreground/15">
          <section aria-labelledby="footer-contact">
            <h2
              id="footer-contact"
              className="mb-4 text-sm font-bold uppercase tracking-wide text-accent"
            >
              Contactez-nous
            </h2>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="flex flex-wrap gap-x-2">
                  {CONTACT.phones.map((p, i) => (
                    <span key={p.tel}>
                      <a href={`tel:${p.tel}`} className="hover:text-accent hover:underline">
                        {p.label}
                      </a>
                      {i < CONTACT.phones.length - 1 && <span aria-hidden="true"> /</span>}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all hover:text-accent hover:underline"
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={CONTACT.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez-nous sur TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </section>

          <nav aria-labelledby="footer-products" className="md:pl-10">
            <h2
              id="footer-products"
              className="mb-4 text-sm font-bold uppercase tracking-wide text-accent"
            >
              Nos Produits
            </h2>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/produits?category=${c.slug}`}
                    className="text-primary-foreground/80 hover:text-accent hover:underline"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-newsletter" className="md:pl-10">
            <h2
              id="footer-newsletter"
              className="mb-4 text-sm font-bold uppercase tracking-wide text-accent"
            >
              Restez informé
            </h2>
            <Newsletter variant="dark" />
          </section>
        </div>

        <div className="mt-10 border-t border-primary-foreground/15 pt-6 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Techno Office Sarl — La Qualité à moindre Coût.
        </div>
      </div>
    </footer>
  );
}
