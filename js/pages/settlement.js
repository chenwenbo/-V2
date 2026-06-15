/* ============================================================
   页面：结算与分成 (Settlement)
   对应规划书：4.8 结算 / 第7章 商业化与交易分成
   订单交付验收后进入结算：平台费 + 服务费 + 成功奖励 + 交易分成
   ============================================================ */
Pages.register('settlement', function () {
  const ents = DB.enterprises;
  const skus = DB.serviceProducts;
  const getSku = (id) => skus.find(s => s.id === id);

  // ---------- 结算单（关联订单 / 企业 / SKU / 分成） ----------
  const bills = [
    { no: 'JS-20260612-001', entId: 'E002', sku: 'SKU-A02', amount: 6.5, bonus: 3.0, node: '已通过初审', state: '待结算',
      split: [['平台/机构', 60], ['撰写交付', 22], ['专家复核', 18]], settleDate: '-' },
    { no: 'JS-20260610-002', entId: 'E003', sku: 'SKU-D01', amount: 0.88, bonus: 0, node: '诊断报告已交付', state: '结算中',
      split: [['平台/机构', 80], ['顾问', 20]], settleDate: '2026-06-15' },
    { no: 'JS-20260608-003', entId: 'E005', sku: 'SKU-D02', amount: 0.68, bonus: 0, node: '已验收', state: '已结算',
      split: [['平台/机构', 78], ['顾问', 22]], settleDate: '2026-06-09' },
    { no: 'JS-20260604-004', entId: 'E002', sku: 'SKU-H01', amount: 5.8, bonus: 0, node: '年费首期', state: '已结算',
      split: [['平台/机构', 100]], settleDate: '2026-06-05' },
    { no: 'JS-20260605-005', entId: 'E006', sku: 'SKU-E02', amount: 2.8, bonus: 0, node: '专家成果交付', state: '待结算',
      split: [['平台/机构', 45], ['专家', 55]], settleDate: '-' },
    { no: 'JS-20260601-006', entId: 'E004', sku: 'SKU-A01', amount: 3.8, bonus: 5.0, node: '高企认定通过', state: '待结算',
      split: [['平台/机构', 55], ['撰写交付', 20], ['专家复核', 15], ['渠道伙伴', 10]], settleDate: '-' },
  ];

  const stColor = (s) => ({ '待结算': 'amber', '结算中': 'primary', '已结算': 'teal' }[s] || 'gray');
  const billTotal = (b) => b.amount + b.bonus;

  // ---------- KPI ----------
  const totalSettled = bills.filter(b => b.state === '已结算').reduce((s, b) => s + billTotal(b), 0);
  const totalPending = bills.filter(b => b.state !== '已结算').reduce((s, b) => s + billTotal(b), 0);
  const totalBonus = bills.reduce((s, b) => s + b.bonus, 0);
  const expertShare = bills.reduce((s, b) => {
    const e = b.split.find(x => x[0] === '专家' || x[0] === '专家复核');
    return s + (e ? billTotal(b) * e[1] / 100 : 0);
  }, 0);

  const kpis = [
    C.kpi({ label: '本月已结算', value: '¥' + totalSettled.toFixed(1), unit: '万', icon: '✅', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '12%', trendDir: 'up', foot: '已完成分账' }),
    C.kpi({ label: '待结算金额', value: '¥' + totalPending.toFixed(1), unit: '万', icon: '🕓', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '含成功奖励待触发' }),
    C.kpi({ label: '成功奖励池', value: '¥' + totalBonus.toFixed(1), unit: '万', icon: '🎁', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', foot: '认定/立项通过后释放' }),
    C.kpi({ label: '专家分成累计', value: '¥' + expertShare.toFixed(2), unit: '万', icon: '👨‍🔬', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', foot: '专家供给激励' }),
  ];

  // ---------- 收费模式（第7章） ----------
  const tiers = [
    { layer: 'SaaS 基础版', who: '中小服务机构', logic: '按席位 / 企业数 / 政策库范围 / AI调用量', note: '日常管理与AI基础能力', color: 'cyan' },
    { layer: '机构专业版', who: '有交付团队和专家资源的机构', logic: '增加商机 / 托管 / 项目交付 / 评审 / 服务产品', note: '主推版本', color: 'primary' },
    { layer: '生态旗舰版', who: '园区运营商 / 区域平台 / 大型机构', logic: '多机构 / 多角色 / 多专家 / 多服务商协同', note: '按项目或区域定制', color: 'purple' },
    { layer: '交易分成', who: '专家 / 承做机构 / 渠道伙伴', logic: '按订单金额 / 成功结果 / 交付节点分成', note: '平台成为交易基础设施', color: 'teal' },
    { layer: 'AI 增值包', who: '高频使用AI撰写/评审/智能体客户', logic: '按调用量 / 材料篇数 / 评审次数 / 模型成本加价', note: '控成本、高毛利', color: 'amber' },
  ];

  // ---------- 结算单详情 modal ----------
  function billModalCall(b) {
    const e = DB.getEnterprise(b.entId);
    const k = getSku(b.sku);
    const tot = billTotal(b);
    const splitRows = b.split.map(s =>
      `<div class=\\'flex items-center justify-between text-sm\\' style=\\'padding:6px 0;border-bottom:1px solid var(--line-2)\\'><span>${s[0]}</span><span class=\\'fw-6\\'>${s[1]}% · ¥${(tot * s[1] / 100).toFixed(2)}万</span></div>`
    ).join('');
    const body = [
      `'<div class=\\'mb-1 fw-6 text-ink text-sm\\'>🏢 结算对象</div>'`,
      `C.kvGrid([['结算单号','${b.no}'],['客户企业','${C.esc(e.name)}'],['服务产品','${k.id} ${C.esc(k.name)}'],['结算方式','${C.esc(k.settle)}'],['交付节点','${C.esc(b.node)}']])`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>💰 金额构成</div>'`,
      `C.kvGrid([['服务费','¥${b.amount}万'],['成功奖励','${b.bonus > 0 ? '¥' + b.bonus + '万（认定/立项通过后释放）' : '无'}'],['合计','<b>¥${tot.toFixed(1)}万</b>']])`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>🤝 分成明细</div>'`,
      `'<div>${splitRows.replace(/"/g, '&quot;')}</div>'`,
      `'<div class=\\'mt-3\\'>'+C.alert('成功奖励仅在资质认定/项目立项结果确认后释放；分成口径与结算需负责人确认。', 'amber', '⚠️')+'</div>'`,
    ].join('+');
    const foot = `C.btn('导出结算单',{onclick:'App.act(\\'结算单已导出\\')'})+C.btn('负责人确认结算',{variant:'primary',onclick:'App.closeModal();App.act(\\'结算已确认，进入打款流程\\')'})`;
    return `App.openModal({title:'💰 结算单 ${b.no}',size:'wide',body:${body},foot:${foot}})`;
  }

  // ---------- 结算单列表 ----------
  const billTable = C.table({
    cols: [
      { label: '结算单号', render: r => `<span class="td-strong nowrap">${C.esc(r.no)}</span>` },
      { label: '客户企业', render: r => { const e = DB.getEnterprise(r.entId); return `<div class="cell-main">${C.entLogo(e, 30)}<div><div class="td-strong">${C.esc(e.name)}</div><div class="cell-sub">${C.esc(getSku(r.sku).name)}</div></div></div>`; } },
      { label: '服务费', render: r => `<span class="text-sm">¥${r.amount}万</span>` },
      { label: '成功奖励', render: r => r.bonus > 0 ? `<span style="color:var(--purple);font-weight:600">¥${r.bonus}万</span>` : `<span class="cell-sub">—</span>` },
      { label: '合计', render: r => `<span class="td-strong" style="color:var(--teal)">¥${billTotal(r).toFixed(1)}万</span>` },
      { label: '交付节点', render: r => `<span class="cell-sub">${C.esc(r.node)}</span>` },
      { label: '状态', render: r => C.badge(r.state, stColor(r.state), true) },
    ],
    rows: bills,
    onRowClick: r => billModalCall(r),
  });

  // ---------- 分成结构示例（瀑布） ----------
  const demo = bills[5];
  const demoTot = billTotal(demo);
  const splitBars = C.barChart(demo.split.map((s, i) => ({
    label: s[0], value: s[1], display: `${s[1]}% · ¥${(demoTot * s[1] / 100).toFixed(2)}万`,
    color: ['var(--primary)', 'var(--teal)', 'var(--amber)', 'var(--purple)'][i % 4],
  })), { max: 100 });

  // ---------- 结算流转 ----------
  const flow = C.stateFlow([
    { id: 'a', name: '交付验收' }, { id: 'b', name: '生成结算单' }, { id: 'c', name: '负责人确认口径' },
    { id: 'd', name: '成功奖励触发' }, { id: 'e', name: '分账打款' }, { id: 'f', name: '归档' },
  ], 'c');
  // ---------- 毛利构成 ----------
  const marginSegs = [
    { label: '托管服务', value: 980, color: '#3b5bdb' },
    { label: '项目交付', value: 720, color: '#0ca678' },
    { label: '专家服务', value: 260, color: '#f08c00' },
    { label: '交易分成', value: 240, color: '#7048e8' },
    { label: 'SaaS订阅', value: 160, color: '#1098ad' },
  ];
  const marginTotal = marginSegs.reduce((s, x) => s + x.value, 0);

  return `
  ${C.pageHead({
    icon: '💰', title: '结算与分成',
    desc: '订单交付验收后进入结算环节。采用「SaaS订阅 + 托管费 + 项目交付费 + 专家费 + 成功激励 + 生态交易分成」组合模式，平台成为科技服务交易基础设施。成功奖励须结果确认后释放，分成口径由负责人确认。',
    crumbs: [{ label: '服务交易' }, { label: '结算与分成' }],
    actions: C.btn('生成结算清单', { icon: '🧾', onclick: 'App.act("正在汇总本月结算清单…")' }) +
             C.btn('查看订单', { onclick: "location.hash='orders'" }) +
             C.btn('AI 毛利洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${C.card({
    title: '🔄 结算流转', sub: '交付验收 → 生成结算单 → 确认口径 → 奖励触发 → 分账打款',
    body: flow + `<div class="mt-3">${C.alert('AI 不得直接承诺补贴金额；成功奖励仅在资质认定/项目立项结果确认后释放，分成与打款须负责人确认（规划书 5.2 / 7）。', 'amber', '⚠️')}</div>`,
  })}

  <div class="grid grid-12" style="margin-top:14px">
    <div class="col-span-7">
      ${C.card({
        title: '🧾 结算单列表', sub: `共 ${bills.length} 单 · 点击查看分成明细`,
        pad: false, body: billTable,
      })}
    </div>
    <div class="col-span-5">
      ${C.card({
        title: '🤝 分成结构示例', sub: demo.no,
        body: `<div class="mb-2 text-sm text-2">${getSku(demo.sku).name} · 合计 <b style="color:var(--teal)">¥${demoTot.toFixed(1)}万</b>（服务费 ¥${demo.amount}万 + 成功奖励 ¥${demo.bonus}万）</div>
          ${splitBars}
          <div class="mt-3">${C.alert('按订单金额 / 成功结果 / 交付节点对专家、承做机构、渠道伙伴分成。', 'teal', '🤝')}</div>`,
      })}
    </div>
  </div>

  <div style="margin-top:14px">
    ${C.card({
      title: '💳 商业化收费层级', sub: '第7章 · 平台SaaS + 托管费 + 交付费 + 专家费 + 成功激励 + 交易分成',
      pad: false,
      body: C.table({
        cols: [
          { label: '收费层', render: r => `<div class="cell-main">${C.badge(r.layer, r.color)}</div>` },
          { label: '适用对象', render: r => `<span class="text-sm">${C.esc(r.who)}</span>` },
          { label: '计费逻辑', render: r => `<span class="text-sm text-2">${C.esc(r.logic)}</span>` },
          { label: '备注', render: r => `<span class="cell-sub">${C.esc(r.note)}</span>` },
        ],
        rows: tiers,
      }),
    })}
  </div>

  <div class="grid grid-12" style="margin-top:14px">
    <div class="col-span-5">
      ${C.card({
        title: '📊 收入毛利构成', sub: `合计 ¥${marginTotal}万`,
        body: `<div class="flex items-center" style="justify-content:center">
          <div style="position:relative">${C.donut(marginSegs, { size: 140 })}
            <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">
              <div><div style="font-size:13px;color:var(--text-3)">综合毛利率</div><div style="font-size:22px;font-weight:800;color:var(--teal)">58.6%</div></div>
            </div></div></div>
          <div class="mt-3 flex flex-col gap-2">${marginSegs.map(s =>
            `<div class="flex items-center justify-between text-sm"><span class="flex items-center gap-2"><span style="width:9px;height:9px;border-radius:3px;background:${s.color};display:inline-block"></span>${s.label}</span><span class="fw-6">¥${s.value}万 · ${Math.round(s.value / marginTotal * 100)}%</span></div>`
          ).join('')}</div>`,
      })}
    </div>
    <div class="col-span-7">
      <div style="margin-top:14px">
        ${C.card({
          title: '🎁 成功奖励待触发', sub: '认定/立项结果确认后释放',
          body: bills.filter(b => b.bonus > 0).map(b => {
            const e = DB.getEnterprise(b.entId);
            return `<div class="list-item">
              <div class="li-icon" style="background:var(--purple-50);color:var(--purple)">🎁</div>
              <div class="li-main"><div class="li-title">${C.esc(e.name)} · ${C.esc(getSku(b.sku).name)}</div><div class="li-sub">交付节点：${C.esc(b.node)}</div></div>
              <div class="text-r"><div class="td-strong" style="color:var(--purple)">¥${b.bonus}万</div>${C.badge(b.state, stColor(b.state))}</div>
            </div>`;
          }).join(''),
        })}
      </div>
    </div>
  </div>
  `;
});
