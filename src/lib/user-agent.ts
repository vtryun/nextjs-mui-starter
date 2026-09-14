/**
 * Order matters in both tables: the first pattern that matches wins, so
 * narrower identifiers must precede the broader ones they are substrings of.
 *
 * This is the bug this file was extracted to make testable — a previous version
 * checked "Mac OS" before "iPhone" and "Linux" before "Android", so every iOS
 * device was reported as macOS and every Android device as Linux.
 */
const BROWSER_PATTERNS: readonly (readonly [string, string])[] = [
  // Edge and Opera both impersonate Chrome, so they must be tested first.
  ['Edg/', 'Edge'],
  ['OPR/', 'Opera'],
  ['Firefox/', 'Firefox'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari'],
]

const OS_PATTERNS: readonly (readonly [string, string])[] = [
  ['Windows', 'Windows'],
  // Android user agents contain "Linux"; test Android first.
  ['Android', 'Android'],
  // iOS user agents contain "like Mac OS X"; test the Apple mobile markers first.
  ['iPhone', 'iOS'],
  ['iPad', 'iPadOS'],
  ['Mac OS', 'macOS'],
  ['Linux', 'Linux'],
]

function matchPattern(
  value: string,
  patterns: readonly (readonly [string, string])[],
): string | null {
  for (const [needle, label] of patterns) {
    if (value.includes(needle)) return label
  }
  return null
}

const LOCALHOST_ADDRESSES = new Set([
  '::1',
  '::ffff:127.0.0.1',
  '0000:0000:0000:0000:0000:0000:0000:0000',
  '127.0.0.1',
])

export function formatIp(ip: string | null | undefined): string {
  if (!ip) return 'Unknown IP'
  return LOCALHOST_ADDRESSES.has(ip) ? 'Localhost' : ip
}

/**
 * Known limitation: iPadOS 13+ reports itself as macOS Safari, so those devices
 * are still labelled macOS. Reliable detection needs feature checks rather than
 * a user-agent string.
 */
export function parseUserAgent(ua: string | null | undefined): string {
  if (!ua) return 'Unknown device'

  const browser = matchPattern(ua, BROWSER_PATTERNS)
  const os = matchPattern(ua, OS_PATTERNS)

  if (!browser && !os) return 'Unknown device'

  return `${browser ?? 'Unknown browser'} on ${os ?? 'Unknown OS'}`
}
