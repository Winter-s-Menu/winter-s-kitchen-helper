import { supabase } from '@/integrations/supabase/client';

export interface RecipeReview {
  id: string;
  recipeId: string;
  userId: string;
  displayName?: string | null;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingAggregate {
  avg: number;
  count: number;
}

export async function fetchAllRatingAggregates(): Promise<Map<string, RatingAggregate>> {
  const { data, error } = await supabase
    .from('recipe_reviews')
    .select('recipe_id, rating');
  const map = new Map<string, RatingAggregate>();
  if (error || !data) return map;
  const sums = new Map<string, { sum: number; count: number }>();
  for (const row of data as any[]) {
    const entry = sums.get(row.recipe_id) ?? { sum: 0, count: 0 };
    entry.sum += Number(row.rating);
    entry.count += 1;
    sums.set(row.recipe_id, entry);
  }
  for (const [id, s] of sums) {
    map.set(id, { avg: s.count ? s.sum / s.count : 0, count: s.count });
  }
  return map;
}

export async function fetchReviewsForRecipe(recipeId: string): Promise<RecipeReview[]> {
  // Preferred: RPC that joins to profiles + auth.users for author display name.
  const { data, error } = await supabase.rpc('get_recipe_reviews', { p_recipe_id: recipeId });

  if (!error && Array.isArray(data)) {
    return (data as any[]).map(r => ({
      id: r.id,
      recipeId: recipeId,
      userId: r.user_id,
      displayName: r.display_name ?? null,
      rating: r.rating,
      reviewText: r.review_text ?? '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  // Fallback: plain select (author name will be unavailable).
  const { data: plain } = await supabase
    .from('recipe_reviews')
    .select('id, recipe_id, user_id, rating, review_text, created_at, updated_at')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });
  return (plain ?? []).map((r: any) => ({
    id: r.id,
    recipeId: r.recipe_id,
    userId: r.user_id,
    displayName: null,
    rating: r.rating,
    reviewText: r.review_text ?? '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function upsertReview(args: {
  recipeId: string;
  userId: string;
  rating: number;
  reviewText: string;
}) {
  const now = new Date().toISOString();
  return supabase
    .from('recipe_reviews')
    .upsert(
      {
        recipe_id: args.recipeId,
        user_id: args.userId,
        rating: args.rating,
        review_text: args.reviewText,
        updated_at: now,
      },
      { onConflict: 'user_id,recipe_id' }
    );
}

export async function deleteReview(args: { recipeId: string; userId: string }) {
  return supabase
    .from('recipe_reviews')
    .delete()
    .eq('recipe_id', args.recipeId)
    .eq('user_id', args.userId);
}
