/* ============================================================
   页面：托管企业监控 (Hosting)
   对应规划书：4.4 企业托管与持续监控
   将项目制一次性收入升级为持续订阅收入：企业纳入托管后，
   平台持续监控政策、企业动态、项目匹配、服务机会与沟通任务。
   ============================================================ */
Pages.register('hosting', function () {
  const hosted = DB.enterprises.filter(e => e.status === '托管中');

  // ---------- KPI ----------
  const avgHealth = hosted.length ? Math.round(hosted.reduce((s, e) => s + e.health, 0) / hosted.length) : 0;
  const kpis = [
    C.kpi({ label: '托管企业数', value: hosted.length, unit: '家', icon: '🛡️', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '12%', trendDir: 'up', foot: '本季新增 6 家' }),
    C.kpi({ label: '平均健康度', value: avgHealth, unit: '分', icon: '❤️', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '3.4', trendDir: 'up', foot: '高于行业基准 78' }),
    C.kpi({ label: '本月续费节点', value: '4', unit: '家', icon: '🔁', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', trend: '', foot: '2 家已发起续约沟通' }),
    C.kpi({ label: '增购商机数', value: '9', unit: '个', icon: '📈', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '5个', trendDir: 'up', foot: '动态/政策触发' }),
  ];

  // ---------- 6 类监控项详表 ----------
  const monitorRows = [
    { item: '政策及时推送', icon: '📋', source: '政策库更新 + 企业画像匹配，命中适用政策或临期窗口', ai: '生成政策摘要、匹配度评分、申报日历与缺口提醒', value: '不错过申报窗口，提升资质获取率与客户黏性' },
    { item: '企业动态检测', icon: '📡', source: '工商变更 / 融资 / 招聘 / 招投标 / 新闻舆情触发', ai: '识别触发式跟进机会，生成动态简报与跟进建议', value: '在企业变化第一时间切入，制造增购与续费机会' },
    { item: '项目匹配度', icon: '🎯', source: '企业画像与项目规则比对，定期重算匹配分', ai: '输出可申报项目清单、匹配分与资格缺口分析', value: '让客户清晰看到成长路径，沉淀年度托管计划' },
    { item: '潜在商机推送', icon: '💡', source: '匹配度跃升 / 政策临期 / 动态触发等组合条件', ai: '自动生成增购商机卡片，推送至负责顾问与销售', value: '托管期内持续产生交易，提升客单价与 ARR' },
    { item: 'AI 话术撰写', icon: '💬', source: '续费节点 / 增购机会 / 沟通任务触发', ai: '生成续费提醒、增购推荐与客户沟通话术', value: '降低顾问沟通成本，提高续费率与增购转化' },
    { item: '服务方案撰写', icon: '✍️', source: '客户确认意向或顾问发起方案需求', ai: '生成年度托管计划、服务组合与报价建议', value: '快速产出可交付方案，缩短成交周期' },
  ];
  const monitorTable = C.table({
    cols: [
      { label: '监控项', width: '130px', render: r => `<div class="cell-main"><span style="font-size:18px">${r.icon}</span><span class="td-strong">${C.esc(r.item)}</span></div>` },
      { label: '数据来源 / 触发条件', render: r => `<span class="text-sm text-2" style="line-height:1.6">${C.esc(r.source)}</span>` },
      { label: 'AI 动作', render: r => `<span class="text-sm" style="line-height:1.6;color:var(--purple)">${C.esc(r.ai)}</span>` },
      { label: '业务价值', render: r => `<span class="text-sm" style="line-height:1.6;color:var(--ink)">${C.esc(r.value)}</span>` },
    ],
    rows: monitorRows,
  });

  // ---------- 托管企业列表 ----------
  // 为每家托管企业构造演示用监控指标
  const hostMeta = {
    E001: { policy: 3, tasks: 4, renew: '2026-12-15' },
    E002: { policy: 2, tasks: 2, renew: '2027-03-20' },
    E004: { policy: 5, tasks: 6, renew: '2026-11-30' },
  };
  const hostTable = C.table({
    cols: [
      { label: '企业', render: r => `<div class="cell-main">${C.entLogo(r, 32)}<div><div class="td-strong">${C.esc(r.name)}</div><div class="cell-sub">${C.esc(r.region)} · ${C.esc(r.contact)} ${C.esc(r.contactRole)}</div></div></div>` },
      { label: '行业', render: r => C.badge(r.industry, 'cyan') },
      { label: '健康度', render: r => `<div style="width:96px">${C.progress(r.health, { color: r.health >= 85 ? 'var(--teal)' : r.health >= 70 ? 'var(--primary)' : 'var(--amber)' })}<span class="cell-sub">${r.health} 分</span></div>` },
      { label: '风险', render: r => C.badge(r.risk, r.risk === '低' ? 'teal' : r.risk === '中' ? 'amber' : 'red', true) },
      { label: '政策触达', render: r => { const m = hostMeta[r.id] || {}; return `<span class="td-strong" style="color:var(--teal)">${m.policy || 0}</span><span class="cell-sub"> 条临期</span>`; } },
      { label: '待办任务', render: r => { const m = hostMeta[r.id] || {}; return `<span class="td-strong">${m.tasks || 0}</span><span class="cell-sub"> 项</span>`; } },
      { label: '续费节点', render: r => { const m = hostMeta[r.id] || {}; return `<span class="cell-sub nowrap">${m.renew || '—'}</span>`; } },
    ],
    rows: hosted,
    onRowClick: r => `location.hash='hosting-detail?id=${r.id}'`,
  });

  // ---------- 健康度分布 ----------
  const healthDist = [
    { label: '健康（85+）', value: hosted.filter(e => e.health >= 85).length, color: '#0ca678' },
    { label: '良好（70-84）', value: hosted.filter(e => e.health >= 70 && e.health < 85).length, color: '#3b5bdb' },
    { label: '关注（<70）', value: hosted.filter(e => e.health < 70).length, color: '#f08c00' },
  ];
  return `
  ${C.pageHead({
    icon: '🛡️', title: '托管企业监控',
    desc: '托管是从项目制一次性收入升级为持续订阅收入的关键模块。企业纳入托管后，平台围绕政策推送、企业动态检测、项目匹配度、潜在商机推送、AI 话术与服务方案撰写 6 类监控项持续运转，输出申报日历、机会提醒与年度托管计划。',
    crumbs: [{ label: '客户经营' }, { label: '托管企业监控' }],
    actions: C.btn('导出托管月报', { icon: '📑', onclick: 'App.act("正在生成托管监控月报…")' }) +
             C.btn('AI 监控洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  <div class="grid grid-12">
    <div class="col-span-8">
      ${C.card({
        title: '👁️ 6 类持续监控能力',
        sub: '规划书 4.4',
        pad: false,
        body: monitorTable,
      })}
    </div>
    <div class="col-span-4">
      ${C.card({
        title: '❤️ 健康度分布',
        sub: `${hosted.length} 家托管中`,
        body: `<div class="flex items-center" style="justify-content:center;position:relative">
          ${C.donut(healthDist, { size: 140 })}
          <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">
            <div><div style="font-size:22px;font-weight:800;color:var(--teal)">${avgHealth}</div><div style="font-size:10px;color:var(--text-3)">平均健康度</div></div>
          </div>
        </div>
        <div class="mt-3 flex flex-col gap-2">${healthDist.map(s =>
          `<div class="flex items-center justify-between text-sm"><span class="flex items-center gap-2"><span style="width:9px;height:9px;border-radius:3px;background:${s.color};display:inline-block"></span>${s.label}</span><span class="fw-6">${s.value} 家</span></div>`
        ).join('')}</div>`,
      })}
    </div>

    <div class="col-span-12">
      ${C.card({
        title: '🏢 托管企业列表',
        sub: `${hosted.length} 家 · 整行点击进入托管详情`,
        actions: C.btn('纳入新企业', { size: 'sm', icon: '➕', onclick: "location.hash='enterprise-pool'" }),
        pad: false,
        body: hostTable,
      })}
    </div>

  </div>
  `;
});
