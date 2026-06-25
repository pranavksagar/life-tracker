-- =============================================================================
-- Life Tracker — seed data (development convenience)
--
-- This attaches sample data to the FIRST auth user in the project. Sign up in
-- the app once, then run this file in the Supabase SQL Editor. Safe to re-run
-- only on a fresh project — it does not de-duplicate.
-- =============================================================================
do $$
declare
  uid uuid;
  area_health   uuid;
  area_work     uuid;
  area_personal uuid;
  spr_current   uuid;
  goal_books    uuid;
  goal_run      uuid;
  hab_meditate  uuid;
  hab_exercise  uuid;
  hab_read      uuid;
  d date;
begin
  select id into uid from auth.users order by created_at limit 1;
  if uid is null then
    raise exception 'No auth user found. Sign up in the app first, then run seed.sql.';
  end if;

  -- Areas -------------------------------------------------------------------
  insert into public.areas (user_id, name, color, icon, sort_order)
    values (uid, 'Health',   '#22c55e', 'heart-pulse', 0) returning id into area_health;
  insert into public.areas (user_id, name, color, icon, sort_order)
    values (uid, 'Work',     '#3b82f6', 'briefcase', 1) returning id into area_work;
  insert into public.areas (user_id, name, color, icon, sort_order)
    values (uid, 'Personal', '#a855f7', 'sparkles', 2) returning id into area_personal;

  -- Sprint (a 2-week box centered on today) ---------------------------------
  insert into public.sprints (user_id, name, start_date, end_date, capacity, status)
    values (uid, 'Sprint 1 — Kickoff', current_date - 4, current_date + 9, 20, 'active')
    returning id into spr_current;

  -- Goals -------------------------------------------------------------------
  insert into public.goals (user_id, title, description, metric_name, target_value, current_value, unit, deadline, status, area_id)
    values (uid, 'Read 12 books this year', 'One book a month, roughly.', 'books read', 12, 4, 'books',
            (date_trunc('year', current_date) + interval '1 year - 1 day')::date, 'active', area_personal)
    returning id into goal_books;
  insert into public.goals (user_id, title, description, metric_name, target_value, current_value, unit, deadline, status, area_id, sprint_id)
    values (uid, 'Run 50 km this month', 'Build an aerobic base.', 'distance', 50, 18, 'km',
            (date_trunc('month', current_date) + interval '1 month - 1 day')::date, 'active', area_health, spr_current)
    returning id into goal_run;

  -- Tasks -------------------------------------------------------------------
  insert into public.tasks (user_id, title, notes, due_date, priority, status, area_id, sprint_id, goal_id, tags, estimate, sort_order) values
    (uid, 'Draft Q3 planning doc', 'Outline objectives and risks.', current_date,     'high',   'doing', area_work,     spr_current, null,       '{planning}',  5, 0),
    (uid, 'Review pull requests',  null,                             current_date,     'medium', 'todo',  area_work,     spr_current, null,       '{code}',      2, 1),
    (uid, 'Book dentist appointment', null,                          current_date + 2, 'low',    'todo',  area_health,   null,        null,       '{errand}',    1, 2),
    (uid, 'Long run — 8km',        'Easy pace.',                      current_date + 1, 'medium', 'todo',  area_health,   spr_current, goal_run,   '{running}',   3, 3),
    (uid, 'Finish chapter 5',      'Current book.',                   current_date,     'low',    'todo',  area_personal, spr_current, goal_books, '{reading}',   2, 4),
    (uid, 'Meal prep for the week', null,                             current_date - 1, 'medium', 'done',  area_health,   spr_current, null,       '{cooking}',   3, 5),
    (uid, 'Pay credit card bill',  null,                             current_date - 2, 'high',   'done',  area_personal, null,        null,       '{finance}',   1, 6),
    (uid, 'Inbox zero',            null,                              current_date - 3, 'low',    'done',  area_work,     null,        null,       '{}',          1, 7);

  update public.tasks set completed_at = (created_at + interval '1 hour') where user_id = uid and status = 'done';

  -- Habits ------------------------------------------------------------------
  insert into public.habits (user_id, name, cadence, target_count, area_id, color)
    values (uid, 'Meditate',  'daily',      1, area_personal, '#a855f7') returning id into hab_meditate;
  insert into public.habits (user_id, name, cadence, target_count, area_id, color)
    values (uid, 'Exercise',  'n_per_week', 4, area_health,   '#22c55e') returning id into hab_exercise;
  insert into public.habits (user_id, name, cadence, target_count, area_id, color)
    values (uid, 'Read',      'daily',      1, area_personal, '#f59e0b') returning id into hab_read;

  -- Habit logs over the last 21 days, with realistic gaps --------------------
  for d in select generate_series(current_date - 20, current_date, interval '1 day')::date loop
    -- Meditate: skip roughly every 5th day
    if (current_date - d) % 5 <> 0 then
      insert into public.habit_logs (user_id, habit_id, date, count) values (uid, hab_meditate, d, 1);
    end if;
    -- Read: skip weekends-ish (every 6th/7th)
    if (current_date - d) % 7 < 5 then
      insert into public.habit_logs (user_id, habit_id, date, count) values (uid, hab_read, d, 1);
    end if;
    -- Exercise: roughly every other day
    if (current_date - d) % 2 = 0 then
      insert into public.habit_logs (user_id, habit_id, date, count) values (uid, hab_exercise, d, 1);
    end if;
  end loop;

  -- Exercise logs -----------------------------------------------------------
  insert into public.exercise_logs (user_id, type, duration_min, intensity, calories, date, notes, area_id) values
    (uid, 'Running',  42, 'high',   430, current_date - 1,  '6km tempo',        area_health),
    (uid, 'Strength', 50, 'medium', 280, current_date - 3,  'Push day',         area_health),
    (uid, 'Cycling',  65, 'medium', 520, current_date - 5,  'Easy ride',        area_health),
    (uid, 'Running',  38, 'medium', 360, current_date - 7,  '5km',              area_health),
    (uid, 'Yoga',     30, 'low',    120, current_date - 8,  'Mobility',         area_health),
    (uid, 'Running',  55, 'high',   560, current_date - 10, '8km long run',     area_health);

  -- Food logs ---------------------------------------------------------------
  insert into public.food_logs (user_id, meal, name, date, calories, protein, carbs, fat, area_id) values
    (uid, 'breakfast', 'Oats & berries',        current_date,     380, 14, 60, 8,  area_health),
    (uid, 'lunch',     'Chicken rice bowl',     current_date,     620, 45, 70, 14, area_health),
    (uid, 'dinner',    'Salmon & veg',          current_date - 1, 540, 38, 30, 26, area_health),
    (uid, 'snack',     'Greek yogurt',          current_date - 1, 150, 15, 12, 4,  area_health);

  raise notice 'Seed complete for user %', uid;
end $$;
