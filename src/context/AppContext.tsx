import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SEED_CARS } from '../data/cars';
import type { Car, ToastMessage, User } from '../types';
import { slugify, uid } from '../utils/format';

const KEYS = {
  users: 'automart_users',
  session: 'automart_session',
  favorites: 'automart_favorites',
  compare: 'automart_compare',
  customCars: 'automart_custom_cars',
  messages: 'automart_messages',
  newsletter: 'automart_newsletter',
};

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Hadi Awais',
  email: 'demo@automart.pk',
  phone: '0300 1234567',
  password: 'automart123',
  joinedAt: '2025-01-12',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or unavailable (private mode). The app keeps working in memory.
  }
}

export type NewCarInput = Omit<Car, 'id' | 'slug' | 'dateListed' | 'views' | 'verified' | 'featured'>;

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppContextValue {
  user: User | null;
  allCars: Car[];
  customCars: Car[];
  favorites: string[];
  compare: string[];
  toasts: ToastMessage[];
  login: (email: string, password: string) => AuthResult;
  signup: (data: { name: string; email: string; phone: string; password: string }) => AuthResult;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  isComparing: (id: string) => boolean;
  addCar: (input: NewCarInput) => Car;
  deleteCar: (id: string) => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: number) => void;
  saveMessage: (data: { name: string; email: string; phone: string; subject: string; message: string }) => void;
  subscribe: (email: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = read<User[]>(KEYS.users, []);
    if (stored.length > 0) return stored;
    write(KEYS.users, [DEMO_USER]);
    return [DEMO_USER];
  });
  const [user, setUser] = useState<User | null>(() => {
    const id = read<string | null>(KEYS.session, null);
    if (!id) return null;
    return read<User[]>(KEYS.users, []).find((u) => u.id === id) ?? null;
  });
  const [favorites, setFavorites] = useState<string[]>(() => read<string[]>(KEYS.favorites, []));
  const [compare, setCompare] = useState<string[]>(() => read<string[]>(KEYS.compare, []));
  const [customCars, setCustomCars] = useState<Car[]>(() => read<Car[]>(KEYS.customCars, []));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  useEffect(() => write(KEYS.favorites, favorites), [favorites]);
  useEffect(() => write(KEYS.compare, compare), [compare]);
  useEffect(() => write(KEYS.customCars, customCars), [customCars]);

  const allCars = useMemo(() => [...customCars, ...SEED_CARS], [customCars]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const login = useCallback(
    (email: string, password: string): AuthResult => {
      const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!match) return { ok: false, error: 'No account found with this email address.' };
      if (match.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };
      setUser(match);
      write(KEYS.session, match.id);
      addToast(`Welcome back, ${match.name.split(' ')[0]}!`);
      return { ok: true };
    },
    [users, addToast],
  );

  const signup = useCallback(
    (data: { name: string; email: string; phone: string; password: string }): AuthResult => {
      if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
        return { ok: false, error: 'An account with this email already exists. Try logging in.' };
      }
      const newUser: User = {
        id: `user-${uid()}`,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      const next = [...users, newUser];
      setUsers(next);
      write(KEYS.users, next);
      setUser(newUser);
      write(KEYS.session, newUser.id);
      addToast(`Your AutoMart account is ready, ${newUser.name.split(' ')[0]}!`);
      return { ok: true };
    },
    [users, addToast],
  );

  const logout = useCallback(() => {
    setUser(null);
    write(KEYS.session, null);
    addToast('You have been logged out.', 'info');
  }, [addToast]);

  const toggleFavorite = useCallback(
    (id: string) => {
      const exists = favorites.includes(id);
      setFavorites((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
      addToast(
        exists ? 'Removed from your saved cars.' : 'Car saved to your favourites.',
        exists ? 'info' : 'success',
      );
    },
    [favorites, addToast],
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleCompare = useCallback(
    (id: string) => {
      if (!compare.includes(id) && compare.length >= 4) {
        addToast('You can compare up to 4 cars at a time.', 'error');
        return;
      }
      setCompare((current) => {
        if (current.includes(id)) {
          return current.filter((item) => item !== id);
        }
        if (current.length >= 4) return current;
        return [...current, id];
      });
    },
    [compare, addToast],
  );

  const removeCompare = useCallback((id: string) => {
    setCompare((current) => current.filter((item) => item !== id));
  }, []);

  const clearCompare = useCallback(() => setCompare([]), []);
  const isComparing = useCallback((id: string) => compare.includes(id), [compare]);

  const addCar = useCallback(
    (input: NewCarInput): Car => {
      const baseSlug = slugify(`${input.brand}-${input.model}-${input.variant}-${input.year}-${input.city}`);
      let slug = baseSlug;
      let suffix = 2;
      while (allCars.some((c) => c.slug === slug)) {
        slug = `${baseSlug}-${suffix++}`;
      }
      const newCar: Car = {
        ...input,
        id: `am-${uid()}`,
        slug,
        dateListed: new Date().toISOString().slice(0, 10),
        views: 0,
        verified: false,
        featured: false,
      };
      setCustomCars((current) => [newCar, ...current]);
      return newCar;
    },
    [allCars],
  );

  const deleteCar = useCallback(
    (id: string) => {
      setCustomCars((current) => current.filter((car) => car.id !== id));
      setFavorites((current) => current.filter((item) => item !== id));
      setCompare((current) => current.filter((item) => item !== id));
      addToast('Your listing has been removed.', 'info');
    },
    [addToast],
  );

  const saveMessage = useCallback(
    (data: { name: string; email: string; phone: string; subject: string; message: string }) => {
      const messages = read<unknown[]>(KEYS.messages, []);
      write(KEYS.messages, [{ ...data, id: uid(), date: new Date().toISOString() }, ...messages]);
    },
    [],
  );

  const subscribe = useCallback((email: string) => {
    const emails = read<string[]>(KEYS.newsletter, []);
    if (!emails.includes(email.toLowerCase())) {
      write(KEYS.newsletter, [email.toLowerCase(), ...emails]);
    }
  }, []);

  const value: AppContextValue = {
    user,
    allCars,
    customCars,
    favorites,
    compare,
    toasts,
    login,
    signup,
    logout,
    toggleFavorite,
    isFavorite,
    toggleCompare,
    removeCompare,
    clearCompare,
    isComparing,
    addCar,
    deleteCar,
    addToast,
    dismissToast,
    saveMessage,
    subscribe,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
