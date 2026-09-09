import { CONTACT } from "@/lib/categories";
import { useAllCategories } from "@/lib/category-store";
import { useAllProducts } from "@/lib/product-store";
import { Newsletter } from "@/components/Newsletter";

export function Footer() {
  const allProducts = useAllProducts();
  const categories = useAllCategories().filter((c) =>
    allProducts.some((p) => p.categorySlug === c.slug),
  );

  return (
    <footer className="bg-[var(--color-ink)] text-primary-foreground">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-[34px] px-[28px] pb-[26px] pt-[60px] sm:grid-cols-2 lg:grid-cols-4">
        <section aria-labelledby="footer-contact">
          <h2
            id="footer-contact"
            className="mb-[14px] font-display text-[20px] font-black uppercase tracking-[-0.01em]"
          >
            2M Global Services
          </h2>
          <div className="text-[14px] leading-[1.9] text-primary-foreground/72">
            {CONTACT.address}
            <br />
            {CONTACT.phones.map((p, i) => (
              <span key={p.tel}>
                <a href={`tel:${p.tel}`} className="hover:text-[var(--color-gold-light)]">
                  {p.label}
                </a>
                {i < CONTACT.phones.length - 1 && " · "}
              </span>
            ))}
            <br />
            <a href={`mailto:${CONTACT.email}`} className="hover:text-[var(--color-gold-light)]">
              {CONTACT.email}
            </a>
          </div>
        </section>

        <nav aria-labelledby="footer-catalogue">
          <h2
            id="footer-catalogue"
            className="mb-4 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-gold-light)]"
          >
            Catalogue
          </h2>
          <ul className="flex flex-col gap-[10px] text-[14px] text-primary-foreground/78">
            {categories.map((c) => (
              <li key={c.slug}>
                <a
                  href={`/produits?category=${c.slug}`}
                  className="hover:text-[var(--color-gold-light)]"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-maison">
          <h2
            id="footer-maison"
            className="mb-4 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-gold-light)]"
          >
            Maison
          </h2>
          <ul className="flex flex-col gap-[10px] text-[14px] text-primary-foreground/78">
            <li>
              <a href="/a-propos" className="hover:text-[var(--color-gold-light)]">
                À propos
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-[var(--color-gold-light)]">
                Contact &amp; devis
              </a>
            </li>
            <li>
              <a href="/produits" className="hover:text-[var(--color-gold-light)]">
                Déstockage
              </a>
            </li>
            <li>Livraison &amp; montage</li>
          </ul>
        </nav>

        <section aria-labelledby="footer-informed">
          <h2
            id="footer-informed"
            className="mb-4 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-gold-light)]"
          >
            Restez informé
          </h2>
          <p className="mb-3 text-[14px] text-primary-foreground/72">
            Offres et nouveautés par e-mail.
          </p>
          <Newsletter compact variant="dark" />
        </section>
      </div>

      <div className="mx-auto max-w-[1320px] border-t border-primary-foreground/14 px-[28px] pb-[40px] pt-[22px] text-[13px] text-primary-foreground/50">
        © {new Date().getFullYear()} 2M Global Services — La Qualité à moindre Coût.
      </div>
    </footer>
  );
}
