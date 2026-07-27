<template>
  <div class="page hydrogen-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">氢测定 — 三节炉法</h2>
        <p class="page-subtitle">依据 GB/T 476-2008</p>
      </div>
      <button @click="clearAll" class="clear-btn">🗑️ 清空数据</button>
    </div>

    <!-- 固定煤样质量 -->
    <div class="fixed-mass">
      <span class="mass-label">煤样质量 m =</span>
      <span class="mass-value">0.2000 g</span>
      <span class="mass-note">（固定值）</span>
    </div>

    <!-- 水分 Mad 输入（共享） -->
    <div class="mad-section">
      <label class="mad-label">水分 Mad (％)：</label>
      <input type="number" step="any" class="mad-input"
        :value="moistureAvg"
        @input="onMadInput($event.target.value)"
        placeholder="如 2.35" />
      <span class="mad-hint" v-if="moistureAvg !== null">已设置</span>
      <span class="mad-hint missing" v-else>请输入</span>
    </div>

    <!-- 空白值引用 -->
    <div class="blank-ref" v-if="blankValue !== null">
      <span class="ref-label">引用空白值 m₃：</span>
      <span class="ref-value">{{ blankFormatted }} g</span>
    </div>
    <div class="blank-missing" v-else>
      ⚠️ 请先在"空白值"页设置空白值 m₃
    </div>

    <TimerPanel :presets="timerPresets" />

    <div class="dual-column">
      <InputGroup
        title="第1组"
        :fields="fields"
        :model-value="group1"
        @update:model-value="onUpdateGroup1"
        :tube-info="tubeInfo1"
      />
      <InputGroup
        title="第2组"
        :fields="fields"
        :model-value="group2"
        @update:model-value="onUpdateGroup2"
        :tube-info="tubeInfo2"
      />
    </div>

    <div class="results-section">
      <ResultCard title="第1组结果" :items="result1Items" />
      <ResultCard title="第2组结果" :items="result2Items" />
    </div>

    <div class="average-section" v-if="average">
      <div class="avg-card">
        <div class="avg-label">两组平均氢质量分数 Had</div>
        <div class="avg-value">{{ average.avg_formatted }} %</div>
        <div class="avg-note">四舍六入五单双，保留两位小数</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
import InputGroup from '@/components/InputGroup.vue'
import ResultCard from '@/components/ResultCard.vue'
import TimerPanel from '@/components/TimerPanel.vue'
import { calcHydrogen, calcAverage } from '@/utils/calculation'
import { formatDecimals } from '@/utils/round'
import { useCoalStore } from '@/store/results'
import { useSampleStore } from '@/store/samples'
import { useBlankStore } from '@/store/blank'

const PAGE = 'hydrogen'

const { state: moistureState, setMoistureAvg } = useCoalStore()
const moistureAvg = computed(() => moistureState.moistureAvg)
const moistureAvgFormatted = computed(() => moistureState.moistureAvgFormatted)

const { getCurrentM3, getCurrentM3Formatted } = useBlankStore()
const blankValue = computed(() => getCurrentM3())
const blankFormatted = computed(() => getCurrentM3Formatted())

const { state: sampleState, getCurrentPageData, updateField, clearPage, getRawGroupData } = useSampleStore()

const timerPresets = [
  { seconds: 60, label: '1min — 半入炉' },
  { seconds: 120, label: '2min — 全入炉' },
  { seconds: 120, label: '2min — 至中央' },
  { seconds: 1080, label: '18min — 保温' },
  { seconds: 120, label: '2min — 取系统' },
  { seconds: 600, label: '10min — 冷却放置' },
]

const FIXED_MASS = 0.2

const fields = [
  { key: 'hi', label: 'H₂O管初质量', placeholder: '如 30.4567' },
  { key: 'hf', label: 'H₂O管终质量', placeholder: '如 30.5678' },
]

const emptyForm = () => ({ hi: '', hf: '', furnaceId: '', slotPosition: '', h2oTubeId: '' })
const group1 = reactive(emptyForm())
const group2 = reactive(emptyForm())

// 直接从 sample store 读取管编号（响应式，炉布局同步后自动更新）
const tubeInfo1 = computed(() => {
  const g = getRawGroupData(PAGE, 'group1')
  if (!g || !g.furnaceId) return null
  return { furnaceId: g.furnaceId, slotPosition: g.slotPosition, h2o: g.h2oTubeId }
})
const tubeInfo2 = computed(() => {
  const g = getRawGroupData(PAGE, 'group2')
  if (!g || !g.furnaceId) return null
  return { furnaceId: g.furnaceId, slotPosition: g.slotPosition, h2o: g.h2oTubeId }
})

function loadFromStore() {
  const data = getCurrentPageData(PAGE)
  if (data.group1) Object.assign(group1, { ...emptyForm(), ...data.group1 })
  if (data.group2) Object.assign(group2, { ...emptyForm(), ...data.group2 })
}

function saveGroup(group, data) {
  Object.entries(data).forEach(([key, val]) => updateField(PAGE, group, key, val))
}

function onUpdateGroup1(data) { Object.assign(group1, data); saveGroup('group1', data) }
function onUpdateGroup2(data) { Object.assign(group2, data); saveGroup('group2', data) }

function onMadInput(val) {
  const num = val === '' ? null : Number(val)
  const formatted = num !== null && !isNaN(num) ? num.toFixed(2) : '-'
  setMoistureAvg(num, formatted)
}

watch(() => sampleState.currentSampleId, () => { loadFromStore() })
onMounted(loadFromStore)

function clearAll() {
  const empty = emptyForm()
  Object.assign(group1, empty)
  Object.assign(group2, empty)
  clearPage(PAGE)
}

const r1 = computed(() => calcHydrogen(FIXED_MASS, group1.hi, group1.hf, blankValue.value, moistureAvg.value))
const r2 = computed(() => calcHydrogen(FIXED_MASS, group2.hi, group2.hf, blankValue.value, moistureAvg.value))
const average = computed(() => calcAverage(r1.value, r2.value))

const result1Items = computed(() => [
  { label: 'm₂ (H₂O增量)', value: r1.value ? formatDecimals(r1.value.m2, 5) : '-' },
  { label: 'm₂ - m₃ (校正后增量)', value: r1.value ? formatDecimals(r1.value.corrected, 5) : '-' },
  { label: 'Had', value: r1.value ? r1.value.had_formatted : '-', highlight: true },
])

const result2Items = computed(() => [
  { label: 'm₂ (H₂O增量)', value: r2.value ? formatDecimals(r2.value.m2, 5) : '-' },
  { label: 'm₂ - m₃ (校正后增量)', value: r2.value ? formatDecimals(r2.value.corrected, 5) : '-' },
  { label: 'Had', value: r2.value ? r2.value.had_formatted : '-', highlight: true },
])
</script>

<style scoped>
.page { padding-bottom: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #222; margin-bottom: 4px; }
.page-subtitle { font-size: 12px; color: #888; }
.clear-btn { background: none; border: 1px solid #e0e0e0; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #888; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.clear-btn:hover { border-color: #d93025; color: #d93025; background: #fce8e6; }

/* 固定质量 */
.fixed-mass { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f0f4ff; border-radius: 8px; margin-bottom: 8px; border: 1px solid #c5d9f2; }
.mass-label { font-size: 13px; color: #555; }
.mass-value { font-size: 16px; font-weight: 700; color: #7b1fa2; }
.mass-note { font-size: 11px; color: #888; }

/* Mad 输入 */
.mad-section { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e0e0e0; }
.mad-label { font-size: 13px; font-weight: 600; color: #333; white-space: nowrap; }
.mad-input { width: 90px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; }
.mad-input:focus { border-color: #1a73e8; }
.mad-hint { font-size: 11px; color: #34a853; margin-left: auto; white-space: nowrap; }
.mad-hint.missing { color: #e65100; }

.blank-ref, .blank-missing { padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; }
.blank-ref { background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32; }
.blank-missing { background: #fff3e0; border: 1px solid #ffcc80; color: #e65100; }
.ref-label { opacity: 0.8; }
.ref-value { font-weight: 700; }

.dual-column { display: flex; flex-direction: column; gap: 12px; }
.results-section { display: flex; flex-direction: column; gap: 12px; }
.average-section { margin-top: 16px; }
.avg-card { background: linear-gradient(135deg, #7b1fa2, #4a148c); color: #fff; border-radius: 12px; padding: 20px; text-align: center; }
.avg-label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
.avg-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
.avg-note { font-size: 11px; opacity: 0.7; }
.hydrogen-page :deep(.input-group) { min-width: 0; }
</style>
