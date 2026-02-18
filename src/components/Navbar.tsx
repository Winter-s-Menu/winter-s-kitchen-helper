import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenFilters?: () => void;
}

export default function Navbar({ searchQuery, onSearchChange, onOpenFilters }: NavbarProps) {
  const location = useLocation();
  const { shoppingList, favorites } = useApp();
  const isHome = location.pathname === '/';
  const itemCount = shoppingList.filter(i => !i.checked).length;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
        <Link to="/" className="font-serif text-xl tracking-tight shrink-0">
          Winter's Menu
        </Link>

        {isHome && onSearchChange && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery ?? ''}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Zoek recepten of ingrediënten…"
              className="w-full rounded-lg bg-secondary pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            />
          </div>
        )}

        {!isHome && <div className="flex-1" />}

        <div className="flex items-center gap-1 shrink-0">
          {isHome && onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          )}
          <Link
            to="/favorieten"
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Favorieten"
          >
            <Heart className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            to="/boodschappenlijst"
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Boodschappenlijst"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
