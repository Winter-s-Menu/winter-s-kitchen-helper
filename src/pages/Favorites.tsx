import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function Favorites() {
  const { favorites, recipes } = useApp();
  const { user } = useAuth();
  const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Terug
          </Link>
          <h1 className="font-serif text-lg">Favorieten</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {!user ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Log in om je favorieten te zien</p>
            <Link to="/inloggen" className="text-primary text-sm hover:underline">Inloggen</Link>
          </div>
        ) : favoriteRecipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-2">Nog geen favorieten</p>
            <Link to="/" className="text-primary text-sm hover:underline">
              Ontdek recepten
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {favoriteRecipes.map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
