import { describe, expect, test } from 'vitest'
import { formatIp, parseUserAgent } from '@/lib/user-agent'

const CHROME_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const EDGE_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
const OPERA_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0'
const FIREFOX_LINUX =
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
const SAFARI_MACOS =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const SAFARI_IPAD =
  'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'

describe('parseUserAgent', () => {
  test.each([
    [CHROME_WINDOWS, 'Chrome on Windows'],
    [EDGE_WINDOWS, 'Edge on Windows'],
    [OPERA_WINDOWS, 'Opera on Windows'],
    [FIREFOX_LINUX, 'Firefox on Linux'],
    [SAFARI_MACOS, 'Safari on macOS'],
  ])('parses %s', (ua, expected) => {
    expect(parseUserAgent(ua)).toBe(expected)
  })

  // Regression: "Linux" is a substring of the Android user agent, so matching
  // Linux first reported every Android device as a desktop Linux machine.
  test('does not mistake Android for desktop Linux', () => {
    expect(parseUserAgent(CHROME_ANDROID)).toBe('Chrome on Android')
  })

  // Regression: iOS user agents contain "like Mac OS X", so matching macOS
  // first reported every iPhone as a Mac.
  test('does not mistake iOS for macOS', () => {
    expect(parseUserAgent(SAFARI_IPHONE)).toBe('Safari on iOS')
    expect(parseUserAgent(SAFARI_IPAD)).toBe('Safari on iPadOS')
  })

  test('returns a placeholder for a missing user agent', () => {
    expect(parseUserAgent(null)).toBe('Unknown device')
    expect(parseUserAgent(undefined)).toBe('Unknown device')
    expect(parseUserAgent('')).toBe('Unknown device')
  })

  test('falls back to unknown for an unrecognised user agent', () => {
    expect(parseUserAgent('curl/8.4.0')).toBe('Unknown device')
  })
})

describe('formatIp', () => {
  test('labels loopback addresses', () => {
    expect(formatIp('::1')).toBe('Localhost')
    expect(formatIp('::ffff:127.0.0.1')).toBe('Localhost')
    expect(formatIp('127.0.0.1')).toBe('Localhost')
  })

  test('passes through a public address', () => {
    expect(formatIp('203.0.113.7')).toBe('203.0.113.7')
  })

  test('handles a missing address', () => {
    expect(formatIp(null)).toBe('Unknown IP')
    expect(formatIp(undefined)).toBe('Unknown IP')
    expect(formatIp('')).toBe('Unknown IP')
  })
})
