'use client'

// Re-export of `next/link`, kept as a single import target so link-level
// behaviour (prefetch policy, analytics) has one place to live later.
//
// Note this wrapper costs nothing in bundle size: `next/link` is already a
// client component, so importing it directly from a server component would pull
// exactly the same code into the client bundle.
import Link from 'next/link'

export default Link
