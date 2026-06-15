/* ============================================================
   页面：企业画像详情 (Enterprise Profile)  — 隐藏页，经跳转进入
   对应规划书：4.1 全量企业画像 / 5.1 数据对象 / 5 画像生成AI能力
   ============================================================ */
Pages.register('enterprise-profile', function (params) {
  const ent = DB.getEnterprise(params.id) || DB.enterprises[0];
  const sc = DB.stageColors[ent.stage] || 'gray';

  // 画像维度雷达数据（用条形近似）
  const dims = [
    { label: '科技属性', value: 90 }, { label: '成长性', value: 82 }, { label: '资质成熟度', value: 68 },
    { label: '研发能力', value: 85 }, { label: '知识产权', value: 76 }, { label: '财务规范度', value: 64 },
  ];

  // 画像 Tab 内容
  const tabBasic = `
    <div class="grid grid-2">
      ${C.card({ title: '🏢 工商与基本信息', body: C.kvGrid([
        ['企业名称', ent.name], ['统一社会信用代码', ent.code], ['所在区域', ent.region],
        ['所属行业', ent.industry], ['企业规模', ent.scale], ['成长阶段', C.badge(ent.stage, sc)],
        ['经营状态', C.badge(ent.status, 'teal')], ['核心联系人', `${ent.contact} · ${ent.contactRole}`], ['联系电话', ent.phone],
      ]) })}
      ${C.card({ title: '💼 经营与财务', body: C.kvGrid([
        ['营业收入', ent.revenue], ['研发投入', ent.rd], ['研发占比', '约 ' + (ent.id === 'E001' ? '14.4%' : '11.2%')],
        ['融资阶段', ent.funding], ['发明/专利', ent.patents + ' 件'], ['软件著作权', ent.softCopyrights + ' 件'],
        ['科技人员占比', '约 32%'], ['高新收入占比', '约 65%'],
      ]) })}
    </div>
    ${C.card({ title: '🏷️ 企业标签', body: C.tagList(ent.tags, { primary: true }) + `<div class="mt-2 text-xs text-3">标签由企业画像 Agent 自动生成，顾问可确认或修正 ${C.sourceRef('工商+研发+知识产权数据')}</div>` })}
  `;

  const tabProfile = `
    <div class="grid grid-12">
      <div class="col-span-5">${C.card({ title: '🎯 综合画像评分', body:
        `<div class="flex items-center gap-4">${C.scoreRing(ent.score, { size: 110 })}
          <div class="flex-1"><div class="mb-2"><span class="text-2 text-sm">高潜等级</span> ${C.badge(ent.potential + '潜力', ent.potential === '高' ? 'teal' : 'amber', true)}</div>
          <div class="text-sm text-2">综合科技属性、成长性、资质成熟度、政策机会与服务可切入点计算</div></div>
        </div>` })}</div>
      <div class="col-span-7">${C.card({ title: '📐 画像维度', body: C.barChart(dims.map(d => ({ ...d, display: d.value }))) })}</div>
    </div>
    ${C.card({ title: '⚠️ 待核验问题', body:
      (ent.gaps.length ? ent.gaps : ['暂无待核验问题']).map(g => C.listItem({ icon: '❓', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', title: g, sub: '需顾问/客户确认 · AI标记为「需客户确认内容」', right: C.btn('指派核验', { size: 'sm', onclick: 'App.act("已指派核验任务")' }) })).join('') })}
  `;

  const tabOpp = `
    ${C.card({ title: '🎁 政策与服务机会', sub: '政策项目 Agent 匹配', pad: false, body: C.table({
      cols: [
        { label: '机会', render: r => `<span class="td-strong">${r.name}</span>` },
        { label: '匹配分', render: r => C.badge(r.match + '分', r.match >= 60 ? 'teal' : r.match >= 30 ? 'amber' : 'red') },
        { label: '推荐服务', render: r => r.sku },
        { label: '窗口', render: r => `<span class="cell-sub">${r.window}</span>` },
        { label: '', render: r => C.btn('查看', { size: 'sm', onclick: "location.hash='policy-library'" }) },
      ],
      rows: [
        { name: '高新技术企业认定', match: 46, sku: '高企申报', window: '2026-08-15' },
        { name: '专精特新中小企业', match: 54, sku: '专精特新培育', window: '2026-10-15' },
        { name: '研发费用加计扣除', match: 88, sku: '研发费用诊断', window: '常年' },
      ],
    }) })}
  `;

  const tabHistory = `
    ${C.card({ title: '🕐 服务与跟进历史', body: C.timeline([
      { time: '2026-06-12 14:30', title: '完成企业画像生成', desc: '企业画像 Agent 输出综合评分 ' + ent.score + ' 分', status: 'done' },
      { time: '2026-06-10 10:15', title: '顾问确认企业有效性', desc: ent.consultant !== '-' ? ent.consultant + ' 确认关键事实并补充线下信息' : '待顾问确认', status: 'done' },
      { time: '2026-06-08 16:40', title: '生成首轮触达话术', desc: '销售助手 Agent 生成电话+微信触达话术', status: 'done' },
      { time: '2026-06-05 09:00', title: '纳入高潜标的推送', desc: '按区域、行业、项目窗口、成交概率推送给 ' + ent.owner },
    ]) })}
  `;

  return `
  ${C.pageHead({
    title: ent.name, icon: C.entLogo(ent, 38).replace('ent-logo', 'ent-logo').match(/>([^<]+)</) ? ent.logo : '🏢',
    crumbs: [{ label: '获客增长' }, { label: '企业池与画像', route: 'enterprise-pool' }, { label: ent.name }],
    desc: `${ent.region} · ${ent.industry} · ${ent.scale} · ${ent.techAttr}`,
    actions: C.btn('生成摸排任务', { icon: '📝', onclick: "location.hash='survey-tasks'" }) +
             C.btn('转化为商机', { icon: '💡', onclick: "location.hash='opportunity'" }) +
             C.btn('纳入托管', { variant: 'primary', icon: '🛡️', onclick: 'App.act("已发起纳入托管流程")' }),
  })}

  <div class="flex gap-3 mb-3 flex-wrap">
    ${C.badge('综合评分 ' + ent.score, 'primary', true)}
    ${C.badge(ent.potential + '潜力', ent.potential === '高' ? 'teal' : 'amber', true)}
    ${C.badge(ent.status, 'cyan', true)}
    ${C.badge('风险 ' + ent.risk, ent.risk === '低' ? 'teal' : 'amber', true)}
    ${ent.owner !== '-' ? C.badge('负责人 ' + ent.owner, 'gray') : ''}
  </div>

  ${C.tabs([
    { label: '画像总览', content: tabProfile },
    { label: '基本信息', content: tabBasic },
    { label: '政策与机会', count: 3, content: tabOpp },
    { label: '服务历史', content: tabHistory },
  ], 'entprofile')}
  `;
});
