<template>
  <div class="timer-panel">
    <div class="timer-header">
      <span class="timer-icon">⏱️</span>
      <span class="timer-title">加热计时器</span>
      <span class="timer-count" v-if="activeTimers.length > 0">{{ activeTimers.length }} 个运行中</span>
    </div>

    <!-- 运行中的计时器列表 -->
    <div class="timer-list" v-if="activeTimers.length > 0">
      <div
        v-for="t in activeTimers"
        :key="t.id"
        class="timer-card"
        :class="{ completed: t.completed, running: t.isRunning && !t.completed }"
      >
        <div class="timer-card-header">
          <span class="timer-card-label">{{ t.label }}</span>
          <button class="timer-close" @click="removeTimer(t.id)" title="移除">✕</button>
        </div>

        <div class="timer-card-time">{{ formatTime(t.remaining) }}</div>

        <div class="timer-progress">
          <div class="progress-bar" :style="{ width: progressPercent(t) + '%' }"></div>
        </div>

        <div class="timer-card-actions">
          <button v-if="t.isRunning" @click="stopTimer(t.id)" class="timer-btn small stop">⏹ 停止</button>
          <button v-else @click="removeTimer(t.id)" class="timer-btn small remove">✕ 移除</button>
        </div>

        <!-- 完成弹窗 -->
        <div v-if="t.completed" class="timer-alert-overlay" @click="dismissComplete(t.id)">
          <div class="alert-box">
            <div class="alert-icon">⏰</div>
            <div class="alert-text">{{ t.label }} 时间到！</div>
            <div class="alert-sub">点击关闭</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预设按钮 -->
    <div class="timer-presets">
      <div class="presets-title">标准加热时间：</div>
      <div class="presets-grid">
        <button
          v-for="preset in presets"
          :key="preset.seconds + preset.label"
          @click="addTimer(preset.seconds, preset.label)"
          class="preset-btn"
        >
          <span class="preset-label">{{ preset.label }}</span>
          <span class="preset-duration">{{ formatDuration(preset.seconds) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTimerStore } from '@/store/timer'

const props = defineProps({
  presets: {
    type: Array,
    default: () => [],
  },
})

const { state, addTimer, stopTimer, removeTimer, dismissComplete } = useTimerStore()
const activeTimers = computed(() => state.timers)

function progressPercent(t) {
  if (t.total === 0) return 0
  return ((t.total - t.remaining) / t.total) * 100
}

function formatTime(seconds) {
  if (seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDuration(seconds) {
  if (seconds >= 60) {
    const m = seconds / 60
    return `${m}min`
  }
  return `${seconds}s`
}
</script>

<style scoped>
.timer-panel {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.timer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.timer-icon { font-size: 18px; }
.timer-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.timer-count {
  font-size: 11px;
  color: #1a73e8;
  background: #e8f0fe;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

/* 计时器卡片列表 */
.timer-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.timer-card {
  background: linear-gradient(135deg, #f0f4ff, #e8f0fe);
  border-radius: 10px;
  padding: 12px 14px;
  position: relative;
  border: 1px solid #d0ddf5;
}
.timer-card.completed {
  background: linear-gradient(135deg, #fff0f0, #fce8e6);
  border-color: #f5c6c2;
}
.timer-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.timer-card-label { font-size: 13px; color: #555; }
.timer-close {
  background: none;
  border: none;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.timer-close:hover { color: #d93025; }
.timer-card-time {
  font-size: 32px;
  font-weight: 700;
  color: #1a73e8;
  font-family: 'Courier New', monospace;
  letter-spacing: 3px;
  margin: 2px 0;
}
.timer-card.completed .timer-card-time { color: #d93025; }

.timer-progress {
  height: 3px;
  background: rgba(0,0,0,0.08);
  border-radius: 2px;
  margin: 4px 0;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: #1a73e8;
  border-radius: 2px;
  transition: width 1s linear;
}
.timer-card.completed .progress-bar { background: #d93025; }
.timer-card-actions { margin-top: 6px; }
.timer-btn {
  padding: 4px 12px;
  border-radius: 5px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.timer-btn.small { font-size: 11px; padding: 3px 10px; }
.timer-btn.stop { background: #fce8e6; color: #d93025; }
.timer-btn.remove { background: #f1f3f4; color: #666; }

/* 预设按钮 */
.presets-title {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}
.presets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}
.preset-btn:hover {
  border-color: #1a73e8;
  background: #f0f4ff;
}
.preset-btn:active {
  transform: scale(0.97);
}
.preset-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.preset-duration {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

/* 完成弹窗 */
.timer-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.alert-box {
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  animation: alert-pop 0.3s ease-out;
}
@keyframes alert-pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.alert-icon { font-size: 48px; margin-bottom: 12px; }
.alert-text {
  font-size: 20px;
  font-weight: 700;
  color: #d93025;
  margin-bottom: 8px;
}
.alert-sub { font-size: 14px; color: #888; }
</style>
