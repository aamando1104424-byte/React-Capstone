-- The Fall of the Dead: shared leaderboard.
-- Paste this whole file into Supabase > SQL Editor and press Run. It is safe
-- to run more than once.

-- One row per finished run.
create table if not exists public.scores (
    id          bigint generated always as identity primary key,
    name        text not null check (char_length(trim(name)) between 1 and 16),
    rank        text not null check (char_length(rank) between 1 and 32),
    score       integer not null check (score >= 0),
    kills       integer not null default 0 check (kills >= 0),
    wave        integer not null default 1 check (wave >= 1),
    created_at  timestamptz not null default now()
);

-- The board always asks for the highest scores first.
create index if not exists scores_score_idx on public.scores (score desc, created_at);

-- Row Level Security: with it on, the publishable key can do nothing at all
-- except what the policies below allow. That is what makes it safe to ship
-- that key inside the game.
alter table public.scores enable row level security;

-- Anyone can read the board.
drop policy if exists "Anyone can read scores" on public.scores;
create policy "Anyone can read scores"
    on public.scores for select
    to anon, authenticated
    using (true);

-- Anyone can add a run. There is no update or delete policy, so nobody using
-- the publishable key can change or remove a run once it is on the board.
drop policy if exists "Anyone can add a score" on public.scores;
create policy "Anyone can add a score"
    on public.scores for insert
    to anon, authenticated
    with check (true);

grant select, insert on public.scores to anon, authenticated;

-- Realtime: push new runs to every open game the moment they are saved.
do $$
begin
    alter publication supabase_realtime add table public.scores;
exception
    when duplicate_object then null;
end $$;
