-- =============================================================================
-- Life Tracker — schema
-- Single-user-per-account model: every row is owned by a Supabase auth user.
-- All ownership/privacy is enforced by RLS in 0002_rls_policies.sql.
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto (usually present on Supabase, but be safe)
create extension if not exists pgcrypto;

-- Keep updated_at fresh on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- areas  — top-level grouping (Health, Work, Personal, ...)
-- -----------------------------------------------------------------------------
create table if not exists public.areas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  color       text not null default '#64748b',
  icon        text,
  sort_order  integer not null default 0,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- sprints  — a named, time-boxed period
-- -----------------------------------------------------------------------------
create table if not exists public.sprints (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  start_date  date not null,
  end_date    date not null,
  capacity    integer,                         -- planned commitment (effort points)
  status      text not null default 'planning'
              check (status in ('planning', 'active', 'completed')),
  retro_notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint sprints_dates_ok check (end_date >= start_date)
);

-- -----------------------------------------------------------------------------
-- goals  — measurable objective, optionally inside a sprint / area
-- -----------------------------------------------------------------------------
create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title         text not null,
  description   text,
  metric_name   text,                          -- e.g. "books read"
  target_value  numeric,                       -- e.g. 12
  current_value numeric not null default 0,
  unit          text,                           -- e.g. "books"
  deadline      date,
  status        text not null default 'active'
                check (status in ('active', 'completed', 'dropped')),
  area_id       uuid references public.areas (id) on delete set null,
  sprint_id     uuid references public.sprints (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- tasks
-- -----------------------------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null,
  notes        text,
  due_date     date,
  priority     text not null default 'medium'
               check (priority in ('low', 'medium', 'high')),
  status       text not null default 'todo'
               check (status in ('todo', 'doing', 'done')),
  area_id      uuid references public.areas (id) on delete set null,
  goal_id      uuid references public.goals (id) on delete set null,
  sprint_id    uuid references public.sprints (id) on delete set null,
  tags         text[] not null default '{}',
  recurrence   jsonb,                           -- {"freq":"daily|weekly|monthly","interval":1}
  estimate     integer,                         -- effort points, feeds sprint capacity
  sort_order   integer not null default 0,      -- ordering within a kanban column
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- habits
-- -----------------------------------------------------------------------------
create table if not exists public.habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  cadence      text not null default 'daily'
               check (cadence in ('daily', 'weekly', 'n_per_week')),
  target_count integer not null default 1,      -- per day, or per week for n_per_week
  area_id      uuid references public.areas (id) on delete set null,
  goal_id      uuid references public.goals (id) on delete set null,
  color        text not null default '#64748b',
  archived     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- habit_logs  — one row per habit per day
-- -----------------------------------------------------------------------------
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id   uuid not null references public.habits (id) on delete cascade,
  date       date not null,
  count      integer not null default 1,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

-- -----------------------------------------------------------------------------
-- exercise_logs
-- -----------------------------------------------------------------------------
create table if not exists public.exercise_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type         text not null,
  duration_min integer not null default 0,
  intensity    text not null default 'medium'
               check (intensity in ('low', 'medium', 'high')),
  calories     integer,
  date         date not null,
  notes        text,
  area_id      uuid references public.areas (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- food_logs  — nutrition fields optional so logging stays fast
-- -----------------------------------------------------------------------------
create table if not exists public.food_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  meal       text not null default 'snack'
             check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  name       text not null,
  date       date not null,
  calories   integer,
  protein    numeric,
  carbs      numeric,
  fat        numeric,
  notes      text,
  area_id    uuid references public.areas (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
create trigger areas_set_updated_at         before update on public.areas         for each row execute function public.set_updated_at();
create trigger sprints_set_updated_at       before update on public.sprints       for each row execute function public.set_updated_at();
create trigger goals_set_updated_at         before update on public.goals         for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at         before update on public.tasks         for each row execute function public.set_updated_at();
create trigger habits_set_updated_at        before update on public.habits        for each row execute function public.set_updated_at();
create trigger exercise_set_updated_at      before update on public.exercise_logs for each row execute function public.set_updated_at();
create trigger food_set_updated_at          before update on public.food_logs     for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- indexes  (scoped by user_id; plus the hot query paths)
-- -----------------------------------------------------------------------------
create index if not exists areas_user_idx         on public.areas (user_id);
create index if not exists sprints_user_idx        on public.sprints (user_id, status);
create index if not exists goals_user_idx          on public.goals (user_id, status);
create index if not exists goals_sprint_idx        on public.goals (sprint_id);
create index if not exists tasks_user_status_idx   on public.tasks (user_id, status);
create index if not exists tasks_user_due_idx      on public.tasks (user_id, due_date);
create index if not exists tasks_sprint_idx        on public.tasks (sprint_id);
create index if not exists tasks_goal_idx          on public.tasks (goal_id);
create index if not exists habits_user_idx         on public.habits (user_id);
create index if not exists habit_logs_user_date_idx on public.habit_logs (user_id, date);
create index if not exists habit_logs_habit_idx    on public.habit_logs (habit_id);
create index if not exists exercise_user_date_idx  on public.exercise_logs (user_id, date);
create index if not exists food_user_date_idx      on public.food_logs (user_id, date);
