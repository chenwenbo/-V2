/* ============================================================
   页面：企业池与画像 (Enterprise Pool)
   对应规划书：4.1 全量企业画像 / 5.1 核心数据对象
   形成全量企业画像，AI输出摘要、成长阶段、缺口与切入点
   ============================================================ */
Pages.register('enterprise-pool', function () {

  const ents = DB.enterprises;

  // KPI 总览
  const cntHosting = ents.filter(e => e.status === '托管中').length;
  const cntOpp = ents.filter(e => e.status === '商机推进').length + 1; // 含历史商机
  const cntProspect = ents.filter(e => ['潜在标的', '待培育'].includes(e.status)).length;
  const kpis = [
    C.kpi({ label: '入池企业总数', value: '1,260', unit: '家', icon: '🏢', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '86家', trendDir: 'up', foot: '多源汇聚去重后' }),
    C.kpi({ label: '托管中', value: String(cntHosting), unit: '家', icon: '🛡️', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', foot: '持续服务客户', trend: '6%', trendDir: 'up' }),
    C.kpi({ label: '商机中', value: '128', unit: '个', icon: '💡', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', foot: '推进中商机', trend: '8.5%', trendDir: 'up' }),
    C.kpi({ label: '潜在标的', value: '342', unit: '家', icon: '⭐', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '待摸排/待培育' }),
  ];

  // 画像维度（全量企业画像维度）
  const profileDims = ['基础信息', '经营', '研发', '知识产权', '财务', '人员', '融资', '资质', '舆情', '产业链', '历史项目'];

  // 行业分布 donut
  const industryDist = (function () {
    const map = {};
    ents.forEach(e => { map[e.industry] = (map[e.industry] || 0) + 1; });
    const colors = ['#3b5bdb', '#0ca678', '#7048e8', '#1098ad', '#f08c00', '#e8590c', '#364fc7', '#12b886'];
    return Object.keys(map).map((k, i) => ({ label: k, value: map[k], color: colors[i % colors.length] }));
  })();

  // 成长阶段分布 barChart
  const stageDist = (function () {
    const map = {};
    ents.forEach(e => { map[e.stage] = (map[e.stage] || 0) + 1; });
    const order = ['初创期', '成长期', '成熟期', '扩张期'];
    return order.filter(s => map[s]).map(s => ({
      label: s, value: map[s], display: map[s] + ' 家',
      color: { '初创期': 'var(--cyan)', '成长期': 'var(--teal)', '成熟期': 'var(--primary)', '扩张期': 'var(--purple)' }[s],
    }));
  })();

  // 状态分组定义
  const statusGroups = ['全部', '托管中', '商机推进', '摸排中', '潜在标的', '待培育'];

  // 企业表格列定义（复用）
  const cols = [
    { label: '企业', render: r => `<div class="cell-main">${C.entLogo(r, 32)}<div><div class="td-strong">${C.esc(r.name)}</div><div class="cell-sub">${C.esc(r.code)}</div></div></div>` },
    { label: '区域 / 行业', render: r => `<div><div class="text-sm">${C.esc(r.region)}</div><div class="cell-sub">${C.esc(r.industry)} · ${C.esc(r.scale)}</div></div>` },
    { label: '成长阶段', render: r => C.badge(r.stage, DB.stageColors[r.stage] || 'gray') },
    { label: '综合评分', render: r => C.badge(String(r.score), r.score >= 85 ? 'teal' : r.score >= 70 ? 'primary' : 'amber', true) },
    { label: '状态', render: r => { const m = { '托管中': 'teal', '商机推进': 'purple', '摸排中': 'primary', '潜在标的': 'amber', '待培育': 'cyan' }; return C.badge(r.status, m[r.status] || 'gray'); } },
    { label: '负责人', render: r => `<span class="text-sm">${C.esc(r.owner)}</span>` },
    { label: '风险', render: r => C.badge(r.risk, r.risk === '低' ? 'teal' : r.risk === '中' ? 'amber' : r.risk === '未知' ? 'gray' : 'red', true) },
  ];

  const mkTable = (rows) => C.table({ cols, rows, onRowClick: r => `location.hash='enterprise-profile?id=${r.id}'` });

  // 各分组表格
  const groupTabs = statusGroups.map(g => ({
    label: g,
    count: g === '全部' ? ents.length : ents.filter(e => e.status === g).length,
    content: (function () {
      const rows = g === '全部' ? ents : ents.filter(e => e.status === g);
      return rows.length ? mkTable(rows) : C.empty(`暂无「${g}」状态企业`, '🏢');
    })(),
  }));

  // 导入企业 modal
  const importModal = `App.openModal({title:'📥 导入企业入池', body:'<div class=\\'mb-3 text-sm text-2\\'>选择导入方式，新企业将进入企业池并由画像 Agent 自动生成画像与评分。</div>'+C.kvGrid([['导入方式','<select class=\\'sel\\'><option>外部数据导入（工商/IP/招投标）</option><option>园区名单导入</option><option>客户转介绍</option><option>活动报名名单</option><option>手工录入单家企业</option></select>'],['去重规则','按统一社会信用代码自动去重'],['画像生成','导入后自动触发企业画像 Agent'],['指派负责人','<select class=\\'sel\\'><option>暂不指派</option><option>李明（销售）</option><option>赵雷（销售）</option></select>']]), foot: C.btn('取消',{onclick:'App.closeModal()'})+C.btn('确认导入',{variant:'primary',onclick:'App.closeModal();App.act(\\'已发起企业导入，画像生成中\\')'})})`;

  // 搜索（演示）
  const searchBox = `<input class="inp" placeholder="搜索企业名称 / 代码 / 行业（回车演示）" style="width:280px" onkeydown="if(event.key==='Enter')App.toast('演示环境：已检索 “'+this.value+'”','success')">`;

  return `
  ${C.pageHead({
    icon: '🏢', title: '企业池与画像',
    desc: '汇聚多源数据形成全量企业画像，覆盖基础信息、经营、研发、知识产权、财务、人员、融资、资质、舆情、产业链与历史项目。AI 输出企业画像摘要、成长阶段判断、关键缺口与服务切入点，由销售/顾问确认企业有效性并补充线下信息。',
    crumbs: [{ label: '获客增长' }, { label: '企业池与画像' }],
    actions: searchBox +
             C.btn('导入企业', { icon: '📥', onclick: importModal }) +
             C.btn('高潜推送', { variant: 'primary', icon: '🎯', onclick: "location.hash='prospect-push'" }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>


  <!-- 企业列表（按状态分组 Tab） -->
  ${C.card({
    title: '📇 企业列表', sub: `共 ${ents.length} 家 · 点击整行进入画像详情`,
    actions: C.btn('导入企业', { size: 'sm', icon: '📥', onclick: importModal }),
    pad: false,
    body: `<div style="padding:14px 16px 0">${C.tabs(groupTabs, 'entpool')}</div>`,
  })}
  `;
});
