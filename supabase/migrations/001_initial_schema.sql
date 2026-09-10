-- GoalPulse Supabase schema
-- Run in Supabase SQL editor or via migrations

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  notification_prefs jsonb not null default '{"match_alerts":true,"goal_alerts":true,"favorite_team_alerts":true,"favorite_league_alerts":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  external_id integer not null unique,
  name text not null,
  logo_url text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leagues
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  external_id integer not null unique,
  name text not null,
  logo_url text,
  country text,
  season integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Players
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  external_id integer not null unique,
  name text not null,
  photo_url text,
  nationality text,
  position text,
  age integer,
  number integer,
  team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fixtures
create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  external_id integer not null unique,
  league_id uuid references public.leagues(id) on delete set null,
  season integer,
  home_team_id uuid references public.teams(id) on delete set null,
  away_team_id uuid references public.teams(id) on delete set null,
  home_score integer,
  away_score integer,
  status text,
  elapsed integer,
  start_time timestamptz,
  venue text,
  round text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fixtures_external_id on public.fixtures(external_id);
create index if not exists idx_fixtures_start_time on public.fixtures(start_time);
create index if not exists idx_fixtures_status on public.fixtures(status);
create index if not exists idx_fixtures_league_id on public.fixtures(league_id);
create index if not exists idx_fixtures_home_team_id on public.fixtures(home_team_id);
create index if not exists idx_fixtures_away_team_id on public.fixtures(away_team_id);

-- Fixture events
create table if not exists public.fixture_events (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  player_id uuid references public.players(id) on delete set null,
  type text not null,
  detail text,
  minute integer,
  extra integer,
  player_name text,
  assist_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_fixture_events_fixture_id on public.fixture_events(fixture_id);

-- Fixture statistics
create table if not exists public.fixture_statistics (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  possession integer,
  shots integer,
  shots_on_target integer,
  corners integer,
  fouls integer,
  offsides integer,
  passes integer,
  pass_accuracy integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(fixture_id, team_id)
);

-- Standings
create table if not exists public.standings (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season integer not null,
  team_id uuid not null references public.teams(id) on delete cascade,
  position integer not null,
  played integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  goal_difference integer not null default 0,
  points integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(league_id, season, team_id)
);

create index if not exists idx_standings_league_season on public.standings(league_id, season);

-- Unified favorites (API entity ids from football provider)
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('team', 'league', 'fixture', 'player')),
  entity_id integer not null,
  created_at timestamptz not null default now(),
  unique(user_id, type, entity_id)
);

create index if not exists idx_favorites_user on public.favorites(user_id);

-- Favorites (legacy relational tables)
create table if not exists public.favorite_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, team_id)
);

create table if not exists public.favorite_leagues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  league_id uuid not null references public.leagues(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, league_id)
);

create table if not exists public.favorite_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, fixture_id)
);

create index if not exists idx_favorite_teams_user on public.favorite_teams(user_id);
create index if not exists idx_favorite_leagues_user on public.favorite_leagues(user_id);
create index if not exists idx_favorite_matches_user on public.favorite_matches(user_id);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- Sync metadata
create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  status text not null,
  message text,
  records_affected integer default 0,
  created_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists teams_updated_at on public.teams;
create trigger teams_updated_at before update on public.teams
  for each row execute function public.set_updated_at();

drop trigger if exists leagues_updated_at on public.leagues;
create trigger leagues_updated_at before update on public.leagues
  for each row execute function public.set_updated_at();

drop trigger if exists fixtures_updated_at on public.fixtures;
create trigger fixtures_updated_at before update on public.fixtures
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.favorite_teams enable row level security;
alter table public.favorite_leagues enable row level security;
alter table public.favorite_matches enable row level security;
alter table public.notifications enable row level security;
alter table public.teams enable row level security;
alter table public.leagues enable row level security;
alter table public.players enable row level security;
alter table public.fixtures enable row level security;
alter table public.fixture_events enable row level security;
alter table public.fixture_statistics enable row level security;
alter table public.standings enable row level security;
alter table public.sync_logs enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Unified favorites policies
create policy "Users can view own favorites"
  on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can update own favorites"
  on public.favorites for update using (auth.uid() = user_id);
create policy "Users can delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- Favorites policies
create policy "Users can view own favorite teams"
  on public.favorite_teams for select using (auth.uid() = user_id);
create policy "Users can insert own favorite teams"
  on public.favorite_teams for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorite teams"
  on public.favorite_teams for delete using (auth.uid() = user_id);

create policy "Users can view own favorite leagues"
  on public.favorite_leagues for select using (auth.uid() = user_id);
create policy "Users can insert own favorite leagues"
  on public.favorite_leagues for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorite leagues"
  on public.favorite_leagues for delete using (auth.uid() = user_id);

create policy "Users can view own favorite matches"
  on public.favorite_matches for select using (auth.uid() = user_id);
create policy "Users can insert own favorite matches"
  on public.favorite_matches for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorite matches"
  on public.favorite_matches for delete using (auth.uid() = user_id);

-- Notifications policies
create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- Public read for football data
create policy "Teams are publicly readable" on public.teams for select using (true);
create policy "Leagues are publicly readable" on public.leagues for select using (true);
create policy "Players are publicly readable" on public.players for select using (true);
create policy "Fixtures are publicly readable" on public.fixtures for select using (true);
create policy "Fixture events are publicly readable" on public.fixture_events for select using (true);
create policy "Fixture statistics are publicly readable" on public.fixture_statistics for select using (true);
create policy "Standings are publicly readable" on public.standings for select using (true);

-- Sync logs: admin only (service role bypasses RLS)
create policy "Admins can view sync logs"
  on public.sync_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
