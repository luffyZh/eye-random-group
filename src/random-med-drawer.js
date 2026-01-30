
/* ================= 随机号/药品号清单 Drawer Logic ================= */

function openRandomMedDrawer(type) {
  const drawer = document.getElementById('random-med-drawer');
  const backdrop = document.getElementById('random-med-backdrop');
  const panel = document.getElementById('random-med-panel');
  const title = document.getElementById('random-med-title');
  const content = document.getElementById('random-med-content');

  // Update Title
  title.innerText = type === 'random' ? '随机号清单' : '药品号清单';

  // Generate and Render Content
  renderRandomMedList(type, content);

  // Show Drawer
  drawer.classList.remove('hidden');
  setTimeout(() => {
    backdrop.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  }, 10);
}

function closeRandomMedDrawer() {
  const drawer = document.getElementById('random-med-drawer');
  const backdrop = document.getElementById('random-med-backdrop');
  const panel = document.getElementById('random-med-panel');

  backdrop.classList.add('opacity-0');
  panel.classList.add('translate-x-full');

  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 300);
}

function renderRandomMedList(type, container) {
  // Mock Data Generation
  // Assuming 2 Groups: Experiment (24/50 used), Control (26/50 used)
  // Total 100 items pre-generated

  const groups = [
    {
      id: 'exp',
      name: '实验组 (高频)',
      color: 'indigo',
      total: 50,
      used: 24,
      prefix: type === 'random' ? 'R-' : 'D-', // R for Random, D for Drug
      start: 1001
    },
    {
      id: 'ctrl',
      name: '对照组 (低频)',
      color: 'emerald',
      total: 50,
      used: 26,
      prefix: type === 'random' ? 'R-' : 'D-',
      start: 2001
    }
  ];

  let html = `<div class="space-y-8">`;

  groups.forEach(g => {
    // Generate items for this group
    let itemsHtml = '';
    for (let i = 0; i < g.total; i++) {
      const isUsed = i < g.used;
      const num = g.prefix + (g.start + i);
      
      const styleClass = isUsed 
        ? "text-slate-300 line-through bg-slate-50 border-slate-100" 
        : `text-slate-700 font-mono font-medium bg-white border-slate-200 hover:border-${g.color}-300 hover:text-${g.color}-600 cursor-default`;

      itemsHtml += `
        <div class="px-3 py-2 rounded border text-center text-sm transition-colors ${styleClass}">
          ${num}
        </div>
      `;
    }

    // Card Header color
    const headerColor = g.color === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100';

    html += `
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center ${headerColor}">
          <h4 class="font-bold">${g.name}</h4>
          <span class="text-xs font-bold bg-white/60 px-2 py-0.5 rounded border border-white/50">
            ${g.used} / ${g.total} 已分配
          </span>
        </div>
        <div class="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          ${itemsHtml}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function exportListToCSV() {
  const title = document.getElementById('random-med-title').innerText;
  const isRandom = title.includes('随机号');
  const type = isRandom ? 'random' : 'med';
  
  // Reuse generation logic or get from DOM? 
  // Better to reuse generation logic for cleaner data.
  // Mock Data (same as render)
  const groups = [
    {
      id: 'exp',
      name: '实验组 (高频)',
      total: 50,
      prefix: type === 'random' ? 'R-' : 'D-',
      start: 1001
    },
    {
      id: 'ctrl',
      name: '对照组 (低频)',
      total: 50,
      prefix: type === 'random' ? 'R-' : 'D-',
      start: 2001
    }
  ];

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "分组名称,编号,状态\n"; // Header

  groups.forEach(g => {
    for (let i = 0; i < g.total; i++) {
        const num = g.prefix + (g.start + i);
        // Mocking 'used' status logic again roughly (24 for exp, 26 for ctrl)
        const usedCount = g.id === 'exp' ? 24 : 26;
        const status = i < usedCount ? "已分配" : "未分配";
        csvContent += `${g.name},${num},${status}\n`;
    }
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const filename = isRandom ? "随机号清单.csv" : "药品号清单.csv";
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF
  
  // Show alert before download
  alert(`即将下载 ${filename} 到本地...`);
  
  link.click();
  document.body.removeChild(link);
}
