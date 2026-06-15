/* ============================================================
   页面：服务产品货架 (Service Products)
   对应规划书：4.8 服务产品化 / 5.1 服务产品数据对象 / 第7章 商业化
   把每项服务产品化为可售卖、可派单、可验收、可结算的 SKU
   ============================================================ */
Pages.register('service-products', function () {
  const skus = DB.serviceProducts;

  // 品类配色
  const catColor = { '托管类': 'primary', '申报类': 'teal', '诊断类': 'cyan', '专家类': 'amber', '工具类': 'purple' };
  const catIcon = { '托管类': '🛡️', '申报类': '📋', '诊断类': '🩺', '专家类': '👨‍🔬', '工具类': '🧰' };

  const cats = ['托管类', '申报类', '诊断类', '专家类', '工具类'];

  const acceptance = {
    '托管类': '托管期内政策提醒及时率 ≥ 95%、季度诊断报告按时交付、年度托管计划经客户确认',
    '申报类': '材料通过 AI 评审 + 专家复核、按时申报受理、申报结果以政府评审为准（不作刚性承诺）',
    '诊断类': '诊断报告交付并经顾问解读、输出明确机会清单与资质路径、客户签收确认',
    '专家类': '专家成果交付物（论证意见 / 精修稿）经客户签收、关键结论由专家署名背书',
    '工具类': '账号开通、功能可用率 ≥ 99.5%、订阅期内政策与项目数据按 SLA 更新',
  };
  const settleRule = {
    '托管类': '平台收年费，顾问/撰写按交付任务计提，增值项目单独结算',
    '申报类': '固定服务费按节点结算 + 成功奖励赢单后结算，撰写与专家按贡献分成',
    '诊断类': '单次结算，作为获客产品时可抵扣后续项目费',
    '专家类': '专家服务费 55% 归专家、平台抽成；外部专家走渠道分成',
    '工具类': 'SaaS 订阅按席位/调用量计费，平台毛利最高，渠道伙伴可参与分销分成',
  };
  // 把每个 sku 序列化成 modal 调用
  function skuModalCall(k) {
    const rolesTxt = k.roles.length ? k.roles.join(' / ') : '无（SaaS 自助）';
    const bodyParts = [
      `C.kvGrid([` +
        `['SKU 编号','${k.id}'],` +
        `['服务品类','${k.cat}'],` +
        `['价格','${C.esc(k.price)}'],` +
        `['交付方式','${C.esc(k.delivery)}'],` +
        `['结算方式','${C.esc(k.settle)}'],` +
        `['所需角色','${C.esc(rolesTxt)}'],` +
        `['交付工期','${C.esc(k.duration)}'],` +
        `['累计销量','${k.sales} 单'],` +
        `['毛利率','${C.esc(k.margin)}']` +
      `])`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>📦 产品描述</div><div class=\\'text-sm text-2\\' style=\\'line-height:1.7\\'>${C.esc(k.desc)}</div>'`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>✅ 验收标准</div><div class=\\'text-sm text-2\\' style=\\'line-height:1.7\\'>${C.esc(acceptance[k.cat])}</div>'`,
      `'<div class=\\'mt-3 mb-1 fw-6 text-ink text-sm\\'>🤝 分成规则</div><div class=\\'text-sm text-2\\' style=\\'line-height:1.7\\'>${C.esc(settleRule[k.cat])}</div>'`,
    ].join('+');
    const foot = `C.btn('关闭',{onclick:'App.closeModal()'})`;
    return `App.openModal({title:'${catIcon[k.cat]} ${C.esc(k.name)}',size:'wide',body:${bodyParts},foot:${foot}})`;
  }

  // ---------- SKU 货架卡片 ----------
  function skuCard(k) {
    const rolesTags = k.roles.length
      ? k.roles.map(r => `<span class="tag tag-primary">${C.esc(r)}</span>`).join('')
      : `<span class="tag">SaaS 自助</span>`;
    return `<div class="card sku-card" data-cat="${C.esc(k.cat)}" style="display:flex;flex-direction:column">
      <div class="card-body" style="flex:1;display:flex;flex-direction:column;gap:8px">
        <div class="flex items-center justify-between">
          ${C.badge(catIcon[k.cat] + ' ' + k.cat, catColor[k.cat])}
          <span class="text-xs text-3">${C.esc(k.id)}</span>
        </div>
        <div class="td-strong" style="font-size:15px;line-height:1.4">${C.esc(k.name)}</div>
        <div class="text-xs text-2" style="line-height:1.6;min-height:34px">${C.esc(k.desc)}</div>
        <div class="flex items-baseline gap-1" style="margin-top:2px">
          <span style="font-size:18px;font-weight:800;color:var(--teal)">${C.esc(k.price)}</span>
        </div>
        <dl class="kv-grid" style="margin:2px 0">
          <dt>交付</dt><dd class="text-xs">${C.esc(k.delivery)}</dd>
          <dt>结算</dt><dd class="text-xs">${C.esc(k.settle)}</dd>
          <dt>工期</dt><dd class="text-xs">${C.esc(k.duration)}</dd>
        </dl>
        <div class="flex items-center gap-1 flex-wrap">${rolesTags}</div>
        <div class="flex items-center justify-between" style="margin-top:auto;padding-top:8px;border-top:1px solid var(--line-2)">
          <span class="text-xs text-3">销量 <b style="color:var(--ink)">${k.sales}</b></span>
          <span class="text-xs text-3">毛利 <b style="color:var(--teal)">${C.esc(k.margin)}</b></span>
        </div>
        <div class="flex gap-2" style="margin-top:6px">
          ${C.btn('查看详情', { size: 'sm', onclick: skuModalCall(k) })}
        </div>
      </div>
    </div>`;
  }

  const shelfGrid = `<div class="grid grid-3">${skus.map(skuCard).join('')}</div>`;

  // 品类筛选 pill（用 onclick 控制 sku-card 显隐）
  const filterPills = `<div class="pill-tabs">` +
    ['全部', ...cats].map((c, i) => {
      const sel = c === '全部'
        ? "document.querySelectorAll('.sku-card').forEach(el=>el.style.display='flex')"
        : `document.querySelectorAll('.sku-card').forEach(el=>el.style.display=el.dataset.cat==='${c}'?'flex':'none')`;
      return `<span class="pill-tab ${i === 0 ? 'active' : ''}" onclick="App.switchPill(this);${sel}">${c}</span>`;
    }).join('') + `</div>`;

  return `
  ${C.pageHead({
    icon: '🛒', title: '服务产品货架',
    desc: '平台商业化的货架。所有服务被产品化为可售卖、可派单、可验收、可结算的 SKU。',
    crumbs: [{ label: '服务交易' }, { label: '服务产品货架' }],
    actions: C.btn('新建 SKU', { icon: '➕', onclick: 'App.act("已打开 SKU 创建表单（原型演示）")' }) +
             C.btn('AI 货架推荐', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  ${C.card({
    title: '🛍️ 服务产品货架', sub: `共 ${skus.length} 个 SKU · 可查看验收标准`,
    actions: filterPills,
    body: `<div class="mb-3">${C.alert('服务产品数据对象：每个 SKU 含价格、交付标准、所需角色、工期、验收标准、分成规则。', 'teal', '🛒')}</div>${shelfGrid}`,
  })}
  `;
});
