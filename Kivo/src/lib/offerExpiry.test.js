import { describe, it, expect } from 'vitest'
import {
  TTL_OPTIONS,
  DEFAULT_TTL_SECONDS,
  computeExp,
  parseExp,
  secondsRemaining,
  formatRemaining,
} from './offerExpiry'

describe('parseExp', () => {
  it.each([
    ['missing', null],
    ['empty', ''],
    ['text', 'abc'],
    ['negative', '-5'],
    ['zero', '0'],
    ['decimal', '1700000000.5'],
    ['scientific notation', '1e9'],
    ['huge number', '99999999999999999999'],
    ['surrounding spaces', ' 1700000000 '],
  ])('rejects %s', (_, raw) => {
    expect(parseExp(raw)).toBeNull()
  })

  it('accepts a positive integer', () => {
    expect(parseExp('1700000000')).toBe(1700000000)
  })
})

describe('computeExp', () => {
  const nowMs = 1_700_000_000_999

  it.each(TTL_OPTIONS.map(opt => [opt.key, opt.value]))('adds %s (%i s) to now in seconds', (_, ttl) => {
    expect(computeExp(nowMs, ttl)).toBe(1_700_000_000 + ttl)
  })

  it('offers 15 min, 1 h, 24 h and 7 days with 24 h as default', () => {
    expect(TTL_OPTIONS.map(opt => opt.value)).toEqual([900, 3600, 86400, 604800])
    expect(DEFAULT_TTL_SECONDS).toBe(86400)
  })
})

describe('secondsRemaining', () => {
  const exp = 1_700_000_000

  it('counts down before exp', () => {
    expect(secondsRemaining(exp, (exp - 10) * 1000)).toBe(10)
    expect(secondsRemaining(exp, exp * 1000 - 1)).toBe(1)
  })

  it('is 0 exactly at exp', () => {
    expect(secondsRemaining(exp, exp * 1000)).toBe(0)
  })

  it('is 0 after exp', () => {
    expect(secondsRemaining(exp, (exp + 60) * 1000)).toBe(0)
  })
})

describe('formatRemaining', () => {
  it.each([
    [0, '00:00:00'],
    [59, '00:00:59'],
    [3599, '00:59:59'],
    [3600, '01:00:00'],
    [86399, '23:59:59'],
    [90061, '1d 01:01:01'],
  ])('formats %i s as %s', (seconds, expected) => {
    expect(formatRemaining(seconds)).toBe(expected)
  })
})
