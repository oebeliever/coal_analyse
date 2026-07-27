<template>
  <div class="page reference-page">
    <h2 class="page-title">GB/T 212-2008 标准参考</h2>
    <p class="page-subtitle">煤的工业分析方法 — 操作流程与要点</p>

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
    title: '一、水分测定 — 通氮干燥法',
    content: [
      '适用范围：所有煤种',
      '设备：通氮干燥箱、玻璃称量瓶、干燥器、分析天平（感量0.0001g）',
      '氮气纯度：99.99%以上',
      '操作步骤：',
      '  1. 在已恒重的称量瓶中称取粒度<0.2mm的分析煤样（1±0.1g），称准至0.0002g',
      '  2. 打开称量瓶盖，放入通氮干燥箱中',
      '  3. 在105~110°C下干燥：褐煤/无烟煤2h，其他煤种1.5h',
      '  4. 取出盖上盖，放入干燥器中冷却至室温（约20min）后称量',
      '  5. 进行检查性干燥，每次30min，直到连续两次质量差不超过0.001g为止',
      '  6. 取最后一次质量为计算依据',
      '注意事项：氮气流量应保持稳定，约100mL/min',
    ],
  },
  {
    title: '二、水分测定 — 空气干燥法',
    content: [
      '适用范围：无烟煤和烟煤',
      '设备：鼓风干燥箱、玻璃称量瓶、干燥器、分析天平（感量0.0001g）',
      '操作步骤：',
      '  1. 在已恒重的称量瓶中称取粒度<0.2mm的分析煤样（1±0.1g），称准至0.0002g',
      '  2. 打开称量瓶盖，放入已加热到105~110°C的鼓风干燥箱中',
      '  3. 烟煤干燥1h，无烟煤干燥1~1.5h',
      '  4. 取出盖上盖，放入干燥器中冷却至室温后称量',
      '  5. 进行检查性干燥，每次30min，直到连续两次质量差不超过0.001g为止',
      '  6. 取最后一次质量为计算依据',
    ],
  },
  {
    title: '三、灰分测定 — 缓慢灰化法',
    content: [
      '适用范围：仲裁分析用',
      '设备：马弗炉（智能温控）、灰皿、干燥器、分析天平（感量0.0001g）',
      '操作步骤：',
      '  1. 在已恒重的灰皿中称取粒度<0.2mm的分析煤样（1±0.1g），称准至0.0002g',
      '  2. 将灰皿送入温度不超过100°C的马弗炉中',
      '  3. 在自然通风条件下，用30min升温至500°C，保持30min',
      '  4. 继续升温至(815±10)°C，保持1h',
      '  5. 取出灰皿，在空气中冷却5min，放入干燥器中冷却至室温后称量',
      '  6. 进行检查性灼烧，每次20min，直到连续两次质量差不超过0.001g为止',
      '  7. 取最后一次质量为计算依据',
    ],
  },
  {
    title: '四、灰分测定 — 快速灰化法',
    content: [
      '适用范围：日常分析',
      '方法A：',
      '  1. 将马弗炉加热至(815±10)°C',
      '  2. 将灰皿推入炉内，在(815±10)°C下灼烧40min',
      '方法B：',
      '  1. 将马弗炉加热至(815±10)°C',
      '  2. 将灰皿放在炉门口预热5~10min',
      '  3. 再推入炉内，在(815±10)°C下灼烧40min',
      '两种方法均需进行检查性灼烧，每次20min，至质量变化<0.001g',
    ],
  },
  {
    title: '五、挥发分测定',
    content: [
      '适用范围：所有煤种',
      '设备：马弗炉（控温精度±10°C）、挥发分坩埚（带盖）、坩埚架、干燥器、分析天平',
      '操作步骤：',
      '  1. 在已恒重的坩埚中称取粒度<0.2mm的分析煤样（1±0.1g），称准至0.0002g',
      '  2. 轻敲使煤样铺平，盖上盖，放在坩埚架上',
      '  3. 将马弗炉预先加热至(920±10)°C（炉温达到920°C后开始计时）',
      '  4. 迅速将坩埚架推入炉内恒温区，关闭炉门',
      '  5. 坩埚放入后，要求炉温在3min内恢复至(900±10)°C',
      '  6. 准确加热7min（包括恢复时间在内）',
      '  7. 取出坩埚，在空气中冷却5~10min，放入干燥器中冷却至室温后称量',
      '注意事项：',
      '  - 坩埚盖必须密封严密',
      '  - 加热时间必须严格控制在7min',
      '  - 每次测定应做两个平行样',
    ],
  },
  {
    title: '六、结果计算精密度要求',
    content: [
      '水分测定：',
      '  重复性限：Mad ≤ 0.20%（空气干燥基）',
      '  再现性临界差：Mad ≤ 0.30%',
      '',
      '灰分测定：',
      '  重复性限：Aad ≤ 0.20%（空气干燥基）',
      '  再现性临界差：Aad ≤ 0.30%',
      '',
      '挥发分测定：',
      '  重复性限：Vad ≤ 0.30%（空气干燥基）',
      '  再现性临界差：Vad ≤ 0.50%',
      '',
      '注：重复性限指同一实验室、同一操作者、同一设备两次测定结果的差值',
    ],
  },
  {
    title: '七、常用计算公式汇总',
    content: [
      '水分 (Mad)：',
      '  m₃ = min(三次干燥后质量)',
      '  m₄ = m₁ + m₂ - m₃（减少质量）',
      '  Mad = m₄ / m₂ × 100%',
      '',
      '灰分 (Aad)：',
      '  m₃ = min(三次灼烧后质量)',
      '  m₄ = m₃ - m₁（剩余质量）',
      '  Aad = m₄ / m₂ × 100%',
      '',
      '挥发分 (Vad)：',
      '  m₃ = min(三次加热后质量)',
      '  m₄ = m₁ + m₂ - m₃（减少质量）',
      '  Vad = (m₄ / m₂) × 100% - Mad',
      '',
      '修约规则：四舍六入五单双，保留四位小数',
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
