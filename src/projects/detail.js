// src/projects/detail.js


// 同步排除开关 UI
document.addEventListener('change', function(e){
  if (e.target && e.target.id === 'enroll-exclusion-switch') {
    const knob = document.getElementById('enroll-exclusion-knob');
    knob.style.transform = e.target.checked ? 'translateX(22px)' : 'translateX(0px)';
  }
});

/* ================= 分组视图切换逻辑 ================= */

function toggleGroupView(count) {
  const grid = document.getElementById('group-grid');
  const targetGroup = document.getElementById('group-target');

  if (count === 3) {
    // Switch to 3 columns
    grid.classList.remove('md:grid-cols-2');
    grid.classList.add('md:grid-cols-3');

    // Show 3rd group
    targetGroup.classList.remove('hidden');
  } else {
    // Switch to 2 columns
    grid.classList.remove('md:grid-cols-3');
    grid.classList.add('md:grid-cols-2');

    // Hide 3rd group
    targetGroup.classList.add('hidden');
  }
}

/* ================= 因子详情展开逻辑 ================= */
function toggleFactorDetails(id) {
  const details = document.getElementById('details-' + id);
  const icon = document.getElementById('icon-' + id);
  
  if (details.classList.contains('hidden')) {
    details.classList.remove('hidden');
    details.classList.add('fade-in');
    icon.classList.add('rotate-180');
  } else {
    details.classList.add('hidden');
    details.classList.remove('fade-in');
    icon.classList.remove('rotate-180');
  }
}

function toggleCriteria(type) {
  const content = document.getElementById(type === 'inclusion' ? 'criteria-inclusion' : 'criteria-exclusion');
  const icon = document.getElementById(type === 'inclusion' ? 'icon-criteria-inclusion' : 'icon-criteria-exclusion');
  const trigger = icon.parentElement;
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    icon.classList.remove('rotate-180');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  } else {
    content.classList.add('hidden');
    icon.classList.add('rotate-180');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }
}

function toggleCriteriaPanel() {
  const panel = document.getElementById('criteria-panel');
  const icon = document.getElementById('icon-criteria-panel');
  const trigger = icon.parentElement;
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    icon.classList.remove('rotate-180');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  } else {
    panel.classList.add('hidden');
    icon.classList.add('rotate-180');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }
}

// 右上角标签枚举与交互
const RIBBON_ENUM = {
  general: { text: '通用', bg: 'bg-indigo-600' },
  core: { text: '核心', bg: 'bg-emerald-600' },
  draft: { text: '草稿', bg: 'bg-amber-500' },
  disabled: { text: '禁用', bg: 'bg-red-600' }
};

function toggleBadgeDropdown(id) {
  const dd = document.getElementById('badge-dropdown-' + id);
  dd.classList.toggle('hidden');
}

function selectBadgeStatus(id, key) {
  const conf = RIBBON_ENUM[key] || RIBBON_ENUM.general;
  const textEl = document.getElementById('badge-text-' + id);

  textEl.innerText = conf.text;
  textEl.className = "absolute top-0 right-0 px-3 py-1 text-white text-xs font-bold shadow rounded-tr-xl " + conf.bg;

  const dd = document.getElementById('badge-dropdown-' + id);
  dd.classList.add('hidden');
}

/* ================= 受试者录入逻辑 (Enrollment) ================= */

function openEnrollDrawer() {
  const drawer = document.getElementById('enroll-drawer');
  const backdrop = document.getElementById('enroll-backdrop');
  const panel = document.getElementById('enroll-panel');

  // 显示抽屉容器
  drawer.classList.remove('hidden');
  
  // 延时触发动画 (Transition)
  setTimeout(() => {
    backdrop.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  }, 10);

  // 初始化状态
  resetFormState();
}

function closeEnrollDrawer() {
  const drawer = document.getElementById('enroll-drawer');
  const backdrop = document.getElementById('enroll-backdrop');
  const panel = document.getElementById('enroll-panel');

  backdrop.classList.add('opacity-0');
  panel.classList.add('translate-x-full');

  // 等动画播完再隐藏 DOM
  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 300);
}

// 完成并关闭
function resetAndClose() {
  closeEnrollDrawer();
  // 可以在这里添加刷新列表的逻辑
  // alert("数据已保存至列表");
}

// 模拟匹配逻辑 (支持 random 和 free 两种模式)
function startMatching(mode) {
  // 0. 额外必填校验
  const source = document.getElementById('enroll-source').value;
  const sourceOther = document.getElementById('enroll-source-other');
  const center = document.getElementById('enroll-center').value;
  const doctor = document.getElementById('enroll-doctor').value;
  const consent = document.getElementById('enroll-consent').checked;
  const exclusionChecked = document.getElementById('enroll-exclusion-switch').checked;
  if (!source) { alert("请选择入组来源"); return; }
  if (source === '其他' && sourceOther && !sourceOther.classList.contains('hidden') && !sourceOther.value.trim()) { alert("请填写入组来源说明"); return; }
  if (!center) { alert("请选择录入中心"); return; }
  if (!doctor) { alert("请选择所属医生"); return; }
  if (!consent) { alert("需完成签署知情同意书后才能匹配"); return; }

  // 1. 获取输入值
  const age = parseInt(document.getElementById('input-age').value);
  const myopia = parseFloat(document.getElementById('input-myopia').value);
  // const history = document.querySelector('input[name="history"]:checked').value; 
  // Assuming history logic is handled or inputs exist

  // 简单的校验
  if (!age || isNaN(myopia)) {
    alert("请完整填写年龄和近视度数");
    return;
  }

  // 如果符合排除标准，直接失败，不进入算法
  if (exclusionChecked) {
    document.getElementById('enroll-form').classList.add('hidden');
    document.getElementById('enroll-loading').classList.add('hidden');
    document.getElementById('enroll-result').classList.remove('hidden');
    document.getElementById('result-fail').classList.remove('hidden');
    document.getElementById('fail-reason').innerText = "符合项目排除标准。";
    const btnFinish = document.getElementById('btn-finish');
    btnFinish.innerText = "重新录入";
    btnFinish.classList.remove('hidden', 'bg-emerald-600', 'hover:bg-emerald-700');
    btnFinish.classList.add('bg-slate-600', 'hover:bg-slate-700');
    btnFinish.onclick = function () { resetFormState(); };
    return;
  }

  // 2. 切换 UI 到 Loading 状态
  document.getElementById('enroll-form').classList.add('hidden');
  document.getElementById('enroll-loading').classList.remove('hidden');

  // 隐藏底部所有操作按钮
  document.getElementById('btn-match-random').classList.add('hidden');
  document.getElementById('btn-match-free').classList.add('hidden');

  // 3. 模拟算法延迟
  setTimeout(() => {
    document.getElementById('enroll-loading').classList.add('hidden');
    document.getElementById('enroll-result').classList.remove('hidden');

    // 4. 通用校验逻辑 (入排标准)
    let passed = true;
    let failReason = "";

    if (age < 6 || age > 14) {
      passed = false;
      failReason = `年龄 ${age} 岁不符合纳入标准 [6-14岁]`;
    } else if (myopia > 0 || myopia < -6.00) {
      passed = false;
      failReason = `屈光度 ${myopia}D 超出研究范围 [0.00 ~ -6.00D]`;
    } 
    // else if (history === 'yes') { ... }

    if (!passed) {
      // --- 失败流程 ---
      document.getElementById('result-fail').classList.remove('hidden');
      document.getElementById('fail-reason').innerText = failReason;

      // 显示重置按钮
      const btnFinish = document.getElementById('btn-finish');
      btnFinish.innerText = "重新录入";
      btnFinish.classList.remove('hidden', 'bg-emerald-600', 'hover:bg-emerald-700');
      btnFinish.classList.add('bg-slate-600', 'hover:bg-slate-700');
      btnFinish.onclick = function () { resetFormState(); };
      return;
    }

    // --- 成功流程 ---

    // 计算分层因子 Tag (通用)
    const tagAge = (age <= 7) ? "4-7岁" : (age <= 10 ? "7-10岁" : "10-14岁");
    const tagMyopia = (myopia >= -0.5) ? "-0.50~0.00D" : (myopia >= -1.0 ? "-1.00~-0.50D" : "<-1.00D");

    if (mode === 'random') {
      // === 随机匹配逻辑 ===
      document.getElementById('result-success').classList.remove('hidden');
      document.getElementById('btn-finish').classList.remove('hidden');

      // 随机分配
      const isExperiement = Math.random() > 0.5;
      document.getElementById('res-group-name').innerText = isExperiement ? "实验组 (高频)" : "对照组 (低频)";
      document.getElementById('res-id').innerText = "CHILD_ELE_" + Math.floor(1000 + Math.random() * 9000);

      // 填充 Random 下的 tags
      const tagsHtml = `
                  <div class="flex justify-between"><span>分层因素(年龄):</span><span class="font-medium text-slate-800">${tagAge}</span></div>
                  <div class="flex justify-between"><span>分层因素(度数):</span><span class="font-medium text-slate-800">${tagMyopia}</span></div>
              `;
      document.getElementById('res-tags-container').innerHTML = tagsHtml;

    } else {
      // === 自由匹配逻辑 ===
      document.getElementById('result-selection').classList.remove('hidden');

      // 填充顶部提示 Tag
      document.getElementById('sel-tag-age').innerText = `年龄: ${tagAge}`;
      document.getElementById('sel-tag-myopia').innerText = `度数: ${tagMyopia}`;

      // 重置卡片选中状态
      clearSelectionStyles();

      // 此时不显示“完成”按钮，等待用户点击卡片
    }

  }, 1000); // 1秒动画
}

function toggleSourceOther(val) {
  const el = document.getElementById('enroll-source-other');
  if (!el) return;
  if (val === '其他') el.classList.remove('hidden');
  else el.classList.add('hidden');
}

function updateEnrollDoctors() {
  const center = document.getElementById('enroll-center').value;
  const doctorSel = document.getElementById('enroll-doctor');
  doctorSel.innerHTML = '';
  if (!center) {
    doctorSel.disabled = true;
    doctorSel.innerHTML = `<option value="" selected>请先选择录入中心</option>`;
    return;
  }
  const list = (DOCTOR_DATA && DOCTOR_DATA[center]) || [];
  list.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    doctorSel.appendChild(opt);
  });
  doctorSel.disabled = false;
}

function toggleConsent() {
  const checked = document.getElementById('enroll-consent').checked;
  const freeBtn = document.getElementById('btn-match-free');
  const randBtn = document.getElementById('btn-match-random');
  [freeBtn, randBtn].forEach(btn => {
    if (!btn) return;
    btn.disabled = !checked;
    btn.classList.toggle('opacity-50', !checked);
    btn.classList.toggle('cursor-not-allowed', !checked);
  });
}

// 自由模式：点击卡片选择组别
function selectGroupOption(group) {
  // 1. 清除旧样式
  clearSelectionStyles();

  // 2. 选中当前样式
  const card = document.getElementById(`card-${group}`);
  const dot = card.querySelector('.selection-dot');

  // 样式变化: 边框变色, 背景微变, 圆点显示
  if (group === 'exp') {
    card.classList.add('border-indigo-500', 'bg-indigo-50', 'ring-1', 'ring-indigo-500');
    card.classList.remove('border-slate-200');
  } else {
    card.classList.add('border-emerald-500', 'bg-emerald-50', 'ring-1', 'ring-emerald-500');
    card.classList.remove('border-slate-200');
  }
  dot.classList.remove('opacity-0');

  // 3. 显示底部完成按钮
  const btnFinish = document.getElementById('btn-finish');
  btnFinish.innerText = "确认分配并录入下一个";
  btnFinish.classList.remove('hidden', 'bg-slate-600', 'hover:bg-slate-700');
  btnFinish.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
  btnFinish.onclick = resetAndClose;
}

// 辅助：清除所有卡片选中态
function clearSelectionStyles() {
  ['exp', 'ctrl'].forEach(g => {
    const card = document.getElementById(`card-${g}`);
    const dot = card.querySelector('.selection-dot');

    // 恢复默认
    card.className = "group cursor-pointer bg-white border-2 border-slate-200 rounded-xl p-4 transition-all relative hover:border-gray-300";
    // 重新加上 hover 颜色
    if (g === 'exp') card.classList.add('hover:border-indigo-300');
    else card.classList.add('hover:border-emerald-300');

    dot.classList.add('opacity-0');
  });
}

function resetFormState() {
  // UI 显示重置
  document.getElementById('enroll-form').classList.remove('hidden');
  document.getElementById('enroll-loading').classList.add('hidden');
  document.getElementById('enroll-result').classList.add('hidden');

  document.getElementById('result-success').classList.add('hidden');
  document.getElementById('result-fail').classList.add('hidden');
  document.getElementById('result-selection').classList.add('hidden');

  // 按钮重置
  document.getElementById('btn-match-random').classList.remove('hidden');
  document.getElementById('btn-match-free').classList.remove('hidden');
  document.getElementById('btn-finish').classList.add('hidden');

  // 清空表单
  document.getElementById('enroll-form').reset();
  // 新增字段和禁用状态复位
  const srcOther = document.getElementById('enroll-source-other');
  if (srcOther) { srcOther.value = ''; srcOther.classList.add('hidden'); }
  const doctorSel = document.getElementById('enroll-doctor');
  if (doctorSel) {
    doctorSel.innerHTML = `<option value="" selected>请先选择录入中心</option>`;
    doctorSel.disabled = true;
  }
  const consentEl = document.getElementById('enroll-consent');
  if (consentEl) { consentEl.checked = false; }
  const freeBtn = document.getElementById('btn-match-free');
  const randBtn = document.getElementById('btn-match-random');
  if (freeBtn && randBtn) {
    freeBtn.disabled = true; freeBtn.classList.add('opacity-50','cursor-not-allowed');
    randBtn.disabled = true; randBtn.classList.add('opacity-50','cursor-not-allowed');
  }
  const excl = document.getElementById('enroll-exclusion-switch');
  const knob = document.getElementById('enroll-exclusion-knob');
  if (excl && knob) { excl.checked = false; knob.style.transform = 'translateX(0px)'; }
}

// 计算年龄
function calculateAge() {
    const dobInput = document.getElementById('input-dob').value;
    const ageInput = document.getElementById('input-age');
    
    if (!dobInput) {
        ageInput.value = '';
        return;
    }

    const dob = new Date(dobInput);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    ageInput.value = age;
}

// 切换多行文本框显示
function toggleTextArea(type, show) {
    const el = document.getElementById('desc-' + type);
    if (show) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// 切换家族史近视输入框
function toggleFamilyMyopia(val) {
    const fatherContainer = document.getElementById('input-father-myopia-container');
    const motherContainer = document.getElementById('input-mother-myopia-container');
    
    // Reset logic
    fatherContainer.classList.add('hidden');
    motherContainer.classList.add('hidden');

    if (val === 'father') {
        fatherContainer.classList.remove('hidden');
    } else if (val === 'mother') {
        motherContainer.classList.remove('hidden');
    } else if (val === 'both') {
        fatherContainer.classList.remove('hidden');
        motherContainer.classList.remove('hidden');
    }
}
