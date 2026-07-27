import { reactive, readonly } from 'vue'

let nextId = 1
const intervalMap = new Map() // id -> intervalId

const state = reactive({
  timers: [], // { id, label, total, remaining, isRunning, completed }
})

export function useTimerStore() {
  /**
   * 添加并启动一个新计时器
   * @param {number} seconds
   * @param {string} label
   */
  function addTimer(seconds, label) {
    const id = nextId++
    const timer = reactive({
      id,
      label,
      total: seconds,
      remaining: seconds,
      isRunning: true,
      completed: false,
    })
    state.timers.push(timer)

    intervalMap.set(id, setInterval(() => {
      timer.remaining--
      if (timer.remaining <= 0) {
        clearInterval(intervalMap.get(id))
        intervalMap.delete(id)
        timer.isRunning = false
        timer.completed = true
        playBeep()
      }
    }, 1000))

    return id
  }

  function stopTimer(id) {
    const intervalId = intervalMap.get(id)
    if (intervalId !== undefined) {
      clearInterval(intervalId)
      intervalMap.delete(id)
    }
    const timer = state.timers.find(t => t.id === id)
    if (timer) timer.isRunning = false
  }

  function removeTimer(id) {
    stopTimer(id)
    const idx = state.timers.findIndex(t => t.id === id)
    if (idx !== -1) state.timers.splice(idx, 1)
  }

  function dismissComplete(id) {
    const timer = state.timers.find(t => t.id === id)
    if (timer) timer.completed = false
  }

  /** 清除所有已完成的计时器 */
  function clearCompleted() {
    const completedIds = state.timers
      .filter(t => t.completed || !t.isRunning)
      .map(t => t.id)
    completedIds.forEach(id => removeTimer(id))
  }

  /** 停止所有计时器 */
  function stopAll() {
    ;[...intervalMap.keys()].forEach(id => {
      clearInterval(intervalMap.get(id))
      intervalMap.delete(id)
    })
    state.timers.forEach(t => { t.isRunning = false })
  }

  /** 用 Web Audio API 发出提示音 */
  function playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const osc = audioCtx.createOscillator()
          const gain = audioCtx.createGain()
          osc.connect(gain)
          gain.connect(audioCtx.destination)
          osc.frequency.value = 880
          osc.type = 'sine'
          gain.gain.setValueAtTime(0.5, audioCtx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5)
          osc.start(audioCtx.currentTime)
          osc.stop(audioCtx.currentTime + 1.5)
        }, i * 700)
      }
    } catch (e) {
      // 静默失败
    }
  }

  return {
    state: readonly(state),
    addTimer,
    stopTimer,
    removeTimer,
    dismissComplete,
    clearCompleted,
    stopAll,
  }
}
