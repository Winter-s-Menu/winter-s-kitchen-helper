import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Recipe } from '@/types/recipe';

const gradientClass: Record<string, string> = {
  vlees: 'recipe-gradient-vlees',
  vis: 'recipe-gradient-vis',
  vegan: 'recipe-gradient-vegan',
  vegetarisch: 'recipe-gradient-vegetarisch',
};

const emoji: Record<string, string> = {
  vlees: '🥩',
  vis: '🐟',
  vegan: '🌱',
  vegetarisch: '🧀',
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/recept/${recipe.id}`}
      className="group block rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className={`${gradientClass[recipe.type]} h-36 sm:h-44 flex items-center justify-center text-5xl`}
      >
        <span className="opacity-60 group-hover:scale-110 transition-transform">
          {emoji[recipe.type]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg leading-tight mb-1">{recipe.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {recipe.prepTimeMinutes} min
          </span>
          {recipe.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
