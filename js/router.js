/* ============================================================
   router.js — 哈希路由 + 导航配置
   window.Pages: 页面注册表;  window.Router: 路由控制
   ============================================================ */

window.Pages = (function () {
  const registry = {};
  return {
    register(id, renderFn) { registry[id] = renderFn; },
    get(id) { return registry[id]; },
    has(id) { return !!registry[id]; },
    all() { return Object.keys(registry); },
  };
})();

/* 导航分组配置 — 覆盖产品规划书全部章节与功能模块 */
window.NAV = [
  {
    group: '经营总览',
    items: [
      { id: 'dashboard', icon: '📊', text: '经营驾驶舱', badge: '' },
    ],
  },
  {
    group: '获客增长',
    items: [
      { id: 'prospect-push',   icon: '🎯', text: '高潜标的推送', badge: '12' },
      { id: 'enterprise-pool', icon: '🏢', text: '企业池与画像' },
      { id: 'survey-tasks',    icon: '📝', text: '摸排任务派发', badge: '3' },
    ],
  },
  {
    group: '商机与销售',
    items: [
      { id: 'opportunity', icon: '💡', text: '商机管理看板' },
    ],
  },
  {
    group: '企业托管',
    items: [
      { id: 'hosting',          icon: '🛡️', text: '托管企业监控' },
      { id: 'policy-calendar',  icon: '📅', text: '政策申报日历', badge: '6' },
      { id: 'policy-library',   icon: '📚', text: '政策项目库' },
      { id: 'dynamics',         icon: '📡', text: '企业动态检测' },
    ],
  },
  {
    group: '交付协同',
    items: [
      { id: 'project-plan',   icon: '🗓️', text: '年度项目计划' },
      { id: 'gap-tasks',      icon: '🧩', text: '未达标缺口任务' },
      { id: 'writing-tasks',  icon: '✍️', text: '撰写任务生产' },
      { id: 'task-center',    icon: '✅', text: '任务中心·状态机' },
    ],
  },
  {
    group: '评审质量',
    items: [
      { id: 'review-ai',      icon: '🤖', text: 'AI评审' },
      { id: 'review-expert',  icon: '👨‍🔬', text: '专家评审' },
      { id: 'review-library', icon: '🗂️', text: '评审沉淀库' },
    ],
  },
  {
    group: '智能体中心',
    items: [
      { id: 'agents', icon: '✨', text: '智能体矩阵' },
    ],
  },
  {
    group: '服务交易',
    items: [
      { id: 'service-products', icon: '🛒', text: '服务产品货架' },
    ],
  },
];

/* 隐藏页面（仅通过跳转进入，不在主导航显示）的标题映射 */
window.HIDDEN_PAGES = {
  'enterprise-profile': '企业画像详情',
  'hosting-detail':     '托管企业详情',
  'writing-editor':     '材料撰写工作台',
  'agent-detail':       '智能体详情',
};

window.Router = (function () {
  let current = null;

  function parse() {
    const hash = location.hash.replace(/^#/, '') || 'dashboard';
    const [path, query] = hash.split('?');
    const params = {};
    if (query) query.split('&').forEach(kv => { const [k, v] = kv.split('='); params[k] = decodeURIComponent(v || ''); });
    return { path, params };
  }

  function render() {
    const { path, params } = parse();
    const main = document.getElementById('main');
    const fn = Pages.get(path);
    current = path;

    // 更新导航高亮
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === path);
    });

    if (!fn) {
      main.innerHTML = `<div class="empty" style="padding-top:80px"><div class="e-ic">🚧</div>
        <div style="font-size:16px;color:var(--ink);font-weight:600">页面「${path}」建设中</div>
        <div class="mt-1">该模块已在规划书中定义，原型页面正在补充</div>
        <div class="mt-3">${C.btn('返回经营驾驶舱', { variant: 'primary', onclick: "location.hash='dashboard'" })}</div></div>`;
      return;
    }

    main.scrollTop = 0;
    window.scrollTo(0, 0);
    try {
      main.innerHTML = fn(params) || '';
      main.classList.add('fade-in');
      setTimeout(() => main.classList.remove('fade-in'), 240);
      // 页面渲染后回调（用于绑定拖拽/图表动画）
      if (typeof App !== 'undefined' && App.afterRender) App.afterRender(path, params);
    } catch (err) {
      console.error('页面渲染错误:', path, err);
      main.innerHTML = `<div class="empty"><div class="e-ic">⚠️</div>页面渲染出错：${C.esc(err.message)}</div>`;
    }
    // 窄屏渲染后收起侧栏
    if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('show');
  }

  function go(path) { location.hash = path; }

  function init() {
    window.addEventListener('hashchange', render);
    render();
  }

  return { init, render, go, parse, current: () => current };
})();
