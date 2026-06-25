import { NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { navItems } from './nav'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function AppShell() {
  const { user, signOut } = useAuth()
  const initial = (user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="bg-card hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-bold">
            L
          </div>
          <span className="font-semibold tracking-tight">Life Tracker</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => sideLink(isActive)}>
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <UserMenu email={user?.email ?? ''} initial={initial} onSignOut={signOut} />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="bg-card pt-safe sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded text-xs font-bold">
              L
            </div>
            <span className="font-semibold">Life Tracker</span>
          </div>
          <UserMenuButton email={user?.email ?? ''} initial={initial} onSignOut={signOut} />
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="bg-card pb-safe fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t md:hidden">
        {navItems
          .filter((i) => i.primary)
          .map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => tabLink(isActive)}>
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </div>
  )
}

function sideLink(isActive: boolean) {
  return cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
  )
}

function tabLink(isActive: boolean) {
  return cn(
    'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors',
    isActive ? 'text-primary' : 'text-muted-foreground',
  )
}

function UserMenu({
  email,
  initial,
  onSignOut,
}: {
  email: string
  initial: string
  onSignOut: () => void
}) {
  return (
    <div className="border-t p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initial}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut}>
            <LogOut className="size-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function UserMenuButton({
  email,
  initial,
  onSignOut,
}: {
  email: string
  initial: string
  onSignOut: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
