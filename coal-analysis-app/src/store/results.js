import { reactive, readonly } from 'vue'

const state = reactive({
  moistureAvg: null,   // 水分平均质量分数（挥发分需要引用）
  moistureAvgFormatted: '-',
})

export function useCoalStore() {
  function setMoistureAvg(value, formatted) {
    state.moistureAvg = value
    state.moistureAvgFormatted = formatted || '-'
  }

  function clearResults() {
    state.moistureAvg = null
    state.moistureAvgFormatted = '-'
  }

  return {
    state: readonly(state),
    setMoistureAvg,
    clearResults,
  }
}
