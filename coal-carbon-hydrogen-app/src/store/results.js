import { reactive, readonly } from 'vue'

const state = reactive({
  moistureAvg: null,
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

  return { state: readonly(state), setMoistureAvg, clearResults }
}
