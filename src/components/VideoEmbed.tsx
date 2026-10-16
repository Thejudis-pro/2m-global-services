import { useEffect, useRef, useState } from "react";

type ParsedVideo =
  | { kind: "iframe"; embedUrl: string }
  | { kind: "file"; url: string; mime: string };

const FILE_EXTENSIONS: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
};

// Turns a YouTube / Vimeo link or a direct video file URL into something we can render.
function parseVideoSource(raw: string): ParsedVideo | null {
  const value = raw.trim();
  if (!value) return null;

  const ext = value.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  if (ext && FILE_EXTENSIONS[ext]) {
    return { kind: "file", url: value, mime: FILE_EXTENSIONS[ext] };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1];
    return id ? { kind: "iframe", embedUrl: youtubeEmbed(id) } : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id =
      url.searchParams.get("v") ??
      (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : undefined);
    return id ? { kind: "iframe", embedUrl: youtubeEmbed(id) } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts.find((p) => /^\d+$/.test(p));
    if (!id) return null;
    // Unlisted videos carry a privacy hash either as ?h=… or as the next path segment.
    const hash = url.searchParams.get("h") ?? parts[parts.indexOf(id) + 1];
    const query = hash && /^[a-z0-9]+$/i.test(hash) ? `?h=${hash}` : "";
    return { kind: "iframe", embedUrl: `https://player.vimeo.com/video/${id}${query}` };
  }
  return null;
}

function youtubeEmbed(id: string) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
}

type VideoEmbedProps = {
  /** YouTube / Vimeo link, or a path / URL to an .mp4 file. */
  src?: string;
  title: string;
  /** Optional poster image for .mp4 files. */
  poster?: string;
  className?: string;
};

export function VideoEmbed({ src, title, poster, className = "" }: VideoEmbedProps) {
  const video = src ? parseVideoSource(src) : null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Lazy loading: nothing is fetched until the player is close to the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !video) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [video]);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video w-full overflow-hidden rounded-[20px] bg-[var(--color-ink)] ${className}`}
    >
      {!video && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center font-display text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)]/80">
          Vidéo à ajouter
        </div>
      )}
      {video && visible && video.kind === "iframe" && (
        <iframe
          src={video.embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
      {video && visible && video.kind === "file" && (
        <video
          controls
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={title}
          className="absolute inset-0 h-full w-full bg-black object-contain"
        >
          {/* #t=0.1 makes browsers that don't preload (iOS) show a frame instead of a black box. */}
          <source src={`${video.url}#t=0.1`} type={video.mime} />
        </video>
      )}
    </div>
  );
}
