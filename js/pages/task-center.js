/* ============================================================
   页面：任务中心·状态机 (Task Center)
   对应规划书：6.2 任务状态机 / 任务数据对象（执行协同与过程追踪）
   ============================================================ */
Pages.register('task-center', function () {

  const states = DB.taskStates;                 // 7 个状态：pending|todo|doing|client|expert|done|exception
  const stById = (id) => states.find(s => s.id === id) || { id, name: id, color: 'gray', meaning: '', actions: [] };

  // ---------- 任务集合：DB.tasks 全量 + 适量补充 ----------
  const extraTasks = [
    { id: 'T009', title: '恒瑞医疗-省级技术中心申请报告撰写', ent: '恒瑞医疗器械', type: '撰写任务', state: 'pending', owner: '-', due: '2026-06-30', priority: '中', progress: 0, project: '省级技术中心' },
    { id: 'T010', title: '锐捷半导体-专精特新摸排访谈', ent: '锐捷半导体', type: '摸排任务', state: 'todo', owner: '赵雷（销售）', due: '2026-06-19', priority: '高', progress: 0, project: '-' },
    { id: 'T011', title: '智驰新能源-技术创新示范企业可研报告', ent: '智驰新能源', type: '撰写任务', state: 'doing', owner: '王磊（撰写）', due: '2026-07-02', priority: '中', progress: 42, project: '技术创新示范' },
    { id: 'T012', title: '青松生物-研发费用归集表客户确认', ent: '青松生物医药', type: '资料任务', state: 'client', owner: '张衡（顾问）', due: '2026-06-21', priority: '中', progress: 60, project: '研发费用诊断' },
    { id: 'T013', title: '云栖智能-专精特新申报书AI竞争力复评', ent: '云栖智能科技', type: '评审任务', state: 'expert', owner: '郑博士（专家）', due: '2026-06-22', priority: '高', progress: 88, project: '专精特新申报' },
    { id: 'T014', title: '绿源环保-高企培育入库材料归档', ent: '绿源环保装备', type: '撰写任务', state: 'done', owner: '陈思（撰写）', due: '2026-06-09', priority: '低', progress: 100, project: '高企培育入库' },
    { id: 'T015', title: '数联云-发明专利布局任务（客户长期未回应）', ent: '数联云软件', type: '诊断任务', state: 'exception', owner: '李明（销售）', due: '2026-06-08', priority: '中', progress: 15, project: '-', exceptionReason: '客户连续两周未回应资料需求，任务停滞，建议调整项目计划或暂停' },
  ];
  const tasks = DB.tasks.concat(extraTasks);

  const cnt = (id) => tasks.filter(t => t.state === id).length;
  const exceptions = tasks.filter(t => t.state === 'exception');

  const priorityBadge = (p) => C.badge(p, p === '高' ? 'red' : p === '中' ? 'amber' : 'gray');

  // ---------- 顶部 KPI ----------
  const kpis = [
    C.kpi({ label: '任务总数', value: tasks.length, unit: '项', icon: '🗂️', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', foot: `覆盖 ${new Set(tasks.map(t => t.ent)).size} 家企业` }),
    C.kpi({ label: '进行中', value: cnt('doing'), unit: '项', icon: '⚙️', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', foot: '正在撰写/复核/收集' }),
    C.kpi({ label: '待客户确认', value: cnt('client'), unit: '项', icon: '📨', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '需客户补充资料' }),
    C.kpi({ label: '待专家复核', value: cnt('expert'), unit: '项', icon: '👨‍🔬', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', foot: '等待专家背书' }),
    C.kpi({ label: '异常 / 逾期', value: cnt('exception'), unit: '项', icon: '🚨', iconBg: 'var(--red-50)', iconColor: 'var(--red)', trend: '需处理', trendDir: 'down', foot: '逾期/资料缺失/不配合' }),
  ];

  // ---------- 任务详情弹窗（按当前状态展示可执行动作）----------
  // 由全局函数承载，避免 onclick 内联过长
  window.TC_OPEN = function (tid) {
    const t = tasks.find(x => x.id === tid);
    if (!t) return;
    const s = stById(t.state);
    const actionBtns = s.actions.map(a =>
      C.btn(a, { size: 'sm', variant: ['升级负责人', '暂停交付', '标记风险'].includes(a) ? 'danger' : (['AI生成', '生成下一任务'].includes(a) ? 'ai' : ''), onclick: `App.act('已执行「${a}」：${C.esc(t.title)}');App.closeModal()` })
    ).join('');
    const body = `
      <div class="flex items-center gap-3 mb-3 flex-wrap">
        ${C.badge(s.name, s.color, true)} ${C.badge(t.type, 'cyan')} ${priorityBadge(t.priority)}
        ${t.project !== '-' ? C.badge('项目：' + t.project, 'gray') : ''}
      </div>
      ${C.kvGrid([
        ['任务编号', t.id],
        ['关联企业', t.ent],
        ['责任人', t.owner === '-' ? '<span style="color:var(--text-3)">待派发</span>' : t.owner],
        ['截止时间', t.due],
        ['当前进度', C.progress(t.progress, { color: t.state === 'exception' ? 'var(--red)' : t.progress >= 90 ? 'var(--teal)' : 'var(--primary)' }) + `<span class="cell-sub">${t.progress}%</span>`],
        ['状态含义', s.meaning],
        ['证据材料', '研发台账、专项审计、知识产权证明、客户确认函 ' + C.sourceRef('附件库可追溯')],
        ['验收结果', t.state === 'done' ? C.badge('验收通过并归档', 'teal') : '待验收'],
      ])}
      ${t.exceptionReason ? C.alert('<b>异常原因：</b>' + C.esc(t.exceptionReason), 'red', '🚨') : ''}
      <div class="mt-3 fw-7 text-sm">当前状态可执行动作</div>
      <div class="text-xs text-3" style="margin:2px 0 8px">动作来自任务状态机定义（${C.esc(s.name)}），执行后将驱动状态流转</div>
    `;
    App.openModal({ title: '📋 ' + t.title, size: 'wide', body, foot: actionBtns + C.btn('关闭', { onclick: 'App.closeModal()' }) });
  };

  // ---------- 状态机可视化（含主干 + 分支 + 异常）----------
  const mainFlow = ['pending', 'todo', 'doing'];
  const branchFlow = ['client', 'expert'];
  const flowViz = `
    <div class="flex flex-col gap-3" style="padding:6px 2px">
      <!-- 主干 -->
      <div class="flex items-center flex-wrap gap-2">
        ${mainFlow.map((id, i) => {
          const s = stById(id);
          return `<div class="state-node" style="cursor:pointer;border-color:var(--${s.color});color:var(--${s.color})" onclick="TC_OPEN('${(tasks.find(t => t.state === id) || {}).id || ''}')">${C.esc(s.name)}</div>${i < mainFlow.length - 1 ? '<span class="state-arrow">→</span>' : ''}`;
        }).join('')}
        <span class="state-arrow">→</span>
        <div class="flex flex-col gap-2" style="border-left:2px dashed var(--line);padding-left:12px">
          ${branchFlow.map(id => { const s = stById(id); return `<div class="state-node" style="cursor:default;border-color:var(--${s.color});color:var(--${s.color})">${C.esc(s.name)}</div>`; }).join('')}
        </div>
        <span class="state-arrow">→</span>
        <div class="state-node" style="cursor:default;border-color:var(--teal);color:var(--teal);font-weight:700">${C.esc(stById('done').name)}</div>
      </div>
      <!-- 异常旁路 -->
      <div class="flex items-center gap-2 flex-wrap" style="margin-top:4px">
        <span class="text-xs text-3">异常可从「待执行 / 进行中 / 待客户确认 / 待专家复核」任意节点触发 ⟶</span>
        <div class="state-node" style="cursor:pointer;border-color:var(--red);color:var(--red);background:var(--red-50)" onclick="document.getElementById('tc-exception').scrollIntoView({behavior:'smooth'})">🚨 ${C.esc(stById('exception').name)}</div>
      </div>
    </div>
    <div class="mt-2">${C.alert('任务状态机定义执行协同的统一语言：每个状态有明确含义与可执行动作，状态流转由系统/AI 自动建议、由责任人确认推进，全过程留痕可追溯。', 'info', '🔄')}</div>
  `;

  // ---------- 7 状态详表 ----------
  const stateTable = C.table({
    cols: [
      { label: '状态', width: '120px', render: r => C.badge(r.name, r.color, true) },
      { label: '含义', render: r => `<span class="text-sm">${C.esc(r.meaning)}</span>` },
      { label: '可执行动作', render: r => `<div class="flex gap-1 flex-wrap">${r.actions.map(a => `<span class="tag">${C.esc(a)}</span>`).join('')}</div>` },
    ],
    rows: states,
  });

  // ---------- 列表视图 ----------
  const listView = C.table({
    cols: [
      { label: '任务', render: r => `<div><div class="td-strong">${C.esc(r.title)}</div><div class="cell-sub">${C.esc(r.id)} · ${C.esc(r.type)}${r.project !== '-' ? ' · ' + C.esc(r.project) : ''}</div></div>` },
      { label: '企业', render: r => `<span class="text-sm">${C.esc(r.ent)}</span>` },
      { label: '责任人', render: r => r.owner === '-' ? '<span class="cell-sub">待派发</span>' : `<span class="text-sm">${C.esc(r.owner)}</span>` },
      { label: '截止', render: r => `<span class="cell-sub nowrap">${C.esc(r.due)}</span>` },
      { label: '优先级', width: '70px', render: r => priorityBadge(r.priority) },
      { label: '状态', width: '110px', render: r => { const s = stById(r.state); return C.badge(s.name, s.color, true); } },
      { label: '进度', render: r => `<div style="width:90px">${C.progress(r.progress, { color: r.state === 'exception' ? 'var(--red)' : r.progress >= 90 ? 'var(--teal)' : 'var(--primary)' })}<span class="cell-sub">${r.progress}%</span></div>` },
    ],
    rows: tasks,
    onRowClick: r => `TC_OPEN('${r.id}')`,
  });

  // ---------- 看板视图（按 7 状态分列，draggable）----------
  const kbCard = (t) => {
    const s = stById(t.state);
    return `<div class="kb-card" draggable="true" onclick="TC_OPEN('${t.id}')">
      <div class="kb-card-title">${C.esc(t.title)}</div>
      <div class="text-xs text-2" style="line-height:1.5">${C.esc(t.ent)} · ${C.esc(t.type)}</div>
      <div style="margin-top:6px">${C.progress(t.progress, { color: t.state === 'exception' ? 'var(--red)' : t.progress >= 90 ? 'var(--teal)' : 'var(--primary)' })}</div>
      <div class="kb-card-meta">
        <span>👤 ${C.esc(t.owner === '-' ? '待派发' : t.owner)}</span>
        <span style="color:var(--${t.priority === '高' ? 'red' : t.priority === '中' ? 'amber' : 'text-3'})">${C.esc(t.due)}</span>
      </div>
    </div>`;
  };
  const kanban = `<div class="kanban">${states.map(s => {
    const list = tasks.filter(t => t.state === s.id);
    return `<div class="kb-col" data-stage-name="${C.esc(s.name)}">
      <div class="kb-col-head">
        <span class="kb-col-title"><span class="kb-col-dot" style="background:var(--${s.color})"></span>${C.esc(s.name)}</span>
        <span class="kb-col-count">${list.length}</span>
      </div>
      <div class="kb-col-body">${list.length ? list.map(kbCard).join('') : `<div class="text-xs text-3" style="text-align:center;padding:14px 0">暂无任务</div>`}</div>
    </div>`;
  }).join('')}</div>`;

  // ---------- 异常任务专区 ----------
  const exceptionZone = exceptions.map(t => C.listItem({
    icon: '🚨', iconBg: 'var(--red-50)', iconColor: 'var(--red)',
    title: t.title,
    sub: `${C.esc(t.ent)} · 责任人 ${C.esc(t.owner)} · 截止 ${C.esc(t.due)}（已逾期）<div style="color:var(--red);margin-top:3px">${C.esc(t.exceptionReason || '')}</div>`,
    right: C.btn('升级负责人', { size: 'sm', variant: 'danger', onclick: `App.act('已升级「${C.esc(t.title)}」至项目负责人')` }) +
           C.btn('调整项目', { size: 'sm', onclick: `App.act('已发起项目计划调整')` }) +
           C.btn('暂停交付', { size: 'sm', variant: 'danger', onclick: `App.act('已暂停该任务交付并记录原因')` }),
  })).join('');
  return `
  ${C.pageHead({
    icon: '🗂️', title: '任务中心 · 状态机',
    desc: '任务是执行协同与过程追踪的最小单元，含类型、责任人、截止时间、状态、依赖、证据材料与验收结果。任务以「七状态机」统一推进：待派发 → 待执行 → 进行中 → 待客户确认 / 待专家复核 → 已完成，异常状态可从多处触发并升级处理。',
    crumbs: [{ label: '交付执行' }, { label: '任务中心' }],
    actions: C.btn('新建任务', { icon: '➕', onclick: 'App.act("新建任务（正式版进入任务编辑器）")' }) +
             C.btn('AI 任务编排', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid mb-3" style="grid-template-columns:repeat(5,1fr);gap:14px">${kpis.join('')}</div>

  ${C.card({ title: '🔄 任务状态机', sub: '7 状态流转 · 可点击节点查看任务', body: flowViz })}

  <div class="grid grid-12">
    <div class="col-span-12">
      ${C.card({ title: '📑 七状态详表', sub: '状态 · 含义 · 可执行动作', pad: false, body: stateTable })}
    </div>
  </div>

  <div id="tc-exception">
    ${C.card({
      title: '🚨 异常任务专区', sub: `${exceptions.length} 项需处理`, cls: 'card-danger',
      body: exceptions.length ? exceptionZone : C.empty('暂无异常任务', '✅'),
    })}
  </div>

  <div class="flex items-center justify-between mb-3 flex-wrap gap-2" style="margin-top:14px">
    <div class="pill-tabs">
      <span class="pill-tab active" onclick="App.switchPill(this);document.getElementById('tc-list').style.display='block';document.getElementById('tc-kanban').style.display='none'">列表视图</span>
      <span class="pill-tab" onclick="App.switchPill(this);document.getElementById('tc-list').style.display='none';document.getElementById('tc-kanban').style.display='block'">看板视图</span>
    </div>
    <span class="text-xs text-3">💡 看板可拖拽卡片在状态间移动，系统将记录流转并提示对应动作</span>
  </div>

  <div id="tc-list">
    ${C.card({ title: '📋 任务列表', sub: `共 ${tasks.length} 项任务`, pad: false, body: listView })}
  </div>
  <div id="tc-kanban" style="display:none">
    ${C.card({ title: '🗂️ 任务看板', sub: '按 7 状态分列 · 可拖拽', body: kanban })}
  </div>
  `;
});
