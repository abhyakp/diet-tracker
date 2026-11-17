(function () {
  'use strict';

  const D = window.DIET;
  const KEY = 'dietTracker.v1';
  const DEFAULT_SETTINGS = { plan: 'B', start: '', height: 178, goal: '', kcal: 2000, protein: 130, water: 12, steps: 8000, theme: 'auto' };

  /* ---------- storage ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return {
          settings: Object.assign(clone(DEFAULT_SETTINGS), d.settings || {}),
          days: d.days && typeof d.days === 'object' ? d.days : {},
          labs: Array.isArray(d.labs) ? d.labs : []
        };
      }
    } catch (e) { /* fall through to defaults */ }
    return { settings: clone(DEFAULT_SETTINGS), days: {}, labs: [] };
  }
  let db = load();
  if (!D.plans[db.settings.plan]) db.settings.plan = DEFAULT_SETTINGS.plan;
  let storageOk = true;
  let persistAsked = false;

  function save(quiet) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      storageOk = true;
      if (!quiet) showSaved();
      if (!persistAsked && navigator.storage && navigator.storage.persist) {
        persistAsked = true;
        navigator.storage.persist().catch(() => {});
      }
    } catch (e) {
      storageOk = false;
      toast('Could not save. This browser may be blocking storage (private mode?).');
    }
  }
  let saveTimer = null;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveTimer = null; save(); }, 400); }
  function flush() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; save(true); } }

  /* ---------- dates ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const todayIso = () => iso(new Date());
  const fmtDate = (s, opts) => parse(s).toLocaleDateString(undefined, opts || { weekday: 'short', day: 'numeric', month: 'short' });
  const planIndex = (s) => (parse(s).getDay() + 6) % 7; // Monday = 0
  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isNum = (v) => typeof v === 'number' && isFinite(v);
  const fmt = (n, dp) => isNum(n) ? n.toLocaleString(undefined, { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 }) : '–';
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const signed = (n, dp) => isNum(n) ? (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), dp) : '–';
  const ICON = {
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>'
  };

  function planSeg(action, current) {
    return Object.keys(D.plans).map((k) => `<button type="button" data-action="${action}" data-p="${k}" aria-pressed="${current === k}">${esc(D.plans[k].short)}</button>`).join('');
  }

  function getDay(s) { return db.days[s] || {}; }
  function setDayField(s, k, v) {
    const day = db.days[s] || {};
    if (v === '' || v === null || v === undefined || v === false || (isNum(v) === false && typeof v === 'number')) delete day[k];
    else day[k] = v;
    if (Object.keys(day).length) db.days[s] = day; else delete db.days[s];
  }
  function weightEntries() {
    return Object.keys(db.days).sort().filter((k) => isNum(db.days[k].weight)).map((k) => ({ d: k, w: db.days[k].weight }));
  }
  function previousWeight(s) {
    const keys = Object.keys(db.days).filter((k) => k < s && isNum(db.days[k].weight)).sort();
    return keys.length ? { d: keys[keys.length - 1], w: db.days[keys[keys.length - 1]].weight } : null;
  }

  /* ---------- UI state ---------- */
  let cur = todayIso();
  let tab = 'today';
  let planView = db.settings.plan;
  let planDay = planIndex(todayIso());
  let labFormOpen = false;
  let deferredPrompt = null;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  function showSaved() {
    const el = $('#saved');
    el.textContent = 'Saved ✓';
    clearTimeout(showSaved.t);
    showSaved.t = setTimeout(() => { el.textContent = ''; }, 1600);
  }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, 3000);
  }
  function applyTheme() {
    const t = db.settings.theme;
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }

  /* ---------- shared fragments ---------- */
  function mealsList(planKey, idx, s) {
    const plan = D.plans[planKey];
    const pd = plan.days[idx];
    const day = s ? getDay(s) : null;
    const rows = D.slots.map((slot) => {
      const text = (slot.prefix || '') + pd[slot.key];
      const tick = s
        ? `<button type="button" class="tick" data-action="meal" data-k="${slot.key}" aria-pressed="${day['meal_' + slot.key] ? 'true' : 'false'}" aria-label="Ate ${esc(slot.label)} as planned">${ICON.check}</button>`
        : '';
      return `<li class="meal${s ? '' : ' plain'}">${tick}<div><div class="when">${esc(slot.label)} · ${esc(slot.time)} · ~${slot.kcal} kcal</div><div class="what">${esc(text)}</div></div></li>`;
    }).join('');
    const extra = (label, text) => `<li class="meal plain"><div><div class="when">${label}</div><div class="what">${esc(text)}</div></div></li>`;
    return `<ul class="meals">${extra('Early morning · 6:30–7:00 am', D.early)}${rows}${extra('Bedtime', D.bedtime)}</ul>`;
  }

  function installBanner() {
    if (isStandalone()) return '';
    let dismissed = false;
    try { dismissed = localStorage.getItem('dietTracker.hideInstall') === '1'; } catch (e) { /* ignore */ }
    if (dismissed) return '';
    if (deferredPrompt) {
      return `<div class="banner"><p><b>Install the app</b> on your home screen so it opens like a normal app and works offline.</p><button type="button" class="btn primary" data-action="install">Install</button><button type="button" class="linkish" data-action="hideInstall">Hide</button></div>`;
    }
    if (isIOS) {
      return `<div class="banner"><p><b>Install on iPhone:</b> tap the Share button in Safari, then <b>Add to Home Screen</b>.</p><button type="button" class="linkish" data-action="hideInstall">Hide</button></div>`;
    }
    return '';
  }

  /* ---------- TODAY ---------- */
  function renderToday() {
    const s = cur;
    const st = db.settings;
    const day = getDay(s);
    const t = todayIso();
    const dayNum = st.start ? diffDays(st.start, s) + 1 : null;
    const plan = D.plans[st.plan];
    const idx = planIndex(s);
    const water = day.water || 0;
    const label = s === t ? 'Today' : s === addDays(t, -1) ? 'Yesterday' : fmtDate(s, { weekday: 'long' });
    const sub = fmtDate(s, { day: 'numeric', month: 'long', year: 'numeric' }) + (dayNum && dayNum > 0 ? ` · Day ${dayNum}, week ${Math.ceil(dayNum / 7)}` : '');

    const setup = !st.start ? `
      <div class="card">
        <h2>Welcome</h2>
        <p class="muted">Choose your meal plan and start date. You can change both later in Settings.</p>
        <div class="seg" role="group" aria-label="Meal plan" style="margin:10px 0">
          ${planSeg('setPlan', st.plan)}
        </div>
        <button type="button" class="btn primary" style="width:100%" data-action="startToday">Start my plan today</button>
      </div>` : '';

    const bar = (k, target) => {
      const v = day[k];
      const pct = isNum(v) && target ? Math.min(100, (v / target) * 100) : 0;
      const over = k === 'kcal' && isNum(v) && v > target * 1.05;
      return `<div class="bar${over ? ' over' : ''}" data-bar="${k}"><i style="width:${pct}%"></i></div>`;
    };

    const glasses = Array.from({ length: st.water }, (_, i) =>
      `<button type="button" class="glass" data-action="water" data-i="${i}" aria-pressed="${i < water}" aria-label="Glass ${i + 1}"></button>`).join('');

    const habits = D.habits.map((h) =>
      `<button type="button" class="chip" data-action="habit" data-k="${h.key}" aria-pressed="${day['h_' + h.key] ? 'true' : 'false'}">${esc(h.label)}</button>`).join('');

    $('#view-today').innerHTML = `
      ${installBanner()}
      ${setup}
      <div class="card datebar">
        <button type="button" class="icon-btn" data-action="prevDay" aria-label="Previous day">${ICON.left}</button>
        <div class="label">
          <button type="button" class="linkish" style="text-decoration:none;color:inherit;font-size:inherit" data-action="pickDate" aria-label="Pick a date">
            <strong>${esc(label)}</strong><span class="muted small">${esc(sub)}</span>
          </button>
          <input type="date" id="dateInput" value="${s}" max="${t}" aria-label="Date">
          ${s !== t ? '<div><button type="button" class="linkish" data-action="goToday">Back to today</button></div>' : ''}
        </div>
        <button type="button" class="icon-btn" data-action="nextDay" aria-label="Next day" ${s >= t ? 'disabled' : ''}>${ICON.right}</button>
      </div>

      <div class="card">
        <div class="field big-input">
          <label for="f-weight">Morning weight (kg)</label>
          <input id="f-weight" type="number" inputmode="decimal" step="0.1" min="30" max="300" placeholder="—" data-f="weight" value="${isNum(day.weight) ? day.weight : ''}">
          <span class="hint" id="weightHint">${weightHint(s, day.weight)}</span>
        </div>
      </div>

      <div class="card">
        <div class="grid2">
          <div class="field">
            <label for="f-kcal">Calories (kcal)</label>
            <input id="f-kcal" type="number" inputmode="numeric" min="0" max="9999" placeholder="${st.kcal}" data-f="kcal" value="${isNum(day.kcal) ? day.kcal : ''}">
            ${bar('kcal', st.kcal)}
            <span class="hint">Target ${fmt(st.kcal)}</span>
          </div>
          <div class="field">
            <label for="f-protein">Protein (g)</label>
            <input id="f-protein" type="number" inputmode="numeric" min="0" max="500" placeholder="${st.protein}" data-f="protein" value="${isNum(day.protein) ? day.protein : ''}">
            ${bar('protein', st.protein)}
            <span class="hint">Target ${fmt(st.protein)}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Water</h3><span class="muted small" id="waterText">${water} / ${st.water} glasses</span></div>
        <div class="glasses">${glasses}</div>
      </div>

      <div class="card">
        <div class="grid3">
          <div class="field">
            <label for="f-steps">Steps</label>
            <input id="f-steps" type="number" inputmode="numeric" min="0" max="100000" placeholder="${st.steps}" data-f="steps" value="${isNum(day.steps) ? day.steps : ''}">
          </div>
          <div class="field">
            <label for="f-exercise">Exercise (min)</label>
            <input id="f-exercise" type="number" inputmode="numeric" min="0" max="600" placeholder="30" data-f="exercise" value="${isNum(day.exercise) ? day.exercise : ''}">
          </div>
          <div class="field">
            <label for="f-sleep">Sleep (h)</label>
            <input id="f-sleep" type="number" inputmode="decimal" step="0.5" min="0" max="24" placeholder="7" data-f="sleep" value="${isNum(day.sleep) ? day.sleep : ''}">
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Habits</h3>
        <div class="chips">${habits}</div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Meals · ${esc(WEEKDAYS_LONG[idx])}</h3><span class="muted small">${esc(plan.name)}</span></div>
        <p class="muted small" style="margin-top:0">Tick each meal you ate as planned.</p>
        ${mealsList(st.plan, idx, s)}
      </div>

      <div class="card">
        <div class="field">
          <label for="f-notes">Notes</label>
          <textarea id="f-notes" data-f="notes" placeholder="Hunger, mood, cravings, eating out…">${esc(day.notes || '')}</textarea>
        </div>
      </div>`;
  }

  function weightHint(s, w) {
    const prev = previousWeight(s);
    if (!isNum(w)) return prev ? `Last: ${fmt(prev.w, 1)} kg on ${fmtDate(prev.d)}` : 'Weigh after the toilet, before food.';
    if (!prev) return 'First entry. Nice start!';
    const d = w - prev.w;
    return `${signed(d, 1)} kg since ${fmtDate(prev.d)}. Day-to-day swings are normal; watch the weekly average.`;
  }

  /* ---------- PLAN ---------- */
  function renderPlan() {
    const plan = D.plans[planView];
    const ti = planIndex(todayIso());
    const days = WEEKDAYS.map((w, i) =>
      `<button type="button" data-action="planDay" data-i="${i}" aria-pressed="${i === planDay}" class="${i === ti ? 'today' : ''}" aria-label="${WEEKDAYS_LONG[i]}${i === ti ? ' (today)' : ''}">${w}</button>`).join('');
    const guide = D.guide.map((g, i) =>
      `<details class="guide"${i === 0 ? ' open' : ''}><summary>${esc(g.title)}</summary><ul>${g.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>`).join('');

    $('#view-plan').innerHTML = `
      <div class="card">
        <div class="seg" role="group" aria-label="Choose plan to view">
          ${planSeg('planView', planView)}
        </div>
        <p class="muted small" style="margin-top:10px">${esc(plan.summary)}</p>
        ${planView !== db.settings.plan
          ? `<button type="button" class="btn primary" style="width:100%" data-action="setPlan" data-p="${planView}">Use this plan for tracking</button>`
          : '<p class="small"><span class="badge good">Your current plan</span></p>'}
      </div>
      <div class="card">
        <div class="daychips" role="group" aria-label="Day of week">${days}</div>
      </div>
      <div class="card">
        <div class="card-head"><h2>${esc(WEEKDAYS_LONG[planDay])}</h2><span class="muted small">~2,000 kcal</span></div>
        ${mealsList(planView, planDay, null)}
        <p class="muted small" style="margin-bottom:0">${esc(plan.tip)} Swap any lunch for another lunch, or any dinner for another dinner.</p>
      </div>
      <div class="card">
        <h2 style="margin-bottom:6px">Diet rules</h2>
        ${guide}
      </div>
      <p class="muted small">General diet guidance, not medical advice. Check your blood report with a doctor, and keep taking any prescribed medicines.</p>`;
  }

  /* ---------- PROGRESS ---------- */
  function renderProgress() {
    const st = db.settings;
    const entries = weightEntries();
    const el = $('#view-progress');
    const anchor = st.start || (Object.keys(db.days).sort()[0]) || todayIso();
    const t = todayIso();

    let html = '';
    if (!entries.length) {
      html += `<div class="card empty"><h2>No weight entries yet</h2><p>Log your morning weight on the Today tab. Your chart and weekly averages will show up here.</p></div>`;
    } else {
      const startE = entries.find((e) => e.d >= anchor) || entries[0];
      const last = entries[entries.length - 1];
      const change = last.w - startE.w;
      const h = st.height / 100;
      const bmi = h ? last.w / (h * h) : null;
      const goal = parseFloat(st.goal);
      const spanDays = diffDays(startE.d, last.d);
      const rate = spanDays >= 7 ? (change / spanDays) * 7 : null;
      html += `
        <div class="card">
          <div class="stats">
            <div class="stat"><div class="k">Start (${esc(fmtDate(startE.d, { day: 'numeric', month: 'short' }))})</div><div class="v">${fmt(startE.w, 1)}<small> kg</small></div></div>
            <div class="stat"><div class="k">Latest</div><div class="v">${fmt(last.w, 1)}<small> kg</small></div></div>
            <div class="stat"><div class="k">Change</div><div class="v ${change < 0 ? 'down' : change > 0 ? 'up' : ''}">${signed(change, 1)}<small> kg</small></div></div>
            <div class="stat"><div class="k">${rate !== null ? 'Per week' : 'BMI'}</div><div class="v">${rate !== null ? signed(rate, 2) + '<small> kg</small>' : fmt(bmi, 1)}</div></div>
          </div>
          <p class="muted small" style="margin:8px 0 0">BMI ${fmt(bmi, 1)}${isNum(goal) ? ` · ${fmt(Math.max(0, last.w - goal), 1)} kg to goal (${fmt(goal, 1)} kg)` : ''} · Target pace: −0.5 kg/week</p>
        </div>
        <div class="card">
          <div class="card-head"><h3>Weight</h3><span class="muted small">last 90 days</span></div>
          ${chartSvg(entries.filter((e) => diffDays(e.d, t) <= 90), isNum(goal) ? goal : null)}
        </div>`;
    }

    html += weeklyCard(anchor, t);
    html += averagesCard(t);
    html += habitsCard(t);
    html += labsCard();
    el.innerHTML = html;
  }

  function chartSvg(points, goal) {
    if (points.length < 2) return '<p class="muted small">Log at least two days to see the chart.</p>';
    const W = 340, H = 190, pl = 34, pr = 10, pt = 10, pb = 24;
    const d0 = points[0].d;
    const xsDays = points.map((p) => diffDays(d0, p.d));
    const span = Math.max(1, xsDays[xsDays.length - 1]);
    const ws = points.map((p) => p.w);
    let min = Math.min(...ws), max = Math.max(...ws);
    if (goal !== null && goal >= min - 4) min = Math.min(min, goal);
    if (max - min < 2) { const mid = (max + min) / 2; min = mid - 1; max = mid + 1; }
    const step = niceStep((max - min) / 4);
    min = Math.floor(min / step) * step; max = Math.ceil(max / step) * step;
    const x = (dd) => pl + (dd / span) * (W - pl - pr);
    const y = (w) => pt + (1 - (w - min) / (max - min)) * (H - pt - pb);

    let grid = '';
    for (let v = min; v <= max + 1e-9; v += step) {
      grid += `<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`;
      grid += `<text class="axis-label" x="${pl - 5}" y="${(y(v) + 3).toFixed(1)}" text-anchor="end">${fmt(v, step < 1 ? 1 : 0)}</text>`;
    }
    const lastD = points[points.length - 1].d;
    const xl = (d, anchor) => `<text class="axis-label" x="${x(diffDays(d0, d)).toFixed(1)}" y="${H - 6}" text-anchor="${anchor}">${esc(fmtDate(d, { day: 'numeric', month: 'short' }))}</text>`;
    grid += xl(d0, 'start') + xl(lastD, 'end');

    const raw = points.map((p, i) => `${i ? 'L' : 'M'}${x(xsDays[i]).toFixed(1)},${y(p.w).toFixed(1)}`).join('');
    const avgPts = points.map((p, i) => {
      const win = points.filter((q) => q.d <= p.d && diffDays(q.d, p.d) <= 6).map((q) => q.w);
      return `${i ? 'L' : 'M'}${x(xsDays[i]).toFixed(1)},${y(avg(win)).toFixed(1)}`;
    }).join('');
    const dots = points.length <= 60 ? points.map((p, i) => `<circle class="dot" cx="${x(xsDays[i]).toFixed(1)}" cy="${y(p.w).toFixed(1)}" r="2.2"/>`).join('') : '';
    const goalLine = goal !== null && goal >= min && goal <= max ? `<line class="goal" x1="${pl}" x2="${W - pr}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}"/>` : '';

    const legend = `<div class="legend"><span><i style="background:var(--brand)"></i>7-day average</span><span><i style="background:var(--muted);opacity:.6"></i>Daily</span>${goalLine ? '<span><i style="background:var(--accent)"></i>Goal</span>' : ''}</div>`;
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight chart from ${esc(fmtDate(d0))} to ${esc(fmtDate(lastD))}: ${fmt(ws[0], 1)} kg to ${fmt(ws[ws.length - 1], 1)} kg">${grid}${goalLine}<path class="raw" d="${raw}"/>${dots}<path class="avg" d="${avgPts}"/></svg>${legend}`;
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }

  function weeklyCard(anchor, t) {
    const totalWeeks = Math.floor(diffDays(anchor, t) / 7) + 1;
    if (totalWeeks < 1) return '';
    const rows = [];
    let prevAvg = null;
    for (let w = 0; w < totalWeeks; w++) {
      const from = addDays(anchor, w * 7);
      const dates = Array.from({ length: 7 }, (_, i) => addDays(from, i)).filter((d) => d <= t);
      const logged = dates.filter((d) => db.days[d]);
      const weights = logged.map((d) => db.days[d].weight).filter(isNum);
      const a = avg(weights);
      const ch = isNum(a) && isNum(prevAvg) ? a - prevAvg : null;
      let badge = '<span class="muted">–</span>';
      if (dates.length < 7) badge = '<span class="muted small">In progress</span>';
      else if (isNum(ch)) {
        badge = ch <= -0.4 ? '<span class="badge good">On track</span>'
          : ch <= -0.15 ? '<span class="badge warn">A bit slow</span>'
          : '<span class="badge bad">Adjust</span>';
      }
      rows.push(`<tr><td>Week ${w + 1}<div class="muted small">${esc(fmtDate(from, { day: 'numeric', month: 'short' }))}</div></td><td>${isNum(a) ? fmt(a, 1) : '–'}</td><td>${signed(ch, 2)}</td><td>${logged.length}/${dates.length}</td><td>${badge}</td></tr>`);
      if (isNum(a)) prevAvg = a;
    }
    return `
      <div class="card">
        <div class="card-head"><h3>Weekly averages</h3><span class="muted small">from ${esc(fmtDate(anchor, { day: 'numeric', month: 'short' }))}</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Week</th><th>Avg kg</th><th>Change</th><th>Logged</th><th>Status</th></tr></thead>
          <tbody>${rows.reverse().join('')}</tbody>
        </table></div>
        <p class="muted small" style="margin-bottom:0"><b>On track</b>: lost 0.4 kg or more. <b>A bit slow</b>: check oil, rice and snacks, or add 2,000 steps. <b>Adjust</b>: cut 150–200 kcal (e.g. half the dinner rice). Do not go below ~1,600 kcal without a doctor.</p>
      </div>`;
  }

  function averagesCard(t) {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(t, -i));
    const pick = (k) => dates.map((d) => getDay(d)[k]).filter(isNum);
    const st = db.settings;
    const items = [
      ['Calories', avg(pick('kcal')), 0, `/ ${fmt(st.kcal)}`],
      ['Protein', avg(pick('protein')), 0, `g / ${st.protein}`],
      ['Water', avg(pick('water')), 1, `/ ${st.water} glasses`],
      ['Steps', avg(pick('steps')), 0, `/ ${fmt(st.steps)}`],
      ['Exercise', avg(pick('exercise')), 0, 'min'],
      ['Sleep', avg(pick('sleep')), 1, 'h']
    ];
    if (items.every((i) => i[1] === null)) return '';
    return `
      <div class="card">
        <div class="card-head"><h3>Last 7 days, daily average</h3></div>
        <div class="stats">${items.map(([k, v, dp, u]) => `<div class="stat"><div class="k">${k}</div><div class="v">${fmt(v, dp)}<small> ${esc(u)}</small></div></div>`).join('')}</div>
      </div>`;
  }

  function habitsCard(t) {
    const dates = Array.from({ length: 14 }, (_, i) => addDays(t, -i)).filter((d) => db.days[d]);
    if (!dates.length) return '';
    const rows = D.habits.map((h) => {
      const n = dates.filter((d) => db.days[d]['h_' + h.key]).length;
      if (h.key === 'strength') {
        const pct = Math.min(100, (n / 4) * 100);
        return `<div class="hbar"><span>${esc(h.label)}</span><div class="bar"><i style="width:${pct}%"></i></div><span>${n}/4</span></div>`;
      }
      const pct = Math.round((n / dates.length) * 100);
      return `<div class="hbar"><span>${esc(h.label)}</span><div class="bar"><i style="width:${pct}%"></i></div><span>${pct}%</span></div>`;
    }).join('');
    return `
      <div class="card">
        <div class="card-head"><h3>Habits, last 14 days</h3><span class="muted small">${dates.length} days logged</span></div>
        ${rows}
      </div>`;
  }

  function labsCard() {
    const labs = db.labs.slice().sort((a, b) => a.date < b.date ? -1 : 1);
    const shown = labs.slice(-3);
    let table = '<p class="muted small">Add your blood test results to compare them over time. Add your first report as the baseline, then your re-test after about 3 months.</p>';
    if (shown.length) {
      const head = shown.map((l) => `<th>${esc(fmtDate(l.date, { day: 'numeric', month: 'short', year: '2-digit' }))}</th>`).join('');
      const body = D.labs.map((f) => {
        const cells = shown.map((l) => {
          const v = l.values[f.key];
          if (!isNum(v)) return '<td class="muted">–</td>';
          const ok = f.dir === 'max' ? v < f.target || (f.key === 'sgpt' && v <= f.target) : v >= f.target;
          return `<td><span class="badge ${ok ? 'good' : 'bad'}">${fmt(v, f.key === 'hba1c' ? 1 : 0)}</span></td>`;
        }).join('');
        return `<tr><td>${esc(f.label)}<div class="muted small">${f.dir === 'max' ? '<' : '≥'} ${f.target} ${esc(f.unit)}</div></td>${cells}</tr>`;
      }).join('');
      const del = labs.map((l) => `<button type="button" class="linkish" data-action="labDelete" data-id="${esc(l.id)}">Remove ${esc(fmtDate(l.date, { day: 'numeric', month: 'short', year: 'numeric' }))}</button>`).join(' ');
      table = `<div class="table-wrap"><table><thead><tr><th>Test</th>${head}</tr></thead><tbody>${body}</tbody></table></div><p class="small" style="margin-bottom:0">${del}</p>`;
    }
    const form = labFormOpen ? `
      <form id="labForm" style="margin-top:12px;display:grid;gap:10px">
        <div class="field"><label for="lab-date">Test date</label><input id="lab-date" type="date" name="date" required max="${todayIso()}" value="${todayIso()}"></div>
        <div class="grid2">
          ${D.labs.map((f) => `<div class="field"><label for="lab-${f.key}">${esc(f.label)} (${esc(f.unit)})</label><input id="lab-${f.key}" name="${f.key}" type="number" inputmode="decimal" step="any" min="0"></div>`).join('')}
        </div>
        <div class="btn-row"><button type="submit" class="btn primary">Save result</button><button type="button" class="btn" data-action="labToggle">Cancel</button></div>
      </form>` : `<div class="btn-row" style="margin-top:10px"><button type="button" class="btn" data-action="labToggle">Add blood test result</button></div>`;
    return `
      <div class="card">
        <div class="card-head"><h3>Blood tests</h3><span class="muted small">re-test every ~3 months</span></div>
        ${table}
        ${form}
      </div>`;
  }

  /* ---------- SETTINGS ---------- */
  function renderSettings() {
    const st = db.settings;
    const num = (id, label, key, attrs, hint) => `
      <div class="field"><label for="${id}">${label}</label>
      <input id="${id}" type="number" data-s="${key}" value="${esc(st[key])}" ${attrs}>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
    let installHtml = '';
    if (isStandalone()) installHtml = '<p class="small"><span class="badge good">Installed</span> You are using the installed app.</p>';
    else if (deferredPrompt) installHtml = '<button type="button" class="btn primary" data-action="install">Install app on this device</button>';
    else if (isIOS) installHtml = '<p class="small">In Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>.</p>';
    else installHtml = '<p class="small muted">Use your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>. The site must be served over HTTPS.</p>';

    $('#view-settings').innerHTML = `
      <div class="card">
        <h2>Plan</h2>
        <div class="seg" role="group" aria-label="Meal plan" style="margin:8px 0 12px">
          ${planSeg('setPlan', st.plan)}
        </div>
        <div class="grid2">
          <div class="field"><label for="s-start">Start date</label><input id="s-start" type="date" data-s="start" value="${esc(st.start)}"></div>
          ${num('s-goal', 'Goal weight (kg)', 'goal', 'inputmode="decimal" step="0.1" min="30" max="300" placeholder="optional"')}
          ${num('s-height', 'Height (cm)', 'height', 'inputmode="numeric" min="100" max="250"', 'For BMI')}
        </div>
      </div>

      <div class="card">
        <h2>Daily targets</h2>
        <div class="grid2" style="margin-top:8px">
          ${num('s-kcal', 'Calories (kcal)', 'kcal', 'inputmode="numeric" min="1200" max="5000"')}
          ${num('s-protein', 'Protein (g)', 'protein', 'inputmode="numeric" min="20" max="300"', 'Veg ~100, non-veg ~130')}
          ${num('s-water', 'Water (glasses)', 'water', 'inputmode="numeric" min="4" max="20"')}
          ${num('s-steps', 'Steps', 'steps', 'inputmode="numeric" min="1000" max="50000"')}
        </div>
      </div>

      <div class="card">
        <h2>Appearance</h2>
        <div class="seg" role="group" aria-label="Theme" style="margin-top:8px">
          ${['auto', 'light', 'dark'].map((t) => `<button type="button" data-action="theme" data-t="${t}" aria-pressed="${st.theme === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
        </div>
      </div>

      <div class="card">
        <h2>Install</h2>
        ${installHtml}
      </div>

      <div class="card">
        <h2>Your data</h2>
        <p class="small muted">Everything is stored only on this device, in this browser. Nothing is sent to the server. Export a backup now and then, especially before changing phones or clearing browser data.</p>
        <p class="small" id="persistInfo"></p>
        <div class="btn-row">
          <button type="button" class="btn primary" data-action="exportJson">Export backup</button>
          <button type="button" class="btn" data-action="importJson">Import backup</button>
          <button type="button" class="btn" data-action="exportCsv">Export CSV (Excel)</button>
        </div>
        <input type="file" id="importFile" accept="application/json,.json" hidden>
        <div class="btn-row" style="margin-top:12px"><button type="button" class="btn danger" data-action="deleteAll">Delete all data</button></div>
      </div>

      <p class="muted small">General diet guidance, not medical advice. Check your blood report with a doctor, and keep taking any prescribed medicines.</p>`;

    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then((p) => {
        const el = $('#persistInfo');
        if (el) el.innerHTML = p ? '<span class="badge good">Protected storage</span> The browser will not clear this data automatically.' : '<span class="badge warn">Standard storage</span> Installing the app makes it less likely the browser clears your data.';
      }).catch(() => {});
    }
  }

  /* ---------- navigation ---------- */
  const VIEWS = { today: renderToday, plan: renderPlan, progress: renderProgress, settings: renderSettings };
  function show(name, push) {
    if (!VIEWS[name]) name = 'today';
    tab = name;
    Object.keys(VIEWS).forEach((k) => { $('#view-' + k).hidden = k !== name; });
    $$('.tabbar button').forEach((b) => {
      if (b.dataset.tab === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    VIEWS[name]();
    if (push && location.hash !== '#' + name) history.pushState(null, '', '#' + name);
    window.scrollTo(0, 0);
  }
  function rerender() { VIEWS[tab](); }

  /* ---------- export / import ---------- */
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportCsv() {
    const cols = ['weight', 'kcal', 'protein', 'water', 'steps', 'exercise', 'sleep'];
    const head = ['date', 'weight_kg', 'calories', 'protein_g', 'water_glasses', 'steps', 'exercise_min', 'sleep_h']
      .concat(D.habits.map((h) => h.key), D.slots.map((s) => 'ate_' + s.label.toLowerCase().replace(/\W+/g, '_')), ['notes']);
    const q = (v) => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
    const lines = Object.keys(db.days).sort().map((d) => {
      const r = db.days[d];
      return [d].concat(
        cols.map((c) => isNum(r[c]) ? r[c] : ''),
        D.habits.map((h) => r['h_' + h.key] ? 1 : 0),
        D.slots.map((s) => r['meal_' + s.key] ? 1 : 0),
        [q(r.notes || '')]
      ).join(',');
    });
    download(`diet-tracker-${todayIso()}.csv`, [head.join(',')].concat(lines).join('\n'), 'text/csv');
  }
  function importFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (!d || typeof d.days !== 'object') throw new Error('bad');
        const n = Object.keys(d.days).length;
        if (!confirm(`Replace the data on this device with the backup (${n} days logged)?`)) return;
        db = { settings: Object.assign(clone(DEFAULT_SETTINGS), d.settings || {}), days: d.days, labs: Array.isArray(d.labs) ? d.labs : [] };
        save();
        applyTheme();
        planView = db.settings.plan;
        toast(`Backup restored: ${n} days.`);
        rerender();
      } catch (e) {
        toast('That file is not a Diet Tracker backup.');
      }
    };
    reader.readAsText(file);
  }

  /* ---------- events ---------- */
  const actions = {
    prevDay() { cur = addDays(cur, -1); renderToday(); },
    nextDay() { if (cur < todayIso()) { cur = addDays(cur, 1); renderToday(); } },
    goToday() { cur = todayIso(); renderToday(); },
    pickDate() {
      const inp = $('#dateInput');
      if (inp.showPicker) { try { inp.showPicker(); return; } catch (e) { /* fall back */ } }
      inp.focus(); inp.click();
    },
    water(b) {
      const i = +b.dataset.i;
      const curW = getDay(cur).water || 0;
      const n = curW === i + 1 ? i : i + 1;
      setDayField(cur, 'water', n || '');
      save();
      $$('.glass').forEach((g, j) => g.setAttribute('aria-pressed', String(j < n)));
      $('#waterText').textContent = `${n} / ${db.settings.water} glasses`;
    },
    habit(b) { toggle(b, 'h_' + b.dataset.k); },
    meal(b) { toggle(b, 'meal_' + b.dataset.k); },
    startToday() { db.settings.start = todayIso(); save(); renderToday(); },
    setPlan(b) { db.settings.plan = b.dataset.p; planView = b.dataset.p; save(); rerender(); },
    planView(b) { planView = b.dataset.p; renderPlan(); },
    planDay(b) { planDay = +b.dataset.i; renderPlan(); },
    theme(b) { db.settings.theme = b.dataset.t; save(); applyTheme(); renderSettings(); },
    async install() {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (e) { /* ignore */ }
      deferredPrompt = null;
      rerender();
    },
    hideInstall() { try { localStorage.setItem('dietTracker.hideInstall', '1'); } catch (e) { /* ignore */ } rerender(); },
    exportJson() { download(`diet-tracker-backup-${todayIso()}.json`, JSON.stringify(Object.assign({ app: 'diet-tracker', version: 1, exported: new Date().toISOString() }, db), null, 2), 'application/json'); },
    importJson() { $('#importFile').click(); },
    exportCsv,
    deleteAll() {
      if (!confirm('Delete ALL your entries, blood tests and settings from this device? This cannot be undone. Export a backup first if you might need it.')) return;
      db = { settings: clone(DEFAULT_SETTINGS), days: {}, labs: [] };
      save(true);
      applyTheme();
      planView = db.settings.plan;
      toast('All data deleted.');
      renderSettings();
    },
    labToggle() { labFormOpen = !labFormOpen; renderProgress(); if (labFormOpen) { const f = $('#lab-date'); if (f) f.focus(); } },
    labDelete(b) {
      const l = db.labs.find((x) => x.id === b.dataset.id);
      if (!l || !confirm(`Remove the blood test from ${fmtDate(l.date, { day: 'numeric', month: 'long', year: 'numeric' })}?`)) return;
      db.labs = db.labs.filter((x) => x.id !== l.id);
      save();
      renderProgress();
    }
  };
  function toggle(b, key) {
    const on = !getDay(cur)[key];
    setDayField(cur, key, on);
    save();
    b.setAttribute('aria-pressed', String(on));
  }

  function onDayField(f) {
    const k = f.dataset.f;
    let v;
    if (f.tagName === 'TEXTAREA') v = f.value.slice(0, 2000);
    else v = f.value === '' ? '' : parseFloat(f.value);
    if (typeof v === 'number' && !isFinite(v)) return;
    setDayField(cur, k, v);
    saveSoon();
    if (k === 'weight') $('#weightHint').textContent = weightHint(cur, v === '' ? null : v);
    if (k === 'kcal' || k === 'protein') {
      const target = db.settings[k];
      const bar = $(`[data-bar="${k}"]`);
      const pct = isNum(v) && target ? Math.min(100, (v / target) * 100) : 0;
      bar.firstElementChild.style.width = pct + '%';
      bar.classList.toggle('over', k === 'kcal' && isNum(v) && v > target * 1.05);
    }
  }
  function onSetting(f) {
    const k = f.dataset.s;
    if (f.type === 'date') db.settings[k] = f.value;
    else if (k === 'goal') db.settings[k] = f.value === '' ? '' : parseFloat(f.value);
    else {
      const n = parseFloat(f.value);
      const min = parseFloat(f.min), max = parseFloat(f.max);
      if (!isFinite(n) || n < min || n > max) { toast(`Enter a number between ${min} and ${max}.`); return; }
      db.settings[k] = n;
    }
    save();
  }

  function bind() {
    const main = $('#main');
    main.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (b && actions[b.dataset.action]) { e.preventDefault(); actions[b.dataset.action](b, e); }
    });
    main.addEventListener('input', (e) => {
      const f = e.target.closest('[data-f]');
      if (f) onDayField(f);
    });
    main.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'dateInput' && t.value) { cur = t.value > todayIso() ? todayIso() : t.value; renderToday(); return; }
      if (t.id === 'importFile' && t.files && t.files[0]) { importFile(t.files[0]); t.value = ''; return; }
      if (t.dataset.s) onSetting(t);
      if (t.dataset.f) flush();
    });
    main.addEventListener('submit', (e) => {
      if (e.target.id !== 'labForm') return;
      e.preventDefault();
      const fd = new FormData(e.target);
      const values = {};
      D.labs.forEach((f) => { const v = parseFloat(fd.get(f.key)); if (isFinite(v)) values[f.key] = v; });
      if (!Object.keys(values).length) { toast('Enter at least one value.'); return; }
      db.labs.push({ id: Date.now().toString(36), date: fd.get('date') || todayIso(), values });
      labFormOpen = false;
      save();
      renderProgress();
    });

    $$('.tabbar button').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab, true)));
    window.addEventListener('hashchange', () => { const h = location.hash.slice(1) || 'today'; if (h !== tab) show(h, false); });

    // Re-render Today if the app is reopened on a new day.
    let lastDay = todayIso();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { flush(); return; }
      const t = todayIso();
      if (t !== lastDay) { if (cur === lastDay) cur = t; lastDay = t; if (tab === 'today') renderToday(); }
    });
    window.addEventListener('pagehide', flush);
    // Another tab of the app changed the data: reload it here instead of overwriting it later.
    window.addEventListener('storage', (e) => {
      if (e.key !== KEY) return;
      db = load();
      applyTheme();
      planView = db.settings.plan;
      const a = document.activeElement;
      if (!(a && a.closest && a.closest('[data-f]'))) rerender();
    });

    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (tab === 'today' || tab === 'settings') rerender(); });
    window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('App installed.'); rerender(); });
  }

  /* ---------- service worker ---------- */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) toast('App updated. Reopen it to use the new version.');
    });
  }

  /* ---------- start ---------- */
  applyTheme();
  bind();
  show(location.hash.slice(1) || 'today', false);
  registerSW();
})();
