# 页面构建契约 (CONTRACT) — 梯度智培原型

> 每个页面是一个独立 JS 文件，放在 `js/pages/<id>.js`。文件已在 `index.html` 中预先 `<script>` 引入，并已在侧栏 `js/router.js` 的 `NAV` 中配置好入口。**你只需写页面实现，不要改 index.html / router.js / app.js / data.js / components.js**（如确需新增数据，可在页面文件顶部用局部常量定义）。

## 0. 文件模板（必须严格遵守）

```js
/* ============================================================
   页面：<中文名> (<English>)
   对应规划书：<章节号 + 功能点>
   ============================================================ */
Pages.register('<page-id>', function (params) {
  // params 来自 URL: #page-id?id=E001  ->  params.id === 'E001'
  // ...构造数据...
  return `
  ${C.pageHead({ /* ... */ })}
  ... HTML 字符串 ...
  `;
});
```

- `Pages.register(id, fn)`：`fn` 返回**HTML 字符串**（不是 DOM）。`id` 必须与分配给你的 page-id 完全一致。
- 页面是纯函数：每次进入路由都会重新调用并 `innerHTML` 注入。不要用顶层副作用。
- 交互通过内联 `onclick="..."` 调用全局 `App.*`（见第 3 节）。看板拖拽由 `App.afterRender` 自动初始化（只要 DOM 用了 `.kanban`/`.kb-col`/`.kb-card`）。
- 所有动态文本用 `C.esc(...)` 或经过组件（组件内部已 esc）。

## 1. 组件 API (window.C) — 全部返回 HTML 字符串

```
C.pageHead({ icon, title, desc, crumbs:[{label,route?}], actions })   // 页头；actions 是按钮 HTML 串
C.kpi({ label, value, unit, icon, iconBg, iconColor, trend, trendDir:'up'|'down', foot })
C.card({ title, sub, actions, body, pad=true, cls })                  // 卡片；title 可含 emoji；body 是 HTML 串
C.badge(text, type, dot=false)   // type: primary|teal|amber|red|purple|cyan|gray
C.btn(text, { variant:'primary'|'ghost'|'danger'|'ai', size:'sm'|'lg', icon, onclick, attrs })
C.table({ cols:[{label,key?,render?(r),width?}], rows, onRowClick?(r)->'js string' })
C.entLogo(ent, size=34)          // ent 需有 .logo .color
C.tabs([{label,count?,content}], groupId)   // groupId 全页唯一；切换由 App.switchTab 自动绑定
C.progress(pct, { color, lg })
C.scoreRing(score0to100, { size, color, label })
C.timeline([{ time, title, desc, status:'done'|'warn'|'' }])
C.alert(htmlText, type:'info'|'teal'|'amber'|'red'|'purple', icon)
C.aiBlock(htmlContent, { actions })          // 紫色「✨AI生成」卡
C.tagList([..], { primary })
C.sourceRef(text)                            // 📎 可追溯来源小标签
C.empty(text, icon)
C.listItem({ icon, iconBg, iconColor, title, sub, right })
C.kvGrid([[k, vHtml], ...])                  // 键值两列
C.stateFlow([{id,name}], activeId)           // 状态机横向流程
C.steps(['步骤1','步骤2',...], activeIdx)
C.barChart([{label,value,display?,color?}], {max})        // 横向条形
C.columnChart([{label,value,display?,hl?}], {height,color}) // 纵向柱状(SVG)
C.lineChart([{label,value}], {height,color,fill})          // 折线(SVG)
C.donut([{label,value,color}], {size})                     // 环形(SVG)
C.esc(str)
```

## 2. 数据 (window.DB) — 直接读取，勿修改结构

```
DB.roles[]          {id,name,short,color,desc,goal}  id: owner|sales|consultant|writer|expert|client
DB.enterprises[]    {id,name,code,logo,color,region,industry,scale,stage,status,score,potential,
                     techAttr,revenue,rd,patents,softCopyrights,funding,contact,contactRole,phone,
                     tags[],gaps[],opportunities[],health,owner,consultant,lastActive,risk}
DB.opportunities[]  {id,ent,entId,stage,amount,prob,owner,product,next,updated,source,note}
DB.oppStages[]      {id,name,color,enter,action,exit}  id: lead|surveyed|proposal|negotiate|won|lost
DB.policies[]       {id,name,level,dept,deadline,daysLeft,status,support,match,tags[],conditions[],scoreRules,materials[]}
DB.tasks[]          {id,title,ent,type,state,owner,due,priority,progress,project,exceptionReason?}
DB.taskStates[]     {id,name,color,meaning,actions[]}  id: pending|todo|doing|client|expert|done|exception
DB.serviceProducts[]{id,name,cat,price,delivery,settle,roles[],duration,sales,margin,desc}
                     cat: 托管类|申报类|诊断类|专家类|工具类
DB.agents[]         {id,name,icon,color,duty,inputs[],outputs[],review,risk,calls,accuracy}
DB.reviews[]        {id,target,type,score,status,expert,date,issues:[{level,text}]}
DB.notifications[]  {type,icon,color,title,desc,time}
DB.stageColors      {成长期:'teal',...}
DB.getEnterprise(id) / DB.getAgent(id)
```

## 3. 全局交互 (window.App) — 用于 onclick

```
App.act('提示文案')          // 通用「操作成功」toast（原型占位动作首选）
App.notImpl()                // 「正式版落地」toast
App.toast(msg, type)         // type: success|warn|error|''
App.openModal({ title, body, foot, size:'wide'|'xwide' })  // body/foot 是 HTML 串
App.closeModal()
App.openAI(context)          // 打开 AI 助手抽屉
App.switchTab(group, idx)    // 由 C.tabs 自动生成的 onclick 调用，无需手写
App.switchPill(this)         // pill 切换：<span class="pill-tab active" onclick="App.switchPill(this)">
App.openNotif()
App.role() / App.roleObj()   // 当前角色
```

## 4. 跳转路由（用 `location.hash='...'`）

可跳转的页面 id（见 NAV + HIDDEN_PAGES）：
dashboard, strategy, architecture, roles, closed-loop, prospect-push, enterprise-pool,
enterprise-profile (带 ?id=E001), survey-tasks, opportunity, hosting,
hosting-detail (带 ?id=E001), policy-calendar, policy-library, dynamics, project-plan,
gap-tasks, writing-tasks, writing-editor (带 ?id=T001), review-ai, review-expert,
review-library, agents, agent-detail (带 ?id=AG1), service-products, orders, dispatch,
settlement, task-center, data-objects, governance, mvp-roadmap, kpi, risk

跳转示例：`onclick="location.hash='hosting-detail?id=E001'"`

## 5. 布局与设计规范

- 栅格：外层用 `<div class="grid grid-12">`，子项用 `class="col-span-8"` 等（1–12）。也可用 `grid-2/3/4`。
- 每个页面**必须**以 `C.pageHead({...})` 开头，含 crumbs 面包屑 + desc 说明（引用规划书原文要点）。
- 页面要**丰满**：多卡片、图表、表格、Tab、时间线、状态机、AI生成块混合使用。一个主模块页面建议 4–8 个信息区块。
- 颜色语义：主蓝=主要/进行；teal=成功/健康/通过；amber=警告/谈判/临期；red=风险/异常/逾期；purple=AI/智能体。
- 体现「AI 在业务流中」：凡 AI 输出处用 `C.aiBlock(...)`，标注数据来源 `C.sourceRef(...)`，关键结论标注「需人工/专家确认」。
- 文案使用规划书术语：潜在标的、摸排、商机、托管、缺口任务、AI评审、专家评审、服务产品SKU、派单承做、结算分成等。

## 6. 验收要求

- 页面无 JS 报错（`node --check` 通过）。
- 关键按钮/行可点击：跳转用真实 hash，演示动作用 `App.act(...)`。
- 内容详实、贴合该模块在规划书中的功能定义；不要留 TODO/占位空白。

## 7. 参考实现

读 `js/pages/dashboard.js`（仪表盘+图表+表格）与 `js/pages/enterprise-profile.js`（详情页+Tab+AI块）作为风格与用法范例。
