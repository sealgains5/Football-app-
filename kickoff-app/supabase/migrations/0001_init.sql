-- Kickoff schema
-- Run against a fresh Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

-- ── profiles ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  handle text,
  avatar_url text,
  bio text not null default '',
  location text not null default '',
  positions text[] not null default '{}',
  skill_rating numeric(2, 1),
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── skill_assessments ────────────────────────────────────────────────────
create table public.skill_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null,
  rating numeric(2, 1) not null,
  created_at timestamptz not null default now()
);

-- ── games ─────────────────────────────────────────────────────────────────
create table public.games (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  format text not null check (format in ('5-a-side', '7-a-side', '11-a-side')),
  game_date date not null,
  game_time text not null,
  location text not null,
  pitch text not null default 'Astroturf',
  spots int not null,
  cost numeric(6, 2) not null default 0,
  skill_level text not null default 'All levels',
  is_private boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ── game_players ─────────────────────────────────────────────────────────
create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  position text,
  status text not null default 'joined' check (status in ('requested', 'waitlist', 'joined')),
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  unique (game_id, player_id)
);

-- ── messages ──────────────────────────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- ── follows ───────────────────────────────────────────────────────────────
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

-- ── notifications ────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('join', 'payment', 'reminder', 'rating', 'follow', 'request')),
  text text not null,
  related_game_id uuid references public.games (id) on delete set null,
  related_user_id uuid references public.profiles (id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── squads ────────────────────────────────────────────────────────────────
create table public.squads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.squad_members (
  squad_id uuid not null references public.squads (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (squad_id, player_id)
);

-- ── ratings (post-game teammate ratings) ────────────────────────────────
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  rater_id uuid not null references public.profiles (id) on delete cascade,
  ratee_id uuid not null references public.profiles (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  unique (game_id, rater_id, ratee_id)
);

-- ── payments (Stripe test-mode) ─────────────────────────────────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  amount numeric(6, 2) not null,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  created_at timestamptz not null default now()
);

create index on public.game_players (game_id);
create index on public.game_players (player_id);
create index on public.messages (game_id);
create index on public.notifications (user_id);
create index on public.follows (followee_id);

-- ── row level security ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.skill_assessments enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.messages enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.ratings enable row level security;
alter table public.payments enable row level security;

-- profiles: readable by anyone signed in, editable only by owner
create policy "profiles are readable by authenticated users" on public.profiles
  for select to authenticated using (true);
create policy "users can update their own profile" on public.profiles
  for update to authenticated using (id = auth.uid());

-- skill_assessments: owner only
create policy "read own assessments" on public.skill_assessments
  for select to authenticated using (user_id = auth.uid());
create policy "insert own assessments" on public.skill_assessments
  for insert to authenticated with check (user_id = auth.uid());

-- games: readable by anyone signed in; writable by organiser
create policy "games are readable by authenticated users" on public.games
  for select to authenticated using (true);
create policy "users can create games" on public.games
  for insert to authenticated with check (organiser_id = auth.uid());
create policy "organiser can update their game" on public.games
  for update to authenticated using (organiser_id = auth.uid());
create policy "organiser can delete their game" on public.games
  for delete to authenticated using (organiser_id = auth.uid());

-- game_players: readable by anyone signed in (rosters are public within the app);
-- a player can insert/update/delete their own row, the organiser can update/delete any row
-- (approve requests, mark paid, remove players) on their own games
create policy "game_players are readable by authenticated users" on public.game_players
  for select to authenticated using (true);
create policy "players can join games" on public.game_players
  for insert to authenticated with check (player_id = auth.uid());
create policy "players or organiser can update roster rows" on public.game_players
  for update to authenticated using (
    player_id = auth.uid()
    or exists (select 1 from public.games g where g.id = game_id and g.organiser_id = auth.uid())
  );
create policy "players or organiser can remove roster rows" on public.game_players
  for delete to authenticated using (
    player_id = auth.uid()
    or exists (select 1 from public.games g where g.id = game_id and g.organiser_id = auth.uid())
  );

-- messages: readable/writable by players in that game (or the organiser)
create policy "game participants can read messages" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.game_players gp
      where gp.game_id = messages.game_id and gp.player_id = auth.uid() and gp.status = 'joined'
    )
    or exists (select 1 from public.games g where g.id = game_id and g.organiser_id = auth.uid())
  );
create policy "game participants can send messages" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and (
      exists (
        select 1 from public.game_players gp
        where gp.game_id = messages.game_id and gp.player_id = auth.uid() and gp.status = 'joined'
      )
      or exists (select 1 from public.games g where g.id = game_id and g.organiser_id = auth.uid())
    )
  );

-- follows: readable by anyone signed in; only the follower manages their own edges
create policy "follows are readable by authenticated users" on public.follows
  for select to authenticated using (true);
create policy "users can follow others" on public.follows
  for insert to authenticated with check (follower_id = auth.uid());
create policy "users can unfollow" on public.follows
  for delete to authenticated using (follower_id = auth.uid());

-- notifications: only the recipient can read/update their own; any signed-in user
-- can create a notification for someone else (side effect of joins/follows/etc.)
create policy "users read their own notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "authenticated users can create notifications" on public.notifications
  for insert to authenticated with check (true);
create policy "users update their own notifications" on public.notifications
  for update to authenticated using (user_id = auth.uid());

-- squads: owner manages; members can read squads they belong to
create policy "owner and members can read squads" on public.squads
  for select to authenticated using (
    owner_id = auth.uid()
    or exists (select 1 from public.squad_members sm where sm.squad_id = id and sm.player_id = auth.uid())
  );
create policy "owner manages squads" on public.squads
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner and members can read squad_members" on public.squad_members
  for select to authenticated using (
    player_id = auth.uid()
    or exists (select 1 from public.squads s where s.id = squad_id and s.owner_id = auth.uid())
  );
create policy "squad owner manages members" on public.squad_members
  for all to authenticated using (
    exists (select 1 from public.squads s where s.id = squad_id and s.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.squads s where s.id = squad_id and s.owner_id = auth.uid())
  );

-- ratings: readable by anyone signed in (used to compute aggregate trust); only the rater writes
create policy "ratings are readable by authenticated users" on public.ratings
  for select to authenticated using (true);
create policy "users rate teammates" on public.ratings
  for insert to authenticated with check (rater_id = auth.uid());

-- payments: only the paying user can read/create their own payment rows;
-- status transitions to succeeded/failed happen via the service-role key from
-- the confirm-payment edge function, which bypasses RLS.
create policy "users read their own payments" on public.payments
  for select to authenticated using (user_id = auth.uid());
create policy "users create their own payments" on public.payments
  for insert to authenticated with check (user_id = auth.uid());
