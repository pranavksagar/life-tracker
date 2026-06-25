/**
 * Domain types for the app, derived from the database schema. UI and hooks
 * import from here (never from database.types directly) so the row shapes have
 * friendly names and a single import site.
 */
import type { Database } from '@/lib/database.types'

type Tables = Database['public']['Tables']

export type Area = Tables['areas']['Row']
export type NewArea = Tables['areas']['Insert']
export type AreaPatch = Tables['areas']['Update']

export type Sprint = Tables['sprints']['Row']
export type NewSprint = Tables['sprints']['Insert']
export type SprintPatch = Tables['sprints']['Update']

export type Goal = Tables['goals']['Row']
export type NewGoal = Tables['goals']['Insert']
export type GoalPatch = Tables['goals']['Update']

export type Task = Tables['tasks']['Row']
export type NewTask = Tables['tasks']['Insert']
export type TaskPatch = Tables['tasks']['Update']

export type Habit = Tables['habits']['Row']
export type NewHabit = Tables['habits']['Insert']
export type HabitPatch = Tables['habits']['Update']

export type HabitLog = Tables['habit_logs']['Row']
export type NewHabitLog = Tables['habit_logs']['Insert']

export type ExerciseLog = Tables['exercise_logs']['Row']
export type NewExerciseLog = Tables['exercise_logs']['Insert']
export type ExerciseLogPatch = Tables['exercise_logs']['Update']

export type FoodLog = Tables['food_logs']['Row']
export type NewFoodLog = Tables['food_logs']['Insert']
export type FoodLogPatch = Tables['food_logs']['Update']

export type {
  Priority,
  TaskStatus,
  SprintStatus,
  GoalStatus,
  HabitCadence,
  Intensity,
  Meal,
} from '@/lib/database.types'
export type { Recurrence, RecurrenceFreq } from '@/lib/recurrence'
