/* ============================================================
   页面：高潜标的推送 (Prospect Push)
   对应规划书：4.1 服务机构前端增长入口 / 高潜标的智能推送
   销售/BD 视角：系统主动找到高潜企业并推送，派发进入摸排
   ============================================================ */
Pages.register('prospect-push', function () {

  // 数据来源（企业池形成来源）
  const sources = [
    { icon: '🏛️', name: '工商数据', desc: '注册、股权、经营状态' },
    { icon: '📜', name: '知识产权', desc: '专利、软著、商标' },
    { icon: '💵', name: '融资信息', desc: '轮次、金额、投资方' },
    { icon: '👔', name: '招聘数据', desc: '研发岗位、扩张信号' },
    { icon: '📑', name: '招投标', desc: '中标、采购、项目' },
    { icon: '🌐', name: '官网/新闻', desc: '产品、动态、舆情' },
    { icon: '📋', name: '政策名单', desc: '入库、认定、获奖' },
    { icon: '🏭', name: '园区名单', desc: '在孵、在园企业' },
    { icon: '🗂️', name: '机构自有名单', desc: '历史客户、活动报名' },
  ];

  // 排序维度（推送排序依据）
  const sortDims = ['科技属性', '成长性', '资质成熟度', '政策机会', '服务可切入点', '风险标签'];

  // 高潜标的：取潜在标的/待培育/摸排中企业 + 自行补充
  const fromDB = DB.enterprises
    .filter(e => ['潜在标的', '待培育', '摸排中'].includes(e.status))
    .map(e => ({
      id: e.id, ent: e, region: e.region, industry: e.industry, score: e.score,
      reason: e.opportunities && e.opportunities.length ? `${e.techAttr}；可切入${e.opportunities[0]}` : e.techAttr,
      sku: (e.opportunities && e.opportunities[0]) || '企业成长诊断',
      prob: e.score >= 85 ? 58 : e.score >= 80 ? 46 : 32,
      window: e.id === 'E007' ? '2026-07' : e.id === 'E006' ? '2026-09' : '常年',
    }));

  const extra = [
    { id: 'E011', ent: { logo: '航', color: '#3b5bdb', name: '航宇精密传感技术公司' }, region: '陕西·西安', industry: '智能传感', score: 83,
      reason: '近6个月新增发明专利5项 + 招聘研发岗12人，研发扩张信号强', sku: '专精特新培育', prob: 49, window: '2026-08' },
    { id: 'E012', ent: { logo: '碳', color: '#0ca678', name: '碳寻新能源材料公司' }, region: '江苏·常州', industry: '新能源', score: 80,
      reason: '完成 Pre-A 轮融资 + 中标省级示范项目，政策关注度上升', sku: '高新技术企业认定', prob: 43, window: '2026-08' },
    { id: 'E013', ent: { logo: '量', color: '#7048e8', name: '量子跃迁信息科技公司' }, region: '安徽·合肥', industry: '量子信息', score: 86,
      reason: '官网披露核心技术突破 + 入选园区重点培育名单，卡脖子赛道', sku: '专精特新小巨人', prob: 52, window: '2026-07' },
  ];
  const prospects = fromDB.concat(extra);

  const kpis = [
    C.kpi({ label: '今日推送数', value: '18', unit: '家', icon: '🎯', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '20%', trendDir: 'up', foot: '按机构服务范围筛选' }),
    C.kpi({ label: '高潜标的数', value: String(prospects.length), unit: '家', icon: '⭐', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '6家', trendDir: 'up', foot: '综合评分≥78' }),
    C.kpi({ label: '待派发', value: '5', unit: '家', icon: '📨', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '等待分配销售/顾问' }),
    C.kpi({ label: '本周转化商机', value: '7', unit: '个', icon: '💡', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '16%', trendDir: 'up', foot: '推送→摸排→商机' }),
  ];

  // 批量派发 modal
  const dispatchModal = `App.openModal({title:'📨 批量派发高潜标的', body:'<div class=\\'mb-3\\'>将已选高潜标的派发给销售/顾问，进入摸排任务池。</div>'+C.kvGrid([['派发标的','已选 6 家高潜企业'],['负责人','<select class=\\'sel\\'><option>李明（销售）</option><option>赵雷（销售）</option><option>张衡（顾问）</option><option>按区域自动分配</option></select>'],['首次触达提醒','<select class=\\'sel\\'><option>派发后24小时</option><option>派发后48小时</option><option>本周内</option></select>'],['摸排截止','<input class=\\'inp\\' type=\\'date\\' value=\\'2026-06-25\\'>'],['推送规则','按机构服务范围+区域+行业+项目窗口+成交概率']]), foot: C.btn('取消',{onclick:'App.closeModal()'})+C.btn('确认派发',{variant:'primary',onclick:'App.closeModal();App.act(\\'已批量派发6家高潜标的至摸排任务池\\')'})})`;

  return `
  ${C.pageHead({
    icon: '🎯', title: '高潜标的推送',
    desc: '服务机构的前端增长入口。系统从工商、知识产权、融资、招聘、招投标、官网新闻、政策与园区名单等来源形成企业池，按科技属性、成长性、资质成熟度、政策机会、服务可切入点与风险标签排序，主动推送高潜标的并派发给销售/顾问进入摸排。',
    crumbs: [{ label: '获客增长' }, { label: '高潜标的推送' }],
    actions: C.btn('批量派发', { icon: '📨', onclick: dispatchModal }) +
             C.btn('AI 推送洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  <!-- 筛选器 -->
  ${C.card({
    title: '🔎 推送筛选',
    body: `<div class="flex gap-3 flex-wrap items-center">
      <div><div class="text-xs text-3 mb-1">区域</div><select class="sel" onchange="App.act('已按区域筛选高潜标的')"><option>全部区域</option><option>浙江·杭州</option><option>广东·深圳/广州</option><option>江苏</option><option>安徽·合肥</option><option>陕西·西安</option></select></div>
      <div><div class="text-xs text-3 mb-1">行业</div><select class="sel" onchange="App.act('已按行业筛选高潜标的')"><option>全部行业</option><option>集成电路</option><option>人工智能</option><option>新能源/新材料</option><option>生物医药</option><option>量子信息</option></select></div>
      <div><div class="text-xs text-3 mb-1">综合评分</div><select class="sel" onchange="App.act('已按评分筛选高潜标的')"><option>全部</option><option>≥85（极高潜）</option><option>80-85（高潜）</option><option>78-80（潜在）</option></select></div>
      <div><div class="text-xs text-3 mb-1">项目窗口</div><select class="sel" onchange="App.act('已按项目窗口筛选高潜标的')"><option>全部窗口</option><option>2026-07（临近）</option><option>2026-08</option><option>2026-09</option><option>常年受理</option></select></div>
      <div style="align-self:flex-end">${C.btn('重置', { onclick: "App.act('已重置筛选条件')" })}</div>
    </div>`,
  })}

  <div class="grid grid-12">
    <!-- 高潜标的列表 -->
    <div class="col-span-12">
      ${C.card({
        title: '⭐ 高潜标的推送列表', sub: `${prospects.length} 家 · 点击查看画像`,
        actions: C.btn('批量派发', { size: 'sm', icon: '📨', onclick: dispatchModal }),
        pad: false,
        body: C.table({
          cols: [
            { label: '企业', render: r => `<div class="cell-main">${C.entLogo(r.ent, 32)}<div><div class="td-strong">${C.esc(r.ent.name)}</div><div class="cell-sub">${C.esc(r.id)}</div></div></div>` },
            { label: '区域 / 行业', render: r => `<div><div class="text-sm">${C.esc(r.region)}</div><div class="cell-sub">${C.esc(r.industry)}</div></div>` },
            { label: '综合评分', render: r => C.badge(String(r.score), r.score >= 85 ? 'teal' : r.score >= 80 ? 'primary' : 'amber', true) },
            { label: '高潜原因', render: r => `<span class="text-sm" style="line-height:1.5">${C.esc(r.reason)}</span>`, width: '30%' },
            { label: '推荐服务', render: r => C.badge(r.sku, 'purple') },
            { label: '成交概率', render: r => `<div style="width:84px">${C.progress(r.prob, { color: r.prob >= 50 ? 'var(--teal)' : 'var(--amber)' })}<span class="cell-sub">${r.prob}%</span></div>` },
            { label: '', render: r => C.btn('派发', { size: 'sm', variant: 'primary', onclick: "event.stopPropagation();location.hash='survey-tasks'" }) },
          ],
          rows: prospects,
          onRowClick: r => `location.hash='enterprise-profile?id=${r.id}'`,
        }),
      })}
    </div>
  </div>

  `;
});
