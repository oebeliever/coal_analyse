<template>
  <div class="result-card" v-if="hasResult">
    <h3 class="result-title">{{ title }}</h3>
    <div class="result-items">
      <div class="result-row" v-for="item in items" :key="item.label">
        <span class="result-label">{{ item.label }}</span>
        <span class="result-value" :class="{ highlight: item.highlight }">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '计算结果' },
  items: { type: Array, default: () => [] },
})

const hasResult = computed(() => {
  return props.items.some(item => item.value !== '-' && item.value !== null && item.value !== undefined)
})
</script>

<style scoped>
.result-card {
  background: linear-gradient(135deg, #e8f0fe, #f0f8ff);
  border-radius: 10px;
  padding: 14px;
  margin-top: 12px;
  border: 1px solid #c5d9f2;
}
.result-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a73e8;
  margin-bottom: 10px;
}
.result-items { display: flex; flex-direction: column; gap: 6px; }
.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
.result-label {
  font-size: 13px;
  color: #555;
}
.result-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  font-family: 'Courier New', monospace;
}
.result-value.highlight {
  color: #d93025;
  font-size: 16px;
  background: #fce8e6;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
