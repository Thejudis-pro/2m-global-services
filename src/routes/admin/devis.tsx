import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  QUOTE_SOURCE_LABELS,
  QUOTE_STATUS_LABELS,
  updateQuoteStatus,
  useInvalidateQuoteRequests,
  useQuoteRequestsQuery,
  type QuoteRequest,
  type QuoteStatus,
} from "@/lib/quote-requests";
import { exportQuoteRequestsXlsx } from "@/lib/excel-export";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/admin/devis")({
  head: () => ({
    meta: [{ title: "Administration — Demandes de devis | 2M Global Services" }],
  }),
  component: AdminQuotesPage,
});

type StatusFilter = QuoteStatus | "all";

function matchesSearch(quote: QuoteRequest, query: string): boolean {
  if (!query) return true;
  const haystack = [quote.name, quote.phone, quote.email, quote.products, quote.message]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function AdminQuotesPage() {
  const { checked, user } = useRequireAdmin();
  const { quotes, loaded, failed } = useQuoteRequestsQuery();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    // <input type="date"> gives local "YYYY-MM-DD" days: compare against the
    // start of the first day and the end of the last one.
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;
    return quotes.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      const created = new Date(q.createdAt);
      if (from && created < from) return false;
      if (to && created > to) return false;
      return matchesSearch(q, query);
    });
  }, [quotes, statusFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = statusFilter !== "all" || search !== "" || dateFrom !== "" || dateTo !== "";

  if (!checked || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Demandes de devis</h1>
      <AdminNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as StatusFilter);
            setPage(1);
          }}
          className="max-w-full overflow-x-auto"
        >
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          size="sm"
          disabled={filtered.length === 0}
          onClick={() => void exportQuoteRequestsXlsx(filtered)}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exporter en Excel (.xlsx) ({filtered.length})
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <Label htmlFor="quote-search">Recherche</Label>
          <Input
            id="quote-search"
            type="search"
            placeholder="Nom, téléphone, e-mail, produit, message…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label htmlFor="quote-date-from">Du</Label>
          <Input
            id="quote-date-from"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label htmlFor="quote-date-to">Au</Label>
          <Input
            id="quote-date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setSearch("");
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Produit(s)</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((quote) => (
              <QuoteRow key={quote.id} quote={quote} />
            ))}
          </TableBody>
        </Table>
        {failed ? (
          <p role="alert" className="py-8 text-center text-sm text-destructive">
            Impossible de charger les demandes de devis. Vérifiez que la migration Supabase «
            quote_requests » a bien été appliquée.
          </p>
        ) : (
          pageItems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {!loaded
                ? "Chargement…"
                : hasFilters
                  ? "Aucune demande pour ces filtres."
                  : "Aucune demande de devis pour le moment."}
            </p>
          )
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}

function QuoteStatusSelect({ quote }: { quote: QuoteRequest }) {
  const invalidate = useInvalidateQuoteRequests();
  const [busy, setBusy] = useState(false);

  async function handleChange(next: QuoteStatus) {
    if (next === quote.status) return;
    setBusy(true);
    try {
      await updateQuoteStatus(quote.id, next);
      await invalidate();
    } catch {
      toast.error("Impossible de modifier le statut de cette demande.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Select
      value={quote.status}
      disabled={busy}
      onValueChange={(v) => void handleChange(v as QuoteStatus)}
    >
      <SelectTrigger className="w-[130px]" aria-label="Statut de la demande">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function QuoteRow({ quote }: { quote: QuoteRequest }) {
  const created = new Date(quote.createdAt);
  return (
    <TableRow className="align-top">
      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
        <div className="text-foreground">{created.toLocaleDateString("fr-FR")}</div>
        <div>{created.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.08em]">
          {QUOTE_SOURCE_LABELS[quote.source]}
        </div>
      </TableCell>
      <TableCell className="text-sm font-medium text-foreground">{quote.name || "—"}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {quote.phone || quote.email ? (
          <>
            {quote.phone && (
              <div>
                <a
                  href={`tel:${quote.phone.replace(/\s/g, "")}`}
                  className="text-foreground hover:text-accent"
                >
                  {quote.phone}
                </a>
              </div>
            )}
            {quote.email && (
              <div>
                <a href={`mailto:${quote.email}`} className="hover:text-accent">
                  {quote.email}
                </a>
              </div>
            )}
          </>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="max-w-[220px] whitespace-normal break-words text-sm text-foreground">
        {quote.products || "—"}
      </TableCell>
      <TableCell className="max-w-[320px] whitespace-pre-wrap break-words text-sm text-muted-foreground">
        {quote.message ||
          (quote.source === "whatsapp" ? (
            <span className="italic">Clic sur le lien WhatsApp de la fiche produit</span>
          ) : (
            "—"
          ))}
      </TableCell>
      <TableCell>
        <QuoteStatusSelect quote={quote} />
      </TableCell>
    </TableRow>
  );
}
