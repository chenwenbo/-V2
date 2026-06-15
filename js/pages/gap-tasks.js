/* ============================================================
   页面：未达标缺口任务 (Gap Tasks)
   对应规划书：4.5 项目交付与材料生产 · 未达标任务
   将项目条件拆成指标项，形成缺口任务——研发费用、知识产权、
   人员、财务、成果转化、制度文件等；输出缺口清单、责任人、
   截止日期、证据材料，可派发补齐任务并关联年度项目计划。
   ============================================================ */
Pages.register('gap-tasks', function (params) {

  // 示例企业 + 目标项目：微岩新材料 申报高企
  const ent = DB.getEnterprise(params.id) || DB.getEnterprise('E003');
  const policy = DB.policies.find(p => p.id === 'P001'); // 国家高新技术企业认定
  const overall = 65; // 距离达标整体完成度

  // ---------- 项目条件 → 指标拆解 → 缺口识别 ----------
  // 拆解步骤
  const flow = C.steps(['读取目标项目条件', '拆解为可量化指标项', '比对企业现状', '识别缺口并量化差距', '生成缺口补齐任务'], 4);

  // 指标拆解卡（条件来自 policy.conditions）
  const condCards = `<div class="grid grid-3">
    ${policy.conditions.map(c => C.listItem({ icon: '📌', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', title: c, sub: '已纳入指标拆解' })).join('')}
  </div>`;

  // ---------- 缺口任务清单 ----------
  const stMap = id => DB.taskStates.find(s => s.id === id) || { name: id, color: 'gray' };
  const gapRows = [
    { metric: '知识产权（核心）', req: '≥1项 I 类核心', cur: '0项 I 类 / 14项专利', gap: '缺 1 项核心发明', task: '梳理在审发明并加速 1 项授权 / 受让 1 项核心专利', owner: '张衡（顾问）', due: '2026-08-10', ev: '专利证书 / 受让协议', state: 'doing', sev: 'red' },
    { metric: '研发费用占比', req: '≥4%（按收入区间）', cur: '约 3.2%（归集不规范）', gap: '差 0.8% 且台账缺失', task: '建立研发费用辅助账，规范归集近 3 年研发费用', owner: '张衡（顾问）', due: '2026-08-05', ev: '研发费用辅助账 / 专项审计', state: 'client', sev: 'red' },
    { metric: '科技人员占比', req: '≥10%', cur: '约 9%', gap: '差 1 个百分点', task: '补充科技人员名单与社保 / 劳动合同证明', owner: '刘洋（企业）', due: '2026-07-28', ev: '人员名单 / 社保证明', state: 'todo', sev: 'amber' },
    { metric: '高新收入占比', req: '≥60%', cur: '约 58%', gap: '差 2 个百分点', task: '梳理 PS（产品/服务）与高新技术对应关系，归集高新收入', owner: '陈思（撰写）', due: '2026-08-12', ev: '高新收入专项审计', state: 'pending', sev: 'amber' },
    { metric: '研发组织管理制度', req: '健全的研发组织管理', cur: '制度文件缺失', gap: '缺 4 项制度文件', task: '编制研发立项、经费、人员、成果管理制度文件', owner: '陈思（撰写）', due: '2026-07-30', ev: '研发管理制度文件包', state: 'pending', sev: 'amber' },
    { metric: '科技成果转化', req: '近3年≥5项 / 年均', cur: '约 3 项 / 年', gap: '转化数量与证据不足', task: '梳理成果转化清单，补充转化证明（合同 / 样机 / 销售）', owner: '张衡（顾问）', due: '2026-08-15', ev: '转化证明 / 销售合同', state: 'pending', sev: 'amber' },
  ];

  const gapTable = C.table({
    cols: [
      { label: '指标项', render: r => `<span class="td-strong">${r.metric}</span>` },
      { label: '要求值', render: r => `<span class="cell-sub">${r.req}</span>` },
      { label: '当前值', render: r => `<span class="cell-sub">${r.cur}</span>` },
      { label: '差距', render: r => `<span style="color:var(--${r.sev});font-weight:600;font-size:12.5px">${r.gap}</span>` },
      { label: '缺口任务', render: r => r.task },
      { label: '责任人', key: 'owner' },
      { label: '截止', render: r => `<span class="cell-sub">${r.due}</span>` },
      { label: '证据材料', render: r => `<span class="cell-sub">${r.ev}</span>` },
      { label: '状态', render: r => { const s = stMap(r.state); return C.badge(s.name, s.color, true); } },
    ],
    rows: gapRows,
  });

  // 评分维度（达标完成度近似）
  const dims = [
    { label: '知识产权', value: 40, display: '40%', color: 'var(--red)' },
    { label: '研发费用', value: 55, display: '55%', color: 'var(--red)' },
    { label: '科技人员', value: 88, display: '88%', color: 'var(--teal)' },
    { label: '高新收入', value: 92, display: '92%', color: 'var(--teal)' },
    { label: '组织管理', value: 30, display: '30%', color: 'var(--amber)' },
    { label: '成果转化', value: 60, display: '60%', color: 'var(--amber)' },
  ];

  return `
  ${C.pageHead({
    icon: '🧩', title: '未达标缺口任务',
    crumbs: [{ label: '项目交付' }, { label: '未达标缺口任务' }],
    desc: '将项目申报条件拆解为可量化指标项——研发费用、知识产权、人员、财务、成果转化、制度文件等，比对企业现状识别缺口，形成带责任人、截止日期与证据材料的缺口补齐任务，并可派发执行、关联年度项目计划。',
    actions: C.btn('切换企业 / 项目', { icon: '🔁', onclick: 'App.notImpl()' }) +
             C.btn('生成缺口诊断报告', { variant: 'primary', icon: '📑', onclick: 'App.act("正在生成缺口诊断报告…")' }),
  })}

  <div class="flex gap-3 mb-3 flex-wrap items-center">
    ${C.entLogo(ent, 34)}
    <div>
      <div class="td-strong">${ent.name}</div>
      <div class="cell-sub">${ent.region} · ${ent.industry} · ${ent.techAttr}</div>
    </div>
    <span class="state-arrow">→</span>
    ${C.badge('目标项目：' + policy.name, 'primary', true)}
    ${C.badge(policy.level, 'cyan')}
    ${C.badge('申报窗口 ' + policy.deadline, 'amber', true)}
  </div>

  ${C.card({ title: '🔍 项目条件 → 指标拆解 → 缺口识别', body:
    flow +
    `<div class="mt-3 mb-2 text-sm text-2 fw-6">目标项目「${policy.name}」核心条件（已拆解为指标项）</div>` +
    condCards +
    `<div class="mt-2">${C.alert('评分规则：' + policy.scoreRules + '。系统据此将每个条件拆解为可量化指标，再与企业画像数据比对识别缺口。', 'info', '📌')}</div>` })}

  <div class="grid grid-12 mt-3">
    <div class="col-span-4">
      ${C.card({ title: '🎯 距离达标整体完成度', body:
        `<div class="flex flex-col items-center gap-2" style="padding:6px 0">
          ${C.scoreRing(overall, { size: 130, label: '达标完成度' })}
          <div class="text-sm text-2 text-c">6 项指标中 2 项已达标、4 项存在缺口</div>
        </div>
        <div class="mt-2">${C.badge('关键硬约束未达标', 'red', true)} ${C.badge('建议锁定 9 月窗口', 'amber', true)}</div>` })}
    </div>
    <div class="col-span-8">
      ${C.card({ title: '📐 各指标达标度', sub: '红=硬约束缺口 / 黄=需补齐 / 绿=已达标', body: C.barChart(dims) })}
    </div>
  </div>

  ${C.card({ title: '📋 缺口任务清单', sub: '指标 → 差距 → 补齐任务 → 责任人 / 截止 / 证据', actions: C.btn('导出缺口清单', { size: 'sm', onclick: 'App.act("正在导出缺口清单…")' }), pad: false, body: gapTable, cls: 'mt-3' })}

  `;
});
