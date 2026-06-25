/**
 * Hand-authored database types matching supabase/migrations.
 * Kept in sync with the SQL by hand (manual-migration workflow). If you later
 * adopt the Supabase CLI, replace this file with `supabase gen types typescript`.
 */
import type { Recurrence } from './recurrence'

export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type SprintStatus = 'planning' | 'active' | 'completed'
export type GoalStatus = 'active' | 'completed' | 'dropped'
export type HabitCadence = 'daily' | 'weekly' | 'n_per_week'
export type Intensity = 'low' | 'medium' | 'high'
export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack'

type AreasRow = {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  sort_order: number
  archived: boolean
  created_at: string
  updated_at: string
}

type SprintsRow = {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string
  capacity: number | null
  status: SprintStatus
  retro_notes: string | null
  created_at: string
  updated_at: string
}

type GoalsRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  metric_name: string | null
  target_value: number | null
  current_value: number
  unit: string | null
  deadline: string | null
  status: GoalStatus
  area_id: string | null
  sprint_id: string | null
  created_at: string
  updated_at: string
}

type TasksRow = {
  id: string
  user_id: string
  title: string
  notes: string | null
  due_date: string | null
  priority: Priority
  status: TaskStatus
  area_id: string | null
  goal_id: string | null
  sprint_id: string | null
  tags: string[]
  recurrence: Recurrence | null
  estimate: number | null
  sort_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

type HabitsRow = {
  id: string
  user_id: string
  name: string
  cadence: HabitCadence
  target_count: number
  area_id: string | null
  goal_id: string | null
  color: string
  archived: boolean
  created_at: string
  updated_at: string
}

type HabitLogsRow = {
  id: string
  user_id: string
  habit_id: string
  date: string
  count: number
  created_at: string
}

type ExerciseLogsRow = {
  id: string
  user_id: string
  type: string
  duration_min: number
  intensity: Intensity
  calories: number | null
  date: string
  notes: string | null
  area_id: string | null
  created_at: string
  updated_at: string
}

type FoodLogsRow = {
  id: string
  user_id: string
  meal: Meal
  name: string
  date: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  notes: string | null
  area_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Insert/Update shapes: server-defaulted columns are optional on insert; the
 * primary key and timestamps are never required from the client.
 */
type ServerManaged = 'id' | 'created_at' | 'updated_at'

type Insert<Row, Optional extends keyof Row> = Omit<Row, ServerManaged | Optional> &
  Partial<Pick<Row, Extract<keyof Row, ServerManaged | Optional>>>

type Update<Row> = Partial<Omit<Row, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

interface TableDef<Row, I, U> {
  Row: Row
  Insert: I
  Update: U
  Relationships: []
}

export interface Database {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      areas: TableDef<
        AreasRow,
        Insert<AreasRow, 'user_id' | 'color' | 'icon' | 'sort_order' | 'archived'>,
        Update<AreasRow>
      >
      sprints: TableDef<
        SprintsRow,
        Insert<SprintsRow, 'user_id' | 'capacity' | 'status' | 'retro_notes'>,
        Update<SprintsRow>
      >
      goals: TableDef<
        GoalsRow,
        Insert<
          GoalsRow,
          | 'user_id'
          | 'description'
          | 'metric_name'
          | 'target_value'
          | 'current_value'
          | 'unit'
          | 'deadline'
          | 'status'
          | 'area_id'
          | 'sprint_id'
        >,
        Update<GoalsRow>
      >
      tasks: TableDef<
        TasksRow,
        Insert<
          TasksRow,
          | 'user_id'
          | 'notes'
          | 'due_date'
          | 'priority'
          | 'status'
          | 'area_id'
          | 'goal_id'
          | 'sprint_id'
          | 'tags'
          | 'recurrence'
          | 'estimate'
          | 'sort_order'
          | 'completed_at'
        >,
        Update<TasksRow>
      >
      habits: TableDef<
        HabitsRow,
        Insert<
          HabitsRow,
          'user_id' | 'cadence' | 'target_count' | 'area_id' | 'goal_id' | 'color' | 'archived'
        >,
        Update<HabitsRow>
      >
      habit_logs: TableDef<
        HabitLogsRow,
        Insert<HabitLogsRow, 'user_id' | 'count'>,
        Update<HabitLogsRow>
      >
      exercise_logs: TableDef<
        ExerciseLogsRow,
        Insert<
          ExerciseLogsRow,
          'user_id' | 'duration_min' | 'intensity' | 'calories' | 'notes' | 'area_id'
        >,
        Update<ExerciseLogsRow>
      >
      food_logs: TableDef<
        FoodLogsRow,
        Insert<
          FoodLogsRow,
          'user_id' | 'meal' | 'calories' | 'protein' | 'carbs' | 'fat' | 'notes' | 'area_id'
        >,
        Update<FoodLogsRow>
      >
    }
  }
}
