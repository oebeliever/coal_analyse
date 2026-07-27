<template>
  <div class="input-group">
    <h3 class="group-title">{{ title }}</h3>
    <div class="input-fields">
      <!-- 器皿编号信息条（来自炉布局同步） -->
      <div class="tube-ids" v-if="tubeInfo">
        <div class="tube-id-row">
          <span class="tid-label">器皿号</span>
          <span class="tid-furnace">炉 {{ tubeInfo.furnaceId }}-{{ tubeInfo.slotPosition || '?' }}</span>
          <span class="tid-tubes">
            <span v-if="tubeInfo.h2o" class="tid-tube">💧{{ tubeInfo.h2o }}</span>
            <span v-if="tubeInfo.co2_1" class="tid-tube">🧪{{ tubeInfo.co2_1 }}</span>
            <span v-if="tubeInfo.co2_2" class="tid-tube">🧪{{ tubeInfo.co2_2 }}</span>
          </span>
        </div>
      </div>

      <!-- 数据字段 -->
      <div v-for="field in fields" :key="field.key" class="field-row">
        <label :for="field.key" class="field-label">{{ field.label }}</label>
        <input
          :id="field.key"
          type="number"
          step="any"
          :placeholder="field.placeholder || ''"
          :value="modelValue[field.key]"
          @input="updateField(field.key, $event.target.value)"
          class="field-input"
          :class="{ 'has-value': modelValue[field.key] !== '' && modelValue[field.key] !== null }"
        />
        <span class="field-unit">g</span>
      </div>
      <slot name="after" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  fields: { type: Array, required: true },
  modelValue: { type: Object, required: true },
  showContainerId: { type: Boolean, default: false },
  tubeInfo: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

function updateField(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.input-group {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
}
.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 2px solid #1a73e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.input-fields { display: flex; flex-direction: column; gap: 8px; }

/* 器皿编号信息条 */
.tube-ids { margin-bottom: 6px; }
.tube-id-row { display: flex; align-items: center; gap: 6px; font-size: 12px; background: #e8f0fe; border-radius: 6px; padding: 7px 10px; flex-wrap: wrap; }
.tid-label { font-size: 11px; font-weight: 600; color: #1a73e8; white-space: nowrap; }
.tid-furnace { font-size: 11px; color: #555; background: #fff; padding: 1px 6px; border-radius: 3px; white-space: nowrap; }
.tid-tubes { display: flex; gap: 4px; flex-wrap: wrap; margin-left: auto; }
.tid-tube { font-family: 'Courier New', monospace; font-weight: 600; color: #333; background: #fff; padding: 1px 6px; border-radius: 3px; white-space: nowrap; }

.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.field-label {
  font-size: 13px;
  color: #555;
  min-width: 100px;
  flex-shrink: 0;
}
.field-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  min-width: 0;
  background: #fff;
}
.field-input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.15);
}
.field-input.has-value {
  border-color: #34a853;
}
.field-unit {
  font-size: 13px;
  color: #888;
  min-width: 16px;
}
</style>
