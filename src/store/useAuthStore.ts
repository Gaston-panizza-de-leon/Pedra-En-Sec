import { create } from 'zustand';

/* ──────────────────────────────────────────────────────────────
   Autenticación client-side (sin backend).
   Persistencia con la Web Storage API (localStorage):
     · pedraensec:users            → [{ username, email, passHash }]
     · pedraensec:session          → "username" del usuario con sesión activa
     · pedraensec:favorites:<user> → [routeId, ...] rutas favoritas de ese usuario
   La contraseña NUNCA se guarda en claro: se almacena su hash SHA-256
   (Web Crypto API, crypto.subtle).
   ────────────────────────────────────────────────────────────── */

const USERS_KEY = 'pedraensec:users';
const SESSION_KEY = 'pedraensec:session';
const favKey = (username: string) => `pedraensec:favorites:${username}`;

interface StoredUser {
  username: string;
  email: string;
  passHash: string;
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readFavorites(username: string): string[] {
  try {
    const raw = localStorage.getItem(favKey(username));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Hash SHA-256 (hex) de la contraseña mediante la Web Crypto API. */
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AuthState {
  /** username del usuario autenticado, o null si no hay sesión. */
  currentUser: string | null;
  /** ids de rutas favoritas del usuario actual. */
  favorites: string[];

  /** Devuelve un mensaje de error (string) o null si todo fue bien. */
  register: (username: string, email: string, password: string) => Promise<string | null>;
  login: (identifier: string, password: string) => Promise<string | null>;
  logout: () => void;

  toggleFavorite: (routeId: string) => void;
  isFavorite: (routeId: string) => boolean;
}

/** Restaura la sesión guardada al arrancar la app. */
function initialSession(): Pick<AuthState, 'currentUser' | 'favorites'> {
  try {
    const username = localStorage.getItem(SESSION_KEY);
    if (username && readUsers().some((u) => u.username === username)) {
      return { currentUser: username, favorites: readFavorites(username) };
    }
  } catch {
    /* localStorage no disponible */
  }
  return { currentUser: null, favorites: [] };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialSession(),

  register: async (username, email, password) => {
    const u = username.trim();
    const mail = email.trim().toLowerCase();
    const users = readUsers();

    if (users.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
      return 'Ese nombre de usuario ya está registrado.';
    }
    if (users.some((x) => x.email === mail)) {
      return 'Ese correo ya está registrado.';
    }

    const passHash = await hashPassword(password);
    users.push({ username: u, email: mail, passHash });
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, u);
    set({ currentUser: u, favorites: readFavorites(u) });
    return null;
  },

  login: async (identifier, password) => {
    const id = identifier.trim().toLowerCase();
    const passHash = await hashPassword(password);
    const user = readUsers().find(
      (x) =>
        (x.email === id || x.username.toLowerCase() === id) && x.passHash === passHash,
    );
    if (!user) return 'Usuario o contraseña incorrectos.';

    localStorage.setItem(SESSION_KEY, user.username);
    set({ currentUser: user.username, favorites: readFavorites(user.username) });
    return null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    set({ currentUser: null, favorites: [] });
  },

  toggleFavorite: (routeId) => {
    const { currentUser, favorites } = get();
    if (!currentUser) return;
    const next = favorites.includes(routeId)
      ? favorites.filter((id) => id !== routeId)
      : [...favorites, routeId];
    localStorage.setItem(favKey(currentUser), JSON.stringify(next));
    set({ favorites: next });
  },

  isFavorite: (routeId) => get().favorites.includes(routeId),
}));