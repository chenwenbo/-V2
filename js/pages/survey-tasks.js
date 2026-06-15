/* ============================================================
   页面：摸排任务派发 (Survey Tasks)
   对应规划书：4.2 摸排任务派发与结构化摸排
   把"是否值得服务、适合什么项目、何时成交、缺口在哪"快速结构化
   ============================================================ */
Pages.register('survey-tasks', function () {

  // 摸排任务：DB 中 type=摸排任务 + 自行补充
  const fromDB = DB.tasks.filter(t => t.type === '摸排任务');
  const extra = [
    { id: 'S101', title: '锐捷半导体-高潜标的摸排', ent: '锐捷半导体科技', owner: '赵雷（销售）', due: '2026-06-18', state: 'doing', progress: 45 },
    { id: 'S102', title: '青松生物医药-摸排访谈', ent: '青松生物医药', owner: '赵雷（销售）', due: '2026-06-17', state: 'todo', progress: 0 },
    { id: 'S103', title: '航宇精密传感-初步摸排', ent: '航宇精密传感', owner: '李明（销售）', due: '2026-06-20', state: 'doing', progress: 60 },
    { id: 'S104', title: '量子跃迁信息-资质摸排', ent: '量子跃迁信息', owner: '张衡（顾问）', due: '2026-06-22', state: 'client', progress: 80 },
  ];
  // 统一为表格行结构
  const dbRows = fromDB.map(t => ({ id: t.id, title: t.title, ent: t.ent, owner: t.owner, due: t.due, state: t.state, progress: t.progress }));
  const tasks = dbRows.concat(extra);

  const stMap = { pending: ['待派发', 'gray'], todo: ['待执行', 'cyan'], doing: ['摸排中', 'primary'], client: ['待客户确认', 'amber'], done: ['已完成', 'teal'], exception: ['异常', 'red'] };

  // 生成摸排任务 modal
  const genModal = `App.openModal({title:'📝 生成摸排任务', body:'<div class=\\'mb-3 text-sm text-2\\'>选择企业与摸排项，系统根据企业画像生成结构化摸排任务并派发。</div>'+C.kvGrid([['目标企业','<select class=\\'sel\\'><option>锐捷半导体科技公司</option><option>青松生物医药有限公司</option><option>航宇精密传感技术公司</option><option>量子跃迁信息科技公司</option></select>'],['摸排项','<div>企业基本情况核验 / 研发信息 / 财务信息 / 知识产权 / 申报意向 / 预算能力 / 关键联系人</div>'],['负责人','<select class=\\'sel\\'><option>李明（销售）</option><option>赵雷（销售）</option><option>张衡（顾问）</option></select>'],['截止日期','<input class=\\'inp\\' type=\\'date\\' value=\\'2026-06-22\\'>']]), foot: C.btn('取消',{onclick:'App.closeModal()'})+C.btn('生成并派发',{variant:'primary',onclick:'App.closeModal();App.act(\\'已生成摸排任务并派发\\')'})})`;

  const kpis = [
    C.kpi({ label: '进行中摸排', value: String(tasks.filter(t => ['doing', 'todo', 'client'].includes(t.state)).length), unit: '个', icon: '📝', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', foot: '待执行/摸排中/待确认' }),
    C.kpi({ label: '本周完成', value: '14', unit: '个', icon: '✅', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '18%', trendDir: 'up', foot: '摸排完成率 72%' }),
    C.kpi({ label: '转商机', value: '7', unit: '个', icon: '💡', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', foot: 'A/B 级客户' }),
    C.kpi({ label: '待客户确认', value: String(tasks.filter(t => t.state === 'client').length), unit: '个', icon: '⏳', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '需补充资料' }),
  ];

  return `
  ${C.pageHead({
    icon: '📝', title: '摸排任务派发',
    desc: '摸排不是简单打电话，而是把"企业是否值得服务、适合什么项目、何时可成交、缺口在哪里"快速结构化。系统按企业画像生成摸排任务，销售/顾问执行后填写结构化摸排表，AI 自动生成客户分级、项目机会、风险提醒与下一步建议，结果可一键转商机/托管/待培育池。',
    crumbs: [{ label: '获客增长' }, { label: '摸排任务派发' }],
    actions: C.btn('生成摸排任务', { variant: 'primary', icon: '📝', onclick: genModal }) +
             C.btn('AI 摸排洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  <!-- 摸排任务列表 -->
  ${C.card({
    title: '📋 摸排任务列表', sub: `${tasks.length} 个任务`,
    actions: C.btn('生成摸排任务', { size: 'sm', icon: '📝', onclick: genModal }),
    pad: false,
    body: C.table({
      cols: [
        { label: '任务', render: r => `<span class="td-strong">${C.esc(r.title)}</span>` },
        { label: '企业', render: r => `<span class="text-sm">${C.esc(r.ent)}</span>` },
        { label: '负责人', render: r => `<span class="text-sm">${C.esc(r.owner)}</span>` },
        { label: '截止', render: r => `<span class="cell-sub">${C.esc(r.due)}</span>` },
        { label: '状态', render: r => { const s = stMap[r.state] || ['未知', 'gray']; return C.badge(s[0], s[1], true); } },
        { label: '进度', render: r => `<div style="width:96px">${C.progress(r.progress, { color: r.progress >= 80 ? 'var(--teal)' : r.progress > 0 ? 'var(--primary)' : 'var(--gray)' })}<span class="cell-sub">${r.progress}%</span></div>` },
        { label: '', render: r => C.btn('填写摸排表', { size: 'sm', onclick: "App.act('已打开结构化摸排表')" }) },
      ],
      rows: tasks,
    }),
  })}

  <div class="grid grid-12">
  </div>
  `;
});
