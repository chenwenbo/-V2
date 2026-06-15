/* ============================================================
   components.js — 通用渲染组件 (返回 HTML 字符串)
   全局 window.C
   ============================================================ */
window.C = (function () {

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* 页头：面包屑 + 标题 + 描述 + 操作区 */
  function pageHead({ icon, title, desc, crumbs = [], actions = '' }) {
    const cb = crumbs.length
      ? `<div class="breadcrumb">${crumbs.map((c, i) =>
          (c.route ? `<a href="#${c.route}">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`) +
          (i < crumbs.length - 1 ? `<span class="sep">›</span>` : '')).join('')}</div>`
      : '';
    return `<div class="page-head">
      ${cb}
      <div class="page-head-row">
        <div>
          <div class="page-title">${icon ? `<span class="pt-icon">${icon}</span>` : ''}${esc(title)}</div>
          ${desc ? `<div class="page-desc">${desc}</div>` : ''}
        </div>
        ${actions ? `<div class="page-actions">${actions}</div>` : ''}
      </div>
    </div>`;
  }

  /* KPI 卡 */
  function kpi({ label, value, unit = '', icon = '', iconBg = 'var(--primary-50)', iconColor = 'var(--primary)', trend = '', trendDir = 'up', foot = '' }) {
    const trendHtml = trend ? `<span class="trend-${trendDir}">${trendDir === 'up' ? '▲' : '▼'} ${esc(trend)}</span>` : '';
    return `<div class="kpi">
      <div class="kpi-top">
        <div class="kpi-label">${esc(label)}</div>
        ${icon ? `<div class="kpi-ic" style="background:${iconBg};color:${iconColor}">${icon}</div>` : ''}
      </div>
      <div class="kpi-value">${esc(value)}${unit ? `<span class="unit">${esc(unit)}</span>` : ''}</div>
      <div class="kpi-foot">${trendHtml}${foot ? `<span>${esc(foot)}</span>` : ''}</div>
    </div>`;
  }

  /* 卡片容器 */
  function card({ title, sub = '', actions = '', body, pad = true, cls = '' }) {
    const head = title ? `<div class="card-head"><h3>${title}${sub ? `<span class="ch-sub">${sub}</span>` : ''}</h3>${actions ? `<div class="flex gap-2">${actions}</div>` : ''}</div>` : '';
    return `<div class="card ${cls}">${head}<div class="${pad ? 'card-body' : ''}">${body}</div></div>`;
  }

  /* 徽章 */
  function badge(text, type = 'gray', dot = false) {
    return `<span class="badge badge-${type}${dot ? ' badge-dot' : ''}">${esc(text)}</span>`;
  }

  /* 按钮 */
  function btn(text, { variant = '', size = '', icon = '', onclick = '', attrs = '' } = {}) {
    const cls = `btn ${variant ? 'btn-' + variant : ''} ${size ? 'btn-' + size : ''}`.trim();
    return `<button class="${cls}" ${onclick ? `onclick="${onclick}"` : ''} ${attrs}>${icon ? icon + ' ' : ''}${esc(text)}</button>`;
  }

  /* 表格 */
  function table({ cols, rows, onRowClick = null }) {
    const head = `<tr>${cols.map(c => `<th style="${c.width ? 'width:' + c.width : ''}">${esc(c.label)}</th>`).join('')}</tr>`;
    const body = rows.map(r => {
      const click = onRowClick ? `onclick="${onRowClick(r)}" class="clickable"` : '';
      return `<tr ${click}>${cols.map(c => `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}</tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="tbl"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
  }

  /* 企业 logo */
  function entLogo(ent, size = 34) {
    return `<div class="ent-logo" style="width:${size}px;height:${size}px;background:${ent.color}18;color:${ent.color}">${esc(ent.logo)}</div>`;
  }

  /* 标签页 (静态结构，交互在 app.js) */
  function tabs(items, groupId) {
    const heads = items.map((t, i) =>
      `<div class="tab ${i === 0 ? 'active' : ''}" data-tab="${groupId}-${i}" onclick="App.switchTab('${groupId}', ${i})">${esc(t.label)}${t.count != null ? `<span class="tab-count">${t.count}</span>` : ''}</div>`
    ).join('');
    const panels = items.map((t, i) =>
      `<div class="tab-panel ${i === 0 ? 'active' : ''}" data-panel="${groupId}-${i}">${t.content}</div>`
    ).join('');
    return `<div class="tabs" data-tabgroup="${groupId}">${heads}</div>${panels}`;
  }

  /* 进度条 */
  function progress(pct, { color = 'var(--primary)', lg = false } = {}) {
    return `<div class="progress ${lg ? 'progress-lg' : ''}"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>`;
  }

  /* 评分圆环 SVG */
  function scoreRing(score, { size = 92, color = null, label = '综合评分' } = {}) {
    const c = color || (score >= 85 ? 'var(--teal)' : score >= 70 ? 'var(--primary)' : score >= 50 ? 'var(--amber)' : 'var(--red)');
    const r = (size - 14) / 2, circ = 2 * Math.PI * r, off = circ * (1 - score / 100);
    return `<div style="position:relative;width:${size}px;height:${size}px">
      <svg class="ring" width="${size}" height="${size}">
        <circle class="ring-bg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="9"></circle>
        <circle class="ring-fg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="9" stroke="${c}" stroke-dasharray="${circ}" stroke-dashoffset="${off}"></circle>
      </svg>
      <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">
        <div><div style="font-size:${size*0.28}px;font-weight:800;color:${c};line-height:1">${score}</div>
        <div style="font-size:10px;color:var(--text-3)">${esc(label)}</div></div>
      </div>
    </div>`;
  }

  /* 时间线 */
  function timeline(items) {
    return `<div class="timeline">${items.map(it =>
      `<div class="tl-item"><div class="tl-dot ${it.status || ''}"></div>
        <div class="tl-time">${esc(it.time)}</div>
        <div class="tl-title">${esc(it.title)}</div>
        ${it.desc ? `<div class="tl-desc">${it.desc}</div>` : ''}
      </div>`).join('')}</div>`;
  }

  /* 提示条 */
  function alert(text, type = 'info', icon = 'ℹ️') {
    return `<div class="alert alert-${type}"><span class="a-ic">${icon}</span><div>${text}</div></div>`;
  }

  /* AI 生成内容块 */
  function aiBlock(content, { actions = '' } = {}) {
    return `<div class="ai-block">${content}${actions ? `<div class="flex gap-2 mt-2">${actions}</div>` : ''}</div>`;
  }

  /* 标签列表 */
  function tagList(tags, { primary = false } = {}) {
    return `<div class="tag-list">${tags.map(t => `<span class="tag ${primary ? 'tag-primary' : ''}">${esc(t)}</span>`).join('')}</div>`;
  }

  /* 数据来源引用 */
  function sourceRef(text) { return `<span class="source-ref" title="数据来源可追溯">${esc(text)}</span>`; }

  /* 空状态 */
  function empty(text, icon = '📭') { return `<div class="empty"><div class="e-ic">${icon}</div>${esc(text)}</div>`; }

  /* 列表项 */
  function listItem({ icon, iconBg = 'var(--primary-50)', iconColor = 'var(--primary)', title, sub, right = '' }) {
    return `<div class="list-item">
      <div class="li-icon" style="background:${iconBg};color:${iconColor}">${icon}</div>
      <div class="li-main"><div class="li-title">${esc(title)}</div><div class="li-sub">${sub}</div></div>
      ${right ? `<div>${right}</div>` : ''}
    </div>`;
  }

  /* key-value 网格 */
  function kvGrid(pairs) {
    return `<dl class="kv-grid">${pairs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
  }

  /* 状态机流程图 */
  function stateFlow(nodes, activeId = null) {
    return `<div class="state-flow">${nodes.map((n, i) =>
      `<div class="state-node ${n.id === activeId ? 'active' : ''}">${esc(n.name)}</div>${i < nodes.length - 1 ? '<span class="state-arrow">→</span>' : ''}`
    ).join('')}</div>`;
  }

  /* 步骤条 */
  function steps(items, activeIdx) {
    return `<div class="steps">${items.map((s, i) => {
      const st = i < activeIdx ? 'done' : i === activeIdx ? 'active' : '';
      return `${i > 0 ? '<div class="step-line"></div>' : ''}<div class="step ${st}"><div class="step-num">${i < activeIdx ? '✓' : i + 1}</div><div class="step-label">${esc(s)}</div></div>`;
    }).join('')}</div>`;
  }

  /* 简易条形图 (横向) */
  function barChart(items, { max = null } = {}) {
    const m = max || Math.max(...items.map(i => i.value));
    return `<div class="flex flex-col gap-3">${items.map(it =>
      `<div><div class="flex justify-between mb-1"><span class="text-sm">${esc(it.label)}</span><span class="text-sm fw-6">${esc(it.display || it.value)}</span></div>
       ${progress(Math.round(it.value / m * 100), { color: it.color || 'var(--primary)' })}</div>`
    ).join('')}</div>`;
  }

  /* 简易柱状图 (纵向 SVG) */
  function columnChart(data, { height = 160, color = 'var(--primary)' } = {}) {
    const max = Math.max(...data.map(d => d.value)) * 1.15;
    const bw = 100 / data.length;
    const bars = data.map((d, i) => {
      const h = (d.value / max) * (height - 30);
      const x = i * bw + bw * 0.2;
      return `<g>
        <rect x="${x}%" y="${height - 24 - h}" width="${bw * 0.6}%" height="${h}" rx="4" fill="${color}" opacity="${d.hl ? 1 : 0.78}"></rect>
        <text x="${x + bw * 0.3}%" y="${height - 8}" text-anchor="middle" font-size="10" fill="var(--text-3)">${esc(d.label)}</text>
        <text x="${x + bw * 0.3}%" y="${height - 30 - h}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ink)">${esc(d.display || d.value)}</text>
      </g>`;
    }).join('');
    return `<svg width="100%" height="${height}" style="overflow:visible">${bars}</svg>`;
  }

  /* 折线图 (SVG) */
  function lineChart(data, { height = 160, color = 'var(--primary)', fill = true } = {}) {
    const max = Math.max(...data.map(d => d.value)) * 1.1, min = 0;
    const w = 100, n = data.length;
    const pts = data.map((d, i) => [i / (n - 1) * w, height - 26 - (d.value - min) / (max - min) * (height - 40)]);
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
    const area = `${path} L${w},${height - 26} L0,${height - 26} Z`;
    const labels = data.map((d, i) => `<text x="${pts[i][0]}%" y="${height - 8}" text-anchor="middle" font-size="10" fill="var(--text-3)">${esc(d.label)}</text>`).join('');
    const dots = pts.map((p, i) => `<circle cx="${p[0]}%" cy="${p[1]}" r="3" fill="#fff" stroke="${color}" stroke-width="2"></circle>`).join('');
    return `<svg width="100%" height="${height}" viewBox="0 0 100 ${height}" preserveAspectRatio="none" style="overflow:visible">
      ${fill ? `<path d="${area}" fill="${color}" opacity="0.08"></path>` : ''}
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"></path>
    </svg><svg width="100%" height="22" style="margin-top:-22px;overflow:visible">${labels}${dots}</svg>`;
  }

  /* 甜甜圈/占比 (单值环) */
  function donut(segments, { size = 120 } = {}) {
    const total = segments.reduce((s, x) => s + x.value, 0);
    const r = (size - 20) / 2, circ = 2 * Math.PI * r;
    let offset = 0;
    const arcs = segments.map(s => {
      const len = s.value / total * circ;
      const dash = `${len} ${circ - len}`;
      const el = `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="14" stroke-dasharray="${dash}" stroke-dashoffset="${-offset}"></circle>`;
      offset += len;
      return el;
    }).join('');
    return `<svg class="ring" width="${size}" height="${size}">${arcs}</svg>`;
  }

  return {
    esc, pageHead, kpi, card, badge, btn, table, entLogo, tabs, progress, scoreRing,
    timeline, alert, aiBlock, tagList, sourceRef, empty, listItem, kvGrid, stateFlow,
    steps, barChart, columnChart, lineChart, donut,
  };
})();
