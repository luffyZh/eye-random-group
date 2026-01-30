function hideAllViews() {
  document.getElementById("view-projects").classList.add("hidden");
  document.getElementById("view-project-detail").classList.add("hidden");
  document.getElementById("view-dimensions").classList.add("hidden");
  document.getElementById("view-departments").classList.add("hidden");
  document.getElementById("view-roles").classList.add("hidden");
  document.getElementById("view-centers").classList.add("hidden");
  document.getElementById("view-center-detail").classList.add("hidden");
  document.getElementById("view-users").classList.add("hidden");

  document
    .querySelectorAll(".nav-item")
    .forEach((el) =>
      el.classList.remove(
        "active",
        "bg-brand-50",
        "text-brand-600"
      )
    );
}

const routeConfig = {
  projects: {
    title: "项目管理",
    description: "管理所有临床研究项目",
    permissions: [
      { text: "所有角色", color: "slate" }
    ]
  },
  dimensions: {
    title: "维度管理",
    description: "定义全局可用的随机化分层因素",
    permissions: [
      { text: "开发者账户", color: "indigo" },
      { text: "超级管理员", color: "purple" },
      { text: "中心管理员", color: "emerald" }
    ]
  },
  departments: {
    title: "科室管理",
    description: "定义项目关联的临床科室",
    permissions: [
      { text: "开发者账户", color: "indigo" },
      { text: "超级管理员", color: "purple" }
    ]
  },
  roles: {
    title: "角色权限控制",
    description: "管理系统角色与功能权限",
    permissions: [
      { text: "开发者账户", color: "indigo" },
      { text: "超级管理员", color: "purple" }
    ]
  },
  centers: {
    title: "中心管理",
    description: "管理多中心临床试验的各个分中心信息",
    permissions: [
      { text: "开发者账户", color: "indigo" },
      { text: "超级管理员", color: "purple" },
      { text: "中心管理员", color: "emerald" }
    ]
  },
  users: {
    title: "用户管理",
    description: "维护系统用户、组织归属与角色权限",
    permissions: [
      { text: "开发者账户", color: "indigo" },
      { text: "超级管理员", color: "purple" }
    ]
  }
};

function updateHeader(config) {
  // Update Title
  document.getElementById("page-title").innerText = config.title || "";
  
  // Update Description
  const descEl = document.getElementById("page-description");
  if (config.description) {
    descEl.innerText = config.description;
    descEl.classList.remove("hidden");
  } else {
    descEl.classList.add("hidden");
  }
  
  // Update Permissions
  const permContainer = document.getElementById("page-permissions");
  permContainer.innerHTML = ""; // Clear existing
  if (config.permissions && config.permissions.length > 0) {
    config.permissions.forEach(perm => {
      const span = document.createElement("span");
      span.className = `px-2 py-0.5 text-xs font-normal rounded bg-${perm.color}-100 text-${perm.color}-700`;
      span.innerText = perm.text;
      permContainer.appendChild(span);
    });
  }
}

function switchTab(tabName) {
  hideAllViews();
  
  // Ensure create-project-wizard is hidden when switching tabs
  if (typeof cancelWizard === 'function') {
    // Only call if wizard is visible to avoid unnecessary DOM updates
    const wiz = document.getElementById('create-project-wizard');
    if (wiz && !wiz.classList.contains('hidden')) {
        cancelWizard();
    }
  } else {
    // Fallback if cancelWizard is not available (e.g. not loaded yet)
    const wiz = document.getElementById('create-project-wizard');
    if (wiz) {
        wiz.classList.add('hidden');
        wiz.classList.remove('flex');
    }
  }

  const config = routeConfig[tabName];
  if (config) {
    updateHeader(config);
  } else {
     // Fallback or specific pages not in config
  }

  const navItem = document.getElementById("nav-" + tabName);
  if (navItem) {
      navItem.classList.add("active", "bg-brand-50", "text-brand-600");
  }
  
  const viewItem = document.getElementById("view-" + tabName);
  if (viewItem) {
      viewItem.classList.remove("hidden");
  }

  if (tabName === "roles") {
    renderRoleList(); // Initialize
  }
}

function openProjectDetail(isFission = false) {
  hideAllViews();
  document
    .getElementById("view-project-detail")
    .classList.remove("hidden");
  document
    .getElementById("nav-projects")
    .classList.add("active", "bg-brand-50", "text-brand-600"); // 保持项目管理高亮
  
  updateHeader({ title: "项目详情" });
  window.scrollTo(0, 0);

  // Toggle Fission Content
  const fissionContent = document.querySelectorAll('.fission-content');
  const normalContent = document.querySelectorAll('.normal-content');
  const projectTitle = document.querySelector('#view-project-detail h2');
  
  if (isFission) {
      fissionContent.forEach(el => el.classList.remove('hidden'));
      normalContent.forEach(el => el.classList.add('hidden'));
      if(projectTitle) projectTitle.innerText = "冠心病介入治疗术后心脏康复分级干预策略的多中心随机对照研究";
      
      // Reset Fission Group View to default state
      if (typeof resetFissionGroupView === 'function') {
        resetFissionGroupView();
      }
  } else {
      fissionContent.forEach(el => el.classList.add('hidden'));
      normalContent.forEach(el => el.classList.remove('hidden'));
      if(projectTitle) projectTitle.innerText = "光刻微结构近视管理镜片在儿童青少年近视防控中的有效性及佩戴安全舒适性的随机对照临床研究";
      
      // Reset Normal Group View to default state (2 groups)
      if (typeof toggleGroupView === 'function') {
        toggleGroupView(2);
        // Reset radio button UI if needed
        const radios = document.getElementsByName('group');
        if (radios && radios.length > 0) radios[0].checked = true;
      }
  }
}

function backToProjects() {
  switchTab("projects");
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const headerContent = document.getElementById('sidebar-header-content');
  const navTexts = document.querySelectorAll('.nav-text');
  const versionInfo = document.getElementById('sidebar-version-info');
  const footer = document.getElementById('sidebar-footer');
  const toggleBtnIcon = document.querySelector('#sidebar-toggle-btn i');
  
  const isExpanded = sidebar.classList.contains('w-72');
  
  if (isExpanded) {
    // Collapse
    sidebar.classList.replace('w-72', 'w-20');
    
    headerContent.classList.add('opacity-0', 'w-0');
    
    navTexts.forEach(t => t.classList.add('opacity-0', 'w-0'));
    
    versionInfo.classList.add('opacity-0', 'w-0');
    
    footer.classList.replace('px-6', 'px-2');
    footer.classList.replace('flex-row', 'flex-col'); 
    footer.classList.replace('justify-between', 'justify-center');
    footer.classList.add('gap-4');
    
    toggleBtnIcon.classList.replace('ri-menu-fold-line', 'ri-menu-unfold-line');
  } else {
    // Expand
    sidebar.classList.replace('w-20', 'w-72');
    
    headerContent.classList.remove('opacity-0', 'w-0');
    
    navTexts.forEach(t => t.classList.remove('opacity-0', 'w-0'));
    
    versionInfo.classList.remove('opacity-0', 'w-0');
    
    footer.classList.replace('px-2', 'px-6');
    footer.classList.replace('flex-col', 'flex-row');
    footer.classList.replace('justify-between', 'justify-between');
    footer.classList.remove('gap-4');

    toggleBtnIcon.classList.replace('ri-menu-unfold-line', 'ri-menu-fold-line');
  }
}

// ================= Notification Drawer Logic =================
function toggleNotificationDrawer() {
  const drawer = document.getElementById('notification-drawer');
  const backdrop = document.getElementById('notification-backdrop');
  const panel = document.getElementById('notification-panel');
  
  if (drawer.classList.contains('hidden')) {
    drawer.classList.remove('hidden');
    // Trigger reflow
    void drawer.offsetWidth;
    
    backdrop.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  } else {
    closeNotificationDrawer();
  }
}

function closeNotificationDrawer() {
  const drawer = document.getElementById('notification-drawer');
  const backdrop = document.getElementById('notification-backdrop');
  const panel = document.getElementById('notification-panel');
  
  backdrop.classList.add('opacity-0');
  panel.classList.add('translate-x-full');
  
  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 300);
}