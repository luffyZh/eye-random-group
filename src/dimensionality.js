// 定义维度数据源 (模拟数据库定义)
const DIMENSION_DATA = {
  gender: { name: '性别', options: ['男', '女'] },
  age: { name: '年龄', options: ['4-7', '8-10', '11-14'] },
  diopter: { name: '屈光度', options: ['-1.0~-0.5', '-0.4~0'] }
};

// 预设每组总人数 (模拟项目设置)
const GROUP_TARGET_COUNT = 50;

function openConfigDrawer() {
  const drawer = document.getElementById('config-drawer');
  const panel = document.getElementById('config-panel');
  const backdrop = document.getElementById('config-backdrop');

  drawer.classList.remove('hidden');
  setTimeout(() => {
    backdrop.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  }, 10);

  // 默认触发一次状态检查
  toggleMatchMode();
}

function closeConfigDrawer() {
  const drawer = document.getElementById('config-drawer');
  const panel = document.getElementById('config-panel');
  const backdrop = document.getElementById('config-backdrop');

  panel.classList.add('translate-x-full');
  backdrop.classList.add('opacity-0');
  setTimeout(() => drawer.classList.add('hidden'), 300);
}

// 切换匹配模式
function toggleMatchMode() {
  const mode = document.querySelector('input[name="matchMode"]:checked').value;
  const generateBtn = document.getElementById('free-generate-area');
  const matrixArea = document.getElementById('matrix-config-area');

  if (mode === 'random') {
    generateBtn.classList.add('hidden');
    matrixArea.classList.add('hidden');
  } else {
    generateBtn.classList.remove('hidden');
    // 如果之前生成过，可以选择不隐藏 matrixArea，或者强制隐藏要求重新生成
    // 这里选择隐藏，要求用户显式点击生成
    matrixArea.classList.add('hidden');
  }
}

// 核心：生成全排列因子
function generateFactors() {
  // 1. 获取选中的维度
  const checkedDims = Array.from(document.querySelectorAll('input[name="dims"]:checked')).map(el => el.value);

  if (checkedDims.length === 0) {
    alert("请至少选择一个维度！");
    return;
  }

  // 2. 准备全排列数据 [[男, 女], [4-7, 8-10...], ...]
  const arraysToCombine = checkedDims.map(key => DIMENSION_DATA[key].options);

  // 3. 计算笛卡尔积 (Cartesian Product)
  const combinations = arraysToCombine.reduce((a, b) => {
    return a.flatMap(d => b.map(e => [d, e].flat().join('_')));
  }); // 注意：这里简化了逻辑，如果只有一个维度，reduce可能需要特判，但在UI上通常至少选一个

  // 修复 reduce 对单数组的情况 (如果只选了性别)
  let factors = [];
  if (checkedDims.length === 1) {
    factors = arraysToCombine[0];
  } else {
    factors = combinations;
  }

  // 4. 渲染界面
  renderFactorList('exp-factor-list', factors, 'exp', GROUP_TARGET_COUNT);
  renderFactorList('ctrl-factor-list', factors, 'ctrl', GROUP_TARGET_COUNT);

  // 5. 显示区域
  document.getElementById('matrix-config-area').classList.remove('hidden');

  // 6. 初始化校验状态
  validateTotal('exp');
  validateTotal('ctrl');
}

// 渲染单个组的因子列表 + 自动均分
function renderFactorList(containerId, factors, prefix, totalCount) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // 清空

  const count = factors.length;
  const baseVal = Math.floor(totalCount / count);
  let remainder = totalCount % count;

  factors.forEach((factor, index) => {
    // 均匀分配算法：把余数分给前几个
    let val = baseVal;
    if (remainder > 0) {
      val += 1;
      remainder--;
    }

    const row = document.createElement('div');
    row.className = "flex items-center justify-between mb-2 last:mb-0 p-2 rounded hover:bg-white/50 border border-transparent hover:border-slate-200 transition-colors";

    // 解析因子名称，稍微美化一下显示
    // e.g., "男_4-7_-1.0~0.5" -> Tags
    const tagsHtml = factor.split('_').map(t =>
      `<span class="text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-600 mr-1">${t}</span>`
    ).join('');

    row.innerHTML = `
              <div class="flex-1 truncate mr-2" title="${factor}">
                  ${tagsHtml}
              </div>
              <input type="number" 
                    class="w-12 h-7 text-xs text-center border border-slate-300 rounded focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-white group-input-${prefix}" 
                    value="${val}" 
                    min="0"
                    oninput="validateTotal('${prefix}')">
          `;
    container.appendChild(row);
  });
}

// 校验总人数
function validateTotal(prefix) {
  const inputs = document.querySelectorAll(`.group-input-${prefix}`);
  let sum = 0;
  inputs.forEach(input => sum += (parseInt(input.value) || 0));

  const badge = document.getElementById(`${prefix}-total-badge`);
  badge.innerText = `${sum} / ${GROUP_TARGET_COUNT}`;

  if (sum === GROUP_TARGET_COUNT) {
    badge.className = "text-xs font-mono bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 text-emerald-700 font-bold transition-colors";
  } else {
    badge.className = "text-xs font-mono bg-red-100 px-2 py-0.5 rounded border border-red-200 text-red-700 font-bold transition-colors";
  }

  return sum === GROUP_TARGET_COUNT;
}

// 重置回均匀分配
function resetDistribution() {
  generateFactors();
}

// 保存配置
function saveConfiguration() {
  const mode = document.querySelector('input[name="matchMode"]:checked').value;

  if (mode === 'random') {
    // 随机模式，只需保存选中的维度
    const checkedDims = Array.from(document.querySelectorAll('input[name="dims"]:checked'));
    if (checkedDims.length === 0) {
      alert("请至少选择一个分层维度");
      return;
    }
    alert("【随机匹配模式】配置已保存！\n系统将按照选中维度进行动态区组随机化。");
    closeConfigDrawer();
  } else {
    // 自由模式，需要校验人数
    const expValid = validateTotal('exp');
    const ctrlValid = validateTotal('ctrl');

    if (!expValid || !ctrlValid) {
      alert("保存失败：\n各组分配人数之和必须等于总人数 (" + GROUP_TARGET_COUNT + "人)。\n请调整红色标记的组别。");
      return;
    }

    // 收集数据示例
    // 实际开发中这里会把 matrix 数据打包发给后端
    alert("【自由匹配模式】配置已保存！\n自定义因子配额表已生效。");
    closeConfigDrawer();
  }
}
