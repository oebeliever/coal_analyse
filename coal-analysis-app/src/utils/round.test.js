import { describe, it, expect } from 'vitest'
import { roundBankers, formatDecimals, getMinWithEmpty } from './round'

describe('roundBankers 四舍六入五单双', () => {
  // 四舍
  it('1.23456 保留4位应为 1.2346', () => {
    expect(roundBankers(1.23456, 4)).toBe(1.2346)
  })
  it('1.23454 保留4位应为 1.2345', () => {
    expect(roundBankers(1.23454, 4)).toBe(1.2345)
  })

  // 六入
  it('1.23456 保留3位应为 1.235', () => {
    expect(roundBankers(1.23456, 3)).toBe(1.235)
  })
  it('1.23458 保留4位应为 1.2346', () => {
    expect(roundBankers(1.23458, 4)).toBe(1.2346)
  })

  // 五单双
  it('1.2345 保留3位应为 1.234（前一位4为偶，舍）', () => {
    expect(roundBankers(1.2345, 3)).toBe(1.234)
  })
  it('1.2335 保留3位应为 1.234（前一位3为奇，进）', () => {
    expect(roundBankers(1.2335, 3)).toBe(1.234)
  })
  it('2.5 保留0位应为 2（前一位2为偶，舍）', () => {
    expect(roundBankers(2.5, 0)).toBe(2)
  })
  it('3.5 保留0位应为 4（前一位3为奇，进）', () => {
    expect(roundBankers(3.5, 0)).toBe(4)
  })

  // 边界
  it('NaN 应返回 NaN', () => {
    expect(roundBankers(NaN, 4)).toBeNaN()
  })
  it('null/undefined 应返回 NaN', () => {
    expect(roundBankers(null, 4)).toBeNaN()
    expect(roundBankers(undefined, 4)).toBeNaN()
  })
  it('0 保留4位应为 0', () => {
    expect(roundBankers(0, 4)).toBe(0)
  })
})

describe('formatDecimals', () => {
  it('1.23456 保留4位应为 "1.2346"', () => {
    expect(formatDecimals(1.23456, 4)).toBe('1.2346')
  })
  it('null 应返回 "-"', () => {
    expect(formatDecimals(null, 4)).toBe('-')
  })
})

describe('getMinWithEmpty', () => {
  it('普通数组返回最小值', () => {
    expect(getMinWithEmpty([1, 2, 3])).toBe(1)
  })
  it('忽略 null/undefined 后取最小值', () => {
    expect(getMinWithEmpty([null, 2, 3])).toBe(2)
    expect(getMinWithEmpty([undefined, 2, 3])).toBe(2)
  })
  it('全部为空返回 null', () => {
    expect(getMinWithEmpty([null, null])).toBeNull()
  })
  it('空数组返回 null', () => {
    expect(getMinWithEmpty([])).toBeNull()
  })
})
