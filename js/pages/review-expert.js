/* ============================================================
   页面：专家评审 (Review · Expert)
   对应规划书：4.6 评审与质量管理 — 专家评审 / 第2章 专家角色
   定位：质量闸口第二道 —— 专家解决专业判断、结果背书与客户信任
   ============================================================ */
Pages.register('review-expert', function (params) {

  const scoreColor = (s) => s >= 85 ? 'teal' : s >= 70 ? 'primary' : s >= 50 ? 'amber' : 'red';
  const levelColor = (l) => l === '高' ? 'red' : l === '中' ? 'amber' : 'gray';

  // KPI
  const kpis = [
    C.kpi({ label: '待专家复核', value: '8', unit: '份', icon: '👨‍🔬', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', trend: '2', trendDir: 'up', foot: '其中高优先级 3 份' }),
    C.kpi({ label: '本月专家意见书', value: '34', unit: '份', icon: '📝', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '18%', trendDir: 'up', foot: '已背书并归档' }),
    C.kpi({ label: '平均复核时长', value: '4.3', unit: 'h', icon: '⏱️', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '0.6h', trendDir: 'down', foot: '较上月缩短' }),
    C.kpi({ label: '风险拦截率', value: '93', unit: '%', icon: '🛡️', iconBg: 'var(--red-50)', iconColor: 'var(--red)', trend: '4%', trendDir: 'up', foot: '提交前发现关键风险' }),
  ];

  // 专家产能 / 排期
  const experts = [
    { name: '郑博士', field: 'AI / 半导体', load: 82, pending: 3, next: '今日 16:00', avg: '4.2h' },
    { name: '孙教授', field: '生物医药', load: 64, pending: 2, next: '明日 10:00', avg: '5.1h' },
    { name: '李工', field: '新材料 / 装备', load: 91, pending: 5, next: '今日 18:30', avg: '3.8h' },
  ];
  const capacityCard = C.card({ title: '👨‍🔬 专家产能与排期', sub: '负荷 / 待审 / 最近可排期',
    body: experts.map(e => `<div class="list-item">
      <div class="li-icon" style="background:var(--amber-50);color:var(--amber)">专</div>
      <div class="li-main"><div class="li-title">${C.esc(e.name)} <span class="text-3 text-xs">${C.esc(e.field)}</span></div>
        <div style="margin-top:5px">${C.progress(e.load, { color: e.load >= 85 ? 'var(--red)' : 'var(--teal)' })}</div>
      </div>
      <div class="text-r"><div class="td-strong text-sm">${e.load}%</div><div class="cell-sub">待审 ${e.pending} · 可排 ${e.next}</div></div>
    </div>`).join('') });

  // 专家评审队列
  const queue = DB.reviews.filter(r => r.type === '专家评审' || r.status.includes('专家'));
  const moreQueue = [
    { id: 'RV07', target: '锐捷半导体-专精特新小巨人申报书', ent: '锐捷半导体', expert: '郑博士', status: '复核中', date: '2026-06-14', prio: '高' },
    { id: 'RV08', target: '青松生物医药-重大新药创制材料', ent: '青松生物医药', expert: '孙教授', status: '待分配', date: '2026-06-13', prio: '中' },
    { id: 'RV09', target: '绿源环保-科技型中小企业自评复核', ent: '绿源环保', expert: '李工', status: '待专家确认', date: '2026-06-12', prio: '中' },
  ];
  const allQueue = queue.map(r => ({ ...r, ent: r.target.split('-')[0], prio: '高' })).concat(moreQueue);

  const queueTable = C.table({
    cols: [
      { label: '评审对象', render: r => `<span class="td-strong">${C.esc(r.target)}</span>` },
      { label: '企业', render: r => `<span class="cell-sub">${C.esc(r.ent)}</span>` },
      { label: '分配专家', render: r => r.expert && r.expert !== '-' ? C.badge(r.expert, 'amber', true) : C.badge('待分配', 'gray') },
      { label: '状态', render: r => C.badge(r.status, r.status.includes('确认') ? 'primary' : r.status.includes('中') ? 'amber' : 'gray', true) },
      { label: '提交时间', render: r => `<span class="cell-sub">${C.esc(r.date)}</span>` },
      { label: '优先级', render: r => C.badge(r.prio, r.prio === '高' ? 'red' : 'amber') },
    ],
    rows: allQueue,
  });

  // 一份专家意见书示例：RV02 智驰新能源-高企复审材料（91分，专家郑博士）
  const op = DB.reviews[1];
  const ent = DB.getEnterprise('E004');

  const opinionItems = [
    { time: '关键结论复核', title: '高企认定核心条件全部满足', desc: '知识产权 128 件、研发费用占比、高新收入占比均达标且口径正确，核心结论成立，认定通过可信度高。', status: 'done' },
    { time: '专业风险提示', title: '高新收入归集口径需复核', desc: '智能驾驶软件服务收入与硬件收入混合计列，建议拆分核算并保留收入确认依据，避免审计阶段口径争议。', status: 'warn' },
    { time: '申报策略建议', title: '建议同步申报国家级专精特新小巨人', desc: '企业研发强度与细分市场地位突出，高企复审与小巨人可形成资质梯度组合，提升政府背书与奖励额度。', status: 'done' },
    { time: '材料表达批注', title: '技术先进性论证可再强化', desc: '修改批注：第三章建议补充与国内外同类产品的对比表，量化三电系统能效领先幅度，增强评审专家直观判断。', status: '' },
  ];
  const opinionTimeline = C.timeline(opinionItems);

  const opIssues = op.issues.map(it => C.listItem({
    icon: it.level === '高' ? '⛔' : it.level === '中' ? '⚠️' : 'ℹ️',
    iconBg: 'var(--' + levelColor(it.level) + '-50, #f1f3f5)', iconColor: 'var(--' + levelColor(it.level) + ')',
    title: C.badge(it.level + '风险', levelColor(it.level), true) + ' ' + C.esc(it.text),
    sub: it.level === '中' ? '专家批注：需在提交前由财务复核口径并补充佐证。' : '专家批注：建议补充说明性附件，非阻断项。',
  })).join('');

  const opinionCard = C.card({
    title: '🖊️ 专家意见书示例', sub: op.target,
    actions: C.badge('专家评审', 'amber', true),
    body: `
    <div class="grid grid-12">
      <div class="col-span-7">
        ${C.card({ title: '专家信息', body: C.kvGrid([
          ['复核专家', C.badge(op.expert, 'amber', true) + ' <span class="text-3 text-xs">AI / 半导体 / 新能源</span>'],
          ['评审企业', C.entLogo(ent, 26) + ' ' + C.esc(ent.name)],
          ['评审类型', '高企复审材料 · 签约前关键复核'],
          ['提交时间', op.date + ' · 复核时长 3.5h'],
        ]) })}
      </div>
      <div class="col-span-5">
        <div class="flex items-center gap-4" style="justify-content:center;padding:8px 0">
          ${C.scoreRing(op.score, { size: 110, label: '专家评分' })}
          <div class="flex-1">
            <div class="text-2 text-sm mb-1">最终建议</div>
            ${C.badge('修改后通过', 'teal', true)}
            <div class="text-sm text-2 mt-2">基础扎实、结论可信，解决 1 项中风险后可出具背书。</div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-3 text-sm fw-6 mb-1">专家复核意见（关键结论 / 风险 / 策略 / 材料批注）</div>
    ${opinionTimeline}
    <div class="mt-3 text-sm fw-6 mb-1">问题清单</div>
    ${opIssues}
    <div class="mt-3">
      ${C.btn('退回材料修改', { onclick: "location.hash='writing-tasks'" })}
      ${C.btn('生成意见书 PDF', { onclick: 'App.act("正在生成专家意见书 PDF…")' })}
    </div>
    ` });

  return `
  ${C.pageHead({
    icon: '👨‍🔬', title: '专家评审',
    crumbs: [{ label: '评审与质量' }, { label: '专家评审' }],
    desc: '规划书 4.6：专家评审解决专业判断、结果背书与客户信任。适用签约前诊断、重要项目提交前、客户要求专家背书；输出专家意见书、修改批注与最终建议，是平台专业可信度的质量闸口。',
    actions: C.btn('分配专家', { icon: '🧑‍⚖️', onclick: 'App.act("已分配专家并通知")' }) +
             C.btn('专家评审助手', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${C.alert('<b>人机协同分工：</b>AI 先审基础问题（格式、完整性、指标、引用一致性），专家只复核高价值结论与风险点。专家意见成为可追溯资产，用于更新规则库、模板库与 AI 评测集。', 'purple', '🤝')}

  <div class="grid grid-12 mt-3">
    <div class="col-span-5">${capacityCard}</div>
    <div class="col-span-7">${C.card({ title: '📋 专家评审队列', sub: '签约前诊断 / 提交前复核 / 客户背书', pad: false,
      actions: C.btn('沉淀库', { size: 'sm', onclick: "location.hash='review-library'" }), body: queueTable })}</div>
  </div>

  <div class="mt-3">${opinionCard}</div>

  <div class="mt-3">${C.card({ title: '🧭 专家意见 → 可追溯资产闭环', body:
    `${C.stateFlow([
      { id: 'a', name: '专家复核' }, { id: 'b', name: '出具意见书' }, { id: 'c', name: '签字背书' },
      { id: 'd', name: '沉淀案例库' }, { id: 'e', name: '更新规则/模板/评测集' }, { id: 'f', name: '反哺AI评审' },
    ], 'c')}
     <div class="text-c text-sm text-2 mt-2">专家的关键判断与偏好被结构化沉淀，持续提升 AI 初评准确率与材料撰写质量。</div>` })}</div>
  `;
});
