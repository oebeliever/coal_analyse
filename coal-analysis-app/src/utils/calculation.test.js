import { describe, it, expect } from 'vitest'
import { calcMoisture, calcAsh, calcVolatile, calcAverage } from './calculation'

describe('calcMoisture 水分计算', () => {
  it('标准输入应正确计算', () => {
    const result = calcMoisture(20, 10, [29.5, 29.4, 29.3])
    // m3 = min(29.5, 29.4, 29.3) = 29.3
    // m4 = 20 + 10 - 29.3 = 0.7
    // m5 = 0.7 / 10 = 0.07
    expect(result.m3).toBe(29.3)
    expect(result.m4).toBeCloseTo(0.7, 5)
    expect(result.m5_raw).toBeCloseTo(0.07, 5)
    expect(result.m5_formatted).toBe('0.0700')
  })

  it('空干燥后质量应忽略', () => {
    const result = calcMoisture(20, 10, [29.5, null, 29.4])
    // m3 = min(29.5, 29.4) = 29.4
    // m4 = 20 + 10 - 29.4 = 0.6
    expect(result.m3).toBe(29.4)
    expect(result.m4).toBeCloseTo(0.6, 5)
  })

  it('全部空干燥质量应返回 null', () => {
    const result = calcMoisture(20, 10, [null, null, null])
    expect(result.m3).toBeNull()
    expect(result.m5_formatted).toBe('-')
  })

  it('m2为0或空时应返回空', () => {
    const r1 = calcMoisture(20, 0, [29.5])
    expect(r1.m5_formatted).toBe('-')
    const r2 = calcMoisture(20, null, [29.5])
    expect(r2.m5_formatted).toBe('-')
  })
})

describe('calcAsh 灰分计算', () => {
  it('标准输入应正确计算', () => {
    const result = calcAsh(20, 10, [21.5, 21.4, 21.3])
    // m3 = min(21.5, 21.4, 21.3) = 21.3
    // m4 = 21.3 - 20 = 1.3
    // m5 = 1.3 / 10 = 0.13
    expect(result.m3).toBe(21.3)
    expect(result.m4).toBeCloseTo(1.3, 5)
    expect(result.m5_raw).toBeCloseTo(0.13, 5)
  })
})

describe('calcVolatile 挥发分计算', () => {
  it('标准输入应减去水分平均质量分数', () => {
    const result = calcVolatile(20, 10, [28.5, 28.4], 0.07)
    // m3 = min(28.5, 28.4) = 28.4
    // m4 = 20 + 10 - 28.4 = 1.6
    // m5_raw = 1.6/10 - 0.07 = 0.09
    expect(result.m3).toBe(28.4)
    expect(result.m4).toBeCloseTo(1.6, 5)
    expect(result.m5_raw).toBeCloseTo(0.09, 5)
  })
})

describe('calcAverage 计算平均值', () => {
  it('两组结果应正确计算平均值', () => {
    const r1 = calcMoisture(20, 10, [29.5, 29.4, 29.3])
    const r2 = calcMoisture(20, 10, [29.6, 29.5, 29.4])
    const avg = calcAverage(r1, r2)
    // r1.m5_rounded = 0.07, r2.m5_rounded = 0.06
    // avg = (0.07 + 0.06) / 2 = 0.065 → keep 4 decimals with banker's rounding: 0.0650
    expect(avg).not.toBeNull()
    expect(avg.avg_rounded).toBeCloseTo(0.065, 5)
    expect(avg.avg_formatted).toBe('0.0650')
  })

  it('任一结果为空应返回 null', () => {
    expect(calcAverage(null, { m5_rounded: 0.1 })).toBeNull()
  })
})
