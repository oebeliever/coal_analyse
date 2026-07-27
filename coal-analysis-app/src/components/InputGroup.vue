<template>
  <div class="input-group">
    <h3 class="group-title">{{ title }}</h3>
    <div class="input-fields">
      <div class="field-row" v-if="showContainerId">
        <label class="field-label">器皿号</label>
        <input
          type="text"
          :value="modelValue.containerId"
          @input="updateField('containerId', $event.target.value)"
          class="field-input"
          placeholder="如 A01"
        />
      </div>
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
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  fields: { type: Array, required: true },
  modelValue: { type: Object, required: true },
  showContainerId: { type: Boolean, default: false },
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
