import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowUpRight,
  Download,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackCardEvent } from "@/lib/card-events";
import { SnapchatIcon, TikTokIcon, WhatsAppIcon } from "./icons";
import "./madior.css";

const CARD_SLUG = "madior";
// Constant (not window.location) so the QR code is identical in preview and production.
const CARD_URL = "https://2mglobal.sn/madior";

const WHATSAPP_URL =
  "https://wa.me/221761923441?text=Bonjour%20Madior%2C%20je%20vous%20contacte%20depuis%20votre%20carte%20digitale.";

const VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "FN:Madior Niang",
  "N:Niang;Madior;;;",
  "ORG:2M Global Services",
  "TEL;TYPE=CELL,VOICE:+221761923441",
  "TEL;TYPE=CELL,VOICE:+221771715129",
  "EMAIL;TYPE=WORK:2mglobalservices11@gmail.com",
  "EMAIL;TYPE=HOME:Madior1991@gmail.com",
  "URL:https://2mglobal.sn",
  "URL:https://www.2mparfumeriedk.com/",
  "URL:https://www.linkedin.com/in/madior-niang-9b440420b",
  "END:VCARD",
].join("\r\n");

type Social = { target: string; label: string; href: string; icon: ReactNode };

const ICON = 16;
const instagram = <Instagram size={ICON} aria-hidden="true" />;
const facebook = <Facebook size={ICON} aria-hidden="true" />;
const tiktok = <TikTokIcon size={ICON} />;
const snapchat = <SnapchatIcon size={ICON} />;

const GLOBAL_SOCIALS: Social[] = [
  {
    target: "instagram_2mglobal",
    label: "Instagram",
    href: "https://www.instagram.com/2mglobalservices",
    icon: instagram,
  },
  {
    target: "facebook_2mglobal",
    label: "Facebook",
    href: "https://www.facebook.com/share/14upspXPgzy/",
    icon: facebook,
  },
];

const ELECTRONICS_SOCIALS: Social[] = [
  {
    target: "facebook_2melectronics",
    label: "Facebook",
    href: "https://www.facebook.com/share/19sWkkQbq9/",
    icon: facebook,
  },
];

const PARFUMERIE_SOCIALS: Social[] = [
  {
    target: "instagram_2mparfumerie",
    label: "Instagram",
    href: "https://www.instagram.com/2mparfumeriesn",
    icon: instagram,
  },
  {
    target: "tiktok_2mparfumerie",
    label: "TikTok",
    href: "https://www.tiktok.com/@2mparfumerie",
    icon: tiktok,
  },
  {
    target: "snapchat_2mparfumerie",
    label: "Snapchat",
    href: "https://snapchat.com/t/vhx9aGof",
    icon: snapchat,
  },
  {
    target: "facebook_2mparfumerie",
    label: "Facebook",
    href: "https://www.facebook.com/share/199cH8H4YW/",
    icon: facebook,
  },
];

const TAKEOFF_SOCIALS: Social[] = [
  {
    target: "instagram_takeoff",
    label: "Instagram",
    href: "https://www.instagram.com/takeoffsenegal",
    icon: instagram,
  },
  {
    target: "tiktok_takeoff",
    label: "TikTok",
    href: "https://www.tiktok.com/@takeoffsn1",
    icon: tiktok,
  },
  {
    target: "snapchat_takeoff",
    label: "Snapchat",
    href: "https://www.snapchat.com/add/takeoffsenegal",
    icon: snapchat,
  },
  {
    target: "facebook_takeoff",
    label: "Facebook",
    href: "https://www.facebook.com/share/1DtY7wzdAb/",
    icon: facebook,
  },
];

function track(event: Parameters<typeof trackCardEvent>[1], target?: string) {
  trackCardEvent(CARD_SLUG, event, target);
}

function SocialChips({ items }: { items: Social[] }) {
  return (
    <div className="madior-chips">
      {items.map((s) => (
        <a
          key={s.target}
          className="madior-chip"
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click", s.target)}
        >
          {s.icon}
          {s.label}
        </a>
      ))}
    </div>
  );
}

function ExternalLinkRow({
  href,
  target,
  icon,
  children,
}: {
  href: string;
  target: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      className="madior-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click", target)}
    >
      <span className="madior-link-main">
        {icon}
        {children}
      </span>
      <ArrowUpRight size={16} className="madior-link-arrow" aria-hidden="true" />
    </a>
  );
}

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  track("click", `tag_${id}`);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveContact() {
  track("save_contact");
  const blob = new Blob([VCARD], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Madior-Niang.vcf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareCard() {
  track("share");
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ title: "Madior Niang", url: CARD_URL });
      return;
    }
    await navigator.clipboard.writeText(CARD_URL);
    toast.success("Lien copié");
  } catch (err) {
    // The user dismissing the native share sheet is not an error.
    if (err instanceof DOMException && err.name === "AbortError") return;
    try {
      await navigator.clipboard.writeText(CARD_URL);
      toast.success("Lien copié");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  }
}

function QrDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function downloadQr() {
    const source = wrapRef.current?.querySelector("canvas");
    if (!source) return;
    // Re-draw on a padded white canvas so the saved PNG keeps its quiet zone.
    const pad = 32;
    const out = document.createElement("canvas");
    out.width = source.width + pad * 2;
    out.height = source.height + pad * 2;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(source, pad, pad);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = "madior-niang-qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    track("click", "qr_download");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="madior-dialog">
        <DialogHeader>
          <DialogTitle>Scannez pour ouvrir la carte</DialogTitle>
          <DialogDescription>Madior Niang — carte digitale</DialogDescription>
        </DialogHeader>
        <div ref={wrapRef} className="madior-qr mx-auto">
          <QRCodeCanvas
            value={CARD_URL}
            // Drawn at 3x and scaled down to 220px so the downloaded PNG stays sharp.
            size={660}
            bgColor="#ffffff"
            fgColor="#04100A"
            level="M"
            style={{ width: 220, height: 220 }}
          />
        </div>
        <button type="button" className="madior-qr-download" onClick={downloadQr}>
          <Download size={16} aria-hidden="true" />
          Télécharger le QR (PNG)
        </button>
      </DialogContent>
    </Dialog>
  );
}

export function MadiorCard() {
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    track("view");
  }, []);

  function openQr() {
    track("qr_open");
    setQrOpen(true);
  }

  return (
    <div className="madior-page">
      <div className="madior-card">
        <header className="madior-hero">
          <img
            className="madior-hero-photo"
            src="/madior/madior_cutout.png"
            alt="Madior Niang"
            width={900}
            height={610}
            loading="eager"
            decoding="async"
          />
          <div className="madior-hero-fade" aria-hidden="true" />
          <div className="madior-location">
            <MapPin size={14} aria-hidden="true" />
            Dakar · Sénégal
          </div>
          <div className="madior-hero-actions">
            <button
              type="button"
              className="madior-round"
              aria-label="Afficher le QR code"
              onClick={openQr}
            >
              <QrCode size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="madior-round"
              aria-label="Partager la carte"
              onClick={shareCard}
            >
              <Share2 size={20} aria-hidden="true" />
            </button>
          </div>
          <h1 className="madior-name">Madior Niang</h1>
        </header>

        <div className="madior-body">
          <nav className="madior-tags" aria-label="Sections">
            <a
              className="madior-tag"
              href="#takeoff"
              onClick={(e) => scrollToSection(e, "takeoff")}
            >
              Take Off Sénégal
            </a>
            <a
              className="madior-tag"
              href="#parfumerie"
              onClick={(e) => scrollToSection(e, "parfumerie")}
            >
              2M Parfumerie
            </a>
            <a className="madior-tag" href="#global" onClick={(e) => scrollToSection(e, "global")}>
              2M Global Services
            </a>
          </nav>

          <div className="madior-actions">
            <a
              className="madior-action is-primary"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click", "whatsapp")}
            >
              <WhatsAppIcon size={22} />
              WhatsApp
            </a>
            <a
              className="madior-action"
              href="tel:+221761923441"
              onClick={() => track("click", "call")}
            >
              <Phone size={22} aria-hidden="true" />
              Appeler
            </a>
            <a
              className="madior-action"
              href="mailto:2mglobalservices11@gmail.com"
              onClick={() => track("click", "email")}
            >
              <Mail size={22} aria-hidden="true" />
              Email
            </a>
          </div>

          <button type="button" className="madior-save" onClick={saveContact}>
            <Download size={18} aria-hidden="true" />
            Enregistrer le contact
          </button>

          <section id="global" className="madior-section" aria-labelledby="madior-global-title">
            <h2 id="madior-global-title">2M Global Services</h2>
            <Link className="madior-link" to="/" onClick={() => track("click", "site_2mglobal")}>
              <span className="madior-link-main">
                <Globe size={16} aria-hidden="true" />
                2mglobal.sn
              </span>
              <ArrowUpRight size={16} className="madior-link-arrow" aria-hidden="true" />
            </Link>
            <SocialChips items={GLOBAL_SOCIALS} />
          </section>

          <section
            id="electronics"
            className="madior-section"
            aria-labelledby="madior-electronics-title"
          >
            <h2 id="madior-electronics-title">2M Electronics</h2>
            <SocialChips items={ELECTRONICS_SOCIALS} />
          </section>

          <section
            id="parfumerie"
            className="madior-section"
            aria-labelledby="madior-parfumerie-title"
          >
            <h2 id="madior-parfumerie-title">2M Parfumerie</h2>
            <ExternalLinkRow
              href="https://www.2mparfumeriedk.com/"
              target="site_2mparfumerie"
              icon={<Globe size={16} aria-hidden="true" />}
            >
              2mparfumeriedk.com
            </ExternalLinkRow>
            <SocialChips items={PARFUMERIE_SOCIALS} />
          </section>

          <section id="takeoff" className="madior-section" aria-labelledby="madior-takeoff-title">
            <h2 id="madior-takeoff-title">Take Off Sénégal</h2>
            <SocialChips items={TAKEOFF_SOCIALS} />
          </section>

          <ExternalLinkRow
            href="https://www.linkedin.com/in/madior-niang-9b440420b"
            target="linkedin_madior"
            icon={<Linkedin size={16} aria-hidden="true" />}
          >
            LinkedIn · Madior Niang
          </ExternalLinkRow>

          <p className="madior-footer">
            <a
              href="https://nextwavesn.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click", "nextwave")}
            >
              Carte digitale par NextWave
            </a>
          </p>
        </div>
      </div>

      <QrDialog open={qrOpen} onOpenChange={setQrOpen} />
    </div>
  );
}
