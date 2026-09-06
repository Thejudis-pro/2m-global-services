export type ContactSubmission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
};

const CONTACT_STORAGE_KEY = "2m-global-services-contact-messages";

// Mock submission handler placeholder — replace with a real API call once the
// backend is connected. Simulates network latency and persists locally so the
// flow can be verified end-to-end during development.
export async function submitContactForm(
  input: Omit<ContactSubmission, "id" | "submittedAt">,
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 700));
  const submission: ContactSubmission = {
    id: `msg-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    ...input,
  };
  const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
  const existing: ContactSubmission[] = raw ? JSON.parse(raw) : [];
  window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify([submission, ...existing]));
}
