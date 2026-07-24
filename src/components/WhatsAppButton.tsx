import { CONTACT } from "@/lib/categories";

export function WhatsAppButton() {
  return (
    <a
      href={CONTACT.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactez-nous sur WhatsApp"
      className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.21c-.29-.14-1.7-.84-1.96-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.9 1.13-.17.19-.33.21-.62.07-.29-.14-1.21-.45-2.3-1.42-.85-.76-1.42-1.7-1.59-1.98-.17-.29-.02-.44.13-.58.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38 0 1.4 1.02 2.76 1.16 2.95.14.19 2 3.05 4.85 4.28.68.29 1.2.46 1.61.59.68.22 1.29.19 1.78.11.54-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.36-.07-.11-.26-.19-.55-.33zM16.02 4C9.4 4 4.02 9.38 4.02 16c0 2.11.55 4.09 1.52 5.81L4 28l6.35-1.67A11.94 11.94 0 0 0 16.02 28C22.64 28 28 22.62 28 16S22.64 4 16.02 4zm0 21.82c-1.87 0-3.62-.5-5.13-1.37l-.37-.22-3.77.99 1.01-3.67-.24-.38A9.79 9.79 0 0 1 6.21 16c0-5.42 4.4-9.82 9.81-9.82 5.42 0 9.82 4.4 9.82 9.82s-4.4 9.82-9.82 9.82z" />
      </svg>
    </a>
  );
}
