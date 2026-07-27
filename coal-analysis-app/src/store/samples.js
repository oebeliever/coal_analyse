import { reactive, readonly, watch } from 'vue'

const STORAGE_KEY = 'coal-analysis-samples'

// 从localStorage加载数据
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

// 初始数据结构
function createEmptySample(id) {
  const empty = () => ({ containerId: '', m1: '', m2: '', d1: '', d2: '', d3: '' })
  return {
    id,
    moisture: { group1: empty(), group2: empty() },
    ash: { group1: empty(), group2: empty() },
    volatile: { group1: empty(), group2: empty() },
  }
}

const saved = loadFromStorage()
const state = reactive({
  samples: saved?.samples || { '样品-001': createEmptySample('样品-001') },
  currentSampleId: saved?.currentSampleId || '样品-001',
})

// 自动保存到localStorage
watch(
  () => ({ samples: state.samples, currentId: state.currentSampleId }),
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        samples: val.samples,
        currentSampleId: val.currentId,
      }))
    } catch (e) { /* quota exceeded etc */ }
  },
  { deep: true }
)

export function useSampleStore() {
  /** 获取当前样本ID */
  function getCurrentId() {
    return state.currentSampleId
  }

  /** 获取所有样本ID列表 */
  function getAllIds() {
    return Object.keys(state.samples)
  }

  /** 获取当前样本数据中的指定页面 */
  function getCurrentPageData(page) {
    const sample = state.samples[state.currentSampleId]
    if (!sample) return { group1: {}, group2: {} }
    return sample[page] || { group1: {}, group2: {} }
  }

  /** 更新当前样本的某个页面、某组的某个字段 */
  function updateField(page, group, field, value) {
    const sample = state.samples[state.currentSampleId]
    if (!sample) return
    if (!sample[page]) sample[page] = { group1: {}, group2: {} }
    sample[page][group][field] = value
  }

  /** 清空当前样本的某个页面的所有数据 */
  function clearPage(page) {
    const sample = state.samples[state.currentSampleId]
    if (!sample) return
    sample[page] = {
      group1: { containerId: '', m1: '', m2: '', d1: '', d2: '', d3: '' },
      group2: { containerId: '', m1: '', m2: '', d1: '', d2: '', d3: '' },
    }
  }

  /** 切换当前样本 */
  function setCurrentSample(id) {
    if (state.samples[id]) {
      state.currentSampleId = id
    }
  }

  /** 新建样本 */
  function createSample(id) {
    if (state.samples[id]) return false
    state.samples[id] = createEmptySample(id)
    state.currentSampleId = id
    return true
  }

  /** 删除样本 */
  function deleteSample(id) {
    if (Object.keys(state.samples).length <= 1) return false
    delete state.samples[id]
    if (state.currentSampleId === id) {
      state.currentSampleId = Object.keys(state.samples)[0]
    }
    return true
  }

  /** 重命名样本 */
  function renameSample(oldId, newId) {
    if (!state.samples[oldId] || state.samples[newId]) return false
    state.samples[newId] = state.samples[oldId]
    state.samples[newId].id = newId
    delete state.samples[oldId]
    if (state.currentSampleId === oldId) {
      state.currentSampleId = newId
    }
    return true
  }

  return {
    state: readonly(state),
    getCurrentId,
    getAllIds,
    getCurrentPageData,
    updateField,
    clearPage,
    setCurrentSample,
    createSample,
    deleteSample,
    renameSample,
  }
}
