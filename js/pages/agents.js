/* ============================================================
   页面：智能体体系 (Agents)
   简化设计：展示智能体列表，引导用户与智能体对话
   ============================================================ */
Pages.register('agents', function () {
  const agents = DB.agents;

  // 智能体卡片网格（简化版）
  const agentCards = agents.map(a => `
    <div class="card agent-card" style="cursor:pointer;border-top:3px solid ${a.color}">
      <div class="card-bd">
        <div class="flex items-center gap-3 mb-2">
          <div class="li-icon" style="background:${a.color}1a;color:${a.color};font-size:20px;width:44px;height:44px;border-radius:12px">${a.icon}</div>
          <div class="flex-1">
            <div class="td-strong" style="font-size:15px">${C.esc(a.name)}</div>
            <div class="cell-sub">${C.esc(a.id)}</div>
          </div>
        </div>
        <div class="text-sm text-2 mb-3" style="line-height:1.6;min-height:40px">${C.esc(a.duty)}</div>
        <div class="flex gap-2">
          ${C.btn('与此智能体对话', { size: 'sm', variant: 'ai', icon: '💬', onclick: `App.openAI("${C.esc(a.name)}")` })}
        </div>
      </div>
    </div>
  `).join('');

  return `
  ${C.pageHead({
    icon: '🤖', title: '智能体体系',
    desc: '与机构的各类业务智能体对话，获取专业建议和数据支持。',
    crumbs: [{ label: '智能中枢' }, { label: '智能体体系' }],
    actions: C.btn('与智能体对话', { variant: 'ai', icon: '✨', onclick: 'App.openAI()' }),
  })}

  <div class="grid grid-12 mb-3">
    <div class="col-span-12">
      ${C.card({
        title: '💬 与智能体对话',
        body: `<div class="text-sm text-2" style="line-height:1.8;padding:10px 0">
          选择下方任意一个智能体，或点击右上角按钮与通用助手对话。通过对话，你可以：
          <ul style="margin:10px 0 0 20px;list-style:disc">
            <li>请求数据分析和业务洞察</li>
            <li>获取方案建议和工作指导</li>
            <li>进行批量处理和内容生成</li>
            <li>解决工作中的问题和困惑</li>
          </ul>
        </div>`,
      })}
    </div>
  </div>

  ${C.card({
    title: '🤖 业务智能体',
    body: `<div class="grid grid-3 agent-grid">${agentCards}</div>`,
  })}
  `;
});
