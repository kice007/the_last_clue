import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { PlaceholderScreen } from '@/components/layout/PlaceholderScreen'
import { LandingPage } from '@/features/landing/LandingPage'
import { NotFound } from './NotFound'


/**
 * Carte des écrans (cahier des charges §3.2).
 * Les chemins sont techniques et neutres ; les libellés visibles passent par i18n.
 * Phase indiquée = phase du cahier des charges où l'écran sera construit.
 */
export const router = createBrowserRouter([
  // Vertical slice 3D (prototype local, hors session) — cahier des assets §10
  ...(import.meta.env.DEV
    ? [{ path: '/prototype/assets', lazy: async () => ({ Component: (await import('@/features/dev/AssetGalleryPage')).AssetGalleryPage }) }]
    : []),
  {
    path: '/prototype/bureau',
    lazy: async () => ({ Component: (await import('@/features/investigation/StudyPrototypePage')).StudyPrototypePage }),
    errorElement: <NotFound />,
  },
  {
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'auth', element: <PlaceholderScreen screen="auth" phase={2} /> },
      { path: 'profile', element: <PlaceholderScreen screen="profile" phase={2} /> },
      { path: 'lobby', element: <PlaceholderScreen screen="lobby" phase={2} /> },
      { path: 'lobby/:roomCode', element: <PlaceholderScreen screen="lobby" phase={2} /> },
      { path: 'cases', element: <PlaceholderScreen screen="cases" phase={2} /> },
      {
        path: 'session/:sessionId',
        children: [
          { path: 'briefing', element: <PlaceholderScreen screen="briefing" phase={3} /> },
          { path: 'office', element: <PlaceholderScreen screen="office" phase={3} /> },
          { path: 'scene/:locationId', element: <PlaceholderScreen screen="scene" phase={3} /> },
          { path: 'evidence', element: <PlaceholderScreen screen="evidence" phase={3} /> },
          { path: 'suspects', element: <PlaceholderScreen screen="suspects" phase={4} /> },
          { path: 'interrogation/:characterId', element: <PlaceholderScreen screen="interrogation" phase={4} /> },
          { path: 'board', element: <PlaceholderScreen screen="board" phase={4} /> },
          { path: 'verdict', element: <PlaceholderScreen screen="verdict" phase={5} /> },
          { path: 'revelation', element: <PlaceholderScreen screen="revelation" phase={5} /> },
        ],
      },
      { path: 'history', element: <PlaceholderScreen screen="history" phase={6} /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
