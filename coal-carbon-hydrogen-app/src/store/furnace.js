import { reactive, readonly, watch } from 'vue'
import { useSampleStore } from './samples'

const STORAGE_KEY = 'ch-analysis-furnace'

const FURNACE_IDS = ['C0805', 'C0806', 'C0807']
const POSITIONS = ['前', '后']

function createDefaultSlots() {
  const slots = []
  FURNACE_IDS.forEach(fid => {
    POSITIONS.forEach(pos => {
      slots.push({
        id: `${fid}-${pos}`,
        furnaceId: fid,
        position: pos,
        tubes: { h2o: '', co2_1: '', co2_2: '' },
        assignment: { sampleId: '' }, // 一个样品同时做碳和氢
      })
    })
  })
  return slots
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

const saved = loadFromStorage()
const state = reactive({
  slots: saved?.slots || createDefaultSlots(),
})

watch(
  () => ({ slots: state.slots }),
  (val) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)) } catch (e) { /* ignore */ }
  },
  { deep: true }
)

/** 将槽位的管编号同步到样品的 carbon + hydrogen 两组数据 */
function syncTubesToSample(slot) {
  if (!slot.assignment.sampleId) return

  const { writeTubeIds } = useSampleStore()
  const group = slot.position === '前' ? 'group1' : 'group2'
  const tubeData = {
    furnaceId: slot.furnaceId,
    slotPosition: slot.position,
    h2oTubeId: slot.tubes.h2o,
    co2_1TubeId: slot.tubes.co2_1,
    co2_2TubeId: slot.tubes.co2_2,
  }

  ;['carbon', 'hydrogen'].forEach(page => {
    writeTubeIds(slot.assignment.sampleId, page, group, tubeData)
  })
}

/** 清除样品 store 中的管编号信息 */
function clearTubesFromSample(slot) {
  if (!slot.assignment.sampleId) return

  const { writeTubeIds } = useSampleStore()
  const group = slot.position === '前' ? 'group1' : 'group2'
  const emptyData = {
    furnaceId: '',
    slotPosition: '',
    h2oTubeId: '',
    co2_1TubeId: '',
    co2_2TubeId: '',
  }

  ;['carbon', 'hydrogen'].forEach(page => {
    writeTubeIds(slot.assignment.sampleId, page, group, emptyData)
  })
}

export function useFurnaceStore() {
  function getFurnaceSlots(furnaceId) {
    return state.slots.filter(s => s.furnaceId === furnaceId)
  }

  function updateTubes(slotId, field, value) {
    const slot = state.slots.find(s => s.id === slotId)
    if (!slot) return
    slot.tubes[field] = value
    if (slot.assignment.sampleId) syncTubesToSample(slot)
  }

  /** 分配样品到槽位（同时覆盖碳和氢测定）
   *  注意：不清除前一个样品的器皿号记录——样品数据应永久保存 */
  function assignSample(slotId, sampleId) {
    const slot = state.slots.find(s => s.id === slotId)
    if (!slot) return

    slot.assignment.sampleId = sampleId || ''

    if (sampleId) syncTubesToSample(slot)
  }

  function clearAssignment(slotId) {
    const slot = state.slots.find(s => s.id === slotId)
    if (!slot) return
    clearTubesFromSample(slot)
    slot.assignment.sampleId = ''
  }

  function getAllSlots() { return state.slots }

  function getSlotForSample(sampleId, group) {
    const groupName = group === 'group1' ? '前' : '后'
    return state.slots.find(s =>
      s.assignment.sampleId === sampleId && s.position === groupName
    ) || null
  }

  return {
    state: readonly(state),
    furnaceIds: FURNACE_IDS,
    positions: POSITIONS,
    getFurnaceSlots, updateTubes, assignSample,
    clearAssignment, getAllSlots, getSlotForSample,
  }
}
