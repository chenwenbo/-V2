/* ============================================================
   页面：AI评审 (Review · AI)
   对应规划书：4.6 评审与质量管理 — AI合规评审 + AI竞争力评审
   定位：质量闸口第一道 —— AI解决高频检查、规则一致性与初步意见
   ============================================================ */
Pages.register('review-ai', function (params) {

  const scoreColor = (s) => s >= 85 ? 'teal' : s >= 70 ? 'primary' : s >= 50 ? 'amber' : 'red';
  const levelColor = (l) => l === '高' ? 'red' : l === '中' ? 'amber' : 'gray';
  const statusColor = (s) => s.includes('通过') ? 'teal' : s.includes('风险') ? 'amber' : s.includes('补充') ? 'amber' : 'primary';

  // KPI
  const kpis = [
    C.kpi({ label: '本月 AI 评审数', value: '156', unit: '次', icon: '🔍', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '24%', trendDir: 'up', foot: '合规评审 98 · 竞争力评审 58' }),
    C.kpi({ label: '平均评分', value: '82.4', unit: '分', icon: '📊', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '3.1', trendDir: 'up', foot: '竞争力维度均值' }),
    C.kpi({ label: '问题命中率', value: '88', unit: '%', icon: '🎯', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '5%', trendDir: 'up', foot: '与专家复核结果一致' }),
    C.kpi({ label: '基础问题自动拦截', value: '70', unit: '%', icon: '🛡️', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', trend: '8%', trendDir: 'up', foot: '专家只复核高价值结论' }),
  ];

  // 两类 AI 评审说明
  const reviewTypes = `
  <div class="grid grid-2">
    ${C.card({ title: '✅ AI 合规评审', sub: '材料初稿 / 附件清单 / 项目条件校验', body: `
      ${C.kvGrid([
        ['适用场景', '申报材料初稿、附件清单核对、项目条件资格校验'],
        ['评审内容', '格式规范、完整性、指标达标、引用一致性、明显风险'],
        ['输出结论', C.badge('通过', 'teal') + ' / ' + C.badge('风险', 'amber') + ' / ' + C.badge('待补充', 'amber') + ' + 问题定位 + 修改建议'],
      ])}
      <div class="mt-2 text-xs text-3">由评审 Agent 基于项目规则库自动执行，秒级完成基础校验 ${C.sourceRef('规则库 v2026.06')}</div>` })}
    ${C.card({ title: '🚀 AI 竞争力评审', sub: '高企 / 专精特新 / 科技项目 / 融资材料', body: `
      ${C.kvGrid([
        ['适用场景', '高企认定、专精特新、科技项目、融资材料的竞争力评估'],
        ['评审内容', '技术先进性、创新性、市场空间、团队能力、财务合理性'],
        ['输出结论', C.badge('评分', 'primary') + ' + 优势短板分析 + 提升建议'],
      ])}
      <div class="mt-2 text-xs text-3">基于评分模型对申报竞争力打分，识别短板并给出可执行优化方向 ${C.sourceRef('评分模型 v3.2')}</div>` })}
  </div>`;

  // AI 评审任务列表（DB 中 type 含 AI 的 + 补充）
  const aiReviews = DB.reviews.filter(r => r.type.includes('AI'));
  const moreAi = [
    { id: 'RV04', target: '数联云软件-高企认定申报书', type: 'AI竞争力评审', score: 73, status: '风险', expert: '-', date: '2026-06-12' },
    { id: 'RV05', target: '锐捷半导体-专精特新附件清单', type: 'AI合规评审', score: 62, status: '待补充', expert: '-', date: '2026-06-11' },
    { id: 'RV06', target: '恒瑞医疗-省级技术中心申请报告', type: 'AI竞争力评审', score: 89, status: '已出具', expert: '-', date: '2026-06-09' },
  ];
  const allAi = aiReviews.concat(moreAi);

  const taskTable = C.table({
    cols: [
      { label: '评审对象', render: r => `<span class="td-strong">${C.esc(r.target)}</span>` },
      { label: '类型', render: r => C.badge(r.type.replace('AI', ''), r.type.includes('合规') ? 'cyan' : 'purple', true) },
      { label: '评分', render: r => C.badge(r.score + ' 分', scoreColor(r.score)) },
      { label: '状态', render: r => C.badge(r.status, statusColor(r.status), true) },
      { label: '日期', render: r => `<span class="cell-sub">${C.esc(r.date)}</span>` },
      { label: '', render: r => C.btn('展开详情', { size: 'sm', onclick: 'App.act("展开 ' + r.id + ' 评审详情")' }) },
    ],
    rows: allAi,
  });

  // 一份完整 AI 评审报告示例：RV01 云栖智能-专精特新申报书（78分）
  const rpt = DB.reviews[0];
  const ent = DB.getEnterprise('E001');

  const compDims = [
    { label: '技术先进性', value: 86, display: '86', color: 'var(--teal)' },
    { label: '创新性', value: 80, display: '80', color: 'var(--primary)' },
    { label: '市场空间', value: 64, display: '64', color: 'var(--amber)' },
    { label: '团队能力', value: 84, display: '84', color: 'var(--teal)' },
    { label: '财务合理性', value: 70, display: '70', color: 'var(--primary)' },
  ];

  const issuesHtml = rpt.issues.map(it => `
    <div class="list-item">
      <div class="li-icon" style="background:var(--${levelColor(it.level)}-50, #f1f3f5);color:var(--${levelColor(it.level)})">${it.level === '高' ? '⛔' : it.level === '中' ? '⚠️' : 'ℹ️'}</div>
      <div class="li-main">
        <div class="li-title">${C.badge(it.level + '风险', levelColor(it.level), true)} <span style="margin-left:6px">${C.esc(it.text)}</span></div>
        <div class="li-sub">修改建议：${it.level === '高' ? '补充行业研究报告或第三方机构数据，明确细分市场口径与数据来源。' : it.level === '中' ? '核对财务报表与申报书研发投入口径，确保两处表述一致。' : '建立术语表，统一全文技术名词与缩写。'}</div>
      </div>
    </div>`).join('');

  const reportCard = C.card({
    title: '📄 AI 评审报告示例', sub: rpt.target,
    actions: C.badge(rpt.type.replace('AI', 'AI '), 'purple', true),
    body: `
    <div class="grid grid-12">
      <div class="col-span-5">
        <div class="flex items-center gap-4">
          ${C.scoreRing(rpt.score, { size: 110, label: 'AI 综合评分' })}
          <div class="flex-1">
            <div class="mb-2">${C.entLogo(ent, 30)} <span class="td-strong">${C.esc(ent.name)}</span></div>
            <div class="mb-2">结论 ${C.badge('风险（待修改）', 'amber', true)}</div>
            <div class="text-sm text-2">具备申报基础，竞争力中等偏上，存在 1 项高风险需在提交前解决。</div>
          </div>
        </div>
      </div>
      <div class="col-span-7">
        <div class="text-sm fw-6 mb-2">竞争力维度评分</div>
        ${C.barChart(compDims)}
      </div>
    </div>
    <div class="mt-3 text-sm fw-6 mb-1">问题清单（按风险等级排序）</div>
    ${issuesHtml}
    <div class="mt-3">
</div>
    <div class="mt-3">${C.alert('<b>AI 评分仅供参考，关键结论需专家复核。</b> 高风险项与最终通过/不通过结论须由签约专家确认背书后方可对客户出具。', 'amber', '⚠️')}</div>
    ` });

  return `
  ${C.pageHead({
    icon: '🔍', title: 'AI 评审',
    crumbs: [{ label: '评审与质量' }, { label: 'AI 评审' }],
    desc: '规划书 4.6：AI 评审解决高频检查、规则一致性和初步意见。分为 AI 合规评审与 AI 竞争力评审，自动拦截基础问题，输出评分、问题定位与修改建议，作为质量闸口第一道把关。',
    actions: C.btn('发起 AI 评审', { icon: '➕', onclick: 'App.act("已创建 AI 评审任务")' }) +
             C.btn('AI 评审助手', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${reviewTypes}

  <div class="mt-3">${C.card({ title: '📋 AI 评审任务列表', sub: '评审 Agent 自动初评', pad: false,
    actions: C.btn('全部评审', { size: 'sm', onclick: "location.hash='review-library'" }), body: taskTable })}</div>

  <div class="mt-3">${reportCard}</div>

  <div class="mt-3">${C.card({ title: '🧭 AI 初评 → 专家复核 协同闭环', body:
    `${C.steps(['材料提交', 'AI 合规评审', 'AI 竞争力评审', '专家复核高价值结论', '出具评审结果', '沉淀至案例库'], 2)}
     <div class="text-c text-sm text-2 mt-2">AI 先审基础问题与规则一致性（拦截约 70% 基础问题），专家只复核高价值结论与风险点，评审结果沉淀反哺规则库与评测集。</div>` })}</div>
  `;
});
