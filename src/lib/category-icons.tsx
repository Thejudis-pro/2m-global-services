import { Archive, Armchair, Cpu, ShieldCheck, Sofa, Table2, type LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "meubles-de-bureau": Table2,
  "fauteuils-chaises": Armchair,
  "salon-chambre": Sofa,
  armoires: Archive,
  electroniques: Cpu,
  "coffre-fort": ShieldCheck,
};

export function getCategoryIcon(categorySlug: string): LucideIcon {
  return CATEGORY_ICONS[categorySlug] ?? Table2;
}
