import type { ReactNode } from 'react'

import { requireSession } from '@/lib/session'

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  // The single auth guard for every route under `(protected)`. Nested pages
  // call `requireSession()` too, but only to narrow the type — the redirect
  // decision lives here.
  await requireSession()

  return <>{children}</>
}
