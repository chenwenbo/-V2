/* ============================================================
   app.js — 应用引导 + 全局交互
   window.App
   ============================================================ */
window.App = (function () {

  let currentRole = 'owner';

  /* ---------- 渲染侧边导航 ---------- */
  function renderNav() {
    const nav = document.getElementById('nav');
    nav.innerHTML = NAV.map(g =>
      `<div class="nav-group-title">${g.group}</div>` +
      g.items.map(it =>
        `<div class="nav-item" data-page="${it.id}" onclick="location.hash='${it.id}'">
          <span class="ni-icon">${it.icon}</span>
          <span class="ni-text">${it.text}</span>
          ${it.badge ? `<span class="ni-badge">${it.badge}</span>` : ''}
        </div>`
      ).join('')
    ).join('');
  }

  /* ---------- 角色切换 ---------- */
  function renderRoleMenu() {
    const menu = document.getElementById('roleMenu');
    menu.innerHTML = `<div class="role-menu-title">切换工作角色（不同角色看到不同工作台与权限）</div>` +
      DB.roles.map(r =>
        `<div class="role-item ${r.id === currentRole ? 'active' : ''}" onclick="App.setRole('${r.id}')">
          <div class="ri-av" style="background:${r.color}1a;color:${r.color}">${r.short}</div>
          <div class="li-main"><div class="ri-name">${r.name}</div><div class="ri-desc">${r.desc}</div></div>
        </div>`
      ).join('');
  }

  function setRole(id) {
    currentRole = id;
    const r = DB.roles.find(x => x.id === id);
    document.getElementById('roleAvatar').textContent = r.short;
    document.getElementById('roleAvatar').style.background = r.color + '1a';
    document.getElementById('roleAvatar').style.color = r.color;
    document.getElementById('roleName').textContent = r.name;
    document.getElementById('roleMenu').classList.remove('open');
    renderRoleMenu();
    toast(`已切换为「${r.name}」视角`, 'success');
    // 角色切换后重渲染当前页（页面可根据 App.role() 调整）
    Router.render();
  }

  function role() { return currentRole; }
  function roleObj() { return DB.roles.find(r => r.id === currentRole); }

  /* ---------- Toast ---------- */
  function toast(msg, type = '', dur = 2600) {
    const wrap = document.getElementById('toastWrap');
    const ic = { success: '✓', warn: '⚠', error: '✕', '': '💬' }[type] || '💬';
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="t-ic">${ic}</span><span>${C.esc(msg)}</span>`;
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = '.3s'; setTimeout(() => el.remove(), 300); }, dur);
  }

  /* ---------- 模态 ---------- */
  function openModal({ title, body, foot = '', size = '' }) {
    const modal = document.getElementById('modal');
    modal.className = `modal ${size}`;
    modal.innerHTML = `
      <div class="modal-head"><h3>${title}</h3><button class="modal-close" onclick="App.closeModal()">✕</button></div>
      <div class="modal-body">${body}</div>
      ${foot ? `<div class="modal-foot">${foot}</div>` : ''}`;
    document.getElementById('modalMask').classList.add('open');
  }
  function closeModal() { document.getElementById('modalMask').classList.remove('open'); }

  /* ---------- AI 助手抽屉 ---------- */
  function openAI(context = '') {
    const drawer = document.getElementById('aiDrawer');
    drawer.innerHTML = aiDrawerContent(context);
    drawer.classList.add('open');
    document.getElementById('drawerMask').classList.add('open');
  }
  function closeAI() {
    document.getElementById('aiDrawer').classList.remove('open');
    document.getElementById('drawerMask').classList.remove('open');
  }
  function aiDrawerContent(context) {
    const suggestions = [
      '哪些托管企业适合本月专精特新申报？',
      '帮云栖智能生成一段专精特新触达话术',
      '微岩新材料离高企认定还差哪些条件？',
      '生成本周逾期任务的处理建议',
    ];
    return `
      <div class="modal-head" style="border-bottom:1px solid var(--line-2)">
        <h3>✨ AI 经营助手</h3><button class="modal-close" onclick="App.closeAI()">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:18px">
        ${C.alert('AI 负责发现、生成、解释、提醒、初评和推荐；关键判断、合规确认与客户承诺由专家和负责人完成。', 'purple', '✨')}
        <div class="ai-block mt-3">
          <div class="ai-tag">综合洞察</div>
          <div class="mt-1" style="font-size:13px;line-height:1.7">
            当前共 <b>4</b> 家托管企业，本月有 <b>2</b> 个临期申报窗口（专精特新 35 天、重大专项 25 天）。
            建议优先推进 <b>智驰新能源</b> 的国家级专精特新材料，AI 评审已就绪，等待专家复核。
            另检测到 <b>恒瑞医疗</b> 完成新融资，触发省级技术中心商机。
          </div>
          <div class="source-ref mt-2">依据：政策日历 / 动态检测 / 评审队列</div>
        </div>
        <div class="mt-3 mb-1 text-sm fw-6 text-ink">试试这样问</div>
        ${suggestions.map(s => `<div class="list-item" style="cursor:pointer" onclick="App.toast('AI 正在生成回答…')">
          <div class="li-icon" style="background:var(--purple-50);color:var(--purple)">💬</div>
          <div class="li-main"><div class="li-title" style="font-weight:500">${s}</div></div>
          <span class="text-3">↗</span></div>`).join('')}
      </div>
      <div style="padding:14px 18px;border-top:1px solid var(--line-2)">
        <div class="global-search" style="height:42px">
          <span class="gs-icon">✨</span>
          <input type="text" placeholder="向 AI 助手提问…" onkeydown="if(event.key==='Enter'){App.toast('AI 正在生成回答…');this.value=''}" />
          <button class="btn btn-ai btn-sm" onclick="App.toast('AI 正在生成回答…')">发送</button>
        </div>
      </div>`;
  }

  /* ---------- 标签页切换 ---------- */
  function switchTab(group, idx) {
    document.querySelectorAll(`[data-tab^="${group}-"]`).forEach(t => t.classList.remove('active'));
    document.querySelectorAll(`[data-panel^="${group}-"]`).forEach(p => p.classList.remove('active'));
    const tab = document.querySelector(`[data-tab="${group}-${idx}"]`);
    const panel = document.querySelector(`[data-panel="${group}-${idx}"]`);
    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  /* ---------- Pill 切换 ---------- */
  function switchPill(el, group) {
    el.parentElement.querySelectorAll('.pill-tab').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
  }

  /* ---------- 看板拖拽 ---------- */
  function initKanban() {
    let dragEl = null;
    document.querySelectorAll('.kb-card[draggable="true"]').forEach(card => {
      card.addEventListener('dragstart', () => { dragEl = card; setTimeout(() => card.classList.add('dragging'), 0); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); dragEl = null; });
    });
    document.querySelectorAll('.kb-col').forEach(col => {
      const drop = col.querySelector('.kb-col-body') || col;
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('dragover'); });
      col.addEventListener('dragleave', () => col.classList.remove('dragover'));
      col.addEventListener('drop', e => {
        e.preventDefault(); col.classList.remove('dragover');
        if (dragEl) {
          drop.appendChild(dragEl);
          updateKanbanCounts();
          const stage = col.dataset.stageName || '新阶段';
          toast(`商机已移动到「${stage}」，AI 已生成对应阶段动作建议`, 'success');
        }
      });
    });
  }
  function updateKanbanCounts() {
    document.querySelectorAll('.kb-col').forEach(col => {
      const cnt = col.querySelectorAll('.kb-card').length;
      const badge = col.querySelector('.kb-col-count');
      if (badge) badge.textContent = cnt;
    });
  }

  /* ---------- 页面渲染后回调 ---------- */
  function afterRender(path, params) {
    // 看板拖拽
    if (document.querySelector('.kanban')) initKanban();
    // 进度条/圆环入场动画已由 CSS transition 处理
  }

  /* ---------- 全局快捷动作（供页面调用的占位交互） ---------- */
  function act(label) { toast(label || '操作已记录（原型演示）', 'success'); }
  function notImpl() { toast('原型演示：该操作将在正式版中落地', ''); }

  /* 通知面板 */
  function openNotif() {
    openModal({
      title: '🔔 提醒中心', size: 'wide',
      body: `<div class="mb-2 text-sm text-2">政策、企业动态、任务、商机、评审等触发式提醒统一汇聚</div>` +
        DB.notifications.map(n => `<div class="list-item">
          <div class="li-icon" style="background:${n.color}1a;color:${n.color}">${n.icon}</div>
          <div class="li-main"><div class="li-title">${C.badge(n.type, 'gray')} ${n.title}</div><div class="li-sub">${n.desc} · ${n.time}</div></div>
          <button class="btn btn-sm">查看</button>
        </div>`).join(''),
      foot: C.btn('全部标记已读', { onclick: 'App.act("已全部标记已读");App.closeModal()' }) + C.btn('关闭', { variant: 'primary', onclick: 'App.closeModal()' }),
    });
  }

  /* ---------- 引导 ---------- */
  function boot() {
    renderNav();
    renderRoleMenu();

    // 导航折叠
    document.getElementById('navToggle').addEventListener('click', () => {
      const sb = document.getElementById('sidebar'), main = document.getElementById('main');
      if (window.innerWidth <= 900) { sb.classList.toggle('show'); }
      else { sb.classList.toggle('collapsed'); main.classList.toggle('full'); }
    });

    // 角色菜单
    document.getElementById('roleSwitcher').addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('roleMenu').classList.toggle('open');
    });
    document.addEventListener('click', () => document.getElementById('roleMenu').classList.remove('open'));

    // 顶部按钮
    document.getElementById('aiAssistBtn').addEventListener('click', () => openAI());
    document.getElementById('notifBtn').addEventListener('click', openNotif);
    document.getElementById('drawerMask').addEventListener('click', closeAI);
    document.getElementById('modalMask').addEventListener('click', e => { if (e.target.id === 'modalMask') closeModal(); });

    // 全局搜索
    const gs = document.getElementById('globalSearch');
    gs.addEventListener('keydown', e => { if (e.key === 'Enter' && gs.value.trim()) toast(`正在搜索「${gs.value.trim()}」…`, ''); });
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); gs.focus(); }
      if (e.key === 'Escape') { closeModal(); closeAI(); }
    });

    Router.init();
  }

  return {
    boot, setRole, role, roleObj, toast, openModal, closeModal, openAI, closeAI,
    switchTab, switchPill, afterRender, act, notImpl, openNotif, initKanban, updateKanbanCounts,
  };
})();

document.addEventListener('DOMContentLoaded', App.boot);
