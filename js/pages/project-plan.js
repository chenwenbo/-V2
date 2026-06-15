/* ============================================================
   页面：年度项目计划 (Annual Project Plan)
   对应规划书：4.5 项目交付与材料生产 · 项目计划
   为每家托管企业建立年度项目计划：目标项目、计划申报时间、
   准备周期、负责人、里程碑；输出年度申报日历、项目优先级、交付排期。
   ============================================================ */
Pages.register('project-plan', function () {

  // KPI
  const kpis = [
    C.kpi({ label: '在办项目数', value: '18', unit: '个', icon: '📋', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '4', trendDir: 'up', foot: '覆盖 12 家托管企业' }),
    C.kpi({ label: '本季计划交付', value: '6', unit: '个', icon: '🚚', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '2', trendDir: 'up', foot: 'Q3 申报季高峰' }),
    C.kpi({ label: '临期项目', value: '3', unit: '个', icon: '⏰', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '距申报窗口 ≤30 天' }),
    C.kpi({ label: '项目准时率', value: '86', unit: '%', icon: '✅', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '3.2%', trendDir: 'up', foot: '目标 90%' }),
  ];

  // ---------- 年度项目排期（甘特）数据 ----------
  // phase: prep=准备期, apply=申报期
  const months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  const ganttRows = [
    { proj: '专精特新申报书', ent: '云栖智能', prep: [6, 9], apply: [10, 10], color: 'var(--purple)' },
    { proj: '省级技术中心认定', ent: '恒瑞医疗', prep: [6, 8], apply: [9, 9], color: 'var(--teal)' },
    { proj: '高企复审', ent: '智驰新能源', prep: [6, 7], apply: [8, 8], color: 'var(--primary)' },
    { proj: '高企认定', ent: '微岩新材料', prep: [6, 8], apply: [9, 9], color: 'var(--amber)' },
    { proj: '科技型中小企业入库', ent: '绿源环保', prep: [6, 6], apply: [7, 7], color: 'var(--cyan)' },
    { proj: '高企认定', ent: '数联云软件', prep: [7, 8], apply: [9, 9], color: '#e8590c' },
  ];

  // 构造单元格：根据月份命中准备期/申报期着色
  function ganttCell(m, row) {
    const inPrep = m >= row.prep[0] && m <= row.prep[1];
    const inApply = m >= row.apply[0] && m <= row.apply[1];
    let bg = 'transparent', label = '', txtColor = '#fff';
    if (inApply) { bg = row.color; label = m === row.apply[0] ? '申报' : ''; }
    else if (inPrep) { bg = row.color + '33'; label = m === row.prep[0] ? '准备' : ''; txtColor = row.color; }
    const cur = m === 6 ? 'box-shadow:inset 0 0 0 2px var(--primary)' : '';
    return `<div style="height:26px;border-right:1px solid var(--line);display:flex;align-items:center;justify-content:center;background:${bg};${cur}">
      <span style="font-size:10px;font-weight:700;color:${txtColor}">${label}</span></div>`;
  }

  const ganttHead = `<div style="display:grid;grid-template-columns:200px repeat(12,1fr);border-bottom:1px solid var(--line);background:var(--bg-soft)">
    <div style="padding:8px 10px;font-size:12px;font-weight:700;color:var(--text-2)">项目 / 企业</div>
    ${months.map(m => `<div style="padding:8px 0;text-align:center;font-size:11px;color:${m === '6' ? 'var(--primary)' : 'var(--text-3)'};font-weight:${m === '6' ? '800' : '500'};border-left:1px solid var(--line)">${m}月</div>`).join('')}
  </div>`;

  const ganttBody = ganttRows.map(row => `<div style="display:grid;grid-template-columns:200px repeat(12,1fr);border-bottom:1px solid var(--line)">
    <div style="padding:6px 10px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid var(--line)">
      <span style="font-size:12.5px;font-weight:600;color:var(--ink)">${row.proj}</span>
      <span style="font-size:11px;color:var(--text-3)">${row.ent}</span>
    </div>
    ${months.map(m => ganttCell(Number(m), row)).join('')}
  </div>`).join('');

  const gantt = `<div style="overflow-x:auto">${ganttHead}${ganttBody}</div>
    <div class="flex gap-4 mt-3 flex-wrap text-xs text-2" style="padding:0 4px">
      <span class="flex items-center gap-1"><span style="width:14px;height:11px;border-radius:3px;background:var(--primary)33;display:inline-block"></span>准备期</span>
      <span class="flex items-center gap-1"><span style="width:14px;height:11px;border-radius:3px;background:var(--primary);display:inline-block"></span>申报期</span>
      <span class="flex items-center gap-1"><span style="width:14px;height:11px;border-radius:3px;box-shadow:inset 0 0 0 2px var(--primary);display:inline-block"></span>当前月（6月）</span>
    </div>`;

  // ---------- 项目优先级表 ----------
  const projRows = [
    { proj: '专精特新申报书', ent: '云栖智能科技', qual: '专精特新中小企业', plan: '2026-10-15', prep: '4个月', owner: '张衡（顾问）', milestone: '8月完成材料初稿', pri: '高', state: 'doing' },
    { proj: '省级企业技术中心', ent: '恒瑞医疗器械', qual: '省级技术中心认定', plan: '2026-09-30', prep: '3.5个月', owner: '张衡（顾问）', milestone: '7月底备齐研发设备清单', pri: '高', state: 'doing' },
    { proj: '高企复审', ent: '智驰新能源汽车', qual: '高新技术企业（复审）', plan: '2026-08-15', prep: '2.5个月', owner: '孙琪（顾问）', milestone: '7月完成专家预评审', pri: '高', state: 'expert' },
    { proj: '高企认定', ent: '微岩新材料', qual: '高新技术企业认定', plan: '2026-09-10', prep: '3个月', owner: '待派发', milestone: '先补齐知识产权缺口', pri: '中', state: 'pending' },
    { proj: '科技型中小企业入库', ent: '绿源环保装备', qual: '科技型中小企业', plan: '2026-07-20', prep: '1个月', owner: '陈思（撰写）', milestone: '本月完成自评表', pri: '中', state: 'doing' },
    { proj: '高企认定', ent: '数联云软件', qual: '高新技术企业认定', plan: '2026-09-10', prep: '2个月', owner: '待派发', milestone: '研发立项规范化先行', pri: '中', state: 'pending' },
  ];

  const priColor = { '高': 'red', '中': 'amber', '低': 'gray' };
  const stMap = id => DB.taskStates.find(s => s.id === id) || { name: id, color: 'gray' };

  const priTable = C.table({
    cols: [
      { label: '目标项目', render: r => `<span class="td-strong">${r.proj}</span>` },
      { label: '企业', key: 'ent' },
      { label: '目标资质', render: r => `<span class="cell-sub">${r.qual}</span>` },
      { label: '计划申报', render: r => `<span class="cell-sub">${r.plan}</span>` },
      { label: '准备周期', key: 'prep' },
      { label: '负责人', render: r => r.owner === '待派发' ? C.badge('待派发', 'gray', true) : r.owner },
      { label: '里程碑', render: r => `<span class="cell-sub">${r.milestone}</span>` },
      { label: '优先级', render: r => C.badge(r.pri, priColor[r.pri], true) },
      { label: '状态', render: r => { const s = stMap(r.state); return C.badge(s.name, s.color, true); } },
    ],
    rows: projRows,
  });

  const newPlanModal = "App.openModal({ title:'新建年度项目计划', body: C.kvGrid([['目标企业','下拉选择托管企业'],['目标项目','高企 / 专精特新 / 技术中心 …'],['计划申报时间','按政策窗口推荐'],['准备周期','AI 估算'],['负责人','指派顾问 / 撰写'],['里程碑','分阶段交付节点']]), foot: C.btn('确认创建',{variant:'primary',onclick:'App.closeModal();App.act(\\'项目计划已创建\\')'}) })";

  return `
  ${C.pageHead({
    icon: '🗓️', title: '年度项目计划',
    crumbs: [{ label: '项目交付' }, { label: '年度项目计划' }],
    desc: '为每家托管企业建立年度项目计划——确定目标项目、计划申报时间、准备周期、负责人和里程碑，输出年度申报日历、项目优先级与交付排期，让全年申报工作可预见、可调度。',
    actions: C.btn('导出排期表', { icon: '📑', onclick: 'App.act("正在导出年度排期表…")' }) +
             C.btn('新建项目计划', { variant: 'primary', icon: '➕', onclick: newPlanModal }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${C.card({ title: '📊 年度项目计划 · 排期甘特图', sub: '按月展示准备期 → 申报期跨度', actions: C.btn('切换季度视图', { size: 'sm', onclick: 'App.notImpl()' }), body: gantt })}

  <div class="grid grid-12 mt-3">
    <div class="col-span-12">
      ${C.card({ title: '🎯 项目优先级与里程碑', sub: '按申报窗口与缺口排序', pad: false, body: priTable })}
    </div>
  </div>

  `;
});
