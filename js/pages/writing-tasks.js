/* ============================================================
   页面：撰写任务生产 (Writing Task Production)
   对应规划书：4.5 项目交付与材料生产 · 撰写任务生产
   回答四问：做什么项目、计划什么时候申报、现在还差什么、
   如何把材料高质量生产出来。覆盖项目计划 / 未达标任务 /
   AI撰写书 / 分模块生产 / 一键上传下载。
   ============================================================ */
Pages.register('writing-tasks', function () {

  // KPI
  const kpis = [
    C.kpi({ label: '在写材料数', value: '14', unit: '份', icon: '✍️', iconBg: 'var(--cyan-50)', iconColor: 'var(--cyan)', trend: '3', trendDir: 'up', foot: '覆盖 9 个项目' }),
    C.kpi({ label: '本周计划交付', value: '5', unit: '份', icon: '📦', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', foot: '高企季材料高峰' }),
    C.kpi({ label: '平均产能', value: '2.4', unit: '份/人周', icon: '⚡', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '0.3', trendDir: 'up', foot: 'AI 初稿提效 40%' }),
    C.kpi({ label: '专家修改率', value: '34', unit: '%', icon: '🔍', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', trend: '6%', trendDir: 'down', foot: '一次通过率提升中' }),
  ];

  // ---------- 四问要点卡 ----------
  const fourQ = `<div class="grid grid-4">
    ${[
      { q: '做什么项目', a: '来自年度项目计划，明确目标资质与申报主体', icon: '🗓️', route: 'project-plan', color: 'var(--primary)' },
      { q: '什么时候申报', a: '按政策窗口确定计划申报时间与准备周期', icon: '⏰', route: 'policy-calendar', color: 'var(--teal)' },
      { q: '现在还差什么', a: '未达标缺口任务给出待补齐指标与证据材料', icon: '🧩', route: 'gap-tasks', color: 'var(--amber)' },
      { q: '如何高质量生产', a: 'AI撰写书 + 分模块生产 + 一键上传下载', icon: '✨', route: 'writing-editor', color: 'var(--purple)' },
    ].map(c => `<div class="card" style="border-top:3px solid ${c.color};cursor:pointer" onclick="location.hash='${c.route}'">
      <div class="card-body">
        <div style="font-size:22px">${c.icon}</div>
        <div class="td-strong mt-1" style="font-size:14px">${c.q}</div>
        <div class="cell-sub mt-1" style="line-height:1.6">${c.a}</div>
      </div>
    </div>`).join('')}
  </div>`;

  // ---------- 4个功能点详卡（设计要点 + 关键输出）----------
  const features = [
    { title: '🗓️ 项目计划', point: '为每家企业建立年度项目计划，确定目标项目、申报时间、准备周期、负责人与里程碑。', out: '年度申报日历 · 项目优先级 · 交付排期', route: 'project-plan' },
    { title: '🧩 未达标任务', point: '将项目条件拆成指标项，识别研发费用、知识产权、人员、财务、成果转化、制度文件等缺口。', out: '缺口清单 · 责任人 · 截止日期 · 证据材料', route: 'gap-tasks' },
    { title: '✨ AI 撰写书', point: '支持可研报告 / 项目申报书 / 高企材料 / 专精特新材料 / 研发项目书 / 服务方案模板化撰写：按章节生成、按企业素材引用、按政策要求校验。', out: '章节初稿 · 引用清单 · 政策校验提示', route: 'writing-editor' },
    { title: '🧱 分模块生产', point: '不同人员负责不同模块，系统维护版本、引用资料、AI建议与专家修改记录。', out: '章节看板 · 版本历史 · 修改意见 · 待确认问题', route: 'writing-editor' },
    { title: '📦 一键上传下载', point: '资料包上传、模板导出、材料打包、附件清单校验、最终版下载，贯通材料生产到提交。', out: 'Word / PDF / Excel 材料包 · 附件目录 · 提交检查清单', route: '' },
  ];

  const featureCards = `<div class="grid grid-2">
    ${features.map(f => C.card({
      title: f.title,
      body: `<div class="text-sm text-2" style="line-height:1.7">${f.point}</div>
        <div class="mt-2 flex items-center gap-2 flex-wrap">
          <span class="text-xs text-3">关键输出：</span>${C.badge(f.out, 'purple')}
        </div>`,
      actions: f.route ? C.btn('进入', { size: 'sm', onclick: "location.hash='" + f.route + "'" }) : C.btn('打包下载', { size: 'sm', onclick: 'App.act("正在打包材料…")' }),
    })).join('')}
  </div>`;

  // ---------- 撰写任务列表（DB.tasks type=撰写任务 + 补充）----------
  const stMap = id => DB.taskStates.find(s => s.id === id) || { name: id, color: 'gray' };
  const writeTasks = DB.tasks.filter(t => t.type === '撰写任务');

  const taskTable = C.table({
    cols: [
      { label: '任务', render: r => `<span class="td-strong">${r.title}</span>` },
      { label: '企业', key: 'ent' },
      { label: '项目', render: r => `<span class="cell-sub">${r.project}</span>` },
      { label: '撰写人', render: r => r.owner === '-' ? C.badge('待派发', 'gray', true) : r.owner },
      { label: '截止', render: r => `<span class="cell-sub">${r.due}</span>` },
      { label: '状态', render: r => { const s = stMap(r.state); return C.badge(s.name, s.color, true); } },
      { label: '进度', render: r => `<div style="width:96px">${C.progress(r.progress, { color: r.progress >= 80 ? 'var(--teal)' : r.progress >= 40 ? 'var(--primary)' : 'var(--amber)' })}<span class="cell-sub">${r.progress}%</span></div>` },
    ],
    rows: writeTasks,
    onRowClick: r => `location.hash='writing-editor?id=${r.id}'`,
  });

  // ---------- 材料模板库 ----------
  const templates = [
    { name: '可行性研究报告', icon: '📘', desc: '研发专项 / 项目立项', color: 'var(--primary)' },
    { name: '项目申报书', icon: '📗', desc: '通用申报书模板', color: 'var(--teal)' },
    { name: '高企认定材料', icon: '🏅', desc: '高新技术企业全套', color: 'var(--amber)' },
    { name: '专精特新材料', icon: '🏆', desc: '专精特新 / 小巨人', color: 'var(--purple)' },
    { name: '研发项目书 (RD)', icon: '🔬', desc: '研发立项 / 加计扣除', color: 'var(--cyan)' },
    { name: '客户服务方案', icon: '📄', desc: '商机方案 / 报价', color: '#e8590c' },
  ];

  const tplGrid = `<div class="grid grid-3">
    ${templates.map(t => `<div class="card" style="cursor:default">
      <div class="card-body flex items-center gap-3">
        <div class="li-icon" style="background:${t.color}1a;color:${t.color};font-size:18px">${t.icon}</div>
        <div class="li-main">
          <div class="td-strong" style="font-size:13.5px">${t.name}</div>
          <div class="cell-sub">${t.desc}</div>
        </div>
        ${C.btn('新建撰写任务', { size: 'sm', variant: 'primary', onclick: 'App.act("已基于「' + t.name + '」模板新建撰写任务")' })}
      </div>
    </div>`).join('')}
  </div>`;

  return `
  ${C.pageHead({
    icon: '🏭', title: '撰写任务生产',
    crumbs: [{ label: '项目交付' }, { label: '撰写任务生产' }],
    desc: '撰写任务生产回答四个问题：做什么项目、计划什么时候申报、现在还差什么、如何把材料高质量生产出来。打通项目计划、未达标任务、AI撰写书、分模块生产与一键上传下载，让材料生产高效且可追溯。',
    actions: C.btn('材料模板库', { icon: '📚', onclick: 'App.act("已打开材料模板库")' }) +
             C.btn('新建撰写任务', { variant: 'primary', icon: '➕', onclick: 'App.act("已创建撰写任务")' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  ${C.card({ title: '❓ 撰写任务生产 · 回答四问', body: fourQ })}

  <div class="mt-3">${C.card({ title: '🧱 五大功能点 · 设计要点与关键输出', body: featureCards })}</div>

  ${C.card({ title: '📝 撰写任务列表', sub: writeTasks.length + ' 份在产材料', actions: C.btn('全部任务', { size: 'sm', onclick: "location.hash='task-center'" }), pad: false, body: taskTable, cls: 'mt-3' })}

  <div class="mt-3">${C.card({ title: '📚 材料模板库', sub: '模板化撰写 · 一键新建撰写任务', body: tplGrid })}</div>

  `;
});

