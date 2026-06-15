/* ============================================================
   页面：评审沉淀库 (Review · Library)
   对应规划书：4.6 评审与质量管理 — 评审沉淀
   定位：所有评审结果进入案例库，反哺规则优化 / 模板优化 / 模型评测
   ============================================================ */
Pages.register('review-library', function (params) {

  // KPI
  const kpis = [
    C.kpi({ label: '累计评审案例', value: '1,284', unit: '份', icon: '🗂️', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '156', trendDir: 'up', foot: '本月新增 156 份' }),
    C.kpi({ label: '沉淀问题类型', value: '42', unit: '类', icon: '🏷️', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '5', trendDir: 'up', foot: '已标准化修改建议' }),
    C.kpi({ label: '通过案例', value: '936', unit: '份', icon: '✅', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '72.9%', trendDir: 'up', foot: '一次通过率 78%' }),
    C.kpi({ label: '失败 / 退回案例', value: '348', unit: '份', icon: '⚠️', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '已归因可复盘' }),
  ];

  // 高频问题类型库
  const freqIssues = [
    { type: '细分市场数据缺失', freq: 186, level: '高', sug: '引用第三方行业报告或权威机构数据，明确细分口径与统计来源。' },
    { type: '研发费用归集不规范', freq: 164, level: '高', sug: '建立研发费用辅助账，按项目归集人工、材料、折旧，与审计口径一致。' },
    { type: '知识产权与产品对应不清', freq: 142, level: '中', sug: '制作知识产权-产品-收入对应表，逐项说明专利如何支撑核心产品。' },
    { type: '高新收入口径错误', freq: 121, level: '高', sug: '区分高新收入与非高新收入，保留收入确认依据与专项审计支撑。' },
    { type: '科技人员占比佐证不足', freq: 98, level: '中', sug: '补充社保缴纳记录、劳动合同与学历证明，核对科技人员名单。' },
    { type: '技术先进性论证薄弱', freq: 87, level: '中', sug: '增加国内外同类产品对比，量化技术指标领先幅度。' },
    { type: '术语与表述不统一', freq: 64, level: '低', sug: '建立术语表，全文统一技术名词与缩写。' },
  ];
  const freqTable = C.table({
    cols: [
      { label: '问题类型', render: r => `<span class="td-strong">${C.esc(r.type)}</span>` },
      { label: '出现频次', render: r => `<div style="width:140px">${C.progress(Math.round(r.freq / 186 * 100), { color: r.level === '高' ? 'var(--red)' : r.level === '中' ? 'var(--amber)' : 'var(--primary)' })}<span class="cell-sub">${r.freq} 次</span></div>` },
      { label: '风险等级', render: r => C.badge(r.level, r.level === '高' ? 'red' : r.level === '中' ? 'amber' : 'gray') },
      { label: '标准修改建议', render: r => `<span class="cell-sub">${C.esc(r.sug)}</span>` },
    ],
    rows: freqIssues,
  });

  // 通过经验库 / 失败原因库（Tab 两栏）
  const passCases = [
    { t: '资质梯度组合申报', d: '科技型中小企业入库 → 高企认定 → 专精特新，逐级背书，材料可复用，通过率显著提升。' },
    { t: '研发费用早归集', d: '签约即建立研发辅助账，申报季无需补做，高新收入与研发占比口径一次到位。' },
    { t: '知识产权前置布局', d: '提前规划核心发明专利与产品对应关系，技术先进性论证有据可依。' },
    { t: '第三方数据背书', d: '引用权威行业报告佐证细分市场地位，竞争力维度评分平均提升 12 分。' },
  ];
  const failCases = [
    { t: '细分市场数据缺失', d: '专精特新申报中最高频失败原因，缺少第三方数据导致细分领域地位无法成立。' },
    { t: '研发费用归集不规范', d: '辅助账缺失或口径混乱，审计阶段被核减，研发占比不达标。' },
    { t: '高新收入口径错误', d: '高新与非高新收入混计，导致高新收入占比＜60% 不达标。' },
    { t: '申报时间窗口误判', d: '材料未在政策窗口前完成评审与修改，错失当年申报批次。' },
  ];
  const colCard = (title, icon, type, items) => C.card({ title: icon + ' ' + title, body:
    items.map(c => C.listItem({ icon: type === 'teal' ? '✅' : '⚠️', iconBg: 'var(--' + type + '-50)', iconColor: 'var(--' + type + ')', title: c.t, sub: c.d })).join('') });

  const passFailTab = `
  <div class="grid grid-2">
    ${colCard('典型通过经验库', '🏆', 'teal', passCases)}
    ${colCard('典型失败原因库', '🚧', 'amber', failCases)}
  </div>`;

  // 专家偏好库
  const expertPrefs = [
    { name: '郑博士', field: 'AI / 半导体', focus: ['技术先进性论证', '卡脖子技术对标', '研发组织管理'], note: '尤其关注与国际同类技术的量化对比，要求论证可证伪。' },
    { name: '孙教授', field: '生物医药', focus: ['临床/研发阶段真实性', '知识产权质量', '财务合理性'], note: '重视研发投入与成果的逻辑闭环，警惕夸大表述。' },
    { name: '李工', field: '新材料 / 装备', focus: ['产业化能力', '高新收入口径', '市场空间论证'], note: '强调样机到量产的可行性与收入归集规范性。' },
  ];
  const prefTab = expertPrefs.map(e => C.card({ title: '👨‍🔬 ' + e.name, sub: e.field, body:
    `<div class="mb-2">${C.tagList(e.focus, { primary: true })}</div>
     <div class="text-sm text-2">${C.esc(e.note)}</div>
     <div class="text-xs text-3 mt-2">${C.sourceRef('基于该专家历史意见书结构化沉淀')}</div>` })).join('');

  const libTabs = C.tabs([
    { label: '高频问题类型库', count: freqIssues.length, content: `${C.card({ title: '🏷️ 高频问题类型与标准修改建议', sub: '统计自全部评审案例', pad: false, body: freqTable })}` },
    { label: '通过 / 失败案例库', content: passFailTab },
    { label: '专家偏好库', count: expertPrefs.length, content: `<div class="grid grid-3">${prefTab}</div>` },
  ], 'revlib');

  // 沉淀价值闭环
  const flowCard = C.card({ title: '🔄 评审沉淀价值闭环', body:
    `${C.stateFlow([
      { id: 'a', name: '评审结果' }, { id: 'b', name: '案例库' }, { id: 'c', name: '规则优化' },
      { id: 'd', name: '模板优化' }, { id: 'e', name: '模型评测样本' }, { id: 'f', name: '反哺AI评审与材料撰写' },
    ], 'b')}
     <div class="grid grid-3 mt-3">
       ${C.listItem({ icon: '📐', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', title: '规则优化', sub: '高频问题转化为评审规则，AI 自动拦截比例持续提升。' })}
       ${C.listItem({ icon: '📄', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', title: '模板优化', sub: '通过经验沉淀为材料模板，撰写阶段一次写对。' })}
       ${C.listItem({ icon: '🧪', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', title: '模型评测样本', sub: '专家复核结果作为评测集，校准 AI 评分准确率。' })}
     </div>` });

  return `
  ${C.pageHead({
    icon: '🗂️', title: '评审沉淀库',
    crumbs: [{ label: '评审与质量' }, { label: '评审沉淀库' }],
    desc: '规划书 4.6：所有评审结果进入案例库，沉淀问题类型、通过经验、失败原因与专家偏好，用于规则优化、模板优化与模型评测样本，形成反哺 AI 评审与材料撰写的质量闭环。',
    actions: C.btn('导出案例库', { icon: '📤', onclick: 'App.act("正在导出评审案例库…")' }) +
             C.btn('沉淀分析助手', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${libTabs}

  <div class="mt-3">${flowCard}</div>

  `;
});
