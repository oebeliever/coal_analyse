import { reactive, readonly, watch } from 'vue'

const STORAGE_KEY = 'ch-analysis-blank'
const H2O_TOLERANCE = 0.0010
const CO2_TOLERANCE = 0.0005

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

const saved = loadFromStorage()
const state = reactive({
  sessions: saved?.sessions || [],
  activeSessionId: saved?.activeSessionId || null,
})

watch(
  () => ({ sessions: state.sessions, activeSessionId: state.activeSessionId }),
  (val) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)) } catch (e) { /* ignore */ }
  },
  { deep: true }
)

let nextId = (state.sessions.length > 0 ? Math.max(...state.sessions.map(s => s.id)) : 0) + 1

function createEmptySession() {
  return {
    id: 0,
    date: new Date().toISOString().split('T')[0],
    note: '',
    initial: { h2o: '', co2_1: '', co2_2: '' },
    groups: [{ h2o: '', co2_1: '', co2_2: '' }],  // 自动添加第1组
  }
}

/**
 * 计算某组的增量
 * @param {object} session - 会话对象
 * @param {number} groupIndex - 组索引 (0-based)
 * @returns {{ h2o: number|null, co2_1: number|null, co2_2: number|null }} 增量值
 */
function calcGroupIncrement(session, groupIndex) {
  const group = session.groups[groupIndex]
  if (!group) return null

  const h2o = Number(group.h2o)
  const co2_1 = Number(group.co2_1)
  const co2_2 = Number(group.co2_2)
  if (isNaN(h2o) || isNaN(co2_1) || isNaN(co2_2)) return null

  let h2o_inc, co2_1_inc, co2_2_inc

  if (groupIndex === 0) {
    // G1 - 初始质量
    const init = session.initial
    const i_h2o = Number(init.h2o)
    const i_co2_1 = Number(init.co2_1)
    const i_co2_2 = Number(init.co2_2)
    if (isNaN(i_h2o) || isNaN(i_co2_1) || isNaN(i_co2_2)) return null
    h2o_inc = h2o - i_h2o
    co2_1_inc = co2_1 - i_co2_1
    co2_2_inc = co2_2 - i_co2_2
  } else {
    // Gn - G(n-1)
    const prev = session.groups[groupIndex - 1]
    const p_h2o = Number(prev.h2o)
    const p_co2_1 = Number(prev.co2_1)
    const p_co2_2 = Number(prev.co2_2)
    if (isNaN(p_h2o) || isNaN(p_co2_1) || isNaN(p_co2_2)) return null
    h2o_inc = h2o - p_h2o
    co2_1_inc = co2_1 - p_co2_1
    co2_2_inc = co2_2 - p_co2_2
  }

  return { h2o: h2o_inc, co2_1: co2_1_inc, co2_2: co2_2_inc }
}

/**
 * 计算两组增量之间的差值：Δn - Δ(n-1)
 * @param {object} session - 会话对象
 * @param {number} groupIndex - 组索引 (0-based)，必须 >= 1
 * @returns {{ h2o: number|null, co2_1: number|null, co2_2: number|null }} 差值
 */
function calcIncrementComparison(session, groupIndex) {
  if (groupIndex < 1) return null
  const inc = calcGroupIncrement(session, groupIndex)
  const prevInc = calcGroupIncrement(session, groupIndex - 1)
  if (!inc || !prevInc) return null
  return {
    h2o: inc.h2o - prevInc.h2o,
    co2_1: inc.co2_1 - prevInc.co2_1,
    co2_2: inc.co2_2 - prevInc.co2_2,
  }
}

/**
 * 检查某一组是否通过恒重检查 (对于第1组总是true，因为无可比对象)
 * 对于第N组 (N>=2)，检查 |Δn - Δ(n-1)| 是否在允许范围内
 * 即相邻两组空白实验的增量差值：
 *   H₂O: ≤ 0.0010, CO₂: ≤ 0.0005
 */
function checkAcceptance(session, groupIndex) {
  if (groupIndex < 1) return { h2o: true, co2_1: true, co2_2: true, passed: true }

  const comp = calcIncrementComparison(session, groupIndex)
  if (!comp) return null

  const h2o_ok = Math.abs(comp.h2o) <= H2O_TOLERANCE
  const co2_1_ok = Math.abs(comp.co2_1) <= CO2_TOLERANCE
  const co2_2_ok = Math.abs(comp.co2_2) <= CO2_TOLERANCE

  return {
    h2o: h2o_ok,
    co2_1: co2_1_ok,
    co2_2: co2_2_ok,
    passed: h2o_ok && co2_1_ok && co2_2_ok,
  }
}

export function useBlankStore() {
  function createSession() {
    const session = createEmptySession()
    session.id = nextId++
    state.sessions.unshift(session)
    state.activeSessionId = session.id
    return session.id
  }

  function getActiveSession() {
    return state.sessions.find(s => s.id === state.activeSessionId) || null
  }

  function setActiveSession(id) {
    if (state.sessions.find(s => s.id === id)) state.activeSessionId = id
  }

  function updateInitial(field, value) {
    const session = getActiveSession()
    if (!session) return
    session.initial[field] = value
  }

  function addGroup(h2o, co2_1, co2_2) {
    const session = getActiveSession()
    if (!session) return -1

    session.groups.push({
      h2o: String(h2o),
      co2_1: String(co2_1),
      co2_2: String(co2_2),
    })

    return session.groups.length - 1
  }

  function updateGroup(index, field, value) {
    const session = getActiveSession()
    if (!session || !session.groups[index]) return
    session.groups[index][field] = value
  }

  function removeGroup(index) {
    const session = getActiveSession()
    if (!session) return false
    if (session.groups.length <= 1) return false
    session.groups.splice(index, 1)
    return true
  }

  function deleteSession(id) {
    const idx = state.sessions.findIndex(s => s.id === id)
    if (idx === -1) return false
    state.sessions.splice(idx, 1)
    if (state.activeSessionId === id) {
      state.activeSessionId = state.sessions.length > 0 ? state.sessions[0].id : null
    }
    return true
  }

  function updateSessionNote(note) {
    const session = getActiveSession()
    if (!session) return
    session.note = note
  }

  function getCurrentM3() {
    const session = getActiveSession()
    if (!session || !session.initial || session.groups.length === 0) return null

    // 找到第一个通过恒重检查的组（从第2组开始检查）
    // 要求 |Δn - Δ(n-1)| ≤ 允差，通过后 m₃ = (Δ(n-1) + Δn) / 2
    for (let i = 1; i < session.groups.length; i++) {
      const accept = checkAcceptance(session, i)
      if (accept && accept.passed) {
        const inc = calcGroupIncrement(session, i)       // Δn
        const prevInc = calcGroupIncrement(session, i - 1) // Δ(n-1)
        if (inc && prevInc) return (prevInc.h2o + inc.h2o) / 2
      }
    }

    // 如果只有第1组或都没通过，返回第1组的H₂O增量（如果有）
    if (session.groups.length >= 1) {
      const inc = calcGroupIncrement(session, 0)
      if (inc) return inc.h2o
    }

    return null
  }

  function getCurrentM3Formatted() {
    const m3 = getCurrentM3()
    if (m3 === null || m3 === undefined) return '-'
    return m3.toFixed(4)
  }

  return {
    state: readonly(state),
    createSession, getActiveSession, setActiveSession,
    updateInitial, addGroup, updateGroup, removeGroup,
    deleteSession, updateSessionNote,
    getCurrentM3, getCurrentM3Formatted,
    calcGroupIncrement, calcIncrementComparison, checkAcceptance,
    // Constants for UI
    H2O_TOLERANCE,
    CO2_TOLERANCE,
  }
}
