import { reactive, readonly, watch } from 'vue'

const STORAGE_KEY = 'ch-analysis-samples'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

function createEmptySample(id) {
  const empty = () => ({ c1i: '', c1f: '', c2i: '', c2f: '', furnaceId: '', slotPosition: '', co2_1TubeId: '', co2_2TubeId: '' })
  const hydrogenEmpty = () => ({ hi: '', hf: '', furnaceId: '', slotPosition: '', h2oTubeId: '' })
  return {
    id,
    carbon: { group1: empty(), group2: empty() },
    hydrogen: { group1: hydrogenEmpty(), group2: hydrogenEmpty() },
  }
}

const saved = loadFromStorage()
const state = reactive({
  samples: saved?.samples || { '样品-001': createEmptySample('样品-001') },
  currentSampleId: saved?.currentSampleId || '样品-001',
})

watch(
  () => ({ samples: state.samples, currentId: state.currentSampleId }),
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        samples: val.samples,
        currentSampleId: val.currentId,
      }))
    } catch (e) { /* quota exceeded */ }
  },
  { deep: true }
)

export function useSampleStore() {
  function getCurrentId() { return state.currentSampleId }

  function getAllIds() { return Object.keys(state.samples) }

  function getCurrentPageData(page) {
    const sample = state.samples[state.currentSampleId]
    if (!sample) return { group1: {}, group2: {} }
    // 确保数据在 store 中创建（否则返回新对象会断开响应式关联）
    if (!sample[page]) sample[page] = { group1: {}, group2: {} }
    return sample[page]
  }

  function updateField(page, group, field, value) {
    const sample = state.samples[state.currentSampleId]
    if (!sample) return
    if (!sample[page]) sample[page] = { group1: {}, group2: {} }
    sample[page][group][field] = value
  }

  function clearPage(page) {
    const sample = state.samples[state.currentSampleId]
    if (!sample) return
    const carbonEmpty = () => ({ c1i: '', c1f: '', c2i: '', c2f: '', furnaceId: '', slotPosition: '', co2_1TubeId: '', co2_2TubeId: '' })
    const hydrogenEmpty = () => ({ hi: '', hf: '', furnaceId: '', slotPosition: '', h2oTubeId: '' })
    sample[page] = page === 'carbon'
      ? { group1: carbonEmpty(), group2: carbonEmpty() }
      : { group1: hydrogenEmpty(), group2: hydrogenEmpty() }
  }

  function setCurrentSample(id) {
    if (state.samples[id]) state.currentSampleId = id
  }

  function createSample(id) {
    if (state.samples[id]) return false
    state.samples[id] = createEmptySample(id)
    state.currentSampleId = id
    return true
  }

  function deleteSample(id) {
    if (Object.keys(state.samples).length <= 1) return false
    delete state.samples[id]
    if (state.currentSampleId === id)
      state.currentSampleId = Object.keys(state.samples)[0]
    return true
  }

  function renameSample(oldId, newId) {
    if (!state.samples[oldId] || state.samples[newId]) return false
    state.samples[newId] = state.samples[oldId]
    state.samples[newId].id = newId
    delete state.samples[oldId]
    if (state.currentSampleId === oldId) state.currentSampleId = newId
    return true
  }

  /** 供 furnace.js 调用来写入管编号（绕过 readonly 代理） */
  function writeTubeIds(sampleId, page, group, tubeData) {
    const sample = state.samples[sampleId]
    if (!sample) return
    if (!sample[page]) sample[page] = { group1: {}, group2: {} }
    if (!sample[page][group]) sample[page][group] = {}
    Object.assign(sample[page][group], tubeData)
  }

  /** 直接从内部 state 读取组数据（绕过 readonly 代理，确保响应式） */
  function getRawGroupData(page, group) {
    const sample = state.samples[state.currentSampleId]
    if (!sample) return {}
    if (!sample[page]) sample[page] = { group1: {}, group2: {} }
    return sample[page][group] || {}
  }

  return {
    state: readonly(state),
    getCurrentId, getAllIds, getCurrentPageData,
    updateField, clearPage,
    setCurrentSample, createSample, deleteSample, renameSample,
    writeTubeIds, getRawGroupData,
  }
}
