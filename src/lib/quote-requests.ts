import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type QuoteStatus = "nouveau" | "traite";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  nouveau: "Nouveau",
  traite: "Traité",
};

// "formulaire" = the contact page's quote form; "whatsapp" = a click on the
// product page's "Commander / Demander un devis sur WhatsApp" link.
export type QuoteSource = "formulaire" | "whatsapp";

export const QUOTE_SOURCE_LABELS: Record<QuoteSource, string> = {
  formulaire: "Formulaire",
  whatsapp: "WhatsApp",
};

export type QuoteRequest = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  products: string;
  message: string;
  source: QuoteSource;
  status: QuoteStatus;
};

type QuoteRow = Database["public"]["Tables"]["quote_requests"]["Row"];

function rowToQuote(row: QuoteRow): QuoteRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    products: row.products ?? "",
    message: row.message ?? "",
    source: row.source === "whatsapp" ? "whatsapp" : "formulaire",
    status: row.status === "traite" ? "traite" : "nouveau",
  };
}

export type QuoteRequestInput = {
  name?: string;
  phone?: string;
  email?: string;
  products?: string;
  message?: string;
  source: QuoteSource;
};

// Quote requests live in Supabase (table `quote_requests`): publicly insertable,
// but only an authenticated admin session can read or update them (see the
// migration's RLS policies).
export async function submitQuoteRequest(input: QuoteRequestInput): Promise<void> {
  const { error } = await supabase.from("quote_requests").insert({
    name: input.name?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    products: input.products?.trim() || null,
    message: input.message?.trim() || null,
    source: input.source,
  });
  if (error) throw error;
}

const CLICK_DEDUPE_MS = 5 * 60 * 1000;

// Logs a click on a product's WhatsApp quote link. Fire-and-forget: it must never
// get in the way of opening WhatsApp, and the same product clicked repeatedly
// from one browser is only recorded once every few minutes.
export async function logWhatsAppQuoteClick(productName: string): Promise<void> {
  try {
    const key = `2m-quote-click:${productName}`;
    const last = Number(window.sessionStorage.getItem(key) ?? 0);
    if (Date.now() - last < CLICK_DEDUPE_MS) return;
    window.sessionStorage.setItem(key, String(Date.now()));
    await submitQuoteRequest({ products: productName, source: "whatsapp" });
  } catch (error) {
    console.warn("Demande de devis WhatsApp non enregistrée :", error);
  }
}

const QUOTES_QUERY_KEY = ["quote-requests"] as const;
const QUOTES_REFETCH_MS = 30_000;

async function fetchQuoteRequests(): Promise<QuoteRequest[]> {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToQuote);
}

// Admin-only hook, re-fetched every 30 s like the orders so the "new" badge in
// the admin nav stays current.
export function useQuoteRequestsQuery(): {
  quotes: QuoteRequest[];
  loaded: boolean;
  failed: boolean;
} {
  const { data, isSuccess, isError } = useQuery({
    queryKey: QUOTES_QUERY_KEY,
    queryFn: fetchQuoteRequests,
    refetchInterval: QUOTES_REFETCH_MS,
    refetchIntervalInBackground: true,
  });
  return { quotes: data ?? [], loaded: isSuccess, failed: isError };
}

export function useInvalidateQuoteRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEY });
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
  if (error) throw error;
}
