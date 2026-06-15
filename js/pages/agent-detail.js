/* ============================================================
   页面：智能体详情 (Agent Detail) — 隐藏页，带 ?id=AG1
   对应规划书：4.7 业务智能体设计（身份/工具/知识边界/权限/复核机制）
   ============================================================ */
Pages.register('agent-detail', function (params) {
  const a = DB.getAgent(params.id) || DB.agents[0];

  // 顶部状态徽章
  const statusBadges = `
  <div class="flex gap-3 mb-3 flex-wrap">
    ${C.badge('调用量 ' + a.calls, 'purple', true)}
    ${C.badge('准确率 ' + a.accuracy, 'teal', true)}
    ${C.badge('人工复核 100%', 'amber', true)}
    ${C.badge('模型版本 v1.2', 'gray')}
    ${C.badge(a.id, 'cyan')}
  </div>`;

  // 每个 Agent 的差异化运行示例
  const demos = {
    AG1: { title: '企业画像生成输出', source: '工商 / 财务 / 研发 / 知识产权 / 融资 / 动态',
      body: `<b>云栖智能（E001）· 画像摘要</b><div class="mt-1" style="line-height:1.75">该企业处于<b>成长期</b>，主营 AI 视觉算法与边缘计算，科技属性突出。研发投入约 ¥1,240万（占比 14.4%），拥有发明专利 8 件 + 软著 23 件，具备资质申报基础。<br/>综合评分 <b>86</b>，高潜力。关键缺口：高新收入归集口径待确认、研发台账不完整。建议优先切入：高企申报、研发费用诊断、专精特新培育。</div>`,
      tags: ['企业画像', '综合评分 86', '3 条待核验问题'] },
    AG2: { title: '政策项目匹配输出', source: '企业画像 / 政策库 / 项目规则 / 区域信息',
      body: `<b>云栖智能 · 政策匹配结果</b><div class="mt-1" style="line-height:1.75">为该企业匹配到 <b>3 项</b>高相关项目：<br/>• 研发费用加计扣除 — 匹配 <b>88分</b>（常年窗口，建议立即启动）<br/>• 专精特新中小企业 — 匹配 <b>54分</b>（窗口 2026-10-15，需补 2 项缺口）<br/>• 高新技术企业认定 — 匹配 <b>46分</b>（窗口 2026-08-15，知识产权达标，财务待规整）<br/>已生成对应申报日历与 5 项缺口任务。</div>`,
      tags: ['3 项匹配', '申报日历', '5 项缺口任务'] },
    AG3: { title: '客户服务方案输出', source: '诊断结果 / 服务产品库 / 案例库',
      body: `<b>客户问题：</b>"我们想申报高企，但不确定研发费用够不够"<div class="mt-1" style="line-height:1.75"><b>方案建议：</b>基于贵司研发投入占比约 14.4%（已达高企 ≥5% 门槛），建议组合：①研发费用诊断（厘清归集口径）→ ②高企申报托管 → ③研发台账工具。预计服务周期 60 天，参考报价区间 ¥6.8万–¥9.2万。<br/><i>具体报价与交付承诺需负责人确认。</i></div>`,
      tags: ['服务组合 3 项', '报价建议', '需负责人确认价格'] },
    AG4: { title: '触达话术生成输出', source: '商机阶段 / 客户痛点 / 历史沟通',
      body: `<b>场景：</b>首轮电话触达（线索阶段）<div class="mt-1" style="line-height:1.75"><b>开场：</b>"王总您好，我是XX机构的张顾问。注意到贵司近期完成了产品迭代，研发投入持续加大。我们梳理发现贵司很可能符合研发费用加计扣除与高企申报条件，这块每年能为企业实际省下不少税费……"<br/><b>异议处理（"我们有合作的代账"）：</b>"代账侧重财务合规，我们专注科技政策与申报路径设计，两者不冲突，可以做个免费的政策匹配诊断给您参考。"</div>`,
      tags: ['触达话术', '异议处理', '发送前需销售确认'] },
    AG5: { title: '申报材料章节初稿', source: '企业素材 / 模板 / 项目规则 / 章节要求',
      body: `<b>专精特新申报书 · 「企业创新能力」章节初稿</b><div class="mt-1" style="line-height:1.75">公司构建了以自主研发为核心的创新体系，现有研发人员占比约 32%，累计获授权发明专利 8 项、软件著作权 23 项……<br/><span style="color:var(--amber)">⚠ 补充问题：①请提供近三年研发费用专项审计报告；②"细分市场占有率"缺少第三方数据支撑，需企业补充来源。</span></div>`,
      tags: ['章节初稿', '2 个补充问题', '撰写人+专家复核'] },
    AG6: { title: 'AI 初评意见输出', source: '材料 / 附件 / 规则 / 评分模型',
      body: `<b>云栖智能-专精特新申报书 · AI 竞争力评审</b><div class="mt-1" style="line-height:1.75">综合评分 <b>78 分</b>。问题定位：<br/>• <span style="color:var(--red)">[高]</span> 细分市场占有率缺少第三方数据支撑<br/>• <span style="color:var(--amber)">[中]</span> 研发投入占比表述与财务数据不一致<br/>• <span style="color:var(--text-3)">[低]</span> 部分技术术语需统一<br/><b>建议：</b>补充市场数据来源后送专家复核。</div>`,
      tags: ['评分 78', '3 个问题', '专家复核关键结论'] },
    AG7: { title: '结算与派单输出', source: '订单 / 合同 / 任务 / 交付结果 / 分成规则',
      body: `<b>本周运营结算建议</b><div class="mt-1" style="line-height:1.75">• 派单：高企申报-绿源环保 → 建议派给撰写人李工（当前负荷 64%）<br/>• 逾期提醒：晨曦物联高企材料任务逾期 5 小时，建议升级处理<br/>• 结算清单：本月可结算交付 8 单，预估服务费 ¥86.4万，分成后机构净收 ¥51.2万（毛利率 59.3%）<br/><i>结算口径与放款须负责人确认。</i></div>`,
      tags: ['派单建议', '逾期提醒', '需负责人确认结算'] },
  };
  const demo = demos[a.id] || demos.AG1;

  return `
  ${C.pageHead({
    icon: a.icon, title: a.name,
    desc: `${a.duty}。本智能体具备明确的身份、工具、知识边界、权限与复核机制（规划书 4.7）。`,
    crumbs: [{ label: '智能中枢' }, { label: '智能体体系', route: 'agents' }, { label: a.name }],
    actions: C.btn('调用日志', { icon: '📑', onclick: 'App.act("正在加载完整调用日志…")' }) +
             C.btn('与该 Agent 对话', { variant: 'ai', icon: '✨', onclick: `App.openAI("${a.name}")` }),
  })}

  ${statusBadges}

  ${C.tabs([
    { label: '能力概览', content: tabOverview(a) },
    { label: '运行示例', content: tabDemo(a, demo) },
    { label: '权限与边界', content: tabBoundary(a) },
    { label: '调用日志与审计', count: 5, content: tabAudit(a) },
  ], 'agentdetail')}
  `;

  // ===== Tab1 能力概览 =====
  function tabOverview(a) {
    const flowNodes = [
      { id: 'in', name: '输入数据' }, { id: 'proc', name: 'AI 处理' },
      { id: 'out', name: '输出/动作' }, { id: 'rev', name: '人工复核' },
    ];
    return `
    <div class="grid grid-12">
      <div class="col-span-7">
        ${C.card({ title: '🎯 核心职责与风险', body: C.kvGrid([
          ['智能体编号', C.badge(a.id, 'purple')],
          ['核心职责', a.duty],
          ['复核节点', `<b style="color:var(--purple)">${C.esc(a.review)}</b>`],
          ['主要风险', `<span style="color:var(--amber)">⚠ ${C.esc(a.risk)}</span>`],
          ['模型版本', 'v1.2 · 规则引擎 r2026.06'],
        ]) })}
      </div>
      <div class="col-span-5">
        ${C.card({ title: '📥 输入数据', body: C.tagList(a.inputs) +
          `<div class="mt-3 mb-1 text-xs text-3">📤 输出 / 动作</div>` + C.tagList(a.outputs, { primary: true }) })}
      </div>
    </div>
    ${C.card({ title: '🔄 处理流程 · 输入 → 处理 → 输出 → 复核',
      body: `<div style="padding:8px 0">${C.steps(['接收输入数据', 'AI 推理/生成', '产出结果与动作', '人工/专家复核', '写入审计日志'], 4)}</div>
      <div class="mt-2">${C.stateFlow(flowNodes, 'rev')}</div>
      <div class="mt-3">${C.alert('AI 输出的所有关键结论均标注「需人工/专家确认」，复核动作（确认人、确认时间、修改内容）写入审计日志，确保结论可追溯、可问责。', 'purple', '🔒')}</div>` })}
    `;
  }

  // ===== Tab2 运行示例 =====
  function tabDemo(a, demo) {
    return `
    <div class="grid grid-2">
      ${C.card({ title: '🏷️ 本次输出对象', body: C.tagList(demo.tags, { primary: true }) +
        `<div class="mt-2 text-xs text-3">输出结果以草稿态生成，须经复核节点确认后方可对客户呈现。 ${C.sourceRef(demo.source)}</div>` })}
      ${C.card({ title: '✅ 复核与确认', body: C.kvGrid([
        ['复核节点', `<b style="color:var(--purple)">${C.esc(a.review)}</b>`],
        ['当前状态', C.badge('待人工确认', 'amber', true)],
        ['AI 角色', '发现 / 生成 / 解释 / 初评 / 推荐'],
        ['人工角色', '关键判断 / 合规确认 / 客户承诺'],
      ]) }) }
    </div>
    ${C.alert('运行示例为脱敏演示数据。AI 生成的结论均附数据来源，涉及承诺（申报成功率、补贴金额、融资结果）的表达不得由 AI 直接输出，须由负责人确认。', 'info', '📌')}
    `;
  }

  // ===== Tab3 权限与边界 =====
  function tabBoundary(a) {
    const dataScopes = [
      { level: '公开数据', cls: 'teal', perm: '可读', desc: '工商、政策库、公开招投标与企业动态' },
      { level: '机构自有数据', cls: 'primary', perm: '可读写', desc: '画像、标签、商机、服务产品库与案例库' },
      { level: '客户上传数据', cls: 'amber', perm: '授权后可读', desc: '研发台账、财务报表、专利证书等需客户授权' },
      { level: '敏感经营数据', cls: 'red', perm: '受限/脱敏', desc: '银行流水、核心合同金额等默认脱敏，禁止外发' },
    ];
    const forbidden = [
      'AI 不得直接向客户承诺申报成功、融资结果或补贴金额',
      '不得使用未经授权的客户数据生成对外内容',
      '不得编造事实、伪造数据来源或引用不存在的文件',
      '关键判断、合规确认与对外发送必须经人工/专家复核',
    ];
    return `
    <div class="grid grid-12">
      <div class="col-span-6">
        ${C.card({ title: '🚧 知识边界', body:
          `<div class="text-sm text-2" style="line-height:1.7">本 Agent 仅在<b>${C.esc(a.duty)}</b>的职责范围内工作，依赖输入：${a.inputs.join('、')}。超出知识边界或数据不足时，输出标记为「待核验问题」并交由人工处理，不做无依据推断。</div>
          <div class="mt-2">${C.alert('主要风险：' + C.esc(a.risk) + '。已通过规则约束 + 检索增强 + 复核节点三重控制降低风险。', 'amber', '⚠️')}</div>` })}
        ${C.card({ title: '🔑 可执行动作权限', body:
          C.tagList(a.outputs, { primary: true }) +
          `<div class="mt-2 text-xs text-3">以上动作均以草稿态产出，正式生效须经「${C.esc(a.review)}」。</div>` })}
      </div>
      <div class="col-span-6">
        ${C.card({ title: '🗂️ 数据授权范围分级', pad: false, body: C.table({
          cols: [
            { label: '数据分级', render: r => C.badge(r.level, r.cls, true) },
            { label: '权限', render: r => `<span class="td-strong">${r.perm}</span>` },
            { label: '说明', render: r => `<span class="cell-sub">${r.desc}</span>` },
          ],
          rows: dataScopes,
        }) })}
      </div>
    </div>
    ${C.card({ title: '⛔ 不可越界事项', body:
      forbidden.map(f => C.listItem({ icon: '⛔', iconBg: 'var(--red-50,#fff5f5)', iconColor: 'var(--red)', title: f, sub: '违反即拦截并告警', right: C.badge('硬约束', 'red') })).join('') })}
    ${C.alert('所有 AI 结论必须展示依据来源；涉及客户承诺的表达必须由负责人确认后方可对外。', 'red', '⚖️')}
    `;
  }

  // ===== Tab4 调用日志与审计 =====
  function tabAudit(a) {
    const logs = [
      { time: '2026-06-14 16:42', obj: '云栖智能 E001', out: demoLogOut(a, '画像评分 86 / 匹配 3 项 / 话术 1 版'), confirmed: true, by: '张顾问' },
      { time: '2026-06-14 11:08', obj: '智驰新能源 E002', out: demoLogOut(a, '高企复审建议 / 评分 91'), confirmed: true, by: '郑博士' },
      { time: '2026-06-13 15:30', obj: '绿源环保 E003', out: demoLogOut(a, '谈判话术 / 报价建议 ¥8.6万'), confirmed: false, by: '-' },
      { time: '2026-06-13 09:55', obj: '晨曦物联 E004', out: demoLogOut(a, '逾期提醒 / 缺口任务 2 项'), confirmed: true, by: '李工' },
      { time: '2026-06-12 14:20', obj: '恒瑞医疗 E005', out: demoLogOut(a, '融资动态触发 / 推荐省级技术中心'), confirmed: false, by: '-' },
    ];
    return `
    ${C.card({ title: '📑 近期调用记录', sub: '记录数据来源、更新时间、人工确认与版本，可追溯',
      pad: false, body: C.table({
        cols: [
          { label: '时间', render: r => `<span class="cell-sub nowrap">${r.time}</span>` },
          { label: '输入对象', render: r => `<span class="td-strong">${r.obj}</span>` },
          { label: '输出摘要', render: r => `<span class="text-sm">${r.out}</span>` },
          { label: '人工确认', render: r => r.confirmed ? C.badge('已确认', 'teal', true) : C.badge('待确认', 'amber', true) },
          { label: '确认人', render: r => `<span class="cell-sub">${r.by}</span>` },
        ],
        rows: logs,
      }) })}
    <div class="grid grid-12">
      <div class="col-span-7">
        ${C.card({ title: '🧾 审计留痕字段', body: C.kvGrid([
          ['数据来源', a.inputs.join(' / ')],
          ['数据更新时间', '2026-06-14 16:42（实时同步）'],
          ['人工修改人', '张顾问 / 郑博士（见上表确认人）'],
          ['规则版本', 'r2026.06'],
          ['模型版本', 'v1.2'],
          ['本月调用量', `<b>${C.esc(a.calls)}</b> 次 · 准确率 ${a.accuracy}`],
        ]) })}
      </div>
      <div class="col-span-5">
        ${C.card({ title: '📊 复核结果分布', body: C.donut([
          { label: '已确认采纳', value: 68, color: '#0ca678' },
          { label: '修改后采纳', value: 22, color: '#f08c00' },
          { label: '待确认', value: 7, color: '#7048e8' },
          { label: '驳回重做', value: 3, color: '#e03131' },
        ], { size: 130 }) +
        `<div class="mt-3 text-xs text-3">每一次调用与复核动作均落库，支持按企业、按时间、按确认人回溯，满足合规审计要求。</div>` })}
      </div>
    </div>
    ${C.alert('审计原则：所有 AI 结论必须展示依据来源；涉及承诺的表达必须由负责人确认。日志不可删除、仅可追加，确保可问责。', 'purple', '🔒')}
    `;
  }

  function demoLogOut(a, txt) {
    return C.esc(txt);
  }
});
