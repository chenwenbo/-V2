/* ============================================================
   页面：材料撰写工作台 (Writing Editor) — 隐藏页，带 ?id=T001
   对应规划书：4.5 AI撰写书 + 分模块生产 / 5.2 治理
   三栏式工作台：章节看板 + 章节编辑区 + 版本/AI建议/待确认/引用。
   体现防事实编造：无依据内容标记 + 需客户确认内容标记；
   引用来源、版本、修改轨迹可追溯。
   ============================================================ */
Pages.register('writing-editor', function (params) {

  const task = DB.tasks.find(t => t.id === params.id)
    || DB.tasks.find(t => t.type === '撰写任务')
    || DB.tasks[0];
  const ent = DB.enterprises.find(e => task.ent && e.name.indexOf(task.ent) === 0) || DB.enterprises[0];

  // ---------- 左栏：章节看板 ----------
  const chapters = [
    { name: '企业基本情况', state: 'done', owner: '陈思' },
    { name: '技术创新性', state: 'doing', owner: '陈思', active: true },
    { name: '研发组织管理', state: 'ai', owner: '王磊' },
    { name: '知识产权情况', state: 'review', owner: '王磊' },
    { name: '财务与成长性', state: 'todo', owner: '李娜' },
    { name: '科技成果转化', state: 'todo', owner: '李娜' },
  ];
  const chState = {
    todo: { label: '待撰写', type: 'gray' },
    ai: { label: 'AI初稿', type: 'purple' },
    doing: { label: '撰写中', type: 'primary' },
    review: { label: '待复核', type: 'amber' },
    done: { label: '已完成', type: 'teal' },
  };

  const chapterBoard = chapters.map((c, i) => {
    const s = chState[c.state];
    return `<div onclick="App.act('已切换到章节：${c.name}')" style="cursor:pointer;padding:10px 12px;border-radius:8px;margin-bottom:6px;border:1px solid ${c.active ? 'var(--primary)' : 'var(--line)'};background:${c.active ? 'var(--primary-50)' : '#fff'}">
      <div class="flex items-center justify-between">
        <span style="font-size:13px;font-weight:${c.active ? '700' : '600'};color:var(--ink)">${i + 1}. ${c.name}</span>
        ${C.badge(s.label, s.type)}
      </div>
      <div class="cell-sub mt-1">负责：${c.owner}</div>
    </div>`;
  }).join('');

  const leftCol = C.card({
    title: '📑 章节看板', sub: chapters.length + ' 章',
    body: chapterBoard + `<div class="mt-2">${C.btn('+ 新增章节', { size: 'sm', onclick: 'App.act("已新增章节")' })}</div>`,
  });

  // ---------- 中栏：当前章节编辑区 ----------
  const noEvid = '<span style="background:var(--red-50);color:var(--red);border:1px dashed var(--red);border-radius:4px;padding:0 4px;font-weight:600" title="无依据内容标记：AI 未在企业素材中找到支撑">⚑无依据</span>';
  const needConfirm = '<span style="background:var(--amber-50);color:var(--amber);border:1px dashed var(--amber);border-radius:4px;padding:0 4px;font-weight:600" title="需客户确认内容标记：待企业核实">⚐需客户确认</span>';

  const draftBody = `
    <div style="font-size:12px;color:var(--text-3);margin-bottom:8px">版本 v3 · 材料撰写 Agent 生成 · 撰写人编辑中</div>
    <div style="font-size:13.5px;line-height:2;color:var(--ink)">
      <p style="margin:0 0 12px">${ent.name}围绕<b>${ent.techAttr}</b>构建了完整的自主技术体系。公司核心技术在
      ${needConfirm} <b>细分领域市场占有率位居行业前列</b>，相较于传统技术路线，产品在关键性能指标上实现显著突破。</p>
      <p style="margin:0 0 12px">在算法 / 工艺层面，公司形成了多项具有自主知识产权的核心技术，累计获得发明及实用新型专利
      <b>${ent.patents}</b> 项、软件著作权 <b>${ent.softCopyrights}</b> 项，技术成果已规模化应用于主营产品。
      ${noEvid} <b>第三方检测报告显示其核心指标达到国际先进水平</b>，该表述暂未在企业素材中找到支撑文件。</p>
      <p style="margin:0 0 12px">公司持续保持高强度研发投入，近三年研发投入累计 <b>${ent.rd}</b> 级别，建立了以研发中心为核心的
      技术创新组织体系，技术创新性符合${'高新技术企业'}认定中"技术先进性"与"自主知识产权"的核心要求。</p>
    </div>
    <div class="mt-3 flex items-center gap-3 flex-wrap" style="padding-top:10px;border-top:1px solid var(--line)">
      ${C.badge('⚑ 无依据内容 1 处', 'red')}
      ${C.badge('⚐ 需客户确认 1 处', 'amber')}
      <span class="text-xs text-3">系统对 AI 生成内容做防编造标记，红色需删除或补证据、黄色需客户核实</span>
    </div>`;

  const midCol = C.card({
    title: '✍️ 当前章节：技术创新性',
    sub: '撰写中 · 负责人 陈思',
    actions: C.badge('AI初稿 v3', 'purple'),
    body: draftBody + `<div class="mt-3">${C.alert('政策校验：本章节对应高企认定「技术先进性 / 自主知识产权」评分项。当前存在 1 处无依据表述，导出前必须处理。', 'amber', '🛡️')}</div>`,
  });

  // ---------- 右栏：版本历史 + AI建议 + 待确认 + 引用 ----------
  const versionTl = C.timeline([
    { time: '2026-06-14 16:20', title: 'v3 撰写人编辑', desc: '陈思 调整市场地位表述，标记需客户确认', status: 'done' },
    { time: '2026-06-14 10:05', title: 'v2 AI 重新生成', desc: '材料撰写 Agent 按新素材重写技术创新性', status: 'done' },
    { time: '2026-06-13 15:40', title: 'v1 AI 初稿', desc: '基于企业画像与专利清单生成首版', status: 'done' },
  ]);

  const aiAdvice = [
    { icon: '✨', t: '补充"国际先进水平"的第三方检测报告作为证据，或改为可佐证的表述' },
    { icon: '✨', t: '细分市场占有率建议引用行业协会 / 第三方机构数据并标注来源' },
    { icon: '✨', t: '建议补充 1-2 个典型应用案例以强化技术成果转化论证' },
  ].map(a => C.listItem({ icon: a.icon, iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', title: a.t, sub: '材料撰写 Agent · 修改建议' })).join('');

  const pendingQs = [
    { q: '细分市场占有率的具体数值与数据来源？', who: '需企业市场部确认' },
    { q: '是否有国际权威检测 / 认证报告可引用？', who: '需企业研发部提供' },
  ].map(p => C.listItem({ icon: '❓', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', title: p.q, sub: p.who, right: C.btn('发送客户', { size: 'sm', onclick: 'App.act("已推送客户确认")' }) })).join('');

  const refs = `<div class="flex flex-col gap-2">
    ${['企业画像（研发 / 知识产权）', '专利清单 23 项', '近三年研发投入台账', '主营产品技术白皮书'].map(r =>
      `<div class="flex items-center gap-2">${C.sourceRef(r)}</div>`).join('')}
  </div><div class="mt-2 text-xs text-3">引用来源、版本与修改轨迹全程可追溯（治理 5.2）</div>`;

  const rightCol =
    C.card({ title: '🕐 版本历史', body: versionTl }) +
    `<div class="mt-3">${C.card({ title: '✨ AI 修改建议', body: aiAdvice })}</div>` +
    `<div class="mt-3">${C.card({ title: '❓ 待客户确认问题', sub: '2 项', body: pendingQs })}</div>` +
    `<div class="mt-3">${C.card({ title: '📎 引用企业素材', body: refs })}</div>`;

  // ---------- 顶部操作条 ----------
  const exportModal = "App.openModal({ title:'一键导出材料包', size:'wide', body:"
    + " C.alert('导出前已自动执行<b>附件清单校验</b>与<b>提交检查清单</b>：6 个章节中 1 章存在无依据内容，建议处理后导出。','amber','🛡️')"
    + " + C.kvGrid([['Word 申报书','申报书正文 v3（含 6 章节）'],['PDF 材料包','合并附件的只读提交版'],['Excel 清单','研发费用 / 高新收入 / 人员明细表'],['附件目录','营业执照 / 专利证书 / 审计报告 等 12 项'],['提交检查清单','格式 / 签章 / 附件完整性 自动校验']]),"
    + " foot: C.btn('确认导出材料包',{variant:'primary',onclick:'App.closeModal();App.act(\\'材料包已导出：Word + PDF + Excel + 附件目录\\')'}) })";

  const actions =
    C.btn('保存', { onclick: 'App.act("已保存当前版本")' }) +
    C.btn('提交 AI 评审', { variant: 'ai', icon: '✨', onclick: "location.hash='review-ai'" }) +
    C.btn('提交专家复核', { icon: '🔍', onclick: "location.hash='review-expert'" }) +
    C.btn('一键导出材料包', { variant: 'primary', icon: '📦', onclick: exportModal });

  return `
  ${C.pageHead({
    icon: '🖊️', title: '材料撰写工作台',
    crumbs: [{ label: '项目交付' }, { label: '撰写任务生产', route: 'writing-tasks' }, { label: task.title }],
    desc: '分模块协同撰写申报材料。AI 按章节生成初稿、按企业素材引用、按政策要求校验；系统维护版本、引用资料、修改建议与专家意见，并对无依据内容与需客户确认内容进行标记，防止事实编造、保障可追溯。',
    actions: actions,
  })}

  <div class="flex gap-3 mb-3 flex-wrap items-center">
    ${C.entLogo(ent, 32)}
    <div><div class="td-strong">${ent.name}</div><div class="cell-sub">${task.project} · 撰写人 ${task.owner}</div></div>
    ${C.badge('截止 ' + task.due, 'amber', true)}
    ${C.badge('整体进度 ' + task.progress + '%', 'primary', true)}
  </div>

  <div class="grid grid-12">
    <div class="col-span-3">${leftCol}</div>
    <div class="col-span-6">${midCol}</div>
    <div class="col-span-3">${rightCol}</div>
  </div>
  `;
});
