/* ============================================================
   页面：企业动态检测 (Enterprise Dynamics)
   对应规划书：4.4 企业动态检测（触发式跟进 / 商机再激活）
   ============================================================ */
Pages.register('dynamics', function () {
  // 动态类型 → 配色/图标
  const typeMeta = {
    '融资':     { color: 'var(--teal)',    bg: 'var(--teal-50)',    icon: '💰' },
    '知识产权': { color: 'var(--primary)',  bg: 'var(--primary-50)', icon: '📜' },
    '招投标':   { color: 'var(--amber)',    bg: 'var(--amber-50)',   icon: '📑' },
    '工商变更': { color: 'var(--purple)',   bg: 'var(--purple-50)',  icon: '🏢' },
    '招聘':     { color: 'var(--cyan)',     bg: 'var(--cyan-50)',    icon: '🧑‍💻' },
    '资质公示': { color: '#364fc7',         bg: 'var(--primary-50)', icon: '🏅' },
    '新闻':     { color: '#e8590c',         bg: 'var(--amber-50)',   icon: '📰' },
  };

  // 8-12 条贴合企业池的动态事件
  const events = [
    { id: 'D01', type: '融资', entId: 'E002', event: '完成新一轮战略融资，引入产业资本约 2.5 亿元', time: '2小时前', value: '高',
      impact: '资本实力与研发投入将提升，强化省级技术中心、重大科技专项申报竞争力；融资信息可作为成长性论证材料。', action: '推荐省级企业技术中心认定', oppRoute: true },
    { id: 'D02', type: '知识产权', entId: 'E001', event: '新增 3 项发明专利授权（计算机视觉方向）', time: '5小时前', value: '高',
      impact: '知识产权数量与质量提升，专精特新「小巨人」发明专利≥5项指标更接近达标，高企知识产权评分项可更新。', action: '更新专精特新/高企材料', oppRoute: false },
    { id: 'D03', type: '招投标', entId: 'E004', event: '中标某市新能源公交三电系统政府采购项目（金额 8600 万）', time: '8小时前', value: '高',
      impact: '形成重大业绩证明，可用于专精特新、技术创新示范企业的市场地位与业绩材料，提升细分领域占有率论证。', action: '补充业绩证明材料', oppRoute: false },
    { id: 'D04', type: '工商变更', entId: 'E003', event: '注册资本由 1000 万增至 3000 万，新增对外投资', time: '1天前', value: '中',
      impact: '注册资本与经营规模变化，需同步更新企业画像；增资有利于高企认定中财务规范度与成长性评价。', action: '刷新企业画像', oppRoute: false },
    { id: 'D05', type: '招聘', entId: 'E005', event: '大规模招聘研发岗位 20+（算法 / 工业软件）', time: '1天前', value: '中',
      impact: '科技人员占比有望提升，利好高企「科技人员占比≥10%」指标；研发团队扩张是研发立项规范化切入点。', action: '推荐研发费用诊断', oppRoute: true },
    { id: 'D06', type: '资质公示', entId: 'E007', event: '入选省级「专精特新中小企业」拟认定公示名单', time: '1天前', value: '高',
      impact: '取得专精特新基础资质后，具备申报「小巨人」的梯度条件，可启动梯度培育托管。', action: '转化梯度培育商机', oppRoute: true },
    { id: 'D07', type: '新闻', entId: 'E006', event: '官网发布一款 1 类创新药进入 II 期临床的消息', time: '2天前', value: '高',
      impact: '研发管线进展是重大新药创制专项、省级工程中心的关键论证素材，显著提升项目匹配度。', action: '推荐重大专项组合', oppRoute: true },
    { id: 'D08', type: '知识产权', entId: 'E004', event: '新增软件著作权 6 项（智能驾驶域控制器）', time: '2天前', value: '中',
      impact: '软著数量提升，可用于高企复审知识产权归集与产品对应关系说明。', action: '更新知识产权台账', oppRoute: false },
    { id: 'D09', type: '招投标', entId: 'E008', event: '中标某工业园区废水处理装备改造项目', time: '3天前', value: '中',
      impact: '形成业绩支撑，利好科技型中小企业入库与高企培育的成长性论证。', action: '补充业绩证明', oppRoute: false },
    { id: 'D10', type: '工商变更', entId: 'E007', event: '完成法定代表人变更，新增半导体设备经营范围', time: '3天前', value: '低',
      impact: '经营范围扩展与高新技术领域一致，利好集成电路专项申报领域归属判断。', action: '刷新企业画像', oppRoute: false },
    { id: 'D11', type: '融资', entId: 'E003', event: '获得地方科创基金 Pre-A 轮投资意向', time: '4天前', value: '中',
      impact: '融资进展有利于研发投入持续性，配合高企认定研发费用占比指标论证。', action: '跟进高企申报', oppRoute: true },
    { id: 'D12', type: '资质公示', entId: 'E001', event: '出现在省级「创新型中小企业」复核公示名单', time: '5天前', value: '中',
      impact: '创新型中小企业资质是专精特新培育链路基础，复核通过可衔接小巨人申报。', action: '更新培育路径', oppRoute: false },
  ];

  // KPI
  const weekCount = events.length;
  const oppCount = events.filter(e => e.oppRoute).length;
  const highCount = events.filter(e => e.value === '高').length;
  const followCount = events.filter(e => e.value !== '低').length;

  const kpis = [
    C.kpi({ label: '本周动态事件', value: weekCount, unit: '条', icon: '📡', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', foot: '多源监控自动采集' }),
    C.kpi({ label: '触发商机', value: oppCount, unit: '个', icon: '💡', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', foot: '可一键转商机跟进' }),
    C.kpi({ label: '高价值动态', value: highCount, unit: '条', icon: '⭐', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', foot: '影响申报/融资/服务' }),
    C.kpi({ label: '待跟进', value: followCount, unit: '条', icon: '📌', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', foot: '已生成跟进理由' }),
  ];

  // 动态事件流（每条含 AI 研判 + 跟进动作）
  const eventStream = events.map(ev => {
    const ent = DB.getEnterprise(ev.entId);
    const m = typeMeta[ev.type];
    const valBadge = ev.value === '高' ? C.badge('高价值', 'teal', true) : ev.value === '中' ? C.badge('中价值', 'amber') : C.badge('低价值', 'gray');
    const followBtn = ev.oppRoute
      ? C.btn('转商机', { variant: 'primary', size: 'sm', onclick: "location.hash='opportunity'" })
      : C.btn('通知负责人', { size: 'sm', onclick: `App.act("已通知 ${ent ? (ent.owner !== '-' ? ent.owner : '负责顾问') : '负责人'}：${ev.action}")` });
    return `<div class="card mb-2" style="border-left:3px solid ${m.color}">
      <div class="card-body">
        <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="li-icon" style="width:30px;height:30px;background:${m.bg};color:${m.color}">${m.icon}</span>
            ${C.badge(ev.type, 'gray')}
            ${ent ? `<span class="td-strong">${C.esc(ent.name)}</span>` : ''}
            ${valBadge}
          </div>
          <span class="cell-sub nowrap">${C.esc(ev.time)}</span>
        </div>
        <div style="font-size:13.5px;line-height:1.6;margin-bottom:8px">${C.esc(ev.event)}</div>
      </div>
    </div>`;
  }).join('');

  // 监控源
  const sources = [
    { name: '工商信息', icon: '🏢', desc: '注册资本、股权、法人、经营范围变更' },
    { name: '融资动态', icon: '💰', desc: '融资轮次、金额、投资方、基金意向' },
    { name: '招聘信息', icon: '🧑‍💻', desc: '研发岗扩张、人员规模、科技人员占比' },
    { name: '知识产权', icon: '📜', desc: '发明专利、实用新型、软著授权与公示' },
    { name: '招投标', icon: '📑', desc: '中标公告、业绩合同、政府采购' },
    { name: '新闻舆情', icon: '📰', desc: '官网/媒体研发进展、产品发布、获奖' },
    { name: '资质公示', icon: '🏅', desc: '高企/专精特新/创新型中小企业公示名单' },
  ];

  return `
  ${C.pageHead({
    icon: '📡', title: '企业动态检测',
    desc: '对应规划书 4.4 企业动态检测：持续监控工商变更、融资、招聘、知识产权、招投标、新闻与资质公示等动态，研判其对申报、融资、服务机会的影响，为销售和顾问生成触发式跟进理由，并支撑搁置商机的再激活。',
    crumbs: [{ label: '政策项目' }, { label: '企业动态检测' }],
    actions: C.btn('监控源配置', { icon: '⚙️', onclick: 'App.act("已打开监控源配置")' }) +
             C.btn('AI 动态洞察', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  <!-- 动态类型筛选 -->
  <div class="flex items-center gap-2 mb-3 flex-wrap">
    <span class="text-sm text-2">按动态类型：</span>
    <div class="pill-tabs">
      <span class="pill-tab active" onclick="App.switchPill(this)">全部</span>
      ${Object.keys(typeMeta).map(t => `<span class="pill-tab" onclick="App.switchPill(this);App.act('已筛选：${t}动态')">${typeMeta[t].icon} ${t}</span>`).join('')}
    </div>
  </div>

  <div class="grid grid-12">
    <!-- 动态事件流 -->
    <div class="col-span-8">
      ${C.card({
        title: '🌊 动态事件流', sub: `本周 ${weekCount} 条 · 按时间倒序`,
        actions: C.btn('全部标记已读', { size: 'sm', onclick: 'App.act("已标记全部动态为已读")' }),
        body: eventStream,
      })}
    </div>

    <!-- 右栏：商机机会 + 监控源 -->
    <div class="col-span-4">
      ${C.card({
        title: '💡 触发商机机会', sub: `${oppCount} 条可转商机`,
        actions: C.btn('商机看板', { size: 'sm', onclick: "location.hash='opportunity'" }),
        body: events.filter(e => e.oppRoute).map(ev => {
          const ent = DB.getEnterprise(ev.entId);
          return C.listItem({
            icon: typeMeta[ev.type].icon, iconBg: typeMeta[ev.type].bg, iconColor: typeMeta[ev.type].color,
            title: ent ? ent.name : ev.type,
            sub: `${ev.action} ${C.sourceRef(ev.type + '动态')}`,
            right: C.btn('转商机', { size: 'sm', variant: 'primary', onclick: "location.hash='opportunity'" }),
          });
        }).join(''),
      })}

      ${C.card({
        title: '⚙️ 监控源配置', sub: '多源汇聚 · 自动采集',
        body: sources.map(s => C.listItem({
          icon: s.icon, iconBg: 'var(--bg-1)', iconColor: 'var(--ink)', title: s.name, sub: s.desc,
          right: C.badge('已接入', 'teal', true),
        })).join('') + `<div class="mt-2">${C.alert('动态先由 AI 研判影响并生成跟进理由，<b>关键结论需人工确认</b>后再转商机或通知客户，避免误判与过度触达。', 'info', '🛡️')}</div>`,
      })}
    </div>
  </div>
  `;
});
