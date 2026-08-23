import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { favoriteService } from '@/services';

interface FavoritesState {
  /** Fast lookup of favorited recommendation IDs. */
  ids: Set<string>;
  /** True after the first sync with the server completes (success or empty). */
  loaded: boolean;
  /** True while the initial listIds fetch is in-flight. */
  loading: boolean;
  /** Toggle a favorite; resolves to the new state. */
  toggle: (id: string) => Promise<boolean>;
  /** Add to favorites. */
  add: (id: string) => Promise<void>;
  /** Remove from favorites. */
  remove: (id: string) => Promise<void>;
  /** True if the given id is currently favorited. */
  has: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesState | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
  /** When false, the provider is a no-op (used for logged-out users). */
  enabled: boolean;
}

export function FavoritesProvider({ children, enabled }: FavoritesProviderProps) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  // In-flight toggles so a fast double-click doesn't double-fire.
  const inflight = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      setIds(new Set());
      setLoaded(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    favoriteService
      .listIds()
      .then((list) => {
        if (cancelled) return;
        setIds(new Set(list));
      })
      .catch(() => {
        if (cancelled) return;
        // Silent failure — heart icon will just start empty.
      })
      .finally(() => {
        if (cancelled) return;
        setLoaded(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const add = useCallback(async (id: string) => {
    if (inflight.current.has(id)) return;
    inflight.current.add(id);
    setIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await favoriteService.add(id);
    } catch {
      // Revert on failure.
      setIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      throw new Error('favorite_failed');
    } finally {
      inflight.current.delete(id);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    if (inflight.current.has(id)) return;
    inflight.current.add(id);
    setIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      await favoriteService.remove(id);
    } catch {
      setIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      throw new Error('favorite_failed');
    } finally {
      inflight.current.delete(id);
    }
  }, []);

  const toggle = useCallback(
    async (id: string) => {
      const wasFav = ids.has(id);
      try {
        if (wasFav) await remove(id);
        else await add(id);
        return !wasFav;
      } catch {
        return wasFav;
      }
    },
    [ids, add, remove],
  );

  const has = useCallback((id: string) => ids.has(id), [ids]);

  const value = useMemo<FavoritesState>(
    () => ({ ids, loaded, loading, toggle, add, remove, has }),
    [ids, loaded, loading, toggle, add, remove, has],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }
  return ctx;
}
