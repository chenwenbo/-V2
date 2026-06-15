/* ============================================================
   页面：商机管理看板 (Opportunity)
   对应规划书：4.3 商机管理 — 阶段化推进 + AI 辅助促成
   销售/BD 视角：从线索到赢单的全流程看板，状态机驱动 AI 动作
   ============================================================ */
Pages.register('opportunity', function () {
  const stages = DB.oppStages;
  const opps = DB.opportunities;

  // 阶段 id -> stage 对象
  const stageById = (id) => stages.find(s => s.id === id);
  // 金额字符串("18万")转数值(万)
  const amtNum = (s) => { const m = String(s).match(/([\d.]+)/); return m ? parseFloat(m[1]) : 0; };

  // ---------- KPI ----------
  const total = opps.length;
  const poolAmount = opps.filter(o => !['lost'].includes(o.stage)).reduce((s, o) => s + amtNum(o.amount), 0);
  const wonThisMonth = opps.filter(o => o.stage === 'won').length;
  const activeOpps = opps.filter(o => !['won', 'lost'].includes(o.stage));
  const avgProb = activeOpps.length ? Math.round(activeOpps.reduce((s, o) => s + o.prob, 0) / activeOpps.length) : 0;

  const kpis = [
    C.kpi({ label: '商机总数', value: total, unit: '个', icon: '💡', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '6个', trendDir: 'up', foot: '本周新增线索 3 个' }),
    C.kpi({ label: '商机金额池', value: '¥' + poolAmount.toFixed(1), unit: '万', icon: '💰', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '12%', trendDir: 'up', foot: '不含输单/搁置' }),
    C.kpi({ label: '本月赢单', value: wonThisMonth, unit: '单', icon: '🏆', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '1单', trendDir: 'up', foot: '已转入托管交付' }),
    C.kpi({ label: '平均赢率', value: avgProb, unit: '%', icon: '📊', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', trend: '4.1%', trendDir: 'up', foot: '在途商机加权' }),
  ];

  // ---------- 看板卡片 ----------
  function oppCard(o) {
    const st = stageById(o.stage);
    const probColor = o.prob >= 70 ? 'var(--teal)' : o.prob >= 40 ? 'var(--amber)' : 'var(--text-3)';
    return `<div class="kb-card" draggable="true" onclick="location.hash='enterprise-profile?id=${o.entId}'">
      <div class="kb-card-title">${C.esc(o.ent)}</div>
      <div class="text-xs text-2" style="line-height:1.5">${C.esc(o.product)}</div>
      <div class="flex items-center justify-between" style="margin-top:8px">
        <span class="fw-7 text-sm" style="color:var(--ink)">${C.esc(o.amount)}</span>
        <span class="text-xs" style="color:${probColor};font-weight:700">赢率 ${o.prob}%</span>
      </div>
      <div style="margin-top:6px">${C.progress(o.prob, { color: probColor })}</div>
      <div class="kb-card-meta">
        <span>👤 ${C.esc(o.owner)}</span>
        <span style="color:${st.color}">${C.esc(o.source)}</span>
      </div>
    </div>`;
  }

  const kanban = `<div class="kanban">${stages.map(st => {
    const list = opps.filter(o => o.stage === st.id);
    return `<div class="kb-col" data-stage-name="${C.esc(st.name)}">
      <div class="kb-col-head">
        <span class="kb-col-title"><span class="kb-col-dot" style="background:${st.color}"></span>${C.esc(st.name)}</span>
        <span class="kb-col-count">${list.length}</span>
      </div>
      <div class="kb-col-body">${list.length ? list.map(oppCard).join('') : `<div class="text-xs text-3" style="text-align:center;padding:14px 0">暂无商机</div>`}</div>
    </div>`;
  }).join('')}</div>`;

  // ---------- 列表视图 ----------
  const listView = C.table({
    cols: [
      { label: '企业', render: r => { const e = DB.getEnterprise(r.entId); return `<div class="cell-main">${e ? C.entLogo(e, 30) : ''}<div><div class="td-strong">${C.esc(r.ent)}</div><div class="cell-sub">${C.esc(r.product)}</div></div></div>`; } },
      { label: '阶段', render: r => { const s = stageById(r.stage); const t = r.stage === 'won' ? 'teal' : r.stage === 'negotiate' ? 'amber' : r.stage === 'lost' ? 'gray' : 'primary'; return C.badge(s.name, t, true); } },
      { label: '金额', render: r => `<span class="td-strong">${C.esc(r.amount)}</span>` },
      { label: '赢率', render: r => `<div style="width:84px">${C.progress(r.prob, { color: r.prob >= 70 ? 'var(--teal)' : r.prob >= 40 ? 'var(--amber)' : 'var(--text-3)' })}<span class="cell-sub">${r.prob}%</span></div>` },
      { label: '负责人', key: 'owner' },
      { label: '来源', render: r => `<span class="cell-sub">${C.esc(r.source)}</span>` },
      { label: '下一步', render: r => `<span class="cell-sub">${C.esc(r.next)}</span>` },
      { label: '更新', render: r => `<span class="cell-sub nowrap">${C.esc(r.updated)}</span>` },
    ],
    rows: opps,
    onRowClick: r => `location.hash='enterprise-profile?id=${r.entId}'`,
  });

  // ---------- 阶段规则表（进入/动作/退出）----------
  const stageRules = C.table({
    cols: [
      { label: '阶段', width: '110px', render: r => `<span class="flex items-center gap-2"><span style="width:9px;height:9px;border-radius:50%;background:${r.color};display:inline-block"></span><span class="td-strong">${C.esc(r.name)}</span></span>` },
      { label: '进入条件', render: r => `<span class="text-sm">${C.esc(r.enter)}</span>` },
      { label: '系统 / AI 动作', render: r => `<span class="text-sm" style="color:var(--purple)">${C.esc(r.action)}</span>` },
      { label: '退出 / 升级条件', render: r => `<span class="text-sm">${C.esc(r.exit)}</span>` },
    ],
    rows: stages,
  });  const negOpp = opps.find(o => o.stage === 'negotiate') || opps[0];
  return `
  ${C.pageHead({
    icon: '💡', title: '商机管理看板',
    desc: '商机以状态机方式推进：线索 → 已摸排 → 方案中 → 谈判 → 赢单 / 输单搁置。每个阶段有明确的进入条件、系统动作与退出升级条件，AI 在对话中推荐服务产品、生成话术并提示风险。',
    crumbs: [{ label: '获客增长' }, { label: '商机管理' }],
    actions: C.btn('新建商机', { icon: '➕', onclick: 'App.openModal({title:"新建商机",size:"wide",body:C_OPP_FORM(),foot:C.btn("取消",{onclick:\'App.closeModal()\'})+C.btn("创建商机",{variant:\'primary\',onclick:\'App.closeModal();App.act(\\"商机已创建并进入线索阶段\\")\'})})' }) +
             C.btn('AI 促成洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
    <div class="pill-tabs">
      <span class="pill-tab active" onclick="App.switchPill(this);document.getElementById('opp-kanban').style.display='block';document.getElementById('opp-list').style.display='none'">看板视图</span>
      <span class="pill-tab" onclick="App.switchPill(this);document.getElementById('opp-kanban').style.display='none';document.getElementById('opp-list').style.display='block'">列表视图</span>
    </div>
    <span class="text-xs text-3">💡 拖拽卡片可在阶段间移动，系统将自动触发对应阶段的 AI 动作</span>
  </div>

  <div id="opp-kanban">
    ${C.card({ title: '🗂️ 商机推进看板', sub: '6 阶段状态机 · 可拖拽', pad: true, body: kanban })}
  </div>
  <div id="opp-list" style="display:none">
    ${C.card({ title: '📋 商机列表', sub: `共 ${total} 个商机`, pad: false, body: listView })}
  </div>

  `;
});

/* 新建商机表单（供 openModal 调用） */
function C_OPP_FORM() {
  const entOpts = DB.enterprises.map(e => `<option>${C.esc(e.name)}</option>`).join('');
  const skuOpts = DB.serviceProducts.map(s => `<option>${C.esc(s.name)}</option>`).join('');
  const stageOpts = DB.oppStages.map(s => `<option>${C.esc(s.name)}</option>`).join('');
  return `<div class="form-grid">
    <div class="form-row"><label>关联企业 <span class="req">*</span></label><select class="select">${entOpts}</select></div>
    <div class="form-row"><label>推荐服务产品</label><select class="select">${skuOpts}</select></div>
    <div class="form-row"><label>预估金额（万元）</label><input class="input" placeholder="如 18"></div>
    <div class="form-row"><label>初始阶段</label><select class="select">${stageOpts}</select></div>
    <div class="form-row"><label>负责人</label><input class="input" placeholder="如 李明"></div>
    <div class="form-row"><label>商机来源</label><input class="input" placeholder="如 潜客推送 / 园区名单"></div>
  </div>
  <div class="form-row"><label>下一步动作</label><input class="input" placeholder="如 2026-06-18 发送服务方案"><div class="hint">创建后系统将按所选阶段自动触发对应 AI 动作（话术 / 诊断 / 方案）</div></div>`;
}
