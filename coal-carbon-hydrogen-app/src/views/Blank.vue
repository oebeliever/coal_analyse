<template>
  <div class="page blank-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">空白值 m₃ 管理</h2>
        <p class="page-subtitle">系统恒重检查 — H₂O≤0.0010g, CO₂≤0.0005g</p>
      </div>
      <button @click="onNewSession" class="clear-btn">➕ 新建空白试验</button>
    </div>

    <!-- 未选择会话时显示历史记录 -->
    <template v-if="!session">
      <div class="current-missing" v-if="state.sessions.length === 0">
        ⚠️ 暂无空白试验记录，请点击"新建空白试验"
      </div>
      <div class="m3-display" v-else>
        <div class="m3-card" v-if="m3Value !== null">
          <span class="m3-label">当前空白值 m₃</span>
          <span class="m3-value">{{ m3Formatted }} g</span>
        </div>
        <div class="session-list">
          <div class="section-title">历史空白试验</div>
          <div v-for="s in state.sessions" :key="s.id" class="session-item"
            :class="{ active: s.id === state.activeSessionId }">
            <div class="session-info" @click="setActiveSession(s.id)">
              <span class="session-date">{{ s.date }}</span>
              <span class="session-note">{{ s.note || '无备注' }}</span>
              <span class="session-groups">{{ s.groups.length }} 组</span>
            </div>
            <div class="session-m3" v-if="calcSessionM3(s) !== null">
              m₃ = {{ calcSessionM3Formatted(s) }} g
            </div>
            <button @click="onDeleteSession(s.id)" class="hist-btn del" title="删除">✕</button>
          </div>
        </div>
      </div>
    </template>

    <!-- 当前空白试验会话 -->
    <template v-else>
      <!-- 基本信息 -->
      <div class="session-info-bar">
        <span class="info-badge">{{ session.date }}</span>
        <input type="text" class="note-input" :value="session.note"
          @input="updateSessionNote($event.target.value)" placeholder="备注（可选）" />
        <button @click="onSaveAndClose" class="save-btn" :disabled="m3Value === null">
          ✅ 设定为当前 m₃
        </button>
      </div>

      <!-- 初始质量 -->
      <div class="form-section">
        <h3 class="section-title">① 初始质量（空白燃烧前称量）</h3>
        <div class="form-row">
          <label class="form-label">H₂O吸收管 (g)</label>
          <input type="number" step="any" class="form-input"
            :value="session.initial.h2o" @input="updateInitial('h2o', $event.target.value)"
            placeholder="如 30.0000" />
        </div>
        <div class="form-row">
          <label class="form-label">CO₂吸收管① (g)</label>
          <input type="number" step="any" class="form-input"
            :value="session.initial.co2_1" @input="updateInitial('co2_1', $event.target.value)"
            placeholder="如 50.0000" />
        </div>
        <div class="form-row">
          <label class="form-label">CO₂吸收管② (g)</label>
          <input type="number" step="any" class="form-input"
            :value="session.initial.co2_2" @input="updateInitial('co2_2', $event.target.value)"
            placeholder="如 48.0000" />
        </div>
      </div>

      <!-- 各组数据 -->
      <div v-for="(group, gi) in session.groups" :key="gi" class="group-section"
        :class="{ 'group-pass': gi > 0 && getAcceptance(gi)?.passed }">
        <div class="group-header">
          <h3 class="section-title">② 第{{ gi + 1 }}组（空白燃烧后称量）</h3>
          <button v-if="gi === session.groups.length - 1 && session.groups.length > 1"
            @click="onRemoveGroup(gi)" class="hist-btn del" title="移除该组">✕</button>
        </div>
        <div class="form-row">
          <label class="form-label">H₂O吸收管 (g)</label>
          <input type="number" step="any" class="form-input"
            :value="group.h2o" @input="updateGroup(gi, 'h2o', $event.target.value)"
            :placeholder="'如 ' + (30.0000 + (gi+1)*0.0005).toFixed(4)" />
        </div>
        <div class="form-row">
          <label class="form-label">CO₂吸收管① (g)</label>
          <input type="number" step="any" class="form-input"
            :value="group.co2_1" @input="updateGroup(gi, 'co2_1', $event.target.value)"
            :placeholder="'如 50.0000' + (gi > 0 ? ' (+检查)' : '')" />
        </div>
        <div class="form-row">
          <label class="form-label">CO₂吸收管② (g)</label>
          <input type="number" step="any" class="form-input"
            :value="group.co2_2" @input="updateGroup(gi, 'co2_2', $event.target.value)"
            :placeholder="'如 48.0001' + (gi > 0 ? ' (+检查)' : '')" />
        </div>

        <!-- 增量显示 -->
        <div class="inc-display" v-if="getIncrement(gi)">
          <div v-if="gi === 0" class="inc-row">
            <span class="inc-label">第1组增量 Δ₁ （G1 − 初始）</span>
            <span class="inc-values">
              H₂O: <strong>{{ getIncrement(gi).h2o.toFixed(5) }}</strong>
              | CO₂①: <strong>{{ getIncrement(gi).co2_1.toFixed(5) }}</strong>
              | CO₂②: <strong>{{ getIncrement(gi).co2_2.toFixed(5) }}</strong>
            </span>
          </div>
          <div v-else class="inc-row">
            <span class="inc-label">第{{ gi + 1 }}组增量 Δ{{ gi + 1 }}（G{{ gi + 1 }} − G{{ gi }}）|Δ{{ gi+1 }}−Δ{{ gi }}| 恒重检查</span>
            <span class="inc-values">
              H₂O: {{ getIncrement(gi).h2o.toFixed(5) }}
              差: <strong :class="compClass(getComparison(gi), 'h2o')">{{ getComparison(gi).h2o.toFixed(5) }}</strong>
              | CO₂①: {{ getIncrement(gi).co2_1.toFixed(5) }}
              差: <strong :class="compClass(getComparison(gi), 'co2_1')">{{ getComparison(gi).co2_1.toFixed(5) }}</strong>
              | CO₂②: {{ getIncrement(gi).co2_2.toFixed(5) }}
              差: <strong :class="compClass(getComparison(gi), 'co2_2')">{{ getComparison(gi).co2_2.toFixed(5) }}</strong>
            </span>
            <span class="inc-accept" v-if="getAcceptance(gi)">
              <span v-if="getAcceptance(gi).passed" class="accept-pass">
                ✅ 恒重合格（
                H₂O差:{{ getComparison(gi).h2o.toFixed(5) }}≤0.0010,
                CO₂①差:{{ getComparison(gi).co2_1.toFixed(5) }}≤0.0005,
                CO₂②差:{{ getComparison(gi).co2_2.toFixed(5) }}≤0.0005）
              </span>
              <span v-else class="accept-fail">
                ❌ 不合格：
                <template v-if="!getAcceptance(gi).h2o">H₂O差{{ getComparison(gi).h2o.toFixed(5) }}>0.0010; </template>
                <template v-if="!getAcceptance(gi).co2_1">CO₂①差{{ getComparison(gi).co2_1.toFixed(5) }}>0.0005; </template>
                <template v-if="!getAcceptance(gi).co2_2">CO₂②差{{ getComparison(gi).co2_2.toFixed(5) }}>0.0005</template>
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 补充组按钮 -->
      <button class="add-group-btn" @click="onAddGroup"
        :disabled="!hasInitialAndFirstGroup">
        ➕ 添加下一组空白实验（再次燃烧后称量）
      </button>

      <!-- 当前判定结果 -->
      <div class="result-section" v-if="m3Value !== null">
        <div class="result-card-blank">
          <div class="result-icon">✅</div>
          <div class="result-text">
            <div class="result-title">系统已恒重</div>
            <div class="result-m3">m₃ = <strong>{{ m3Formatted }}</strong> g</div>
            <div class="result-note">取相邻两组合格增量的平均值，作为 H₂O 吸收管空白值用于氢含量计算</div>
          </div>
        </div>
      </div>
      <div class="no-result" v-else-if="session.groups.length >= 2">
        ⚠️ 尚未达到恒重要求，请继续补充空白组
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBlankStore } from '@/store/blank'

const {
  state, createSession, getActiveSession, setActiveSession,
  updateInitial, addGroup, updateGroup, removeGroup,
  deleteSession, updateSessionNote,
  getCurrentM3, getCurrentM3Formatted,
  calcGroupIncrement, calcIncrementComparison, checkAcceptance,
  H2O_TOLERANCE, CO2_TOLERANCE,
} = useBlankStore()

const session = computed(() => getActiveSession())
const m3Value = computed(() => getCurrentM3())
const m3Formatted = computed(() => getCurrentM3Formatted())

const hasInitialAndFirstGroup = computed(() => {
  if (!session.value) return false
  const s = session.value
  return s.initial.h2o !== '' && s.initial.co2_1 !== '' && s.initial.co2_2 !== '' &&
    s.groups.length >= 1
})

function getIncrement(gi) {
  if (!session.value) return null
  return calcGroupIncrement(session.value, gi)
}

function getAcceptance(gi) {
  if (!session.value) return null
  return checkAcceptance(session.value, gi)
}

function getComparison(gi) {
  if (!session.value) return null
  return calcIncrementComparison(session.value, gi)
}

function calcSessionM3(s) {
  for (let i = 1; i < s.groups.length; i++) {
    const comp = calcIncrementComparison(s, i)
    if (!comp) continue
    const h2o_ok = Math.abs(comp.h2o) <= H2O_TOLERANCE
    const co2_1_ok = Math.abs(comp.co2_1) <= CO2_TOLERANCE
    const co2_2_ok = Math.abs(comp.co2_2) <= CO2_TOLERANCE
    if (h2o_ok && co2_1_ok && co2_2_ok) {
      const inc = calcGroupIncrement(s, i)
      const prevInc = calcGroupIncrement(s, i - 1)
      if (inc && prevInc) return (prevInc.h2o + inc.h2o) / 2
    }
  }
  if (s.groups.length >= 1) {
    const inc = calcGroupIncrement(s, 0)
    if (inc) return inc.h2o
  }
  return null
}

function calcSessionM3Formatted(s) {
  const v = calcSessionM3(s)
  return v !== null ? v.toFixed(4) : '-'
}

function valClass(val, tolerance) {
  if (Math.abs(val) <= tolerance) return 'val-pass'
  return 'val-fail'
}

function compClass(comp, field) {
  if (!comp) return ''
  return Math.abs(comp[field]) <= (field === 'h2o' ? H2O_TOLERANCE : CO2_TOLERANCE) ? 'val-pass' : 'val-fail'
}

function onNewSession() {
  createSession()
}

function onAddGroup() {
  addGroup('', '', '')
}

function onRemoveGroup(gi) {
  if (confirm('确定移除此组数据？')) {
    removeGroup(gi)
  }
}

function onDeleteSession(id) {
  if (confirm('确定删除此空白试验记录？')) {
    deleteSession(id)
  }
}

function onSaveAndClose() {
  // Just set it as active and navigate to a clean state
  // The m₃ value is automatically read by Hydrogen.vue via getCurrentM3()
  setActiveSession(session.value.id)
  alert(`空白值 m₃ = ${m3Formatted.value} g 已设定为当前使用`)
}
</script>

<style scoped>
.page { padding-bottom: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #222; margin-bottom: 4px; }
.page-subtitle { font-size: 12px; color: #888; margin-bottom: 16px; }
.clear-btn { background: none; border: 1px solid #1a73e8; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #1a73e8; cursor: pointer; white-space: nowrap; }
.clear-btn:hover { background: #e8f0fe; }

.section-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 10px; }
.form-section { background: #f8f9fa; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.form-label { font-size: 13px; color: #555; min-width: 120px; flex-shrink: 0; }
.form-input { flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; }
.form-input:focus { border-color: #1a73e8; }

/* 小组卡片 */
.group-section { background: #f8f9fa; border-radius: 10px; padding: 14px; margin-bottom: 12px; border-left: 4px solid #1a73e8; }
.group-section.group-pass { border-left-color: #34a853; background: #f1faf1; }
.group-header { display: flex; justify-content: space-between; align-items: center; }
.group-header .section-title { margin-bottom: 10px; }

/* 增量显示 */
.inc-display { margin-top: 10px; padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #e8e8e8; }
.inc-row { font-size: 13px; line-height: 1.6; }
.inc-label { color: #888; display: block; margin-bottom: 2px; }
.inc-values { display: block; font-family: 'Courier New', monospace; }
.val-pass { color: #34a853; }
.val-fail { color: #d93025; }
.inc-accept { display: block; margin-top: 4px; }
.accept-pass { color: #34a853; font-weight: 600; }
.accept-fail { color: #d93025; font-size: 12px; }

/* 结果卡片 */
.result-section { margin-top: 16px; }
.result-card-blank { display: flex; align-items: center; gap: 14px; background: #e8f5e9; border: 2px solid #34a853; border-radius: 12px; padding: 20px; }
.result-icon { font-size: 36px; }
.result-title { font-size: 16px; font-weight: 700; color: #2e7d32; margin-bottom: 4px; }
.result-m3 { font-size: 24px; font-weight: 700; color: #1b5e20; }
.result-note { font-size: 12px; color: #555; margin-top: 4px; }
.no-result { padding: 14px; background: #fff3e0; border: 1px solid #ffcc80; border-radius: 8px; color: #e65100; font-size: 13px; }

/* 按钮 */
.add-group-btn { width: 100%; padding: 12px; background: #f0f4ff; border: 2px dashed #1a73e8; border-radius: 10px; color: #1a73e8; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
.add-group-btn:hover:not(:disabled) { background: #e8f0fe; }
.add-group-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.save-btn { padding: 8px 16px; background: #34a853; color: #fff; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; white-space: nowrap; }
.save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.save-btn:hover:not(:disabled) { background: #2e7d32; }

.info-badge { font-size: 12px; font-weight: 600; color: #fff; background: #1a73e8; padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
.note-input { flex: 1; padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; outline: none; min-width: 0; }
.note-input:focus { border-color: #1a73e8; }
.session-info-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

/* 空状态 */
.current-missing { padding: 20px; text-align: center; background: #fff3e0; border: 1px solid #ffcc80; border-radius: 8px; color: #e65100; font-size: 14px; }
.m3-display { margin-top: 8px; }

/* m₃ 卡片 */
.m3-card { display: flex; align-items: center; justify-content: center; gap: 12px; background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.m3-label { font-size: 14px; color: #555; }
.m3-value { font-size: 24px; font-weight: 700; color: #2e7d32; }

/* 会话列表 */
.session-list { margin-top: 8px; }
.session-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0; margin-bottom: 6px; }
.session-item.active { border-color: #1a73e8; background: #e8f0fe; }
.session-info { flex: 1; cursor: pointer; min-width: 0; }
.session-date { font-size: 13px; font-weight: 600; color: #333; }
.session-note { font-size: 11px; color: #888; margin-left: 6px; }
.session-groups { font-size: 11px; color: #888; margin-left: 6px; }
.session-m3 { font-size: 12px; font-weight: 600; color: #34a853; white-space: nowrap; margin-right: 8px; }
.hist-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #ddd; font-size: 14px; cursor: pointer; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hist-btn.del { color: #d93025; }
.hist-btn.del:hover { background: #fce8e6; border-color: #d93025; }
</style>
