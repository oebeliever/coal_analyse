<template>
  <div class="page furnace-page">
    <h2 class="page-title">炉布局可视化</h2>
    <p class="page-subtitle">三节炉器皿固定配置 — 一个样品同时测定碳和氢</p>

    <div class="furnace-grid">
      <div v-for="fid in furnaceIds" :key="fid" class="furnace-card">
        <!-- 炉头 -->
        <div class="furnace-header">
          <span class="furnace-icon">🔥</span>
          <span class="furnace-id">{{ fid }}</span>
          <span class="furnace-status" :class="furnaceStatus(fid).cls">{{ furnaceStatus(fid).label }}</span>
        </div>

        <!-- 两个槽位：前 / 后 -->
        <div class="slots">
          <div v-for="slot in getFurnaceSlots(fid)" :key="slot.id" class="slot-card">

            <div class="slot-header">
              <span class="slot-position">{{ slot.position }}组</span>
            </div>

            <!-- 管编号 -->
            <div class="tubes-config">
              <div class="tube-row">
                <span class="tube-icon">💧</span>
                <span class="tube-label">H₂O管</span>
                <input type="text" class="tube-input" :value="slot.tubes.h2o"
                  @input="updateTubes(slot.id, 'h2o', $event.target.value)"
                  placeholder="如 H-001" />
              </div>
              <div class="tube-row">
                <span class="tube-icon">🧪</span>
                <span class="tube-label">CO₂管①</span>
                <input type="text" class="tube-input" :value="slot.tubes.co2_1"
                  @input="updateTubes(slot.id, 'co2_1', $event.target.value)"
                  placeholder="如 C-101" />
              </div>
              <div class="tube-row">
                <span class="tube-icon">🧪</span>
                <span class="tube-label">CO₂管②</span>
                <input type="text" class="tube-input" :value="slot.tubes.co2_2"
                  @input="updateTubes(slot.id, 'co2_2', $event.target.value)"
                  placeholder="如 C-102" />
              </div>
            </div>

            <!-- 样品分配（同时用于碳和氢） -->
            <div class="assignment-area">
              <label class="assign-label">样品：</label>
              <select class="assign-select"
                :value="slot.assignment.sampleId"
                @change="onAssignChange(slot.id, $event.target.value)">
                <option value="">— 空闲 —</option>
                <option v-for="sid in sampleIds" :key="sid" :value="sid">
                  {{ sid }}
                </option>
              </select>
              <button v-if="slot.assignment.sampleId" class="goto-btn"
                @click="jumpToCarbon(slot)" title="跳转碳测定">C</button>
              <button v-if="slot.assignment.sampleId" class="goto-btn goto-h"
                @click="jumpToHydrogen(slot)" title="跳转氢测定">H</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFurnaceStore } from '@/store/furnace'
import { useSampleStore } from '@/store/samples'

const router = useRouter()
const { state, furnaceIds, getFurnaceSlots, updateTubes, assignSample, clearAssignment } = useFurnaceStore()
const { state: sampleState, getAllIds, setCurrentSample } = useSampleStore()
const sampleIds = computed(() => getAllIds())

function furnaceStatus(fid) {
  const slots = getFurnaceSlots(fid)
  const hasWork = slots.some(s => s.assignment.sampleId)
  return hasWork
    ? { label: '使用中', cls: 'busy' }
    : { label: '空闲', cls: 'idle' }
}

function onAssignChange(slotId, sampleId) {
  if (!sampleId) {
    clearAssignment(slotId)
  } else {
    assignSample(slotId, sampleId)
  }
}

function jumpToCarbon(slot) {
  if (!slot.assignment.sampleId) return
  setCurrentSample(slot.assignment.sampleId)
  router.push('/carbon')
}

function jumpToHydrogen(slot) {
  if (!slot.assignment.sampleId) return
  setCurrentSample(slot.assignment.sampleId)
  router.push('/hydrogen')
}
</script>

<style scoped>
.page { padding-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #222; margin-bottom: 4px; }
.page-subtitle { font-size: 12px; color: #888; margin-bottom: 16px; }

.furnace-grid { display: flex; flex-direction: column; gap: 20px; }

.furnace-card { background: #fff; border-radius: 14px; border: 1px solid #e0e0e0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.furnace-header { display: flex; align-items: center; gap: 8px; padding: 14px 16px; background: linear-gradient(135deg, #ff6d00, #e65100); color: #fff; }
.furnace-icon { font-size: 20px; }
.furnace-id { font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; }
.furnace-status { margin-left: auto; font-size: 11px; padding: 2px 10px; border-radius: 10px; background: rgba(255,255,255,0.25); }
.furnace-status.idle { background: rgba(255,255,255,0.15); opacity: 0.7; }

.slots { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.slot-card { border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; background: #fafafa; }
.slot-header { margin-bottom: 10px; }
.slot-position { font-size: 14px; font-weight: 700; color: #333; padding: 2px 10px; background: #e8e8e8; border-radius: 4px; display: inline-block; }

.tubes-config { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; padding: 10px; background: #f0f4ff; border-radius: 8px; }
.tube-row { display: flex; align-items: center; gap: 6px; }
.tube-icon { font-size: 14px; width: 20px; text-align: center; }
.tube-label { font-size: 12px; color: #555; min-width: 60px; }
.tube-input { flex: 1; padding: 5px 8px; border: 1px solid #d0ddf5; border-radius: 5px; font-size: 13px; font-family: 'Courier New', monospace; outline: none; background: #fff; max-width: 140px; }
.tube-input:focus { border-color: #1a73e8; }

.assignment-area { display: flex; align-items: center; gap: 6px; padding-top: 10px; border-top: 1px dashed #ddd; }
.assign-label { font-size: 12px; color: #888; white-space: nowrap; }
.assign-select { flex: 1; padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; outline: none; background: #fff; min-width: 0; }
.assign-select:focus { border-color: #1a73e8; }
.goto-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #1a73e8; background: #e8f0fe; color: #1a73e8; font-size: 14px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.goto-btn:hover { background: #1a73e8; color: #fff; }
.goto-btn.goto-h { border-color: #7b1fa2; background: #f3e8ff; color: #7b1fa2; }
.goto-btn.goto-h:hover { background: #7b1fa2; color: #fff; }
</style>
