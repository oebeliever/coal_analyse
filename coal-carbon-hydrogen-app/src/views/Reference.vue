<template>
  <div class="page reference-page">
    <h2 class="page-title">GB/T 476-2008 标准参考</h2>
    <p class="page-subtitle">煤中碳和氢的测定方法 — 三节炉法</p>

    <div class="accordion">
      <div v-for="(section, idx) in sections" :key="idx" class="accordion-item">
        <button class="accordion-header" @click="toggle(idx)">
          <span class="accordion-icon">{{ openIdx === idx ? '▼' : '▶' }}</span>
          <span class="accordion-title">{{ section.title }}</span>
        </button>
        <div class="accordion-body" v-show="openIdx === idx">
          <div v-for="(line, li) in section.content" :key="li" class="content-line">
            {{ line }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const openIdx = ref(0)

function toggle(idx) {
  openIdx.value = openIdx.value === idx ? -1 : idx
}

const sections = [
  {
    title: '一、方法原理',
    content: [
      '煤样在氧气流中于(800±10)°C下燃烧，',
      '碳完全氧化为二氧化碳(CO₂)，氢完全氧化为水(H₂O)，',
      '生成的CO₂和H₂O分别被二氧化碳吸收剂（碱石棉）和吸水剂（无水高氯酸镁）吸收，',
      '根据吸收剂的增量计算煤中碳和氢的质量分数。',
      '',
      '干扰排除：',
      '  硫 → 铬酸铅（三节炉中段）或高锰酸银热解产物去除',
      '  氯 → 银丝卷去除',
      '  氮氧化物 → 粒状二氧化锰去除',
    ],
  },
  {
    title: '二、三节炉法操作流程',
    content: [
      '炉温控制：',
      '  第一节炉 (850±10)°C — 燃烧段',
      '  第二节炉 (800±10)°C — 燃烧段',
      '  第三节炉 (600±10)°C — 净化段',
      '  第一节炉紧靠第二节炉',
      '',
      '操作步骤（精确时间控制）：',
      '  1. 在预先灼烧过的燃烧舟中称取粒度<0.2mm的煤样0.2g（称准至0.0002g），',
      '     均匀铺平，在试样上铺一层三氧化钨',
      '  2. 以120mL/min流量通入氧气',
      '  3. 放入燃烧舟 → 塞上橡皮塞',
      '  4. 1min后 → 移动第一节炉，使燃烧舟一半进入炉子',
      '  5. 2min后 → 移动炉体，使燃烧舟全部进入炉子',
      '  6. 再2min后 → 使燃烧舟位于炉子中央',
      '  7. 保温18min → 使燃烧舟位于炉子中央保温',
      '  8. 2min后 → 取下吸收系统，关闭磨口塞',
      '  9. 用绒布擦净吸收管，在天平旁放置10min后称量',
      '',
      '总时长：1+2+2+18+2 = 25min，加称量前放置10min共35min',
    ],
  },
  {
    title: '三、试剂与材料',
    content: [
      '• 氧气：纯度≥99.5%，不含氢和有机杂质',
      '• 碱石棉：粒度1~2mm（CO₂吸收剂）',
      '• 无水高氯酸镁：粒度1~3mm（H₂O吸收剂）',
      '• 三氧化钨（WO₃）：助燃剂',
      '• 铬酸铅：粒度1~3mm（除硫）',
      '• 银丝卷：除氯',
      '• 粒状二氧化锰：除氮氧化物',
      '',
      '• 燃烧舟：素烧瓷或石英，长约70mm',
      '• U形吸收管：用于CO₂和H₂O吸收',
      '• 分析天平：感量0.0001g',
      '• 三节管式炉：带控温装置',
    ],
  },
  {
    title: '四、计算公式',
    content: [
      '碳质量分数 (空气干燥基)：',
      '  Cad = (0.2729 × m₁) / m × 100%',
      '',
      '氢质量分数 (空气干燥基)：',
      '  Had = [0.1119 × (m₂ - m₃)] / m × 100 - 0.1119 × Mad',
      '',
      '参数说明：',
      '  m  — 煤样质量 (g)',
      '  m₁ — CO₂吸收管增量 (g)， = CO₂管终质量 - CO₂管初质量',
      '       若使用双管，m₁ = m₁(①) + m₁(②)（当m₁(②)≥0.0005g时）',
      '  m₂ — H₂O吸收管增量 (g)， = H₂O管终质量 - H₂O管初质量',
      '  m₃ — 空白值 (g)',
      '  Mad — 一般分析煤样水分质量分数 (%)',
      '  0.2729 — CO₂→C换算系数 (12.01/44.01)',
      '  0.1119 — H₂O→H换算系数 (2.016/18.015)',
      '',
      '修约规则：四舍六入五单双，保留两位小数',
    ],
  },
  {
    title: '五、精密度要求',
    content: [
      '碳测定 (Cad)：',
      '  重复性限：≤ 0.50%',
      '  再现性临界差：≤ 1.00%',
      '',
      '氢测定 (Had)：',
      '  重复性限：≤ 0.15%',
      '  再现性临界差：≤ 0.30%',
      '',
      '注：重复性限指同一实验室、同一操作者、同一设备两次测定结果的差值',
      '注：再现性临界差指不同实验室之间测定结果的差值',
    ],
  },
  {
    title: '六、操作注意事项',
    content: [
      '1. 燃烧舟和填充物需预先灼烧至恒重',
      '2. 新装填的吸收管需通氧处理至恒重后方可使用',
      '3. 氧气流量必须在整个试验过程中保持120mL/min恒定',
      '4. 吸水U形管和CO₂U形管不可互换使用',
      '5. 第二个CO₂吸收管质量变化<0.0005g时，计算可忽略',
      '6. 称量吸收管时需确保关闭磨口塞，用绒布擦净',
      '7. 每次测定应做两个平行样（双样）',
      '8. 空白值应定期测定，新换吸收剂后必须重做空白',
    ],
  },
]
</script>

<style scoped>
.page { padding-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #222; margin-bottom: 4px; }
.page-subtitle { font-size: 12px; color: #888; margin-bottom: 16px; }

.accordion { display: flex; flex-direction: column; gap: 6px; }
.accordion-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #f8f9fa;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: left;
}
.accordion-header:hover { background: #eee; }
.accordion-icon { font-size: 10px; color: #888; }
.accordion-title { flex: 1; }
.accordion-body {
  padding: 12px 14px;
  background: #fff;
  font-size: 13px;
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
}
.content-line { padding: 1px 0; }
</style>
