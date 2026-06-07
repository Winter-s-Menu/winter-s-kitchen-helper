import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import FilterModal from '@/components/FilterModal';
import { useApp } from '@/context/AppContext';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { Button } from '@/components/ui/button';
import { getDiscoveryOrder } from '@/lib/discoveryOrder';

const PAGE_SIZE = 24;

export default function Index() {
  const { searchQuery: search, setSearchQuery: setSearch, filters, setFilters, recipes, recipesLoading, ratings } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useScrollRestore('home');

  // Reset pagination when filters/search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, filters]);

  const filtered = useMemo(() => {
    let list = recipes;
    const q = search.toLowerCase().trim();

    const hasSearch = q.length > 0;
    const hasFilters =
      filters.types.length > 0 ||
      filters.excludeAllergens.length > 0 ||
      filters.prepTime !== '' ||
      filters.course !== '' ||
      filters.minRating > 0;

    if (q) {
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some(i => i.name.toLowerCase().includes(q))
      );
    }

    if (filters.types.length > 0) {
      list = list.filter(r => filters.types.includes(r.type));
    }

    if (filters.excludeAllergens.length > 0) {
      list = list.filter(
        r => !filters.excludeAllergens.some(a => r.allergens.includes(a))
      );
    }

    if (filters.prepTime === '<30') list = list.filter(r => r.prepTimeMinutes < 30);
    else if (filters.prepTime === '30-60')
      list = list.filter(r => r.prepTimeMinutes >= 30 && r.prepTimeMinutes <= 60);
    else if (filters.prepTime === '60+') list = list.filter(r => r.prepTimeMinutes > 60);

    if (filters.course) list = list.filter(r => r.course === filters.course);

    if (filters.minRating > 0) {
      list = list.filter(r => {
        const agg = ratings.get(r.id);
        return !!agg && agg.count > 0 && agg.avg >= filters.minRating;
      });
    }

    if (!hasSearch && !hasFilters && list.length > 0) {
      const order = getDiscoveryOrder(
        list.map(r => {
          const agg = ratings.get(r.id);
          return {
            id: r.id,
            createdAt: r.createdAt,
            avgRating: agg?.avg,
            reviewCount: agg?.count,
          };
        })
      );
      list = [...list].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }

    return list;
  }, [search, filters, recipes, ratings]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={search} onSearchChange={setSearch} onOpenFilters={() => setFiltersOpen(true)} />
      <FilterModal open={filtersOpen} onOpenChange={setFiltersOpen} filters={filters} onChange={setFilters} />

      <main className="mx-auto max-w-3xl px-4 py-6">
        {recipesLoading ? (
          <p className="text-center text-muted-foreground py-20">Recepten laden…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            Geen recepten gevonden. Probeer andere zoektermen of filters.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {filtered.length === 1 ? 'recept' : 'recepten'} gevonden
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {visible.map(r => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                >
                  Meer laden
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}