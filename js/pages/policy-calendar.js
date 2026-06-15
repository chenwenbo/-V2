/* ============================================================
   页面：政策申报日历 (Policy Calendar)
   对应规划书：4.4 政策及时推送 / 4.5 项目计划（倒排期申报日历与提醒）
   ============================================================ */
Pages.register('policy-calendar', function () {
  // 适配企业映射：政策 → 在管/托管企业（政策项目 Agent 匹配结果）
  const adaptMap = {
    P001: ['E003', 'E005', 'E008'], P002: ['E001', 'E004'], P003: ['E003', 'E005', 'E008'],
    P004: ['E002', 'E004'], P005: ['E003', 'E008'], P006: ['E006', 'E004'],
  };
  const adaptEnts = p => (adaptMap[p.id] || []).map(id => DB.getEnterprise(id)).filter(Boolean);
  const adaptCount = p => (adaptMap[p.id] || []).length;

  // 按剩余天数倒排
  const sorted = [...DB.policies].sort((a, b) => a.daysLeft - b.daysLeft);
  const nearDue = sorted.filter(p => p.daysLeft <= 35);          // 临期窗口
  const inProgress = DB.policies.filter(p => p.status === '申报中');
  const hostedCount = 3;                                          // 托管中企业（云栖/恒瑞/智驰）
  const reminderCount = nearDue.length * 2 + DB.policies.length;  // 已生成提醒数（演示口径）

  // 语义助手
  const dueVar = d => d <= 25 ? 'var(--red)' : d <= 35 ? 'var(--amber)' : d <= 90 ? 'var(--cyan)' : 'var(--teal)';
  const dueBadge = d => d <= 25 ? 'red' : d <= 35 ? 'amber' : d <= 90 ? 'cyan' : 'teal';
  const levelType = lv => lv === '国家级' ? 'primary' : 'purple';

  const kpis = [
    C.kpi({ label: '本月临期申报', value: nearDue.length, unit: '项', icon: '⏰', iconBg: 'var(--amber-50)', iconColor: 'var(--amber)', trend: '', foot: '剩余 ≤35 天，需倒排期' }),
    C.kpi({ label: '申报中项目', value: inProgress.length, unit: '项', icon: '📋', iconBg: 'var(--primary-50)', iconColor: 'var(--primary)', trend: '', foot: '窗口开放，可启动材料' }),
    C.kpi({ label: '适配托管企业', value: hostedCount, unit: '家', icon: '🛡️', iconBg: 'var(--teal-50)', iconColor: 'var(--teal)', trend: '', foot: '已纳入年度托管计划' }),
    C.kpi({ label: '已生成提醒', value: reminderCount, unit: '条', icon: '🔔', iconBg: 'var(--purple-50)', iconColor: 'var(--purple)', trend: '', foot: '提前 30/15/7 天三档' }),
  ];

  // 提醒设置 modal（提前X天 + 提醒对象）
  const reminderModal = `App.openModal({title:'🔔 申报提醒设置', body:'<div class=\\'mb-3 text-2\\' style=\\'font-size:13px\\'>政策项目 Agent 按申报截止时间倒排期，自动生成提醒并推送给负责人，避免错过申报窗口。</div>'+C.kvGrid([['提前提醒档位','<select class=\\'sel\\'><option>提前 30 / 15 / 7 / 3 天（推荐）</option><option>提前 15 / 7 / 1 天</option><option>仅提前 7 天</option></select>'],['提醒对象','<select class=\\'sel\\'><option>负责顾问 + 销售 + 撰写</option><option>仅项目负责顾问</option><option>负责人 + 客户对接人</option></select>'],['提醒方式','<select class=\\'sel\\'><option>站内 + 邮件 + 企业微信</option><option>仅站内消息</option></select>'],['临期升级规则','剩余 ≤7 天且材料未启动，自动升级机构负责人'],['适用范围','全部托管企业的适配政策']]), foot: C.btn('取消',{onclick:'App.closeModal()'})+C.btn('保存提醒规则',{variant:'primary',onclick:'App.closeModal();App.act(\\'已保存申报提醒规则，按倒排期自动推送\\')'})})`;

  // 申报时间轴行
  const timelineRows = sorted.map(p => {
    const ents = adaptEnts(p);
    const entChips = ents.length
      ? ents.map(e => `<span class="tag" title="${C.esc(e.name)}">${C.esc(e.logo)} ${C.esc(e.name.slice(0, 4))}</span>`).join('')
      : '<span class="text-3 text-xs">暂无适配在管企业</span>';
    return `<div class="list-item clickable" onclick="location.hash='policy-library'">
      <div class="li-icon" style="background:${dueVar(p.daysLeft)}1a;color:${dueVar(p.daysLeft)};font-weight:800;flex-direction:column;line-height:1.1">
        <div style="font-size:16px">${p.daysLeft}</div><div style="font-size:8px">天</div></div>
      <div class="li-main">
        <div class="li-title">${C.esc(p.name)} ${C.badge(p.level, levelType(p.level))} ${p.daysLeft <= 35 ? C.badge('临期', 'red', true) : C.badge(p.status, dueBadge(p.daysLeft) === 'red' ? 'amber' : 'teal')}</div>
        <div class="li-sub">${C.esc(p.dept)} · 截止 <b style="color:${dueVar(p.daysLeft)}">${C.esc(p.deadline)}</b> · 支持：${C.esc(p.support)}</div>
        <div class="tag-list mt-1">${entChips}</div>
      </div>
      <div class="text-r">
        <div class="td-strong text-sm" style="color:${dueVar(p.daysLeft)}">剩余 ${p.daysLeft} 天</div>
        <div class="cell-sub">适配 ${adaptCount(p)} 家 · 匹配度 ${p.match}</div>
        ${C.btn('查看政策', { size: 'sm', onclick: "event.stopPropagation();location.hash='policy-library'" })}
      </div>
    </div>`;
  }).join('');

  // 月历网格：6月→12月，把关键截止日标注到对应月份格
  const months = ['6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const monthIdx = dl => { const m = parseInt(dl.split('-')[1], 10); return m - 6; };
  const calCells = months.map((mLabel, i) => {
    const items = sorted.filter(p => monthIdx(p.deadline) === i);
    const inner = items.length
      ? items.map(p => `<div class="cal-ev" style="background:${dueVar(p.daysLeft)}14;border-left:3px solid ${dueVar(p.daysLeft)};border-radius:5px;padding:4px 6px;margin-top:4px;font-size:11px;line-height:1.35;cursor:pointer" onclick="location.hash='policy-library'">
          <div style="font-weight:700;color:var(--ink)">${C.esc(p.deadline.slice(5))}</div>
          <div class="text-2" style="font-size:10.5px">${C.esc(p.name.slice(0, 9))}</div></div>`).join('')
      : '<div class="text-3 text-xs" style="margin-top:8px">—</div>';
    return `<div style="border:1px solid var(--line);border-radius:10px;padding:8px;min-height:96px;background:var(--bg-0)">
      <div class="flex justify-between items-center"><span class="fw-6 text-sm">2026 · ${mLabel}</span>${items.length ? C.badge(items.length + ' 项', 'gray') : ''}</div>
      ${inner}</div>`;
  }).join('');

  return `
  ${C.pageHead({
    icon: '📅', title: '政策申报日历',
    desc: '对应规划书 4.4 政策及时推送与 4.5 项目计划：系统识别适配企业、解释匹配原因，按申报截止时间倒排期生成申报日历与多档提醒，提升政策响应速度，避免错过申报窗口。',
    crumbs: [{ label: '政策项目' }, { label: '政策申报日历' }],
    actions: C.btn('申报提醒设置', { icon: '🔔', onclick: reminderModal }) +
             C.btn('AI 申报建议', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-4 mb-3">${kpis.join('')}</div>

  <div class="grid grid-12">
    <!-- 申报时间轴（按剩余天数倒排，临期高亮） -->
    <div class="col-span-7">
      ${C.card({
        title: '⏳ 申报时间轴 · 倒排期', sub: '按剩余天数升序，≤35 天红/黄高亮',
        actions: C.btn('进入政策库', { size: 'sm', onclick: "location.hash='policy-library'" }),
        body: timelineRows + `<div class="mt-2">${C.alert('剩余 <b>≤25 天</b> 的政策标红，<b>≤35 天</b> 标黄。临期项目应立即倒排期、启动材料生产，并锁定专家复核档期。', 'amber', '⏰')}</div>`,
      })}
    </div>

    <!-- 适配在管企业（识别 + 匹配原因） -->
    <div class="col-span-5">
      ${C.card({
        title: '🎯 临期政策 · 适配企业识别', sub: '政策项目 Agent 匹配',
        body: nearDue.map(p => {
          const ents = adaptEnts(p);
          return `<div class="mb-3">
            <div class="flex items-center justify-between mb-1">
              <span class="fw-6 text-sm">${C.esc(p.name)}</span>${C.badge('剩余 ' + p.daysLeft + ' 天', dueBadge(p.daysLeft))}</div>
            ${ents.length ? ents.map(e => C.listItem({
              icon: C.entLogo(e, 28), iconBg: 'transparent', title: e.name,
              sub: `${e.region} · ${e.industry} · 命中匹配项：${(e.opportunities[0] || '资质培育')}`,
              right: C.btn('日历', { size: 'sm', onclick: `location.hash='enterprise-profile?id=${e.id}'` }),
            })).join('') : `<div class="text-3 text-xs">暂无适配在管企业</div>`}
          </div>`;
        }).join('') + C.sourceRef('匹配依据：企业画像 + 政策申报条件 + 区域适用范围'),
      })}
    </div>

    <!-- 月历网格 -->
    <div class="col-span-12">
      ${C.card({
        title: '🗓️ 申报月历 · 2026 下半年', sub: '关键截止日按月份分布',
        body: `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px">${calCells}</div>
          <div class="mt-3 flex gap-4 flex-wrap text-xs text-2">
            <span class="flex items-center gap-1"><span style="width:10px;height:10px;border-radius:3px;background:var(--red);display:inline-block"></span> 临期 ≤25 天</span>
            <span class="flex items-center gap-1"><span style="width:10px;height:10px;border-radius:3px;background:var(--amber);display:inline-block"></span> 临近 ≤35 天</span>
            <span class="flex items-center gap-1"><span style="width:10px;height:10px;border-radius:3px;background:var(--cyan);display:inline-block"></span> 关注 ≤90 天</span>
            <span class="flex items-center gap-1"><span style="width:10px;height:10px;border-radius:3px;background:var(--teal);display:inline-block"></span> 充裕 / 常年受理</span>
          </div>`,
      })}
    </div>

  </div>
  `;
});
