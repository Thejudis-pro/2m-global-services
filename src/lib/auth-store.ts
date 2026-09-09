// Mock auth placeholder — the admin account is stored in plain text in
// localStorage for demo purposes only. Replace with real Supabase Auth once the
// backend is connected; do not reuse this for real credentials.

export type StoredUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  role: "admin";
};

export type PublicUser = Omit<StoredUser, "password">;

const USERS_KEY = "2m-global-services-users";
const SESSION_KEY = "2m-global-services-session";

// Demo seed admin account for local testing only — replace with real
// Supabase-backed admin roles (app_metadata.role = "admin") once connected.
const DEMO_ADMIN: StoredUser = {
  id: "admin-seed",
  name: "Administrateur",
  phone: "770000000",
  email: "admin@2mglobalservices.com",
  password: "admin1234",
  role: "admin",
};

function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) {
      saveUsers([DEMO_ADMIN]);
      return [DEMO_ADMIN];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublicUser(user: StoredUser): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

let session: string | null =
  typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;

export const authStore = {
  login(identifier: string, password: string): PublicUser {
    const users = loadUsers();
    const user = users.find(
      (u) => (u.email === identifier || u.phone === identifier) && u.password === password,
    );
    if (!user) throw new Error("Identifiants incorrects.");
    session = user.id;
    window.localStorage.setItem(SESSION_KEY, user.id);
    return toPublicUser(user);
  },
  logout() {
    session = null;
    window.localStorage.removeItem(SESSION_KEY);
  },
  getCurrentUser(): PublicUser | null {
    if (!session) return null;
    const user = loadUsers().find((u) => u.id === session);
    return user ? toPublicUser(user) : null;
  },
};
