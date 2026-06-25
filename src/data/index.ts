/**
 * The data-access layer: the single seam between the UI and the backend.
 * UI/hooks import repositories from here; if the backend is ever swapped, only
 * these modules change.
 */
export { areasRepo } from './areas'
export { sprintsRepo } from './sprints'
export { goalsRepo, goalProgress } from './goals'
export { tasksRepo, type TaskFilter } from './tasks'
export { habitsRepo } from './habits'
export { exerciseRepo } from './exercise'
export { foodRepo } from './food'
export { DataError } from './client'
export * from './types'
