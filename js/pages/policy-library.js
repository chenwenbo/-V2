/* ============================================================
   页面：政策项目库 (Policy Library)
   对应规划书：第3章 规则知识层 / 第4章 / 5.1 政策项目数据对象
   ============================================================ */
Pages.register('policy-library', function () {
  const policies = DB.policies;
  const levelType = lv => lv === '国家级' ? 'primary' : 'purple';
  const dueBadge = d => d <= 25 ? 'red' : d <= 35 ? 'amber' : d <= 90 ? 'cyan' : 'teal';
  const matchType = m => m >= 60 ? 'teal' : m >= 30 ? 'amber' : 'red';

  const nationCount = policies.filter(p => p.level === '国家级').length;
  const provCount = policies.filter(p => p.level === '省级').length;
  const inProgress = policies.filter(p => p.status === '申报中').length;
  const yearRound = policies.filter(p => p.status === '常年受理').length;

  const kpis = [
    C.kpi({ label: '政策项目总数', value: policies.length, unit: '项', icon: '📚', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', foot: '结构化入库 · 可追溯引用' }),
    C.kpi({ label: '国家级 / 省级', value: `${nationCount}/${provCount}`, unit: '项', icon: '🏛️', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', foot: '覆盖梯度培育主链路' }),
    C.kpi({ label: '申报中', value: inProgress, unit: '项', icon: '📋', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '窗口开放，可启动' }),
    C.kpi({ label: '常年受理', value: yearRound, unit: '项', icon: '🔄', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', foot: '随时备料、择机申报' }),
  ];

  // 政策卡片网格
  const policyCard = p => `<div class="card" style="cursor:pointer" onclick="App.switchTab('pollib', ${policies.indexOf(p) < 2 ? policies.indexOf(p) : 0})${policies.indexOf(p) < 2 ? '' : ";App.act('该政策详情结构同高企/专精特新，演示版展开前两项')"}">
    <div class="card-body">
      <div class="flex items-center justify-between mb-2">
        ${C.badge(p.level, levelType(p.level))}
        ${C.badge('剩余 ' + p.daysLeft + ' 天', dueBadge(p.daysLeft))}
      </div>
      <div class="td-strong" style="font-size:14.5px;margin-bottom:6px">${C.esc(p.name)}</div>
      <div class="cell-sub" style="margin-bottom:8px">${C.esc(p.dept)} · 截止 ${C.esc(p.deadline)}</div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-2">支持方式</span>
        <span class="text-xs fw-6 text-r" style="max-width:62%">${C.esc(p.support)}</span>
      </div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-2">匹配企业（≥30分）</span>
        ${C.badge(p.match + ' 匹配度', matchType(p.match))}
      </div>
      ${C.tagList(p.tags, { primary: true })}
    </div>
  </div>`;

  // 政策完整结构详情（申报条件 / 评分规则 / 材料要求 / 支持方式）
  const detail = p => {
    const ents = (p.id === 'P001' ? ['E003', 'E005', 'E008'] : p.id === 'P002' ? ['E001', 'E004'] : [])
      .map(id => DB.getEnterprise(id)).filter(Boolean);
    return `
    ${C.card({ title: `📑 ${p.name} · 政策概览`, sub: p.level, body: C.kvGrid([
      ['政策名称', `<b>${C.esc(p.name)}</b>`], ['政策层级', C.badge(p.level, levelType(p.level))],
      ['主管部门', C.esc(p.dept)], ['申报状态', C.badge(p.status, p.status === '申报中' ? 'amber' : 'teal')],
      ['申报截止', `<b style="color:var(--${dueBadge(p.daysLeft)})">${C.esc(p.deadline)}（剩余 ${p.daysLeft} 天）</b>`],
      ['支持方式', C.esc(p.support)], ['标签', C.tagList(p.tags, { primary: true })],
      ['可追溯版本', `规则版本 v2026.06 ${C.sourceRef('政策原文 + 申报指南')}`],
    ]) })}

    <div class="grid grid-2">
      ${C.card({ title: '✅ 申报条件', sub: '逐项核验依据', body:
        p.conditions.map((c, i) => C.listItem({
          icon: (i + 1), iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', title: c,
          sub: 'AI 比对企业画像后给出「满足 / 缺口」结论，结论附政策条款引用',
          right: C.badge('需核验', 'gray'),
        })).join('') })}

      ${C.card({ title: '📋 材料要求', sub: '清单驱动缺口任务', body:
        p.materials.map((m, i) => C.listItem({
          icon: '📄', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', title: m,
          sub: '可由材料撰写 Agent 生成初稿，撰写人员与专家复核',
          right: C.btn('生成任务', { size: 'sm', onclick: 'App.act("已生成材料缺口任务")' }),
        })).join('') })}
    </div>

    ${C.card({ title: '📐 评分规则', sub: '可追溯到评分项', body:
      `<div class="mb-2" style="font-size:13.5px;line-height:1.7">${C.esc(p.scoreRules)}</div>` +
      C.alert('AI 政策匹配引擎依据评分规则输出<b>匹配分与缺口项</b>，每一条结论标注对应评分项与政策条款，<b>不得直接承诺申报成功</b>。', 'purple', '⚖️') })}

    ${ents.length ? C.card({ title: '🎯 当前适配企业', sub: '政策项目 Agent 匹配', pad: false, body: C.table({
      cols: [
        { label: '企业', render: r => `<div class="cell-main">${C.entLogo(r, 30)}<div><div class="td-strong">${C.esc(r.name)}</div><div class="cell-sub">${C.esc(r.region)} · ${C.esc(r.industry)}</div></div></div>` },
        { label: '匹配判断', render: r => C.badge(r.gaps.length ? '存在缺口' : '基本满足', r.gaps.length ? 'amber' : 'teal') },
        { label: '主要缺口', render: r => `<span class="cell-sub">${C.esc(r.gaps[0] || '无显著缺口')}</span>` },
        { label: '', render: r => C.btn('查看画像', { size: 'sm', onclick: `location.hash='enterprise-profile?id=${r.id}'` }) },
      ], rows: ents,
    }) }) : ''}
    `;
  };

  return `
  ${C.pageHead({
    icon: '📚', title: '政策项目库',
    desc: '对应规划书第3章规则知识层：将政策层级、申报条件、截止时间、支持方式、材料要求、评分规则结构化入库，让 AI 的每一条匹配与建议都有依据、有引用、可追溯，避免编造与过度承诺。',
    crumbs: [{ label: '政策项目' }, { label: '政策项目库' }],
    actions: C.btn('导入政策', { icon: '📥', onclick: 'App.act("已打开政策导入流程")' }) +
             C.btn('AI 政策匹配', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  <!-- 层级筛选 -->
  <div class="flex items-center gap-2 mb-3 flex-wrap">
    <span class="text-sm text-2">按层级：</span>
    <div class="pill-tabs">
      <span class="pill-tab active" onclick="App.switchPill(this)">全部</span>
      <span class="pill-tab" onclick="App.switchPill(this);App.act('已筛选：国家级政策')">国家级</span>
      <span class="pill-tab" onclick="App.switchPill(this);App.act('已筛选：省级政策')">省级</span>
      <span class="pill-tab" onclick="App.switchPill(this);App.act('已筛选：申报中')">申报中</span>
      <span class="pill-tab" onclick="App.switchPill(this);App.act('已筛选：常年受理')">常年受理</span>
    </div>
  </div>

  ${C.card({
    title: '🗂️ 政策项目卡片', sub: `共 ${policies.length} 项 · 点击卡片查看完整结构`,
    body: `<div class="grid grid-3">${policies.map(policyCard).join('')}</div>`,
  })}

  <!-- AI 政策匹配引擎说明 -->

  <!-- 政策详情：高企认定 + 专精特新小巨人 完整展开 -->
  ${C.card({
    title: '🔬 政策完整结构 · 详情', sub: '申报条件 / 评分规则 / 材料要求 / 支持方式',
    body: C.tabs([
      { label: policies[0].name, content: detail(policies[0]) },
      { label: policies[1].name, content: detail(policies[1]) },
    ], 'pollib'),
  })}
  `;
});
