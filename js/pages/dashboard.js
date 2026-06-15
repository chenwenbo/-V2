/* ============================================================
   页面：经营驾驶舱 (Dashboard)
   对应规划书：第2章 机构负责人成功指标 / 第3章 经营台 / 第8章 KPI
   机构负责人视角：客户池、收入预测、交付质量、团队效率
   ============================================================ */
Pages.register('dashboard', function () {
  const role = App.roleObj();

  const kpis = [
    C.kpi({ label: '托管企业数', value: '47', unit: '家', icon: '🛡️', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '12%', trendDir: 'up', foot: '本季新增 6 家' }),
    C.kpi({ label: '有效商机', value: '128', unit: '个', icon: '💡', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '8.5%', trendDir: 'up', foot: '金额池 ¥1,840万' }),
    C.kpi({ label: '本年 ARR', value: '¥2,360', unit: '万', icon: '💰', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '23%', trendDir: 'up', foot: '续费贡献 62%' }),
  ];

  // 收入构成
  const revenueSegments = [
    { label: '托管服务费', value: 980, color: '#3b5bdb' },
    { label: '项目交付费', value: 720, color: '#0ca678' },
    { label: '专家评审费', value: 260, color: '#f08c00' },
    { label: '交易分成', value: 240, color: '#7048e8' },
    { label: 'SaaS订阅', value: 160, color: '#1098ad' },
  ];
  const revTotal = revenueSegments.reduce((s, x) => s + x.value, 0);

  // 月度营收趋势
  const monthly = [
    { label: '1月', value: 142 }, { label: '2月', value: 128 }, { label: '3月', value: 196 },
    { label: '4月', value: 224 }, { label: '5月', value: 248 }, { label: '6月', value: 286, hl: true },
  ];

  // 商机漏斗
  const funnel = [
    { stage: '线索', count: 64, color: '#1098ad' },
    { stage: '已摸排', count: 38, color: '#7048e8' },
    { stage: '方案中', count: 16, color: '#3b5bdb' },
    { stage: '谈判', count: 7, color: '#f08c00' },
    { stage: '赢单', count: 3, color: '#0ca678' },
  ];
  const funnelMax = funnel[0].count;

  // 重点商机
  const topOpps = DB.opportunities.filter(o => ['proposal', 'negotiate'].includes(o.stage));

  // 托管企业健康度
  const hosting = DB.enterprises.filter(e => e.status === '托管中');

  // 专家产能
  const experts = [
    { name: '郑博士', field: 'AI/半导体', load: 82, pending: 3, avgHrs: '4.2h' },
    { name: '孙教授', field: '生物医药', load: 64, pending: 2, avgHrs: '5.1h' },
    { name: '李工', field: '新材料/装备', load: 91, pending: 5, avgHrs: '3.8h' },
  ];

  return `
  ${C.pageHead({
    icon: '📊', title: `经营驾驶舱 · ${role.name}视角`,
    desc: '机构负责人一屏看清客户池、收入预测、交付质量与团队效率。线索转化率、托管续费率、交付毛利、客户净推荐值一目了然。',
    crumbs: [{ label: '经营总览' }, { label: '经营驾驶舱' }],
    actions: C.btn('AI 经营洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-3 mb-3">${kpis.join('')}</div>

  <div class="grid grid-12">
    <!-- 营收趋势 -->
    <div class="col-span-12">
      ${C.card({
        title: '📈 月度营收趋势', sub: '单位：万元',
        actions: `<div class="pill-tabs"><span class="pill-tab active" onclick="App.switchPill(this)">本年</span><span class="pill-tab" onclick="App.switchPill(this)">近12月</span></div>`,
        body: C.columnChart(monthly, { height: 200, color: 'var(--primary)' }),
      })}
    </div>

    <!-- 商机漏斗 -->
    <div class="col-span-6">
      ${C.card({
        title: '🔻 商机转化漏斗', sub: '线索→赢单',
        actions: C.btn('进入看板', { size: 'sm', onclick: "location.hash='opportunity'" }),
        body: `<div class="flex flex-col gap-2">${funnel.map((f, i) => {
          const w = 40 + (f.count / funnelMax) * 60;
          const conv = i > 0 ? Math.round(f.count / funnel[i - 1].count * 100) : 100;
          return `<div class="flex items-center gap-3">
            <span class="text-sm" style="width:54px">${f.stage}</span>
            <div style="flex:1"><div style="width:${w}%;background:${f.color};color:#fff;border-radius:7px;padding:6px 12px;font-size:13px;font-weight:600;display:flex;justify-content:space-between">
              <span>${f.count} 个</span>${i > 0 ? `<span style="opacity:.85;font-weight:500">转化 ${conv}%</span>` : ''}</div></div>
          </div>`;
        }).join('')}</div>
        <div class="mt-3">${C.alert('线索→商机转化率 59%，商机赢单率 19%，平均成交周期 38 天。建议加强「方案中→谈判」阶段的异议处理。', 'info', '📌')}</div>`,
      })}
    </div>

    <!-- 重点商机 -->
    <div class="col-span-6">
      ${C.card({
        title: '🎯 重点跟进商机', sub: '方案中 / 谈判阶段',
        actions: C.btn('全部商机', { size: 'sm', onclick: "location.hash='opportunity'" }),
        pad: false,
        body: C.table({
          cols: [
            { label: '企业', render: r => { const e = DB.getEnterprise(r.entId); return `<div class="cell-main">${e ? C.entLogo(e, 30) : ''}<div><div class="td-strong">${r.ent}</div><div class="cell-sub">${r.product}</div></div></div>`; } },
            { label: '阶段', render: r => { const s = DB.oppStages.find(x => x.id === r.stage); return C.badge(s.name, r.stage === 'negotiate' ? 'amber' : 'primary', true); } },
            { label: '金额', render: r => `<span class="td-strong">${r.amount}</span>` },
            { label: '赢率', render: r => C.progress(r.prob, { color: r.prob >= 60 ? 'var(--teal)' : 'var(--amber)' }) + `<span class="cell-sub">${r.prob}%</span>` },
            { label: '负责人', key: 'owner' },
          ],
          rows: topOpps,
          onRowClick: r => `location.hash='enterprise-profile?id=${r.entId}'`,
        }),
      })}
    </div>

    <!-- 托管企业健康度 -->
    <div class="col-span-12">
      ${C.card({
        title: '🛡️ 托管企业健康度', sub: `${hosting.length} 家托管中`,
        actions: C.btn('托管监控', { size: 'sm', onclick: "location.hash='hosting'" }),
        pad: false,
        body: C.table({
          cols: [
            { label: '企业', render: r => `<div class="cell-main">${C.entLogo(r, 30)}<div><div class="td-strong">${r.name}</div><div class="cell-sub">${r.region} · ${r.industry}</div></div></div>` },
            { label: '健康度', render: r => `<div style="width:90px">${C.progress(r.health, { color: r.health >= 85 ? 'var(--teal)' : r.health >= 70 ? 'var(--primary)' : 'var(--amber)' })}<span class="cell-sub">${r.health}分</span></div>` },
            { label: '风险', render: r => C.badge(r.risk, r.risk === '低' ? 'teal' : r.risk === '中' ? 'amber' : 'red', true) },
            { label: '续费节点', render: r => `<span class="cell-sub">2026-12 到期</span>` },
          ],
          rows: hosting,
          onRowClick: r => `location.hash='hosting-detail?id=${r.id}'`,
        }),
      })}
    </div>

  `;
});
