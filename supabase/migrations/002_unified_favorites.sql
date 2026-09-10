-- Unified favorites table (used by API + React Query hooks)
-- Complements favorite_teams / favorite_leagues / favorite_matches

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('team', 'league', 'fixture', 'player')),
  entity_id integer not null,
  created_at timestamptz not null default now(),
  unique(user_id, type, entity_id)
);

create index if not exists idx_favorites_user on public.favorites(user_id);

alter table public.favorites enable row level security;

create policy "Users can view own favorites"
  on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);
