import { useSyncExternalStore } from "react";

// Mock auth placeholder — accounts and credentials are stored in plain text in
// localStorage for demo purposes only. Replace with real Supabase Auth once the
// backend is connected; do not reuse this for real user credentials.

export type Address = {
  id: string;
  label: string;
  address: string;
  city: string;
  region: string;
};

export type Role = "customer" | "admin";

export type StoredUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  role: Role;
  addresses: Address[];
};

export type PublicUser = Omit<StoredUser, "password">;

const USERS_KEY = "techno-office-users";
const SESSION_KEY = "techno-office-session";

// Demo seed admin account for local testing only — replace with real
// Supabase-backed admin roles (app_metadata.role = "admin") once connected.
const DEMO_ADMIN: StoredUser = {
  id: "admin-seed",
  name: "Administrateur",
  phone: "770000000",
  email: "admin@technoofficesarl.com",
  password: "admin1234",
  role: "admin",
  addresses: [],
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
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const authStore = {
  register(input: { name: string; phone: string; email: string; password: string }): PublicUser {
    const users = loadUsers();
    if (users.some((u) => u.email === input.email || u.phone === input.phone)) {
      throw new Error("Un compte existe déjà avec cet e-mail ou ce téléphone.");
    }
    const user: StoredUser = {
      id: `user-${Date.now()}`,
      role: "customer",
      addresses: [],
      ...input,
    };
    saveUsers([...users, user]);
    session = user.id;
    window.localStorage.setItem(SESSION_KEY, user.id);
    emit();
    return toPublicUser(user);
  },
  login(identifier: string, password: string): PublicUser {
    const users = loadUsers();
    const user = users.find(
      (u) => (u.email === identifier || u.phone === identifier) && u.password === password,
    );
    if (!user) throw new Error("Identifiants incorrects.");
    session = user.id;
    window.localStorage.setItem(SESSION_KEY, user.id);
    emit();
    return toPublicUser(user);
  },
  logout() {
    session = null;
    window.localStorage.removeItem(SESSION_KEY);
    emit();
  },
  getCurrentUser(): PublicUser | null {
    if (!session) return null;
    const user = loadUsers().find((u) => u.id === session);
    return user ? toPublicUser(user) : null;
  },
  requestPasswordReset(identifier: string): boolean {
    const users = loadUsers();
    return users.some((u) => u.email === identifier || u.phone === identifier);
  },
  updateProfile(userId: string, patch: Partial<Pick<StoredUser, "name" | "phone">>) {
    saveUsers(loadUsers().map((u) => (u.id === userId ? { ...u, ...patch } : u)));
    emit();
  },
  addAddress(userId: string, address: Omit<Address, "id">) {
    saveUsers(
      loadUsers().map((u) =>
        u.id === userId
          ? { ...u, addresses: [...u.addresses, { id: `addr-${Date.now()}`, ...address }] }
          : u,
      ),
    );
    emit();
  },
  removeAddress(userId: string, addressId: string) {
    saveUsers(
      loadUsers().map((u) =>
        u.id === userId ? { ...u, addresses: u.addresses.filter((a) => a.id !== addressId) } : u,
      ),
    );
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useCurrentUser() {
  return useSyncExternalStore(authStore.subscribe, authStore.getCurrentUser, () => null);
}
