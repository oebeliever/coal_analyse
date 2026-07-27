/**
 * 四舍六入五单双修约规则
 * @param {number} value - 要修约的值
 * @param {number} decimals - 保留小数位数
 * @returns {number} 修约后的数值
 */
export function roundBankers(value, decimals) {
  if (value === null || value === undefined || isNaN(value)) return NaN
  if (!isFinite(value)) return value

  const factor = Math.pow(10, decimals)
  const sign = value < 0 ? -1 : 1
  const absVal = Math.abs(value)
  const scaled = absVal * factor

  // Detect when scaled is at or very close to X.5 (floating-point boundary case).
  // This handles cases like 1.015 * 100 = 101.49999999999999 (should be 101.5).
  // The EPS is safe because any genuine non-boundary value in this app has a
  // fractional part at least 0.1 away from 0.5 (values have at most 5-6 decimals).
  const EPS = 1e-12
  const fractional = scaled - Math.floor(scaled)
  const isHalfBoundary = Math.abs(fractional - 0.5) < EPS

  if (isHalfBoundary) {
    // Apply 四舍六入五单双 at the X.5 boundary
    const whole = Math.floor(scaled + EPS / 2)
    const rounded = whole % 2 === 0 ? whole : whole + 1
    return sign * rounded / factor
  }

  // Normal case: not at a X.5 boundary, use standard rounding
  const rounded = Math.round(scaled)
  return sign * rounded / factor
}

/**
 * 将数值格式化为指定小数位数的字符串
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatDecimals(value, decimals) {
  if (value === null || value === undefined || isNaN(value)) return '-'
  return value.toFixed(decimals)
}

/**
 * 取数组中的最小值，忽略 null/undefined/空字符串
 * @param {(number|null)[]} weights
 * @returns {number|null} 最小值，若无可比较值返回 null
 */
export function getMinWithEmpty(weights) {
  const valid = weights.filter(w => w !== null && w !== undefined && w !== '' && !isNaN(w))
  if (valid.length === 0) return null
  return Math.min(...valid)
}
