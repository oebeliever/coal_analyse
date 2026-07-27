import { roundBankers, formatDecimals } from './round'

const CO2_TO_C = 0.2729       // 12.01/44.01
const H2O_TO_H = 0.1119       // 2.016/18.015
const NEGLIGIBLE_THRESHOLD = 0.0005  // 第二CO₂管可忽略阈值

/**
 * 判断第二CO₂管增量是否可忽略
 */
export function isCarbonM2Negligible(m1_2) {
  return m1_2 === null || m1_2 === undefined || Math.abs(m1_2) < NEGLIGIBLE_THRESHOLD
}

/**
 * 碳含量计算
 * @param {number} m - 煤样质量 (g)
 * @param {number} c1i - CO₂管①初质量 (g)
 * @param {number} c1f - CO₂管①终质量 (g)
 * @param {number|null} c2i - CO₂管②初质量 (g)
 * @param {number|null} c2f - CO₂管②终质量 (g)
 */
export function calcCarbon(m, c1i, c1f, c2i, c2f) {
  if (m === '' || m === null || m === undefined || Number(m) <= 0) return null
  if (c1i === '' || c1i === null || c1i === undefined) return null
  if (c1f === '' || c1f === null || c1f === undefined) return null

  const n_m = Number(m)
  const n_c1i = Number(c1i)
  const n_c1f = Number(c1f)
  const m1_1 = n_c1f - n_c1i

  let m1_2 = null
  let m1_total = m1_1
  let m1_total_display = m1_1

  if (c2i !== '' && c2i !== null && c2i !== undefined &&
      c2f !== '' && c2f !== null && c2f !== undefined) {
    m1_2 = Number(c2f) - Number(c2i)
    if (!isCarbonM2Negligible(m1_2)) {
      m1_total = m1_1 + m1_2
      m1_total_display = m1_total
    }
  }

  if (n_m <= 0) return null

  const cad_raw = (CO2_TO_C * m1_total / n_m) * 100
  const cad_rounded = roundBankers(cad_raw, 2)
  const cad_formatted = formatDecimals(cad_rounded, 2)

  return {
    m1_1: roundBankers(m1_1, 5),
    m1_2: m1_2 !== null ? roundBankers(m1_2, 5) : null,
    m1_total: roundBankers(m1_total, 5),
    m1_total_display: roundBankers(m1_total_display, 5),
    cad_raw: roundBankers(cad_raw, 5),
    cad_rounded,
    cad_formatted,
  }
}

/**
 * 氢含量计算
 * @param {number} m - 煤样质量 (g)
 * @param {number} hi - H₂O管初质量 (g)
 * @param {number} hf - H₂O管终质量 (g)
 * @param {number} m3 - 空白值 (g)
 * @param {number} mad - 水分 Mad (%)
 */
export function calcHydrogen(m, hi, hf, m3, mad) {
  if (m === '' || m === null || m === undefined || Number(m) <= 0) return null
  if (hi === '' || hi === null || hi === undefined) return null
  if (hf === '' || hf === null || hf === undefined) return null

  const n_m = Number(m)
  const n_hi = Number(hi)
  const n_hf = Number(hf)
  const n_m3 = (m3 === '' || m3 === null || m3 === undefined) ? 0 : Number(m3)
  const n_mad = (mad === '' || mad === null || mad === undefined) ? 0 : Number(mad)

  const m2 = n_hf - n_hi
  const corrected = m2 - n_m3

  if (n_m <= 0) return null

  const had_raw = (H2O_TO_H * corrected / n_m) * 100 - H2O_TO_H * n_mad
  const had_rounded = roundBankers(had_raw, 2)
  const had_formatted = formatDecimals(had_rounded, 2)

  return {
    m2: roundBankers(m2, 5),
    corrected: roundBankers(corrected, 5),
    had_raw: roundBankers(had_raw, 5),
    had_rounded,
    had_formatted,
  }
}

/**
 * 计算两组平均质量分数
 */
export function calcAverage(result1, result2) {
  if (!result1 || !result2) return null
  if (result1.cad_rounded == null && result1.had_rounded == null) return null
  if (result2.cad_rounded == null && result2.had_rounded == null) return null

  const val1 = result1.cad_rounded != null ? Number(result1.cad_rounded) : Number(result1.had_rounded)
  const val2 = result2.cad_rounded != null ? Number(result2.cad_rounded) : Number(result2.had_rounded)

  const avg = (val1 + val2) / 2
  return {
    avg_raw: roundBankers(avg, 5),
    avg_rounded: roundBankers(avg, 2),
    avg_formatted: formatDecimals(roundBankers(avg, 2), 2),
  }
}
