import { Outlet, Link, ScrollRestoration } from 'react-router'
import { Wordmark } from '@/components/ui/Wordmark'
import { AudioToggle } from '@/components/ui/AudioToggle'
import { FilmGrain } from '@/components/ui/FilmGrain'
import { useAmbience } from '@/hooks/useAmbience'

/** Cadre commun : en-tête discret, grain de pellicule, ambiance sonore. */
export function AppShell() {
  useAmbience()
  return (
    <div className="relative min-h-dvh bg-ink text-paper">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="pointer-events-auto">
          <Wordmark />
        </Link>
        <div className="pointer-events-auto">
          <AudioToggle />
        </div>
      </header>
      <Outlet />
      <FilmGrain />
      <ScrollRestoration />
    </div>
  )
}
