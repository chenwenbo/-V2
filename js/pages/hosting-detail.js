/* ============================================================
   页面：托管企业详情 (Hosting Detail) — 隐藏页，经跳转进入
   对应规划书：4.4 企业托管与持续监控 / 4.5 年度托管计划与服务交付
   ============================================================ */
Pages.register('hosting-detail', function (params) {
  const hosted = DB.enterprises.filter(e => e.status === '托管中');
  const ent = DB.getEnterprise(params.id) || hosted[0] || DB.enterprises[0];
  const hcolor = ent.health >= 85 ? 'var(--teal)' : ent.health >= 70 ? 'var(--primary)' : 'var(--amber)';

  // ---------- Tab1 托管概览 ----------
  const planKv = C.kvGrid([
    ['托管产品', C.badge('年度政策托管服务', 'primary')],
    ['服务周期', '2026-01-01 至 2026-12-31（12 个月）'],
    ['年费', '5.8 万元 / 年 + 增值项目费'],
    ['服务范围', '政策监控 · 季度诊断 · 申报日历 · 任务跟进 · AI 问答席位'],
    ['成长目标', `${ent.opportunities.join(' → ')}`],
    ['负责顾问', ent.consultant !== '-' ? ent.consultant : '待分配'],
    ['对接人', `${ent.contact} · ${ent.contactRole} · ${ent.phone}`],
  ]);
  const milestones = C.timeline([
    { time: 'Q1 · 1-3月', title: '建档与基线诊断', desc: '完成企业画像更新、研发费用归集诊断，输出年度托管计划与资质路径', status: 'done' },
    { time: 'Q2 · 4-6月', title: '资质培育与材料筹备', desc: `推进 ${ent.opportunities[0] || '核心资质'} 申报，补齐知识产权与研发立项缺口`, status: 'done' },
    { time: 'Q3 · 7-9月', title: '集中申报季', desc: '按申报日历提交高企/专精特新材料，专家复核关键结论', status: 'warn' },
    { time: 'Q4 · 10-12月', title: '成果验收与续约', desc: '复盘年度成果，输出下一年度成长规划，发起续费与增购', status: '' },
  ]);
  const tabOverview = `
    <div class="grid grid-12">
      <div class="col-span-8">${C.card({ title: '📦 托管方案', sub: '规划书 4.5', body: planKv })}</div>
      <div class="col-span-4">${C.card({ title: '❤️ 客户健康度', body:
        `<div class="flex items-center" style="justify-content:center">${C.scoreRing(ent.health, { size: 130, color: hcolor, label: '健康度' })}</div>
         <div class="mt-2 text-c text-sm text-2">综合政策触达、任务准时率、客户配合度、续费意向计算</div>
         <div class="mt-2 flex justify-center gap-2 flex-wrap">${C.badge('风险 ' + ent.risk, ent.risk === '低' ? 'teal' : 'amber', true)}${C.badge('活跃 ' + ent.lastActive, 'gray')}</div>` })}</div>
      <div class="col-span-12">${C.card({ title: '🗓️ 年度里程碑', sub: '托管期成长路线', body: milestones })}</div>
    </div>`;

  // ---------- Tab2 监控提醒 ----------
  // 贴合该企业行业构造监控条目
  const ind = ent.industry;
  const monitorItems = [
    { icon: '📋', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', title: `命中政策：${ent.opportunities[0] || '高新技术企业认定'}`, sub: `匹配度 78 分 · 申报窗口临近，建议本月启动材料 · 来源：政策库`, right: C.badge('临期', 'amber', true) },
    { icon: '📡', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', title: `企业动态：${ind}领域新增招投标信息`, sub: '识别为业绩证明机会，可用于资质申报佐证', right: C.badge('已捕获', 'primary') },
    { icon: '🎯', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', title: `项目匹配跃升：${ent.opportunities[1] || '专精特新培育'}`, sub: '匹配分由 46 升至 62，达到可申报阈值', right: C.badge('+16', 'teal') },
    { icon: '💡', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', title: '潜在增购商机：研发费用加计扣除诊断', sub: '研发台账规范度待提升，建议增购研发费用诊断（6800元）', right: C.btn('转商机', { size: 'sm', onclick: "location.hash='opportunity'" }) },
    { icon: '⏰', iconBg: 'var(--red)', iconColor: '#fff', title: '申报日历提醒：知识产权布局窗口', sub: `${ind}相关发明专利建议 7 月前提交，以满足申报时间要求`, right: C.badge('待办', 'red', true) },
  ];
  const tabMonitor = `
    ${C.card({ title: '🔔 持续监控提醒', sub: '政策 / 动态 / 项目匹配 / 商机', body: monitorItems.map(C.listItem).join('') })}
  `;

  // ---------- Tab3 年度项目计划 ----------
  const planRows = [
    { project: ent.opportunities[0] || '高新技术企业认定', apply: '2026-08-15', prep: '8 周', owner: ent.consultant !== '-' ? ent.consultant : '张衡（顾问）', milestone: '材料生产中', state: 'doing' },
    { project: ent.opportunities[1] || '专精特新培育', apply: '2026-10-15', prep: '6 周', owner: ent.consultant !== '-' ? ent.consultant : '张衡（顾问）', milestone: '资格诊断完成', state: 'todo' },
    { project: '研发费用加计扣除', apply: '常年', prep: '2 周', owner: '陈思（撰写）', milestone: '台账整理中', state: 'doing' },
  ];
  const tabPlan = `
    ${C.card({ title: '📅 年度项目计划', sub: '规划书 4.5 · 可跳转项目规划', pad: false, body: C.table({
      cols: [
        { label: '目标项目', render: r => `<span class="td-strong">${C.esc(r.project)}</span>` },
        { label: '计划申报时间', render: r => `<span class="cell-sub">${C.esc(r.apply)}</span>` },
        { label: '准备周期', key: 'prep' },
        { label: '负责人', render: r => `<span class="text-sm">${C.esc(r.owner)}</span>` },
        { label: '里程碑', render: r => { const t = r.state === 'doing' ? 'primary' : r.state === 'todo' ? 'cyan' : 'teal'; return C.badge(r.milestone, t, true); } },
        { label: '', render: r => C.btn('项目规划', { size: 'sm', onclick: "location.hash='project-plan'" }) },
      ],
      rows: planRows,
    }) })}
    ${C.alert(`当前年度计划共 ${planRows.length} 个目标项目，建议优先推进临期项目「${planRows[0].project}」。点击「缺口任务」查看资格补齐清单。`, 'info', '📌')}
  `;

  // ---------- Tab4 服务记录 ----------
  const tabHistory = `
    ${C.card({ title: '🕐 托管服务记录', sub: '服务 / 沟通 / 交付历史', body: C.timeline([
      { time: '2026-06-12 14:30', title: '季度诊断完成', desc: `更新企业画像，健康度 ${ent.health} 分，输出本季缺口补齐建议`, status: 'done' },
      { time: '2026-06-05 10:00', title: '政策推送 + 顾问解读', desc: `推送 ${ent.opportunities[0] || '高企认定'} 申报窗口，${ent.consultant !== '-' ? ent.consultant : '顾问'} 电话解读`, status: 'done' },
      { time: '2026-05-20 16:00', title: '增值服务交付', desc: '完成研发费用归集诊断报告，客户确认采纳', status: 'done' },
      { time: '2026-04-08 09:30', title: '年度托管计划评审', desc: '与客户确认年度成长目标与申报节奏', status: 'done' },
      { time: '2026-01-10 11:00', title: '建档与基线诊断', desc: '完成托管建档、企业画像基线评估', status: 'done' },
    ]) })}
  `;

  return `
  ${C.pageHead({
    icon: ent.logo, title: ent.name,
    crumbs: [{ label: '客户经营' }, { label: '托管企业监控', route: 'hosting' }, { label: ent.name }],
    desc: `${ent.region} · ${ent.industry} · ${ent.scale} · ${ent.techAttr} · 托管中`,
    actions: C.btn('生成服务方案', { icon: '✍️', onclick: 'App.act("客户顾问 Agent 正在生成服务方案…")' }) +
             C.btn('推荐增购产品', { icon: '🛒', onclick: "location.hash='service-products'" }) +
             C.btn('查看缺口任务', { variant: 'primary', icon: '🧩', onclick: "location.hash='gap-tasks'" }),
  })}

  <div class="flex gap-3 mb-3 flex-wrap">
    ${C.badge('健康度 ' + ent.health + ' 分', ent.health >= 85 ? 'teal' : ent.health >= 70 ? 'primary' : 'amber', true)}
    ${C.badge('风险 ' + ent.risk, ent.risk === '低' ? 'teal' : ent.risk === '中' ? 'amber' : 'red', true)}
    ${C.badge('续费节点 2026-12-15', 'amber', true)}
    ${C.badge('负责顾问 ' + (ent.consultant !== '-' ? ent.consultant : '待分配'), 'gray')}
    ${C.badge('综合评分 ' + ent.score, 'cyan', true)}
  </div>

  ${C.tabs([
    { label: '托管概览', content: tabOverview },
    { label: '监控提醒', count: 5, content: tabMonitor },
    { label: '年度项目计划', count: 3, content: tabPlan },
    { label: '服务记录', content: tabHistory },
  ], 'hostingdetail')}
  `;
});
