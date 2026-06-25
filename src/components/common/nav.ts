import {
  CalendarDays,
  CheckSquare,
  Flag,
  LayoutGrid,
  LineChart,
  ListTodo,
  Repeat,
  Settings,
  Sun,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Show in the mobile bottom bar (kept to 5 for thumb reach). */
  primary?: boolean
}

export const navItems: NavItem[] = [
  { to: '/today', label: 'Today', icon: Sun, primary: true },
  { to: '/tasks', label: 'Tasks', icon: ListTodo, primary: true },
  { to: '/habits', label: 'Habits', icon: Repeat, primary: true },
  { to: '/board', label: 'Board', icon: LayoutGrid, primary: true },
  { to: '/goals', label: 'Goals', icon: Flag },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/log', label: 'Activity', icon: CheckSquare },
  { to: '/settings', label: 'Settings', icon: Settings, primary: true },
]
