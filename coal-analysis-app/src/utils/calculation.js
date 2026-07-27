import { roundBankers, getMinWithEmpty, formatDecimals } from './round'

/**
 * 通用分析计算
 * @param {number} m1 器皿质量
 * @param {number} m2 物质质量
 * @param {(number|null)[]} dryWeights 三次干燥后质量数组
 * @param {'moisture'|'ash'|'volatile'} type 分析类型
 * @param {number} avgMoisture 水分平均质量分数（仅挥发分需要）
 * @returns {{ m3: number|null, m4: number|null, m5_raw: number|null, m5_rounded: number, m5_formatted: string }}
 */
function baseCalc(m1, m2, dryWeights, type, avgMoisture = 0) {
  const m3 = getMinWithEmpty(dryWeights)

  // 如果任何必要参数缺失或无效，返回空结果
  if (m1 === null || m1 === undefined || m1 === '' || Number(m1) < 0 ||
      m2 === null || m2 === undefined || m2 === '' || Number(m2) <= 0 ||
      m3 === null) {
    return { m3: null, m4: null, m5_raw: null, m5_rounded: null, m5_formatted: '-' }
  }

  const n_m1 = Number(m1)
  const n_m2 = Number(m2)
  const n_m3 = Number(m3)
  let m4

  switch (type) {
    case 'moisture':
      // 水分：减少的质量 = m1 + m2 - m3
      m4 = n_m1 + n_m2 - n_m3
      break
    case 'ash':
      // 灰分：剩余的质量 = m3 - m1
      m4 = n_m3 - n_m1
      break
    case 'volatile':
      // 挥发分：减少的质量 = m1 + m2 - m3
      m4 = n_m1 + n_m2 - n_m3
      break
    default:
      m4 = 0
  }

  if (m4 < 0) m4 = 0
  let m5_raw = m4 / n_m2

  // 挥发分需要减去水分平均质量分数
  if (type === 'volatile') {
    m5_raw = m5_raw - (avgMoisture || 0)
    if (m5_raw < 0) m5_raw = 0
  }

  const m5_rounded = roundBankers(m5_raw, 4)
  const m5_formatted = formatDecimals(m5_rounded, 4)

  return {
    m3: n_m3,
    m4: roundBankers(m4, 5),
    m5_raw: roundBankers(m5_raw, 5),
    m5_rounded,
    m5_formatted,
  }
}

/**
 * 水分计算
 */
export function calcMoisture(m1, m2, dryWeights) {
  return baseCalc(m1, m2, dryWeights, 'moisture')
}

/**
 * 灰分计算
 */
export function calcAsh(m1, m2, dryWeights) {
  return baseCalc(m1, m2, dryWeights, 'ash')
}

/**
 * 挥发分计算（需要水分平均质量分数）
 */
export function calcVolatile(m1, m2, dryWeights, avgMoisture = 0) {
  return baseCalc(m1, m2, dryWeights, 'volatile', avgMoisture)
}

/**
 * 计算两组平均质量分数，并修约
 */
export function calcAverage(result1, result2) {
  if (!result1 || !result2) return null
  if (result1.m5_rounded == null || result2.m5_rounded == null) return null

  const avg = (Number(result1.m5_rounded) + Number(result2.m5_rounded)) / 2
  return {
    avg_raw: roundBankers(avg, 5),
    avg_rounded: roundBankers(avg, 4),
    avg_formatted: formatDecimals(roundBankers(avg, 4), 4),
  }
}
