-- =============================================================================
-- Life Tracker — Row Level Security
-- Every table is private to its owner. A row is visible/mutable only when
-- auth.uid() matches its user_id. INSERTs are forced to the caller's uid via
-- the column default + the with-check clause, so a client cannot write rows
-- on behalf of another user.
-- =============================================================================

alter table public.areas         enable row level security;
alter table public.sprints       enable row level security;
alter table public.goals         enable row level security;
alter table public.tasks         enable row level security;
alter table public.habits        enable row level security;
alter table public.habit_logs    enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.food_logs     enable row level security;

-- areas
create policy "areas_select" on public.areas for select using (auth.uid() = user_id);
create policy "areas_insert" on public.areas for insert with check (auth.uid() = user_id);
create policy "areas_update" on public.areas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "areas_delete" on public.areas for delete using (auth.uid() = user_id);

-- sprints
create policy "sprints_select" on public.sprints for select using (auth.uid() = user_id);
create policy "sprints_insert" on public.sprints for insert with check (auth.uid() = user_id);
create policy "sprints_update" on public.sprints for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sprints_delete" on public.sprints for delete using (auth.uid() = user_id);

-- goals
create policy "goals_select" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete" on public.goals for delete using (auth.uid() = user_id);

-- tasks
create policy "tasks_select" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete" on public.tasks for delete using (auth.uid() = user_id);

-- habits
create policy "habits_select" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update" on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_delete" on public.habits for delete using (auth.uid() = user_id);

-- habit_logs
create policy "habit_logs_select" on public.habit_logs for select using (auth.uid() = user_id);
create policy "habit_logs_insert" on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "habit_logs_update" on public.habit_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_delete" on public.habit_logs for delete using (auth.uid() = user_id);

-- exercise_logs
create policy "exercise_logs_select" on public.exercise_logs for select using (auth.uid() = user_id);
create policy "exercise_logs_insert" on public.exercise_logs for insert with check (auth.uid() = user_id);
create policy "exercise_logs_update" on public.exercise_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercise_logs_delete" on public.exercise_logs for delete using (auth.uid() = user_id);

-- food_logs
create policy "food_logs_select" on public.food_logs for select using (auth.uid() = user_id);
create policy "food_logs_insert" on public.food_logs for insert with check (auth.uid() = user_id);
create policy "food_logs_update" on public.food_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "food_logs_delete" on public.food_logs for delete using (auth.uid() = user_id);
