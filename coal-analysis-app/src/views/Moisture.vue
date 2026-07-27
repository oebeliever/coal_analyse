<template>
  <div class="page moisture-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">空气干燥基水分测定</h2>
        <p class="page-subtitle">依据 GB/T 212-2008</p>
      </div>
      <button @click="clearAll" class="clear-btn">🗑️ 清空数据</button>
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
        <div class="avg-label">两组平均水分质量分数</div>
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
import { calcMoisture, calcAverage } from '@/utils/calculation'
import { formatDecimals } from '@/utils/round'
import { useCoalStore } from '@/store/results'
import { useSampleStore } from '@/store/samples'

const PAGE = 'moisture'

const store = useCoalStore()
const { state: sampleState, getCurrentPageData, updateField, clearPage } = useSampleStore()

const timerPresets = [
  { seconds: 7200, label: '通氮干燥(褐煤/无烟煤) 2h' },
  { seconds: 5400, label: '通氮干燥(其他煤种) 1.5h' },
  { seconds: 3600, label: '空气干燥(烟煤) 1h' },
  { seconds: 5400, label: '空气干燥(无烟煤) 1.5h' },
  { seconds: 1800, label: '检查性干燥 30min' },
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

// 从样本存储加载数据
function loadFromStore() {
  const data = getCurrentPageData(PAGE)
  if (data.group1) Object.assign(group1, { ...emptyForm(), ...data.group1 })
  if (data.group2) Object.assign(group2, { ...emptyForm(), ...data.group2 })
}

// 保存到样本存储
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

// 切换样本时重新加载
watch(() => sampleState.currentSampleId, () => {
  loadFromStore()
})

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

const r1 = computed(() => calcMoisture(group1.m1, group1.m2, toDryWeights(group1)))
const r2 = computed(() => calcMoisture(group2.m1, group2.m2, toDryWeights(group2)))
const average = computed(() => calcAverage(r1.value, r2.value))

watch(average, (avg) => {
  if (avg) {
    store.setMoistureAvg(avg.avg_rounded, avg.avg_formatted)
  } else {
    store.setMoistureAvg(null, '-')
  }
})

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
.dual-column { display: flex; flex-direction: column; gap: 12px; }
.results-section { display: flex; flex-direction: column; gap: 12px; }
.average-section { margin-top: 16px; }
.avg-card {
  background: linear-gradient(135deg, #1a73e8, #1557b0);
  color: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.avg-label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
.avg-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
.avg-note { font-size: 11px; opacity: 0.7; }
.moisture-page :deep(.input-group) { min-width: 0; }
</style>
