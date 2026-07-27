import { describe, it, expect } from 'vitest'
import { calcCarbon, calcHydrogen, calcAverage, isCarbonM2Negligible } from './calculation'

describe('calcCarbon', () => {
  it('returns null when m is empty', () => {
    expect(calcCarbon('', '50', '50.5', '', '')).toBeNull()
  })

  it('returns null when c1i is empty', () => {
    expect(calcCarbon('0.2', '', '50.5', '', '')).toBeNull()
  })

  it('returns null when c1f is empty', () => {
    expect(calcCarbon('0.2', '50', '', '', '')).toBeNull()
  })

  it('calculates simple case with one CO2 tube', () => {
    const r = calcCarbon('0.2', '50.0000', '50.5555', '', '')
    expect(r).not.toBeNull()
    expect(r.m1_1).toBeCloseTo(0.5555, 4)
    expect(r.m1_2).toBeNull()
    expect(r.m1_total).toBeCloseTo(0.5555, 4)
    expect(r.cad_formatted).toMatch(/^\d+\.\d{2}$/)
    // Cad = 0.2729 * 0.5555 / 0.2 * 100 = 75.78...
    expect(r.cad_rounded).toBeCloseTo(75.78, 1)
  })

  it('ignores negligible second tube', () => {
    const r = calcCarbon('0.2', '50.0000', '50.5555', '48.0000', '48.0002')
    expect(r).not.toBeNull()
    expect(r.m1_2).toBeCloseTo(0.0002, 4)
    expect(r.m1_total).toBeCloseTo(r.m1_1, 4) // m1_2 is ignored
  })

  it('includes second tube when significant', () => {
    const r = calcCarbon('0.2', '50.0000', '50.5555', '48.0000', '48.0010')
    expect(r).not.toBeNull()
    expect(r.m1_2).toBeCloseTo(0.0010, 4)
    expect(r.m1_total).toBeCloseTo(0.5565, 4)
  })
})

describe('calcHydrogen', () => {
  it('returns null when m is empty', () => {
    expect(calcHydrogen('', '30', '30.1', '0.0005', '2.35')).toBeNull()
  })

  it('returns null when hi is empty', () => {
    expect(calcHydrogen('0.2', '', '30.1', '0.0005', '2.35')).toBeNull()
  })

  it('returns null when hf is empty', () => {
    expect(calcHydrogen('0.2', '30', '', '0.0005', '2.35')).toBeNull()
  })

  it('calculates hydrogen correctly', () => {
    // m2 = 30.1000 - 30.0000 = 0.1000, corrected = 0.1000 - 0.0005 = 0.0995
    // had = (0.1119 * 0.0995 / 0.2) * 100 - 0.1119 * 2.35
    //     = 5.567... - 0.2629... = 5.30...
    const r = calcHydrogen('0.2', '30.0000', '30.1000', '0.0005', '2.35')
    expect(r).not.toBeNull()
    expect(r.m2).toBeCloseTo(0.1, 4)
    expect(r.corrected).toBeCloseTo(0.0995, 4)
    expect(r.had_formatted).toMatch(/^\d+\.\d{2}$/)
  })

  it('handles zero blank value', () => {
    const r = calcHydrogen('0.2', '30.0000', '30.1000', '', '2.35')
    expect(r).not.toBeNull()
    expect(r.corrected).toBeCloseTo(0.1, 4)
  })

  it('handles zero moisture', () => {
    const r = calcHydrogen('0.2', '30.0000', '30.1000', '0.0005', '')
    expect(r).not.toBeNull()
    expect(r.had_formatted).toMatch(/^\d+\.\d{2}$/)
  })
})

describe('calcAverage', () => {
  it('calculates average of two carbon results', () => {
    const r1 = { cad_rounded: 75.80, had_rounded: null }
    const r2 = { cad_rounded: 75.64, had_rounded: null }
    const avg = calcAverage(r1, r2)
    expect(avg).not.toBeNull()
    expect(avg.avg_rounded).toBeCloseTo(75.72, 2)
  })

  it('calculates average of two hydrogen results', () => {
    const r1 = { cad_rounded: null, had_rounded: 4.53 }
    const r2 = { cad_rounded: null, had_rounded: 4.51 }
    const avg = calcAverage(r1, r2)
    expect(avg).not.toBeNull()
    expect(avg.avg_rounded).toBeCloseTo(4.52, 2)
  })

  it('returns null when both results are null', () => {
    expect(calcAverage(null, null)).toBeNull()
  })

  it('returns null when both results have null values', () => {
    expect(calcAverage({ cad_rounded: null, had_rounded: null }, { cad_rounded: null, had_rounded: null })).toBeNull()
  })
})

describe('isCarbonM2Negligible', () => {
  it('returns true for null', () => {
    expect(isCarbonM2Negligible(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(isCarbonM2Negligible(undefined)).toBe(true)
  })

  it('returns true for small values', () => {
    expect(isCarbonM2Negligible(0.0002)).toBe(true)
    expect(isCarbonM2Negligible(0.00049)).toBe(true)
  })

  it('returns false for significant values at threshold', () => {
    expect(isCarbonM2Negligible(0.0005)).toBe(false)
    expect(isCarbonM2Negligible(0.001)).toBe(false)
  })
})
