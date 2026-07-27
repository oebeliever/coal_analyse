<template>
  <div id="app-container">
    <header class="app-header" v-if="showHeader">
      <div class="header-top">
        <h1 class="app-title">煤炭工业分析计算器</h1>
      </div>
      <div class="sample-bar">
        <label class="sample-label">煤样编号：</label>
        <select v-model="currentId" @change="onSwitchSample" class="sample-select">
          <option v-for="id in sampleIds" :key="id" :value="id">{{ id }}</option>
        </select>
        <button @click="onRenameSample" class="sample-btn-rename">✏️ 重命名</button>
        <button @click="onNewSample" class="sample-btn add" title="新建煤样">＋</button>
        <button @click="onDeleteSample" class="sample-btn del" title="删除当前煤样">－</button>
      </div>
    </header>
    <div class="router-view-wrapper">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <nav class="bottom-tabs">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tab-item"
        :class="{ active: $route.path === tab.path }"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSampleStore } from '@/store/samples'

const route = useRoute()
const router = useRouter()
const showHeader = computed(() => route.path !== '/reference')

const { state, getAllIds, setCurrentSample, createSample, deleteSample, renameSample } = useSampleStore()

const currentId = computed({
  get: () => state.currentSampleId,
  set: (val) => setCurrentSample(val),
})
const sampleIds = computed(() => getAllIds())

function onSwitchSample() {
  // already handled by the v-model + setCurrentSample
}

function onNewSample() {
  const base = '样品-'
  let n = 1
  const ids = getAllIds()
  while (ids.includes(`${base}${String(n).padStart(3, '0')}`)) n++
  const newId = `${base}${String(n).padStart(3, '0')}`
  createSample(newId)
}

function onDeleteSample() {
  const ids = getAllIds()
  if (ids.length <= 1) {
    alert('至少保留一个煤样')
    return
  }
  if (confirm(`确定删除煤样「${state.currentSampleId}」？数据将永久丢失。`)) {
    deleteSample(state.currentSampleId)
  }
}

function onRenameSample() {
  const oldId = state.currentSampleId
  const newId = prompt('输入新的煤样编号：', oldId)
  if (!newId || newId.trim() === '' || newId === oldId) return
  const trimmed = newId.trim()
  if (getAllIds().includes(trimmed)) {
    alert('该编号已存在')
    return
  }
  renameSample(oldId, trimmed)
}

const tabs = [
  { path: '/moisture', label: '水分', icon: '💧' },
  { path: '/ash', label: '灰分', icon: '🔥' },
  { path: '/volatile', label: '挥发分', icon: '💨' },
  { path: '/reference', label: '标准参考', icon: '📖' },
]
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f0f2f5;
  -webkit-font-smoothing: antialiased;
}
#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.08);
}
.app-header {
  padding: 12px 16px 8px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid #f0f0f0;
}
.header-top { margin-bottom: 6px; }
.app-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a73e8;
}
.sample-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sample-label {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
}
.sample-select {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  outline: none;
  cursor: pointer;
}
.sample-select:focus {
  border-color: #1a73e8;
}
.sample-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.2s;
}
.sample-btn-rename {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  white-space: nowrap;
  transition: all 0.2s;
  color: #555;
}
.sample-btn-rename:hover {
  border-color: #1a73e8;
  color: #1a73e8;
  background: #e8f0fe;
}
.sample-btn.add:hover {
  border-color: #34a853;
  color: #34a853;
  background: #e8f5e9;
}
.sample-btn.del:hover {
  border-color: #d93025;
  color: #d93025;
  background: #fce8e6;
}
.router-view-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 70px;
}
.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 6px;
  text-decoration: none;
  color: #999;
  font-size: 12px;
  transition: color 0.2s;
  border-top: 2px solid transparent;
}
.tab-item.active {
  color: #1a73e8;
  border-top-color: #1a73e8;
  background: rgba(26,115,232,0.04);
}
.tab-icon { font-size: 22px; margin-bottom: 2px; }
.tab-label { font-size: 11px; font-weight: 500; }
.router-view-wrapper::-webkit-scrollbar { width: 4px; }
.router-view-wrapper::-webkit-scrollbar-track { background: transparent; }
.router-view-wrapper::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 2px; }
</style>
