import { reactive, readonly } from 'vue'

let nextId = 1
const intervalMap = new Map()

const state = reactive({
  timers: [],
})

export function useTimerStore() {
  function addTimer(seconds, label, steps) {
    const id = nextId++
    const now = Date.now()
    const timer = reactive({
      id,
      label,
      total: seconds,
      remaining: seconds,
      endTime: now + seconds * 1000,
      elapsed: 0,
      isRunning: true,
      completed: false,
      currentStep: 0,
      steps: steps || null,
      stepLabel: '',
    })
    state.timers.push(timer)

    intervalMap.set(id, setInterval(() => {
      const now = Date.now()
      const remainingMs = Math.max(0, timer.endTime - now)
      timer.remaining = Math.max(0, Math.round(remainingMs / 1000))
      timer.elapsed = Math.round((now - (timer.endTime - timer.total * 1000)) / 1000)

      // Update step guidance
      if (timer.steps && timer.steps.length > 0) {
        const elapsedSec = timer.total - timer.remaining
        let stepIdx = 0
        for (let i = 0; i < timer.steps.length; i++) {
          if (elapsedSec >= timer.steps[i].endTime) stepIdx = i + 1
        }
        if (stepIdx >= timer.steps.length) stepIdx = timer.steps.length - 1
        timer.currentStep = stepIdx
        timer.stepLabel = timer.steps[stepIdx] ? timer.steps[stepIdx].label : ''
      }

      if (timer.remaining <= 0) {
        clearInterval(intervalMap.get(id))
        intervalMap.delete(id)
        timer.isRunning = false
        timer.completed = true
        playBeep()
      }
    }, 200))

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

  function clearCompleted() {
    const ids = state.timers.filter(t => t.completed || !t.isRunning).map(t => t.id)
    ids.forEach(id => removeTimer(id))
  }

  function stopAll() {
    ;[...intervalMap.keys()].forEach(id => {
      clearInterval(intervalMap.get(id))
      intervalMap.delete(id)
    })
    state.timers.forEach(t => { t.isRunning = false })
  }

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
    } catch (e) { /* silent */ }
  }

  return {
    state: readonly(state),
    addTimer, stopTimer, removeTimer, dismissComplete,
    clearCompleted, stopAll,
  }
}
