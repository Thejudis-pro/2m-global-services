const MESSAGES = [
  "Livraison 24h dans Dakar",
  "Paiement à la livraison",
  "Montage offert dès 200.000 CFA",
  "Déstockage showroom en cours",
];

function MarqueeGroup() {
  return (
    <div className="flex shrink-0 gap-[52px] whitespace-nowrap pl-7">
      {MESSAGES.map((m) => (
        <span key={m}>{m}</span>
      ))}
    </div>
  );
}

export function PromoMarquee() {
  return (
    <div className="flex h-[38px] items-center overflow-hidden bg-primary text-primary-foreground">
      <div
        className="flex font-display text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{ animation: "marquee-scroll 28s linear infinite" }}
      >
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
}
