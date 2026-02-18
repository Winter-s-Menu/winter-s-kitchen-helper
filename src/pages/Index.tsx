import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import FilterModal, { Filters, emptyFilters } from '@/components/FilterModal';
import { recipes } from '@/data/recipes';

export default function Index() {
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const filtered = useMemo(() => {
    let list = recipes;
    const q = search.toLowerCase().trim();

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

    return list;
  }, [search, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={search} onSearchChange={setSearch} onOpenFilters={() => setFiltersOpen(true)} />
      <FilterModal open={filtersOpen} onOpenChange={setFiltersOpen} filters={filters} onChange={setFilters} />

      <main className="mx-auto max-w-3xl px-4 py-6">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            Geen recepten gevonden. Probeer andere zoektermen of filters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
