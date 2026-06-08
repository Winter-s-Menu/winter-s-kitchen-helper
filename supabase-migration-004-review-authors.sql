-- ============================================================
-- Migration 004: Public RPC for reviews with author display name
-- Run AFTER migration 003 in Supabase SQL Editor.
-- ============================================================

create or replace function public.get_recipe_reviews(p_recipe_id text)
returns table (
  id uuid,
  user_id uuid,
  rating int,
  review_text text,
  created_at timestamptz,
  updated_at timestamptz,
  display_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.user_id,
    r.rating,
    r.review_text,
    r.created_at,
    r.updated_at,
    coalesce(nullif(p.name, ''), u.email) as display_name
  from public.recipe_reviews r
  left join public.profiles p on p.id = r.user_id
  left join auth.users u on u.id = r.user_id
  where r.recipe_id = p_recipe_id
  order by r.created_at desc;
$$;

grant execute on function public.get_recipe_reviews(text) to anon, authenticated;
