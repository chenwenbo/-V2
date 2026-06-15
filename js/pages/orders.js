/* ============================================================
   页面：订单管理 (Orders)
   对应规划书：4.8 服务产品下单 / 4.3 赢单动作 / 第7章 商业化
   下单后自动生成托管档案 / 项目计划 / 交付任务
   ============================================================ */
Pages.register('orders', function () {
  const ents = DB.enterprises;
  const skus = DB.serviceProducts;
  const getSku = (id) => skus.find(s => s.id === id);
  const entByName = (n) => ents.find(e => e.name.includes(n) || n.includes(e.logo));

  // 订单状态定义
  const orderStates = [
    { id: '待派单', color: 'gray' }, { id: '派单中', color: 'cyan' }, { id: '交付中', color: 'primary' },
    { id: '待验收', color: 'amber' }, { id: '已完成', color: 'teal' }, { id: '已结算', color: 'purple' },
  ];
  const stColor = (s) => (orderStates.find(o => o.id === s) || {}).color || 'gray';

  // ---------- 自构造订单（关联企业 + SKU） ----------
  const orders = [
    { no: 'SO-20260612-001', entId: 'E001', sku: 'SKU-H02', amount: 8.6, created: '2026-06-12', state: '交付中', owner: '张衡（顾问）' },
    { no: 'SO-20260611-002', entId: 'E002', sku: 'SKU-A02', amount: 6.5, created: '2026-06-11', state: '待验收', owner: '张衡（顾问）' },
    { no: 'SO-20260610-003', entId: 'E004', sku: 'SKU-A01', amount: 3.8, created: '2026-06-10', state: '交付中', owner: '孙琪（顾问）' },
    { no: 'SO-20260609-004', entId: 'E003', sku: 'SKU-D01', amount: 0.88, created: '2026-06-09', state: '已完成', owner: '李明（销售）' },
    { no: 'SO-20260608-005', entId: 'E005', sku: 'SKU-D02', amount: 0.68, created: '2026-06-08', state: '已结算', owner: '李明（销售）' },
    { no: 'SO-20260607-006', entId: 'E004', sku: 'SKU-E01', amount: 1.2, created: '2026-06-07', state: '待派单', owner: '孙琪（顾问）' },
    { no: 'SO-20260606-007', entId: 'E001', sku: 'SKU-T01', amount: 0.298, created: '2026-06-06', state: '已完成', owner: '系统自助' },
    { no: 'SO-20260605-008', entId: 'E006', sku: 'SKU-E02', amount: 2.8, created: '2026-06-05', state: '派单中', owner: '赵雷（销售）' },
    { no: 'SO-20260604-009', entId: 'E002', sku: 'SKU-H01', amount: 5.8, created: '2026-06-04', state: '已结算', owner: '张衡（顾问）' },
    { no: 'SO-20260603-010', entId: 'E008', sku: 'SKU-D01', amount: 0.88, created: '2026-06-03', state: '待派单', owner: '李明（销售）' },
  ];

  // ---------- KPI ----------
  const totalAmt = orders.reduce((s, o) => s + o.amount, 0);
  const cntPending = orders.filter(o => o.state === '待派单').length;
  const cntDelivering = orders.filter(o => ['派单中', '交付中', '待验收'].includes(o.state)).length;
  const cntDone = orders.filter(o => ['已完成', '已结算'].includes(o.state)).length;

  const kpis = [
    C.kpi({ label: '本月订单数', value: String(orders.length), unit: '单', icon: '📦', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '3单', trendDir: 'up', foot: '货架成交订单' }),
    C.kpi({ label: '订单总额', value: '¥' + totalAmt.toFixed(1), unit: '万', icon: '💰', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '15%', trendDir: 'up', foot: '含成功奖励待结算' }),
    C.kpi({ label: '待派单', value: String(cntPending), unit: '单', icon: '🕓', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '等待派单承做' }),
    C.kpi({ label: '交付中 / 已完成', value: `${cntDelivering} / ${cntDone}`, icon: '🚚', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', foot: '在途交付与已交付' }),
  ];

  // ---------- 订单详情 modal ----------
  function orderModalCall(o) {
    const e = DB.getEnterprise(o.entId);
    const k = getSku(o.sku);
    const rolesTxt = k.roles.length ? k.roles.join(' / ') : '系统自助';
    const body = [
      `'<div class=\\'mb-1 fw-6 text-ink text-sm\\'>🏢 客户信息</div>'`,
      `C.kvGrid([['客户企业','${C.esc(e.name)}'],['区域/行业','${C.esc(e.region)} · ${C.esc(e.industry)}'],['联系人','${C.esc(e.contact)} · ${C.esc(e.contactRole)}']])`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>📦 服务产品明细</div>'`,
      `C.kvGrid([['SKU','${k.id} ${C.esc(k.name)}'],['品类','${C.esc(k.cat)}'],['订单金额','¥${o.amount}万'],['交付方式','${C.esc(k.delivery)}'],['结算方式','${C.esc(k.settle)}'],['工期','${C.esc(k.duration)}'],['所需角色','${C.esc(rolesTxt)}']])`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>🔗 关联任务（下单自动生成）</div>'`,
      `'<div class=\\'text-sm text-2\\' style=\\'line-height:1.7\\'>· 托管档案：已为客户创建服务档案<br>· 项目计划：按 ${C.esc(k.duration)} 自动排期<br>· 交付任务：已拆解承做 / 撰写 / 评审任务进入任务中心</div>'`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>🤝 分成规则</div>'`,
      `'<div class=\\'text-sm text-2\\' style=\\'line-height:1.7\\'>${C.esc(k.settle)}；专家/承做机构/渠道伙伴按订单金额或交付节点分成。</div>'`,
      `'<div class=\\'mt-3\\'>'+C.badge('当前状态：${o.state}','${stColor(o.state)}',true)+'</div>'`,
    ].join('+');
    const foot = `C.btn('去派单',{onclick:'App.closeModal();location.hash=\\'dispatch\\''})+C.btn('去结算',{onclick:'App.closeModal();location.hash=\\'settlement\\''})+C.btn('关闭',{variant:'primary',onclick:'App.closeModal()'})`;
    return `App.openModal({title:'📦 订单 ${o.no}',size:'wide',body:${body},foot:${foot}})`;
  }

  // ---------- 订单列表 ----------
  const orderTable = C.table({
    cols: [
      { label: '订单号', render: r => `<span class="td-strong nowrap">${C.esc(r.no)}</span>` },
      { label: '客户企业', render: r => { const e = DB.getEnterprise(r.entId); return `<div class="cell-main">${C.entLogo(e, 30)}<div><div class="td-strong">${C.esc(e.name)}</div><div class="cell-sub">${C.esc(e.region)}</div></div></div>`; } },
      { label: '服务产品', render: r => { const k = getSku(r.sku); return `<div><div class="text-sm">${C.esc(k.name)}</div><div class="cell-sub">${C.esc(k.cat)}</div></div>`; } },
      { label: '金额', render: r => `<span class="td-strong">¥${r.amount}万</span>` },
      { label: '下单时间', render: r => `<span class="cell-sub nowrap">${C.esc(r.created)}</span>` },
      { label: '状态', render: r => C.badge(r.state, stColor(r.state), true) },
      { label: '负责人', render: r => `<span class="text-sm">${C.esc(r.owner)}</span>` },
    ],
    rows: orders,
    onRowClick: r => orderModalCall(r),
  });

  // ---------- 订单状态流转 ----------
  const flow = C.stateFlow([
    { id: 'a', name: '下单' }, { id: 'b', name: '派单' }, { id: 'c', name: '承做交付' },
    { id: 'd', name: '验收' }, { id: 'e', name: '结算' },
  ], 'c');

  // ---------- 订单详情示例卡 ----------
  const demo = orders[0];
  const demoEnt = DB.getEnterprise(demo.entId);
  const demoSku = getSku(demo.sku);
  const detailCard = C.card({
    title: '🧾 订单详情示例', sub: demo.no,
    actions: C.btn('查看全部字段', { size: 'sm', onclick: orderModalCall(demo) }),
    body: `<div class="grid grid-2">
      <div>${C.kvGrid([
        ['客户企业', `<span class="cell-main" style="gap:8px">${C.entLogo(demoEnt, 26)}${C.esc(demoEnt.name)}</span>`],
        ['服务产品', `${C.esc(demoSku.name)} ${C.badge(demoSku.cat, 'primary')}`],
        ['订单金额', `<b style="color:var(--teal)">¥${demo.amount}万</b>`],
        ['交付方式', demoSku.delivery],
        ['结算方式', demoSku.settle],
      ])}</div>
      <div>${C.kvGrid([
        ['当前状态', C.badge(demo.state, stColor(demo.state), true)],
        ['关联任务', '托管档案 / 项目计划 / 3 项交付任务'],
        ['分成规则', '年费平台收取，撰写/专家按交付分成'],
        ['负责人', demo.owner],
        ['下单时间', demo.created],
      ])}</div>
    </div>
    <div class="mt-3">${C.alert('赢单/下单后系统自动生成托管档案、项目计划与交付任务（规划书 4.3）。订单贯穿派单、承做、验收、结算全链路。', 'teal', '⚡')}</div>`,
  });
  // ---------- 新建订单表单 ----------
  const entOpts = ents.map(e => `<option>${C.esc(e.name)}</option>`).join('');
  const skuOpts = skus.map(s => `<option>${C.esc(s.name)} · ${C.esc(s.price)}</option>`).join('');
  const newOrderForm = `<div class=\\'form-grid\\'>` +
    `<div class=\\'form-row\\'><label>客户企业 <span class=\\'req\\'>*</span></label><select class=\\'select\\'>${entOpts.replace(/"/g, '&quot;')}</select></div>` +
    `<div class=\\'form-row\\'><label>服务产品 SKU <span class=\\'req\\'>*</span></label><select class=\\'select\\'>${skuOpts.replace(/"/g, '&quot;')}</select></div>` +
    `<div class=\\'form-row\\'><label>报价（万元）</label><input class=\\'input\\' placeholder=\\'如 3.8\\'></div>` +
    `<div class=\\'form-row\\'><label>负责人</label><input class=\\'input\\' placeholder=\\'如 张衡\\'></div>` +
    `</div>` +
    `<div class=\\'form-row\\'><label>备注</label><input class=\\'input\\' placeholder=\\'交付边界 / 付款方式 / 成功奖励约定\\'><div class=\\'hint\\'>创建后自动生成托管档案、项目计划与交付任务，并进入派单池</div></div>`;
  const newOrderCall = `App.openModal({title:'📦 新建订单',size:'wide',body:"${newOrderForm}",foot:C.btn('取消',{onclick:'App.closeModal()'})+C.btn('创建订单',{variant:'primary',onclick:'App.closeModal();App.act(\\'订单已创建，已生成交付任务并进入派单池\\')'})})`;

  return `
  ${C.pageHead({
    icon: '📦', title: '订单管理',
    desc: '服务产品下单后形成订单，贯穿下单 → 派单 → 承做交付 → 验收 → 结算全链路。下单即自动生成托管档案、项目计划与交付任务，让服务可派单、可验收、可结算。',
    crumbs: [{ label: '交易与结算' }, { label: '订单管理' }],
    actions: C.btn('新建订单', { icon: '➕', onclick: newOrderCall }) +
             C.btn('去货架选品', { onclick: "location.hash='service-products'" }) +
             C.btn('AI 订单洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${C.card({
    title: '🔄 订单状态流转', sub: '下单 → 派单 → 承做交付 → 验收 → 结算',
    body: flow + `<div class="mt-3">${C.alert('运营结算 Agent 跟踪订单全链路状态，自动推进节点并提示逾期。关键验收与结算口径需负责人确认。', 'info', '🔄')}</div>`,
  })}

  <div style="margin-top:14px">
    ${C.card({
      title: '📋 订单列表', sub: `共 ${orders.length} 单 · 点击整行查看订单详情`,
      actions: C.btn('新建订单', { size: 'sm', icon: '➕', onclick: newOrderCall }),
      pad: false,
      body: orderTable,
    })}
  </div>

  <div style="margin-top:14px">${detailCard}</div>

  <div style="margin-top:14px">
</div>
  `;
});
