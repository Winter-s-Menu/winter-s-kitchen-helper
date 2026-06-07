-- ============================================================
-- Migration 003: Recipe Reviews
-- Run AFTER migration 001/002 in Supabase SQL Editor.
-- ============================================================

create table if not exists public.recipe_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create index if not exists recipe_reviews_recipe_id_idx on public.recipe_reviews(recipe_id);

grant select on public.recipe_reviews to anon, authenticated;
grant insert, update, delete on public.recipe_reviews to authenticated;
grant all on public.recipe_reviews to service_role;

alter table public.recipe_reviews enable row level security;

drop policy if exists "Reviews are publicly readable" on public.recipe_reviews;
create policy "Reviews are publicly readable"
  on public.recipe_reviews for select using (true);

drop policy if exists "Users can insert own review" on public.recipe_reviews;
create policy "Users can insert own review"
  on public.recipe_reviews for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own review" on public.recipe_reviews;
create policy "Users can update own review"
  on public.recipe_reviews for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own review" on public.recipe_reviews;
create policy "Users can delete own review"
  on public.recipe_reviews for delete using (auth.uid() = user_id);
