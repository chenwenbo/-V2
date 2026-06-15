/* ============================================================
   页面：派单承做 (Dispatch)
   对应规划书：4.8 派发承做 / 运营结算 Agent
   所有服务可派单、可验收；AI 按技能匹配 + 负荷均衡 + 历史质量派单
   ============================================================ */
Pages.register('dispatch', function () {
  const skus = DB.serviceProducts;
  const getSku = (id) => skus.find(s => s.id === id);

  // ---------- KPI ----------
  const kpis = [
    C.kpi({ label: '待派单', value: '4', unit: '项', icon: '🕓', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '等待匹配承做方' }),
    C.kpi({ label: '承做中', value: '9', unit: '项', icon: '🚚', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '2项', trendDir: 'up', foot: '内部 + 外部并行' }),
    C.kpi({ label: '本周完成', value: '6', unit: '项', icon: '✅', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '12%', trendDir: 'up', foot: '验收通过归档' }),
    C.kpi({ label: '逾期预警', value: '2', unit: '项', icon: '⚠️', iconBg: 'var(--red-50)', iconColor: 'var(--red)', trendDir: 'down', foot: '需升级处理' }),
  ];

  // ---------- 派单池 ----------
  const pool = [
    { item: 'SO-007 · 技术先进性论证', ent: 'E004', skill: '专家（半导体/三电）', dur: '3个工作日', suggest: '郑博士（内部专家）', match: 94, state: '待派单' },
    { item: 'SO-010 · 企业成长诊断', ent: 'E008', skill: '顾问（环保装备）', dur: '5个工作日', suggest: '张衡（内部顾问）', match: 88, state: '待派单' },
    { item: 'SO-008 · 商业计划书精修', ent: 'E006', skill: '专家（生物医药/融资）', dur: '7个工作日', suggest: '卓越投行顾问（渠道伙伴）', match: 86, state: '派单中' },
    { item: 'T005 · 发明专利布局建议', ent: 'E005', skill: '顾问 + 知识产权', dur: '6个工作日', suggest: '智信知识产权（外部承做）', match: 82, state: '待派单' },
  ];
  const poolTable = C.table({
    cols: [
      { label: '订单 / 任务', render: r => `<span class="td-strong">${C.esc(r.item)}</span>` },
      { label: '客户', render: r => { const e = DB.getEnterprise(r.ent); return e ? `<div class="cell-main">${C.entLogo(e, 28)}<span class="text-sm">${C.esc(e.name)}</span></div>` : '-'; } },
      { label: '所需角色技能', render: r => `<span class="text-sm text-2">${C.esc(r.skill)}</span>` },
      { label: '工期', render: r => `<span class="cell-sub nowrap">${C.esc(r.dur)}</span>` },
      { label: '建议承做方', render: r => `<span class="text-sm" style="color:var(--purple)">${C.esc(r.suggest)}</span> ${C.badge('匹配' + r.match, r.match >= 90 ? 'teal' : 'primary')}` },
      { label: '', render: r => C.btn('确认派单', { variant: 'primary', size: 'sm', onclick: `App.act('已确认派单给 ${C.esc(r.suggest)}')` }) },
    ],
    rows: pool,
  });

  // ---------- 承做方资源 ----------
  const resources = [
    { name: '郑博士', type: '内部专家', field: 'AI / 半导体', load: 82, cap: '本周可接 2 项', score: 4.9, kind: 'expert' },
    { name: '张衡', type: '内部顾问', field: '资质/政策托管', load: 68, cap: '本周可接 3 项', score: 4.8, kind: 'consultant' },
    { name: '陈思', type: '内部撰写', field: '申报材料生产', load: 91, cap: '负荷偏高', score: 4.7, kind: 'writer' },
    { name: '智信知识产权', type: '外部承做机构', field: '专利布局/IP', load: 55, cap: '产能充足', score: 4.6, kind: 'org' },
    { name: '卓越投行顾问', type: '渠道伙伴', field: '融资/路演辅导', load: 40, cap: '产能充足', score: 4.5, kind: 'partner' },
    { name: '安信会计师事务所', type: '外部承做机构', field: '研发费用专项审计', load: 73, cap: '本周可接 1 项', score: 4.8, kind: 'org' },
  ];
  const kindColor = { expert: 'amber', consultant: 'purple', writer: 'cyan', org: 'primary', partner: 'teal' };
  const resCards = `<div class="grid grid-3">${resources.map(r => `<div class="card"><div class="card-body" style="display:flex;flex-direction:column;gap:8px">
    <div class="flex items-center justify-between">
      ${C.badge(r.type, kindColor[r.kind])}
      <span class="text-xs" style="color:var(--amber);font-weight:700">★ ${r.score}</span>
    </div>
    <div class="td-strong" style="font-size:14px">${C.esc(r.name)}</div>
    <div class="text-xs text-2">${C.esc(r.field)}</div>
    <div style="margin-top:2px"><div class="flex justify-between mb-1"><span class="text-xs text-3">当前负荷</span><span class="text-xs fw-6">${r.load}%</span></div>${C.progress(r.load, { color: r.load >= 85 ? 'var(--red)' : r.load >= 70 ? 'var(--amber)' : 'var(--teal)' })}</div>
    <div class="flex items-center justify-between" style="margin-top:2px">
      <span class="text-xs text-3">${C.esc(r.cap)}</span>
      ${C.btn('指派', { size: 'sm', onclick: `App.act('已向 ${C.esc(r.name)} 发起派单')` })}
    </div>
  </div></div>`).join('')}</div>`;

  // ---------- 承做进度跟踪 ----------
  const progress = [
    { item: 'SO-001 · 资质培育托管', maker: '张衡（顾问）', state: '承做中', pct: 45, eta: '2026-09-12', late: false },
    { item: 'SO-003 · 高企申报材料', maker: '陈思（撰写）', state: '承做中', pct: 60, eta: '2026-06-25', late: false },
    { item: 'SO-002 · 专精特新申报', maker: '郑博士（专家）', state: '待验收', pct: 95, eta: '2026-06-17', late: false },
    { item: 'T007 · 高企研发费用归集', maker: '王磊（撰写）', state: '逾期', pct: 30, eta: '2026-06-12', late: true },
    { item: 'SO-008 · 商业计划书精修', maker: '卓越投行顾问', state: '承做中', pct: 20, eta: '2026-06-20', late: false },
  ];
  const progTable = C.table({
    cols: [
      { label: '承做项目', render: r => `<span class="td-strong">${C.esc(r.item)}</span>` },
      { label: '承做方', render: r => `<span class="text-sm">${C.esc(r.maker)}</span>` },
      { label: '状态', render: r => C.badge(r.state, r.late ? 'red' : r.state === '待验收' ? 'amber' : 'primary', true) },
      { label: '进度', render: r => `<div style="width:110px">${C.progress(r.pct, { color: r.late ? 'var(--red)' : r.pct >= 90 ? 'var(--teal)' : 'var(--primary)' })}<span class="cell-sub">${r.pct}%</span></div>` },
      { label: '预计完成', render: r => r.late ? C.badge('逾期 ' + r.eta, 'red', true) : `<span class="cell-sub nowrap">${C.esc(r.eta)}</span>` },
    ],
    rows: progress,
  });


  // ---------- 手动派单表单 ----------
  const makerOpts = resources.map(r => `<option>${C.esc(r.name)}（${C.esc(r.type)}）</option>`).join('');
  const manualForm = `<div class=\\'form-grid\\'>` +
    `<div class=\\'form-row\\'><label>派单项目 <span class=\\'req\\'>*</span></label><select class=\\'select\\'><option>SO-010 企业成长诊断</option><option>T005 发明专利布局建议</option></select></div>` +
    `<div class=\\'form-row\\'><label>承做方 <span class=\\'req\\'>*</span></label><select class=\\'select\\'>${makerOpts.replace(/"/g, '&quot;')}</select></div>` +
    `<div class=\\'form-row\\'><label>工期（工作日）</label><input class=\\'input\\' placeholder=\\'如 5\\'></div>` +
    `<div class=\\'form-row\\'><label>计划完成日</label><input class=\\'input\\' placeholder=\\'如 2026-06-25\\'></div>` +
    `</div>` +
    `<div class=\\'form-row\\'><label>派单说明</label><input class=\\'input\\' placeholder=\\'交付标准 / 验收要求 / 分成约定\\'><div class=\\'hint\\'>派单后承做方进度纳入承做进度跟踪，逾期自动预警</div></div>`;
  const manualCall = `App.openModal({title:'🚚 手动派单',size:'wide',body:"${manualForm}",foot:C.btn('取消',{onclick:'App.closeModal()'})+C.btn('确认派单',{variant:'primary',onclick:'App.closeModal();App.act(\\'已派单，承做进度开始跟踪\\')'})})`;

  return `
  ${C.pageHead({
    icon: '🚚', title: '派单承做',
    desc: '所有服务可派单、可验收。运营结算 Agent 按角色技能匹配、负荷均衡与历史质量输出派单建议与逾期提醒。承做方涵盖内部团队（顾问/撰写/专家）与外部承做机构、渠道伙伴。',
    crumbs: [{ label: '交易与结算' }, { label: '派单承做' }],
    actions: C.btn('手动派单', { icon: '➕', onclick: manualCall }) +
             C.btn('查看订单', { onclick: "location.hash='orders'" }) +
             C.btn('AI 派单建议', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${C.card({
    title: '📥 派单池', sub: '待派单的订单 / 任务 · AI 已给出建议承做方',
    actions: C.btn('手动派单', { size: 'sm', icon: '➕', onclick: manualCall }),
    pad: false,
    body: poolTable,
  })}


  ${C.card({
    title: '👥 承做方资源', sub: '内部团队 + 外部承做机构 / 渠道伙伴 · 产能 / 负荷 / 专长 / 评分',
    body: resCards,
    cls: 'mt-3',
  })}

  <div style="margin-top:14px">
    ${C.card({
      title: '📈 承做进度跟踪', sub: '已派单项目进度 · 逾期预警',
      pad: false,
      body: progTable,
    })}
  </div>
  `;
});
