import { submitQuoteRequest } from "@/lib/quote-requests";

export type ContactSubmission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
};

// The contact page's quote form: every submission becomes an entry in the admin's
// "Demandes de devis" page (Supabase table `quote_requests`).
export async function submitContactForm(
  input: Omit<ContactSubmission, "id" | "submittedAt">,
): Promise<void> {
  await submitQuoteRequest({
    name: `${input.firstName} ${input.lastName}`,
    phone: input.phone,
    email: input.email,
    message: input.message,
    source: "formulaire",
  });
}
