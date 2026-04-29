import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, ShoppingCart, StickyNote, Minus, Plus, Clock, Share2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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

function formatAmount(n: number): string {
  if (n === 0) return '0';
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return rounded.toString();
  return rounded.toFixed(rounded < 10 ? 1 : 0);
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { recipes, recipesLoading, toggleFavorite, isFavorite, addToShoppingList, saveNote, getNote, deleteNote } = useApp();
  const recipe = recipes.find(r => r.id === id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servings, setServings] = useState(recipe?.baseServings ?? 4);
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Update document metadata for the current recipe (client-side; crawlers
  // are served pre-rendered HTML by /api/og/recept/[slug]).
  useEffect(() => {
    if (!recipe) return;
    const siteName = "Winter's Menu";
    const fullTitle = `${recipe.title} — ${siteName}`;
    const sentences = (recipe.description || '').match(/[^.!?]+[.!?]+/g);
    const shortDesc = sentences && sentences.length
      ? sentences.slice(0, 2).join('').trim()
      : (recipe.description || 'Ontdek recepten, schaal ingrediënten en maak je boodschappenlijst.');
    const url = `${window.location.origin}/recept/${recipe.id}`;
    const image = recipe.imageUrl || `${window.location.origin}/tab_logo.png`;

    const prevTitle = document.title;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      return el;
    };

    setMeta('meta[name="description"]', 'name', 'description', shortDesc);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'article');
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', shortDesc);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', shortDesc);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    return () => { document.title = prevTitle; };
  }, [recipe]);

  // Close lightbox with Escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen]);

  if (recipesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Laden…</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Recept niet gevonden</p>
          <Link to="/" className="text-primary hover:underline">Terug naar home</Link>
        </div>
      </div>
    );
  }

  const requireAuth = (action: () => void) => {
    if (!user) {
      toast('Log in om deze functie te gebruiken', {
        action: { label: 'Inloggen', onClick: () => navigate('/inloggen') },
      });
      return;
    }
    action();
  };

  const scalingFactor = servings / recipe.baseServings;
  const fav = isFavorite(recipe.id);
  const existingNote = getNote(recipe.id);

  const handleAddToList = () => {
    requireAuth(async () => {
      if (!recipe.ingredients.length) {
        toast.error('Geen ingrediënten gevonden voor dit recept');
        return;
      }
      const success = await addToShoppingList(recipe.ingredients, scalingFactor);
      if (success) {
        toast.success('Ingrediënten toegevoegd aan je boodschappenlijst');
      } else {
        toast.error('Toevoegen aan boodschappenlijst mislukt');
      }
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/recept/${recipe.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link gekopieerd');
    } catch {
      toast.error('Kopiëren mislukt. Kopieer de URL handmatig uit de adresbalk.');
    }
  };

  const openNote = () => {
    requireAuth(() => {
      setNoteText(existingNote?.text ?? '');
      setShowNote(true);
    });
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      saveNote(recipe.id, noteText);
      toast.success('Notitie opgeslagen');
    } else {
      deleteNote(recipe.id);
    }
    setShowNote(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image or gradient */}
      <div className="relative">
        {recipe.imageUrl ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full h-48 sm:h-64 overflow-hidden cursor-zoom-in focus:outline-none"
            aria-label="Vergroot afbeelding"
          >
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </button>
        ) : (
          <div className={`${gradientClass[recipe.type]} h-48 sm:h-64 flex items-center justify-center text-6xl`}>
            <span className="opacity-50">{emoji[recipe.type]}</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm bg-background/70 backdrop-blur-sm rounded-full px-3 py-1.5 text-foreground/80 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Terug
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 -mt-6 relative z-10">
        {/* Title card */}
        <div className="rounded-xl bg-card border p-5 mb-4">
          <h1 className="font-serif text-2xl sm:text-3xl mb-1">{recipe.title}</h1>
          <p className="text-foreground/60 text-sm mb-3">{recipe.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> {recipe.prepTimeMinutes} min
            </span>
            {recipe.tags.map(tag => (
              <span key={tag} className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleAddToList}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="h-4 w-4" /> Voeg toe aan lijst
          </button>
          <button
            onClick={() => requireAuth(() => toggleFavorite(recipe.id))}
            className={`rounded-xl px-4 py-3 border transition-colors ${
              fav ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:bg-secondary'
            }`}
            aria-label="Favoriet"
          >
            <Heart className={`h-5 w-5 ${fav ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={openNote}
            className={`rounded-xl px-4 py-3 border transition-colors ${
              existingNote ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:bg-secondary'
            }`}
            aria-label="Notitie"
          >
            <StickyNote className="h-5 w-5" />
          </button>
          <button
            onClick={handleShare}
            className="rounded-xl px-4 py-3 border bg-card border-border hover:bg-secondary transition-colors"
            aria-label="Deel"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Note editor */}
        {showNote && (
          <div className="mb-6 rounded-xl border bg-card p-4">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Schrijf een notitie bij dit recept…"
              className="w-full bg-transparent resize-none outline-none text-sm min-h-[80px]"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowNote(false)} className="text-sm text-muted-foreground hover:text-foreground">
                Annuleren
              </button>
              <button onClick={handleSaveNote} className="text-sm font-medium text-primary hover:underline">
                Opslaan
              </button>
            </div>
          </div>
        )}

        {/* Servings */}
        <section className="rounded-xl border bg-card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl">Ingrediënten</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings(s => Math.max(1, s - 1))}
                className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-secondary transition-colors"
                disabled={servings <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium w-16 text-center">{servings} pers.</span>
              <button
                onClick={() => setServings(s => Math.min(100, s + 1))}
                className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-secondary transition-colors"
                disabled={servings >= 100}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {recipe.ingredients.map(ing => (
              <li key={ing.id} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                <span>{ing.name}</span>
                <span className="text-muted-foreground">
                  {formatAmount(ing.amount * scalingFactor)} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="font-serif text-xl mb-4">Bereiding</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <p className="pt-0.5 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Allergens */}
        {recipe.allergens.length > 0 && (
          <p className="text-xs text-muted-foreground mb-8">
            Allergenen: {recipe.allergens.join(', ')}
          </p>
        )}
      </main>
    </div>
  );
}
