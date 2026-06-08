import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  deleteReview,
  fetchReviewsForRecipe,
  upsertReview,
  type RecipeReview,
} from '@/lib/reviews';

interface Props {
  recipeId: string;
}

function StarRow({
  value,
  onChange,
  size = 'md',
  interactive = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}) {
  const px = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= Math.round(value);
        const className = `${px} ${filled ? 'fill-primary text-primary' : 'text-muted-foreground/40'} ${
          interactive ? 'cursor-pointer transition-transform active:scale-90' : ''
        }`;
        if (interactive) {
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} sterren`}
              onClick={() => onChange?.(n)}
              className="p-0.5"
            >
              <Star className={className} />
            </button>
          );
        }
        return <Star key={n} className={className} />;
      })}
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function displayNameFor(r: RecipeReview, ownEmail?: string | null, isOwn?: boolean): string {
  const name = (r.displayName ?? '').trim();
  if (name) return name;
  if (isOwn && ownEmail) return ownEmail;
  return 'Anoniem';
}

export default function RecipeReviews({ recipeId }: Props) {
  const { user } = useAuth();
  const { refreshRatings } = useApp();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<RecipeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ownReview = user ? reviews.find(r => r.userId === user.id) : undefined;
  const otherReviews = user ? reviews.filter(r => r.userId !== user.id) : reviews;
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  const load = async () => {
    setLoading(true);
    const list = await fetchReviewsForRecipe(recipeId);
    setReviews(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  useEffect(() => {
    if (ownReview) {
      setRating(ownReview.rating);
      setText(ownReview.reviewText);
    } else {
      setRating(0);
      setText('');
    }
  }, [ownReview?.id]);

  const handleSubmit = async () => {
    if (!user) {
      toast('Log in om een review te plaatsen', {
        action: { label: 'Inloggen', onClick: () => navigate('/inloggen') },
      });
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error('Kies een score van 1 tot 5 sterren');
      return;
    }
    setSubmitting(true);
    const { error } = await upsertReview({
      recipeId,
      userId: user.id,
      rating,
      reviewText: text.trim().slice(0, 1000),
    });
    setSubmitting(false);
    if (error) {
      toast.error('Review opslaan mislukt');
      return;
    }
    toast.success(ownReview ? 'Review bijgewerkt' : 'Review geplaatst');
    await load();
    refreshRatings();
  };

  const handleDelete = async () => {
    if (!user || !ownReview) return;
    setSubmitting(true);
    const { error } = await deleteReview({ recipeId, userId: user.id });
    setSubmitting(false);
    if (error) {
      toast.error('Review verwijderen mislukt');
      return;
    }
    toast.success('Review verwijderd');
    await load();
    refreshRatings();
  };

  return (
    <section className="rounded-xl border bg-card p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl">Beoordelingen</h2>
        {count > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarRow value={avg} size="sm" />
            <span>{avg.toFixed(1)} · {count} {count === 1 ? 'review' : 'reviews'}</span>
          </div>
        )}
      </div>

      {/* Other users' reviews (and own review for reference, marked) */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Laden…</p>
      ) : count === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen reviews. Wees de eerste!</p>
      ) : otherReviews.length === 0 && !ownReview ? null : (
        <ul className="space-y-4">
          {otherReviews.map(r => (
            <li key={r.id} className="border-b border-border/50 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StarRow value={r.rating} size="sm" />
                  <span className="text-xs text-muted-foreground truncate">
                    {displayNameFor(r)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(r.updatedAt || r.createdAt)}
                </span>
              </div>
              {r.reviewText && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.reviewText}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Own review section — compact and subtle, below other reviews */}
      <div className="mt-6 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {ownReview ? 'Jouw review' : 'Plaats een review'}
          </p>
          <StarRow value={rating} onChange={setRating} size="md" interactive />
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Hoe vond je dit recept? (optioneel)"
          maxLength={1000}
          className="w-full bg-transparent resize-none outline-none text-sm min-h-[44px] border-b border-border focus:border-primary transition-colors pb-1.5"
        />
        <div className="flex items-center justify-between mt-2">
          {ownReview ? (
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Verwijderen
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || rating < 1}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:text-muted-foreground"
          >
            {ownReview ? 'Bijwerken' : 'Plaatsen'}
          </button>
        </div>
        {ownReview && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Zichtbaar als: {displayNameFor(ownReview, user?.email, true)}
          </p>
        )}
      </div>
    </section>
  );
}
