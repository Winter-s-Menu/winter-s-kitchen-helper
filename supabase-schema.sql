-- ============================================================
-- Winter's Menu — Supabase Postgres Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  profile_picture text,
  dietary_preferences text[], -- e.g. {'vegan','vegetarisch','pescotarisch'}
  allergies text[],           -- e.g. {'gluten','noten','lactose'}
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. RECIPES
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  prep_time_minutes int not null default 30,
  type text not null check (type in ('vlees','vis','vegan','vegetarisch')),
  course text not null check (course in ('ontbijt','lunch','diner','dessert')),
  allergens text[] default '{}',
  tags text[] default '{}',
  base_servings int not null default 4,
  steps text[] default '{}',
  created_at timestamptz default now()
);

alter table public.recipes enable row level security;

create policy "Recipes are publicly readable"
  on public.recipes for select
  using (true);

-- 3. INGREDIENTS (master list)
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_unit text not null default 'g',
  image_url text,
  category text not null check (category in ('groente','fruit','vlees_vis','zuivel','kruiden','droog','overig'))
);

alter table public.ingredients enable row level security;

create policy "Ingredients are publicly readable"
  on public.ingredients for select
  using (true);

-- 4. RECIPE_INGREDIENTS (join table)
create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  amount numeric not null default 0,
  unit text not null default 'g'
);

alter table public.recipe_ingredients enable row level security;

create policy "Recipe ingredients are publicly readable"
  on public.recipe_ingredients for select
  using (true);

-- 5. FAVORITES
create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, recipe_id)
);

alter table public.favorites enable row level security;

create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- 6. NOTES
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  note_text text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, recipe_id)
);

alter table public.notes enable row level security;

create policy "Users can view own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- 7. SHOPPING LISTS
create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.shopping_lists enable row level security;

create policy "Users can view own shopping list"
  on public.shopping_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert own shopping list"
  on public.shopping_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shopping list"
  on public.shopping_lists for update
  using (auth.uid() = user_id);

-- Allow anyone to view shared lists by token (via RPC or direct query)
create policy "Anyone can view shared lists by token"
  on public.shopping_lists for select
  using (share_token is not null);

-- 8. SHOPPING LIST ITEMS
create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  ingredient_name text not null,
  amount numeric not null default 0,
  unit text not null default 'stuks',
  checked boolean default false,
  category text not null default 'overig'
);

alter table public.shopping_list_items enable row level security;

create policy "Users can manage own shopping list items"
  on public.shopping_list_items for all
  using (
    exists (
      select 1 from public.shopping_lists sl
      where sl.id = list_id and sl.user_id = auth.uid()
    )
  );

create policy "Anyone can view shared list items"
  on public.shopping_list_items for select
  using (
    exists (
      select 1 from public.shopping_lists sl
      where sl.id = list_id and sl.share_token is not null
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_recipe_ingredients_recipe on public.recipe_ingredients(recipe_id);
create index idx_favorites_user on public.favorites(user_id);
create index idx_notes_user_recipe on public.notes(user_id, recipe_id);
create index idx_shopping_lists_user on public.shopping_lists(user_id);
create index idx_shopping_lists_token on public.shopping_lists(share_token);
create index idx_shopping_list_items_list on public.shopping_list_items(list_id);
