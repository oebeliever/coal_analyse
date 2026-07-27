<template>
  <div class="page volatile-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">挥发分测定</h2>
        <p class="page-subtitle">依据 GB/T 212-2008 — (900±10)°C, 7min</p>
      </div>
      <button @click="clearAll" class="clear-btn">🗑️ 清空数据</button>
    </div>

    <div class="moisture-ref" v-if="moistureAvg !== null">
      <span class="ref-label">引用水分平均质量分数：</span>
      <span class="ref-value">{{ moistureAvgFormatted }} %</span>
    </div>
    <div class="moisture-missing" v-else>
      ⚠️ 请先计算水分，挥发分计算需要引用水分平均质量分数
    </div>

    <TimerPanel :presets="timerPresets" />

    <div class="dual-column">
      <InputGroup
        title="第1组"
        :fields="fields"
        :model-value="group1"
        @update:model-value="onUpdateGroup1"
        show-container-id
      />
      <InputGroup
        title="第2组"
        :fields="fields"
        :model-value="group2"
        @update:model-value="onUpdateGroup2"
        show-container-id
      />
    </div>

    <div class="results-section">
      <ResultCard title="第1组结果" :items="result1Items" />
      <ResultCard title="第2组结果" :items="result2Items" />
    </div>

    <div class="average-section" v-if="average">
      <div class="avg-card">
        <div class="avg-label">两组平均挥发分质量分数</div>
        <div class="avg-value">{{ average.avg_formatted }} %</div>
        <div class="avg-note">四舍六入五单双，保留四位小数</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
import InputGroup from '@/components/InputGroup.vue'
import ResultCard from '@/components/ResultCard.vue'
import TimerPanel from '@/components/TimerPanel.vue'
import { calcVolatile, calcAverage } from '@/utils/calculation'
import { formatDecimals } from '@/utils/round'
import { useCoalStore } from '@/store/results'
import { useSampleStore } from '@/store/samples'

const PAGE = 'volatile'

const store = useCoalStore()
const moistureAvg = computed(() => store.state.moistureAvg)
const moistureAvgFormatted = computed(() => store.state.moistureAvgFormatted)

const { state: sampleState, getCurrentPageData, updateField, clearPage } = useSampleStore()

const timerPresets = [
  { seconds: 420, label: '900°C 加热 7min' },
  { seconds: 180, label: '炉温恢复 3min' },
]

const fields = [
  { key: 'm1', label: '器皿质量 m₁', placeholder: '如 20.0000' },
  { key: 'm2', label: '物质质量 m₂', placeholder: '如 10.0000' },
  { key: 'd1', label: '第一次干燥后', placeholder: '可选' },
  { key: 'd2', label: '第二次干燥后', placeholder: '可选' },
  { key: 'd3', label: '第三次干燥后', placeholder: '可选' },
]

const emptyForm = () => ({ containerId: '', m1: '', m2: '', d1: '', d2: '', d3: '' })
const group1 = reactive(emptyForm())
const group2 = reactive(emptyForm())

function loadFromStore() {
  const data = getCurrentPageData(PAGE)
  if (data.group1) Object.assign(group1, { ...emptyForm(), ...data.group1 })
  if (data.group2) Object.assign(group2, { ...emptyForm(), ...data.group2 })
}

function saveGroup(group, data) {
  Object.entries(data).forEach(([key, val]) => {
    updateField(PAGE, group, key, val)
  })
}

function onUpdateGroup1(data) {
  Object.assign(group1, data)
  saveGroup('group1', data)
}
function onUpdateGroup2(data) {
  Object.assign(group2, data)
  saveGroup('group2', data)
}

watch(() => sampleState.currentSampleId, () => loadFromStore())
onMounted(loadFromStore)

function clearAll() {
  const empty = emptyForm()
  Object.assign(group1, empty)
  Object.assign(group2, empty)
  clearPage(PAGE)
}

function toDryWeights(g) {
  return [g.d1, g.d2, g.d3].map(v => v === '' ? null : Number(v))
}

const r1 = computed(() => calcVolatile(group1.m1, group1.m2, toDryWeights(group1), moistureAvg.value))
const r2 = computed(() => calcVolatile(group2.m1, group2.m2, toDryWeights(group2), moistureAvg.value))
const average = computed(() => calcAverage(r1.value, r2.value))

const result1Items = computed(() => [
  { label: 'm₃ (最小值)', value: formatDecimals(r1.value.m3, 5) },
  { label: 'm₄ (减少质量)', value: formatDecimals(r1.value.m4, 5) },
  { label: 'm₅ (5位小数)', value: formatDecimals(r1.value.m5_raw, 5) },
  { label: 'm₅ 修约结果', value: r1.value.m5_formatted, highlight: true },
])
const result2Items = computed(() => [
  { label: 'm₃ (最小值)', value: formatDecimals(r2.value.m3, 5) },
  { label: 'm₄ (减少质量)', value: formatDecimals(r2.value.m4, 5) },
  { label: 'm₅ (5位小数)', value: formatDecimals(r2.value.m5_raw, 5) },
  { label: 'm₅ 修约结果', value: r2.value.m5_formatted, highlight: true },
])
</script>

<style scoped>
.page { padding-bottom: 16px; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-title { font-size: 20px; font-weight: 700; color: #222; margin-bottom: 4px; }
.page-subtitle { font-size: 12px; color: #888; }
.clear-btn {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.clear-btn:hover {
  border-color: #d93025;
  color: #d93025;
  background: #fce8e6;
}
.moisture-ref, .moisture-missing {
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 14px;
  font-size: 13px;
}
.moisture-ref {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}
.moisture-missing {
  background: #fff3e0;
  border: 1px solid #ffcc80;
  color: #e65100;
}
.ref-label { opacity: 0.8; }
.ref-value { font-weight: 700; }
.dual-column { display: flex; flex-direction: column; gap: 12px; }
.results-section { display: flex; flex-direction: column; gap: 12px; }
.average-section { margin-top: 16px; }
.avg-card {
  background: linear-gradient(135deg, #7b1fa2, #4a148c);
  color: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.avg-label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
.avg-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
.avg-note { font-size: 11px; opacity: 0.7; }
.volatile-page :deep(.input-group) { min-width: 0; }
</style>
