import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

/**
 * Request-scoped session reader.
 *
 * `auth.api.getSession` hits the database, so calling it from both a layout and
 * the page below it would cost two queries per request. React's `cache` keeps
 * the deduplication scoped to a single request, which is exactly the lifetime
 * we want — a module-level cache would leak sessions across users.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

/**
 * Same read, but for code that has already passed the `(protected)` layout and
 * therefore cannot legitimately run without a session.
 *
 * Two reasons this exists rather than an `if (!session) redirect(...)` in every
 * page:
 *
 * 1. TypeScript cannot know the layout ran, so `getSession()` stays
 *    `Session | null` in the page. Repeating the guard is what narrows it —
 *    which means one forgotten guard is a runtime crash, not a compile error.
 * 2. The guard belongs in exactly one place.
 *
 * Deliberately not wrapped in `cache`: `redirect()` works by throwing a
 * control-flow error, and there is no reason to memoise that. The expensive
 * part — the database query — is already deduplicated inside `getSession`.
 */
export async function requireSession() {
  const session = await getSession()

  if (!session) {
    redirect('/sign-in')
  }

  return session
}
