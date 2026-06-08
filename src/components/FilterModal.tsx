import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RECIPE_TYPE_LABELS, COURSE_LABELS, ALLERGEN_OPTIONS } from '@/types/recipe';
import type { RecipeType, Course } from '@/types/recipe';
import { Star } from 'lucide-react';

export type StarValue = 1 | 2 | 3 | 4 | 5;

export interface Filters {
  types: RecipeType[];
  excludeAllergens: string[];
  prepTime: '' | '<30' | '30-60' | '60+';
  course: Course | '';
  ratings: StarValue[];
}

export const emptyFilters: Filters = {
  types: [],
  excludeAllergens: [],
  prepTime: '',
  course: '',
  ratings: [],
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filters: Filters;
  onChange: (f: Filters) => void;
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm rounded-full px-3 py-1.5 border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-foreground border-border hover:bg-secondary'
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterModal({ open, onOpenChange, filters, onChange }: Props) {
  const toggleType = (t: RecipeType) => {
    const types = filters.types.includes(t)
      ? filters.types.filter(x => x !== t)
      : [...filters.types, t];
    onChange({ ...filters, types });
  };

  const toggleAllergen = (a: string) => {
    const excludeAllergens = filters.excludeAllergens.includes(a)
      ? filters.excludeAllergens.filter(x => x !== a)
      : [...filters.excludeAllergens, a];
    onChange({ ...filters, excludeAllergens });
  };

  const setPrepTime = (v: Filters['prepTime']) =>
    onChange({ ...filters, prepTime: filters.prepTime === v ? '' : v });

  const setCourse = (v: Course) =>
    onChange({ ...filters, course: filters.course === v ? '' : v });

  const toggleRating = (v: StarValue) => {
    const ratings = filters.ratings.includes(v)
      ? filters.ratings.filter(x => x !== v)
      : [...filters.ratings, v];
    onChange({ ...filters, ratings });
  };

  const hasFilters =
    filters.types.length > 0 ||
    filters.excludeAllergens.length > 0 ||
    filters.prepTime !== '' ||
    filters.course !== '' ||
    filters.ratings.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <section>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Type</h4>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(RECIPE_TYPE_LABELS) as [RecipeType, string][]).map(([k, label]) => (
                <Toggle key={k} active={filters.types.includes(k)} onClick={() => toggleType(k)}>
                  {label}
                </Toggle>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Allergenen uitsluiten</h4>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map(o => (
                <Toggle
                  key={o.value}
                  active={filters.excludeAllergens.includes(o.value)}
                  onClick={() => toggleAllergen(o.value)}
                >
                  {o.label}
                </Toggle>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Bereidingstijd</h4>
            <div className="flex flex-wrap gap-2">
              {([['<30', '< 30 min'], ['30-60', '30–60 min'], ['60+', '60+ min']] as const).map(
                ([k, label]) => (
                  <Toggle key={k} active={filters.prepTime === k} onClick={() => setPrepTime(k)}>
                    {label}
                  </Toggle>
                )
              )}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Gang</h4>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(COURSE_LABELS) as [Course, string][]).map(([k, label]) => (
                <Toggle key={k} active={filters.course === k} onClick={() => setCourse(k)}>
                  {label}
                </Toggle>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Beoordeling</h4>
            <p className="text-xs text-muted-foreground/80 mb-2">
              Filtert op de afgeronde gemiddelde score. Combineer meerdere waardes.
            </p>
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3, 4, 5] as StarValue[]).map(n => (
                <Toggle key={n} active={filters.ratings.includes(n)} onClick={() => toggleRating(n)}>
                  <span className="inline-flex items-center gap-1">
                    {n} <Star className="h-3.5 w-3.5 fill-current" />
                  </span>
                </Toggle>
              ))}
            </div>
          </section>

          {hasFilters && (
            <button
              onClick={() => onChange(emptyFilters)}
              className="text-sm text-primary hover:underline"
            >
              Wis alle filters
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
