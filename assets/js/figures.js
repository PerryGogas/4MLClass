/* =====================================================================
   4MLClass figures
   Static slide figures (drawn, no photos) and the interactive figures
   of build 1: K-Means step by step, the fruit decision tree, KNN.
   Each entry of FIGS mounts itself into the element <div data-fig="name">.
   (c) 2026 Periklis Gogas, EMEF Lab. MIT License.
   ===================================================================== */
(function () {
  'use strict';
  const MLS = window.MLS;
  const FIGS = (window.FIGS = window.FIGS || {});
  const f2 = x => MLS.fmt(x, 2), f3 = x => MLS.fmt(x, 3);

  /* ---------------------------------------------------------------
     diagram helpers: a bare plot whose units are 1 unit = 1 px wide
     --------------------------------------------------------------- */
  function diagram(host, cfg) {
    const F = MLS.figure(host, {
      title: cfg.title, sub: cfg.sub, file: cfg.file, help: cfg.help, data: cfg.data,
      plot: { bare: true, margin: { l: 0, r: 0, t: 0, b: 0 }, height: cfg.height, ariaLabel: cfg.title }
    });
    const P = F.plot;
    P.draw(() => {
      P.setX(0, P.W); P.setY(0, P.H);
      cfg.draw(P, F);
    });
    if (cfg.minWidth) { host.querySelector('.fig-plot').style.minWidth = cfg.minWidth + 'px'; host.style.overflowX = 'auto'; }
    return F;
  }
  /* y measured from the top (px) */
  const Y = (P, y) => P.H - y;
  function box(P, cx, cy, w, h, o) {
    o = o || {};
    const r = P.node('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: o.rx === undefined ? 8 : o.rx, fill: o.fill || P.C.surface, stroke: o.stroke || P.C.axis, 'stroke-width': o.sw || 1.3 }, P.overlay);
    const lines = [].concat(o.text || []);
    const fs = o.fs || 12.5, lh = fs * 1.25;
    lines.forEach((t, i) => {
      const e = P.node('text', { x: cx, y: cy - (lines.length - 1) * lh / 2 + i * lh + fs * 0.36, 'text-anchor': 'middle', 'font-size': i === 0 ? fs : fs - 1, 'font-weight': i === 0 ? 700 : 500, fill: o.color || P.C.text }, P.overlay);
      e.textContent = t;
    });
    return r;
  }
  function line(P, x1, y1, x2, y2, o) {
    o = o || {};
    return P.node('line', { x1, y1, x2, y2, stroke: o.color || P.C.muted, 'stroke-width': o.width || 1.5, 'stroke-dasharray': o.dash }, o.parent || P.overlay);
  }
  function label(P, x, y, s, o) {
    o = o || {};
    const e = P.node('text', { x, y, 'text-anchor': o.anchor || 'middle', 'font-size': o.size || 12, 'font-weight': o.weight || 700, fill: o.color || P.C.muted, 'paint-order': 'stroke', stroke: P.C.surface, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, P.overlay);
    e.textContent = s; return e;
  }
  function arrowHead(P, x1, y1, x2, y2, color) {
    const a = Math.atan2(y2 - y1, x2 - x1), s = 8;
    P.node('path', { d: 'M' + x2 + ',' + y2 + 'L' + (x2 - s * Math.cos(a - 0.45)) + ',' + (y2 - s * Math.sin(a - 0.45)) + 'L' + (x2 - s * Math.cos(a + 0.45)) + ',' + (y2 - s * Math.sin(a + 0.45)) + 'z', fill: color }, P.overlay);
  }
  function arrow(P, x1, y1, x2, y2, o) { o = o || {}; line(P, x1, y1, x2, y2, o); arrowHead(P, x1, y1, x2, y2, o.color || P.C.muted); }

  /* text width estimate (IBM Plex Sans, bold) */
  const tw = (s, fs) => String(s).length * (fs || 12.5) * 0.58;

  /* ---------------------------------------------------------------
     generic tree drawer (used by the static trees and the fruit tree)
     node: { lines:[...], kind:'q'|'leaf'|'open', fill?, stroke?, id?, kids:[{edge, node}] }
     --------------------------------------------------------------- */
  function layoutTree(root) {
    let leaf = 0, depth = 0;
    (function walk(n, d) {
      n.d = d; depth = Math.max(depth, d);
      if (!n.kids || !n.kids.length) { n.slot = leaf++; return; }
      n.kids.forEach(k => walk(k.node, d + 1));
      n.slot = (n.kids[0].node.slot + n.kids[n.kids.length - 1].node.slot) / 2;
    })(root, 0);
    return { leaves: leaf, depth };
  }
  function drawTree(P, root, o) {
    o = o || {};
    const L = layoutTree(root);
    const padX = 10, top = o.top || 34, rowH = o.rowH || 92, fs = P.W < 520 ? 11 : 12.5;
    const colW = (P.W - 2 * padX) / Math.max(1, L.leaves);
    const pos = n => ({ x: padX + colW * (n.slot + 0.5), y: top + n.d * rowH });
    const nodes = [];
    (function walk(n) {
      const p = pos(n);
      (n.kids || []).forEach(k => {
        const q = pos(k.node);
        line(P, p.x, p.y + 6 + n.lines.length * 8, q.x, q.y - 6 - k.node.lines.length * 8, { color: P.C.axis, width: 1.6 });
        const t = k.edge === 'True' || k.edge === 'Yes' || k.edge === 'YES' || k.edge === 'yes';
        label(P, (p.x + q.x) / 2 + (q.x < p.x ? -6 : 6), (p.y + q.y) / 2, k.edge, { anchor: q.x < p.x ? 'end' : 'start', size: 11.5, color: t ? MLS.css('--success') : MLS.css('--danger') });
        walk(k.node);
      });
      nodes.push({ n, p });
    })(root);
    nodes.forEach(({ n, p }) => {
      const w = Math.min(colW * (n.kids && n.kids.length ? 2 : 1) - 8, Math.max(...n.lines.map((s, i) => tw(s, i ? fs - 1 : fs))) + 18);
      const r = box(P, p.x, p.y, Math.max(w, 60), 12 + n.lines.length * fs * 1.3, { text: n.lines, fill: n.fill, stroke: n.stroke, sw: n.sel ? 3 : 1.3, fs });
      if (o.onNode) { r.style.cursor = 'pointer'; r.addEventListener('click', () => o.onNode(n)); }
    });
    return L;
  }
  function treeColors() {
    return {
      q: { fill: MLS.css('--info-bg'), stroke: MLS.css('--info-border') },
      yes: { fill: MLS.css('--tint'), stroke: MLS.css('--tint-border') },
      no: { fill: MLS.css('--warn-bg'), stroke: MLS.css('--warn-border') },
      open: { fill: MLS.css('--surface'), stroke: MLS.css('--chart-axis') }
    };
  }

  /* ================================================================
     STATIC FIGURES
     ================================================================ */

  /* slide 29: classification or regression */
  FIGS.regVsClass = function (host) {
    const r = MLS.rng(29);
    const reg = Array.from({ length: 14 }, (_, i) => { const x = 0.6 + i * 0.62; return [x, 1 + 0.85 * x + r.normal(0, 0.55)]; });
    const cls = [];
    for (let i = 0; i < 8; i++) cls.push([r.uniform(0.6, 4), r.uniform(5, 9), 0]);
    for (let i = 0; i < 8; i++) cls.push([r.uniform(5, 9.3), r.uniform(0.8, 4.3), 1]);
    diagram(host, {
      title: 'Classification or regression?', sub: 'Regression predicts a number on a continuous scale; classification predicts a class.', file: 'classification-or-regression',
      height: w => Math.round(Math.min(300, w * 0.48)),
      draw(P) {
        const half = P.W / 2, pad = 26, h = P.H - 2 * pad - 14;
        [0, 1].forEach(k => {
          const x0 = k * half + pad, x1 = (k + 1) * half - pad, y0 = P.H - pad, y1 = pad + 14;
          arrow(P, x0, y0, x1, y0, { color: P.C.axis }); arrow(P, x0, y0, x0, y1 - 6, { color: P.C.axis });
          const sx = v => x0 + (v / 10) * (x1 - x0), sy = v => y0 - (v / 10) * h;
          label(P, (x0 + x1) / 2, pad, k ? 'Classification' : 'Regression', { size: 14, color: MLS.css('--series-' + (k ? 3 : 1)) });
          if (!k) {
            line(P, sx(0.3), sy(1.25), sx(9.6), sy(9.2), { color: MLS.css('--series-2'), width: 2.5 });
            reg.forEach(p => P.node('circle', { cx: sx(p[0]), cy: sy(p[1]), r: 5, fill: 'none', stroke: MLS.css('--series-8'), 'stroke-width': 2 }, P.overlay));
          } else {
            line(P, sx(1), sy(1.3), sx(9.4), sy(9.6), { color: P.C.ink, width: 2.2, dash: '6 4' });
            cls.forEach(p => p[2] ? P.node('rect', { x: sx(p[0]) - 5, y: sy(p[1]) - 5, width: 10, height: 10, rx: 2, fill: MLS.css('--series-8') }, P.overlay)
                                  : P.node('circle', { cx: sx(p[0]), cy: sy(p[1]), r: 5.5, fill: MLS.css('--series-4') }, P.overlay));
          }
        });
      }
    });
  };

  /* slides 45 and 48: agent and environment */
  FIGS.rlLoop = function (host) {
    diagram(host, {
      title: 'Reinforcement learning: agent and environment', sub: 'The agent acts; the environment answers with a reward or a punishment and a new state.', file: 'rl-agent-environment',
      height: w => Math.round(Math.min(260, Math.max(210, w * 0.36))),
      draw(P) {
        const cx = P.W / 2, ax = Math.max(90, cx - Math.min(220, P.W * 0.3)), ex = Math.min(P.W - 90, cx + Math.min(220, P.W * 0.3)), cy = P.H / 2 + 6;
        const C = treeColors();
        box(P, ax, cy, 130, 54, { text: ['Agent', 'mouse, dog, Pong paddle'], fill: MLS.css('--warn-bg'), stroke: MLS.css('--warn-border'), fs: 13.5 });
        box(P, ex, cy, 130, 54, { text: ['Environment', 'maze, owner, game'], fill: C.q.fill, stroke: C.q.stroke, fs: 13.5 });
        const g = MLS.css('--accent');
        arrow(P, ax + 66, cy - 40, ex - 66, cy - 40, { color: g, width: 2 }); label(P, cx, cy - 48, 'actions (UP / DOWN, move, sit)', { color: g });
        arrow(P, ex - 66, cy + 14, ax + 66, cy + 14, { color: MLS.css('--success'), width: 2 }); label(P, cx, cy + 8, 'reward  or  punishment', { color: MLS.css('--success') });
        arrow(P, ex - 66, cy + 44, ax + 66, cy + 44, { color: P.C.muted, width: 1.6, dash: '5 4' }); label(P, cx, cy + 38, 'observations (new state)');
      }
    });
  };

  /* slides 81 to 84: layers */
  FIGS.annLayers = function (host) {
    diagram(host, {
      title: 'Artificial Neural Network: 3 main parts interconnected, the layers', sub: 'Every node of a layer sends its output to every node of the next layer.', file: 'ann-layers',
      height: w => Math.round(Math.min(330, Math.max(250, w * 0.45))),
      draw(P) {
        const cols = [{ n: 2, t: 'Input layer', s: 'X1, X2', c: MLS.css('--series-4') }, { n: 5, t: 'Hidden layer', s: 'activation function', c: MLS.css('--series-8') }, { n: 1, t: 'Output layer', s: 'ŷ', c: MLS.css('--series-1') }];
        const xs = [0.18, 0.5, 0.82].map(f => f * P.W), top = 40, bot = P.H - 46;
        const ys = cols.map(c => Array.from({ length: c.n }, (_, i) => c.n === 1 ? (top + bot) / 2 : top + (bot - top) * (i + 0.5) / c.n));
        for (let k = 0; k < 2; k++) ys[k].forEach(a => ys[k + 1].forEach(b => line(P, xs[k] + 14, a, xs[k + 1] - 14, b, { color: P.C.axis, width: 1 })));
        cols.forEach((c, k) => {
          ys[k].forEach(y => P.node('circle', { cx: xs[k], cy: y, r: 14, fill: MLS.rgba(c.c, 0.25), stroke: c.c, 'stroke-width': 2 }, P.overlay));
          label(P, xs[k], 22, c.t, { size: 13.5, color: P.C.text });
          label(P, xs[k], P.H - 18, c.s, { size: 12 });
        });
        label(P, (xs[0] + xs[1]) / 2, P.H - 34, 'weights w', { size: 11.5 });
        label(P, (xs[1] + xs[2]) / 2, P.H - 34, 'weights w′', { size: 11.5 });
      }
    });
  };

  /* slide 93: A/C example, y = x − 20 and ReLU(x − 20) */
  FIGS.reluAC = function (host) {
    const F = MLS.figure(host, {
      title: 'A/C power consumption and temperature', sub: 'The line y = x − 20 is wrong below 20 °C; ReLU(x − 20) = max(0, x − 20) fits both parts.', file: 'relu-ac',
      plot: { x: { domain: [0, 45], label: 'Temperature x (°C)' }, y: { domain: [-20, 26], label: 'Consumption y (€)' }, aspect: 0.56 },
      data: () => ({ cols: ['Temperature', 'y = x − 20', 'ReLU(x − 20)'], rows: Array.from({ length: 10 }, (_, i) => { const x = i * 5; return [x, x - 20, Math.max(0, x - 20)]; }) })
    });
    const P = F.plot;
    P.draw(() => {
      P.hline(0, { color: P.C.axis });
      P.fn(x => x - 20, { color: MLS.css('--series-1'), width: 2.5 });
      P.line([[0, 0], [20, 0], [45, 25]], { color: MLS.css('--series-8'), width: 3, dash: '8 5' });
      P.points([[30, 10]], { color: MLS.css('--series-8'), r: 6, tip: () => '30 °C → 30 − 20 = <b>10 €</b>' });
      P.text(30, 10, '30 °C → 10 €', { dx: 10, dy: 18, size: 12.5 });
      P.text(3, -15, 'y = x − 20 gives negative consumption here', { size: 12, color: MLS.css('--series-1') });
    });
    F.legend([{ label: 'y = x − 20 (linear)', color: MLS.css('--series-1'), line: true }, { label: 'ReLU(x − 20) = max(0, x − 20)', color: MLS.css('--series-8'), line: true, dash: '8 5' }]);
  };

  /* slide 131: will I accept a job? */
  FIGS.jobTree = function (host) {
    diagram(host, {
      title: 'Will I accept a job? A decision in steps', file: 'job-offer-tree', height: 330, minWidth: 380,
      draw(P) {
        const C = treeColors();
        const q = (t, kids) => ({ lines: [t], fill: C.q.fill, stroke: C.q.stroke, kids });
        const lf = (t, ok) => ({ lines: [t], fill: ok ? C.yes.fill : C.no.fill, stroke: ok ? C.yes.stroke : C.no.stroke });
        drawTree(P, q('Salary at least $50,000?', [
          { edge: 'yes', node: q('Commute more than 1 hour?', [
            { edge: 'yes', node: lf('Decline offer') },
            { edge: 'no', node: q('Offers free coffee?', [{ edge: 'yes', node: lf('Accept offer', true) }, { edge: 'no', node: lf('Decline offer') }]) }]) },
          { edge: 'no', node: lf('Decline offer') }]), { rowH: 88 });
      }
    });
  };

  /* slide 132: electricity theft */
  FIGS.theftTree = function (host) {
    diagram(host, {
      title: 'Automatic detection of electricity theft with AI', file: 'electricity-theft-tree', height: 330, minWidth: 380,
      draw(P) {
        const C = treeColors();
        const q = (t, kids) => ({ lines: [t], fill: C.q.fill, stroke: C.q.stroke, kids });
        const lf = (t, bad) => ({ lines: [t], fill: bad ? C.no.fill : C.yes.fill, stroke: bad ? C.no.stroke : C.yes.stroke });
        drawTree(P, q('Big drop in consumption?', [
          { edge: 'NO', node: lf('Legit') },
          { edge: 'YES', node: q('Broken seal on the meter?', [
            { edge: 'NO', node: q('Is there a bypass on the meter?', [{ edge: 'NO', node: lf('Legit') }, { edge: 'YES', node: lf('Theft', true) }]) },
            { edge: 'YES', node: lf('Theft', true) }]) }]), { rowH: 88 });
      }
    });
  };

  /* ================================================================
     INTERACTIVE 1: K-Means step by step (slides 58, 59)
     ================================================================ */
  MLS.registerHelp({
    km_data: { title: 'The data', html: '40 countries in one year: <b>GDP growth</b> and <b>inflation</b>, both in %. There are no labels (no Y): K-Means must find the groups on its own. <b>Click</b> on the chart to add a country; tick <b>Delete points</b> and click a point to remove it.' },
    km_k: { title: 'k = 2 clusters', html: 'We choose the number of clusters before we start. Here k = 2, as in the slide.' },
    km_steps: { title: 'Step by step', html: '<b>Step</b> does one action of the list. <b>Play</b> runs the actions one after the other. <b>End</b> runs to the end at once. <b>Reset</b> goes back to the same start.' },
    km_start: { title: 'New random start', html: 'The algorithm starts from 2 random points (centers). A different start can need more or fewer rounds, and with unlucky data it can even end in different clusters.' },
    km_round: { title: 'Round', html: 'One round = assign every point to the nearest center, then move each center to the average of its points.' },
    km_move: { title: 'Center movement', html: 'How far the two centers moved in the last update (sum of both distances, in % points). When it becomes 0, the centers stopped moving and the algorithm ends.' }
  });
  FIGS.kmeans = function (host) {
    const PH = ['Start with all blue.', 'Select 2 random points (centers).', 'Connect them.', 'Draw the middle perpendicular line.', 'Separates data into two classes.', 'Find the center of gravity for both classes (average).', 'Repeat until centers stop moving.'];
    /* one fixed realistic data set (seed 2026) */
    const r0 = MLS.rng(2026), base = [];
    for (let i = 0; i < 20; i++) base.push([r0.normal(1.4, 0.9), r0.normal(1.6, 0.85)]);
    for (let i = 0; i < 20; i++) base.push([r0.normal(4.9, 1.0), r0.normal(5.6, 1.1)]);
    let pts = base.map(p => p.slice()), startSeed = 7, phase = 0, round = 0, centers = null, prevCenters = null, lab = null, moved = null, finished = false, del = false;

    host.innerHTML =
      '<div class="ifig"><div class="ifig-head"><span class="badge">Interactive</span><h3>K-Means step by step (k = 2)</h3></div>' +
      '<div class="ifig-grid"><div>' +
        '<div class="card"><b>How the algorithm works</b>' + MLS.helpBtn('km_steps') + '<ol class="phase-list" id="kmPh">' + PH.map(t => '<li>' + t + '</li>').join('') + '</ol></div>' +
        '<div class="card"><div id="kmStep"></div>' +
          '<div class="btn-row" style="margin-top:8px"><button type="button" class="btn-ghost btn-small" id="kmNew">&#127922; New random start</button>' + MLS.helpBtn('km_start') + '</div>' +
          '<label class="check"><input type="checkbox" id="kmDel"> Delete points (click a point)</label>' +
          '<div class="btn-row" style="margin-top:6px"><button type="button" class="btn-ghost btn-small" id="kmData">&#8634; Original data</button>' + MLS.helpBtn('km_data') + '</div>' +
        '</div></div>' +
      '<div><div class="stat-grid" id="kmStats"></div><div id="kmFig"></div></div></div></div>';
    const $ = s => host.querySelector(s);
    const F = MLS.figure($('#kmFig'), {
      title: 'Countries: GDP growth and inflation', sub: 'Unlabelled data (no Y). Click to add a country.', file: 'kmeans-steps', help: 'km_data',
      plot: { x: { domain: [-1.5, 8.5], label: 'GDP growth (%)' }, y: { domain: [-1.5, 8.5], label: 'Inflation (%)' }, square: 0.82, onClick: click },
      data: () => ({ cols: ['Country', 'GDP growth (%)', 'Inflation (%)', 'Cluster'], rows: pts.map((p, i) => [i + 1, p[0], p[1], lab ? (lab[i] === 0 ? 'Red' : 'Blue') : 'none yet']) })
    });
    const P = F.plot;
    const red = () => MLS.css('--series-8'), blue = () => MLS.css('--series-1');

    function pickStart() {
      const r = MLS.rng(startSeed), n = pts.length;
      const a = r.int(0, n - 1); let b = r.int(0, n - 2); if (b >= a) b++;
      return [pts[a].slice(), pts[b].slice()];
    }
    function assign(c) { return pts.map(p => { const d0 = (p[0] - c[0][0]) ** 2 + (p[1] - c[0][1]) ** 2, d1 = (p[0] - c[1][0]) ** 2 + (p[1] - c[1][1]) ** 2; return d0 <= d1 ? 0 : 1; }); }
    function means(l) {
      return [0, 1].map(k => {
        const s = pts.filter((_, i) => l[i] === k);
        return s.length ? [MLS.stat.mean(s.map(p => p[0])), MLS.stat.mean(s.map(p => p[1]))] : centers[k].slice();
      });
    }
    function reset() { phase = 0; round = 0; centers = null; prevCenters = null; lab = null; moved = null; finished = false; }
    function step() {
      if (finished) return false;
      if (phase === 0) { centers = pickStart(); phase = 1; round = 1; }
      else if (phase === 1) phase = 2;
      else if (phase === 2) phase = 3;
      else if (phase === 3) { lab = assign(centers); phase = 4; }
      else if (phase === 4) {
        prevCenters = centers.map(c => c.slice());
        centers = means(lab);
        moved = Math.hypot(centers[0][0] - prevCenters[0][0], centers[0][1] - prevCenters[0][1]) + Math.hypot(centers[1][0] - prevCenters[1][0], centers[1][1] - prevCenters[1][1]);
        phase = 5;
        if (moved < 1e-9) { finished = true; phase = 6; }
      } else if (phase === 5) { round++; prevCenters = null; phase = 2; }
      return !finished;
    }
    function click(x, y) {
      if (del) {
        let bi = -1, bd = Infinity;
        pts.forEach((p, i) => { const d = Math.hypot(P.sx(p[0]) - P.sx(x), P.sy(p[1]) - P.sy(y)); if (d < bd) { bd = d; bi = i; } });
        if (bi >= 0 && bd < 14 && pts.length > 4) { pts.splice(bi, 1); reset(); upd(); }
        else if (pts.length <= 4) MLS.toast('Keep at least 4 points.');
        return;
      }
      pts.push([x, y]); reset(); upd();
    }
    /* perpendicular bisector clipped to the plot */
    function bisector(c) {
      const mx = (c[0][0] + c[1][0]) / 2, my = (c[0][1] + c[1][1]) / 2, dx = c[1][0] - c[0][0], dy = c[1][1] - c[0][1];
      const L = 40, ux = -dy, uy = dx, n = Math.hypot(ux, uy) || 1;
      return [[mx - ux / n * L, my - uy / n * L], [mx + ux / n * L, my + uy / n * L]];
    }
    function draw() {
      P.draw(() => {
        const col = (i) => (!lab || phase < 4) ? blue() : (lab[i] === 0 ? red() : blue());
        if (centers && phase >= 3 && phase !== 5) { const b = bisector(centers); P.line(b, { color: P.C.ink, width: 2, dash: '7 5' }); }
        if (centers && phase === 5 && prevCenters) { const b = bisector(prevCenters); P.line(b, { color: P.C.muted, width: 1.4, dash: '4 5', opacity: 0.6 }); }
        P.points(pts, { color: (d, i) => col(i), shape: (d, i) => (lab && phase >= 4 && lab[i] === 0) ? 'square' : 'circle', r: 5,
          tip: (d, i) => 'Country ' + (i + 1) + '<br>GDP growth ' + f2(d[0]) + '%<br>Inflation ' + f2(d[1]) + '%' + (lab && phase >= 4 ? '<br>Cluster: <b>' + (lab[i] === 0 ? 'red' : 'blue') + '</b>' : '') });
        if (centers && phase >= 2 && phase !== 5) P.line(centers, { color: MLS.css('--series-3'), width: 3 });
        if (prevCenters && phase === 5) prevCenters.forEach((c, k) => { P.points([c], { color: k ? blue() : red(), shape: 'star', r: 8, opacity: 0.35 }); P.arrow(c[0], c[1], centers[k][0], centers[k][1], { color: P.C.ink }); });
        if (centers) centers.forEach((c, k) => P.points([c], { color: k ? blue() : red(), shape: 'star', r: 10, ringColor: P.C.ink, tip: () => (k ? 'Blue' : 'Red') + ' center<br>(' + f2(c[0]) + ', ' + f2(c[1]) + ')' }));
      });
    }
    function upd() {
      MLS.$$('#kmPh li', host).forEach((li, k) => { li.classList.toggle('on', k === phase); li.classList.toggle('past', k < phase); });
      const n0 = lab ? lab.filter(v => v === 0).length : 0;
      $('#kmStats').innerHTML =
        MLS.statCard('Round', centers ? String(round) : '0', finished ? 'finished' : '', finished ? 'good' : '', 'km_round') +
        MLS.statCard('Red cluster', lab && phase >= 4 ? String(n0) : 'n/a', 'countries') +
        MLS.statCard('Blue cluster', lab && phase >= 4 ? String(pts.length - n0) : 'n/a', 'countries') +
        MLS.statCard('Center movement', moved === null ? 'n/a' : f3(moved), finished ? 'centers stopped moving' : 'last update', finished ? 'good' : '', 'km_move');
      const cap = finished ? '<b>Done.</b> The centers stopped moving after ' + round + ' round' + (round > 1 ? 's' : '') + '. Every country belongs to the cluster of its nearest center.'
        : ['All ' + pts.length + ' countries are blue: no clusters yet. Press <b>Step</b>.',
           'Two random countries become the 2 centers (stars).',
           'We connect the two centers with a line.',
           'The middle perpendicular line splits the plane: every point on one side is closer to one center.',
           'Each country takes the colour of the side it is on: two classes.',
           'Each center moves to the average (center of gravity) of its class. The arrows show the move.',
           ''][phase];
      F.caption(cap);
      F.legend([{ label: lab && phase >= 4 ? 'Red cluster' : 'Country (no cluster yet)', color: lab && phase >= 4 ? red() : blue(), shape: lab && phase >= 4 ? 'square' : 'circle' }].concat(lab && phase >= 4 ? [{ label: 'Blue cluster', color: blue() }] : []).concat(centers ? [{ label: 'Center', color: P.C.muted, shape: 'star' }] : []));
      draw(); F.refreshTable();
    }
    MLS.stepper($('#kmStep'), { step, reset, after: upd, runMax: 200, speed: 2 });
    $('#kmNew').onclick = () => { startSeed = MLS.newSeed(); reset(); upd(); };
    $('#kmDel').onchange = e => { del = e.target.checked; };
    $('#kmData').onclick = () => { pts = base.map(p => p.slice()); reset(); upd(); };
    upd();
  };

  /* ================================================================
     INTERACTIVE 2: the fruit decision tree with Gini (slides 134 to 144)
     ================================================================ */
  MLS.registerHelp({
    dt_gini: { title: 'Gini impurity', html: 'How "messy" a group is: 1 − (sum of the squared shares of each fruit). 0 = all fruits of one kind. With k kinds the maximum is 1 − 1/k (4 fruits: 0.75).' },
    dt_total: { title: 'Total Gini of the tree', html: 'The Gini of every final group, weighted by its share of the 7 fruits, added together. This is the number in the slides: 0.694 at the start, 0.400 after the first question, and so on.' },
    dt_q: { title: 'Every possible question', html: 'For the selected group we ask every possible separation question and calculate the Gini impurity after the split. We choose the question that <b>minimizes</b> it (the largest decrease). Questions with the same Gini make the same split (for example "diameter ≤ 2" and "diameter ≥ 3").' },
    dt_sel: { title: 'Select a group', html: 'Click a box in the tree to select that group of fruits. Its fruits are highlighted in the table.' }
  });
  FIGS.dtree = function (host) {
    const FR = [['Apple', 'Red', 3, 5], ['Apple', 'Green', 3, 4], ['Apple', 'Yellow', 3, 4], ['Pear', 'Green', 3, 4], ['Banana', 'Yellow', 2, 6], ['Grape', 'Green', 1, 1], ['Grape', 'Red', 1, 1]];
    const N = FR.length, COLS = { Red: '#D64545', Green: '#3BA55C', Yellow: '#E8C547' };
    const short = i => FR[i][0] + ' ' + FR[i][1][0];
    let root, selId, hist;
    function gini(idx) { const c = {}; idx.forEach(i => (c[FR[i][0]] = (c[FR[i][0]] || 0) + 1)); return 1 - Object.values(c).reduce((s, v) => s + (v / idx.length) ** 2, 0); }
    function leaves(n, out) { out = out || []; if (n.q) { leaves(n.kids[0], out); leaves(n.kids[1], out); } else out.push(n); return out; }
    const total = () => leaves(root).reduce((s, l) => s + l.idx.length / N * gini(l.idx), 0);
    let nid = 0;
    const mk = idx => ({ id: ++nid, idx, q: null, kids: null });
    function reset() { nid = 0; root = mk(FR.map((_, i) => i)); selId = root.id; hist = []; }
    function find(n, id) { if (n.id === id) return n; if (n.q) return find(n.kids[0], id) || find(n.kids[1], id); return null; }
    function questions(n) {
      const out = [], idx = n.idx;
      [['diameter', 2], ['height', 3]].forEach(([nm, c]) => {
        const vals = [...new Set(idx.map(i => FR[i][c]))].sort((a, b) => a - b);
        vals.slice(0, -1).forEach(v => out.push({ t: 'Is the ' + nm + ' ≤ ' + v + '?', f: i => FR[i][c] <= v }));
        vals.slice(1).forEach(v => out.push({ t: 'Is the ' + nm + ' ≥ ' + v + '?', f: i => FR[i][c] >= v }));
      });
      ['Green', 'Red', 'Yellow'].forEach(col => {
        const k = idx.filter(i => FR[i][1] === col).length;
        if (k > 0 && k < idx.length) out.push({ t: 'Is the fruit ' + col.toLowerCase() + '?', f: i => FR[i][1] === col });
      });
      const before = total();
      out.forEach(q => {
        q.T = idx.filter(q.f); q.F = idx.filter(i => !q.f(i));
        q.after = before - idx.length / N * gini(idx) + q.T.length / N * gini(q.T) + q.F.length / N * gini(q.F);
        q.dec = before - q.after;
      });
      return out;
    }
    function bestQ(n) { const qs = questions(n); if (!qs.length) return null; const m = Math.min(...qs.map(q => q.after)); return qs.find(q => q.after < m + 1e-12); }
    function apply(n, q) {
      const before = total();
      n.q = q.t; n.kids = [mk(q.T), mk(q.F)];
      const after = total();
      hist.push({ q: q.t, before, after });
      const nxt = leaves(root).find(l => gini(l.idx) > 1e-12 && questions(l).length);
      selId = nxt ? nxt.id : n.kids[0].id;
    }
    function growAll() { let guard = 20, l; while (guard-- && (l = leaves(root).find(x => gini(x.idx) > 1e-12 && questions(x).length))) apply(l, bestQ(l)); }
    reset();

    host.innerHTML =
      '<div class="ifig"><div class="ifig-head"><span class="badge">Interactive</span><h3>Grow the fruit decision tree with the Gini impurity</h3></div>' +
      '<div class="cols2">' +
        '<div class="card"><b>The fruits</b>' + MLS.helpBtn('dt_sel') + '<div class="tbl-wrap" style="margin-top:6px"><table class="tbl fruit-tbl" id="dtTbl"></table></div></div>' +
        '<div class="card" style="margin-top:0"><b>Total Gini of the tree</b>' + MLS.helpBtn('dt_total') + '<div class="hist" id="dtHist"></div>' +
          '<div class="btn-row" style="margin-top:8px"><button type="button" class="btn-small" id="dtBest">&#10142; Use the best question</button><button type="button" class="btn-secondary btn-small" id="dtAll">&#9197; Grow the whole tree</button><button type="button" class="btn-ghost btn-small" id="dtReset">&#8634; Reset</button></div></div>' +
      '</div><div id="dtFig" class="dt-fig" style="margin-top:10px"></div>' +
      '<div class="card" style="margin-top:10px"><b id="dtQTitle">Questions</b>' + MLS.helpBtn('dt_q') + '<div class="note" id="dtQNote"></div><div class="q-wrap"><table class="q-tbl" id="dtQ"></table></div></div>' +
      '</div>';
    const $ = s => host.querySelector(s);
    const F = diagram($('#dtFig'), {
      title: 'The decision tree', sub: 'Click a box to select a group. True goes left, False goes right.', file: 'fruit-decision-tree', help: 'dt_sel', minWidth: 600,
      height: () => 50 + 104 * (depth() + 1),
      data: () => ({ cols: ['Group', 'Fruits', 'n', 'Gini', 'Question'], rows: allNodes().map(n => [n.id, n.idx.map(short).join(', '), n.idx.length, Number(gini(n.idx).toFixed(3)), n.q || '']) }),
      draw(P) { drawTree(P, viewTree(root), { rowH: 104, top: 36, onNode: v => { selId = v.id; upd(); } }); }
    });
    function allNodes() { const out = []; (function w(n) { out.push(n); if (n.q) n.kids.forEach(w); })(root); return out; }
    function depth() { let d = 0; (function w(n, k) { d = Math.max(d, k); if (n.q) n.kids.forEach(c => w(c, k + 1)); })(root, 0); return d; }
    function viewTree(n) {
      const C = treeColors(), g = gini(n.idx), pure = g < 1e-12, canSplit = questions(n).length > 0;
      let lines, col;
      if (n.q) { lines = [n.q.replace('Is the ', '').replace('Is it ', ''), n.idx.length + ' fruits · gini = ' + f3(g)]; col = C.q; lines[0] = lines[0].charAt(0).toUpperCase() + lines[0].slice(1); }
      else if (pure) { lines = [n.idx.map(short).join(', '), 'gini = 0', '→ ' + FR[n.idx[0]][0].toUpperCase()]; col = C.yes; }
      else if (!canSplit) { lines = [n.idx.map(short).join(', '), 'gini = ' + Number(g.toFixed(3)), 'same features']; col = C.no; }
      else { lines = [counts(n.idx), n.idx.length + ' fruits · gini = ' + f3(g)]; col = C.open; }
      const v = { id: n.id, lines, fill: col.fill, stroke: n.id === selId ? MLS.css('--accent') : col.stroke, sel: n.id === selId };
      if (n.q) v.kids = [{ edge: 'True', node: viewTree(n.kids[0]) }, { edge: 'False', node: viewTree(n.kids[1]) }];
      return v;
    }
    function counts(idx) { const c = {}; idx.forEach(i => (c[FR[i][0]] = (c[FR[i][0]] || 0) + 1)); return Object.entries(c).map(([k, v]) => v + ' ' + k + (v > 1 ? 's' : '')).join(', '); }

    function upd() {
      const sel = find(root, selId) || root;
      $('#dtTbl').innerHTML = '<thead><tr><th>Tag</th><th>Color</th><th>Diameter</th><th>Height</th></tr></thead><tbody>' +
        FR.map((r, i) => '<tr class="' + (sel.idx.includes(i) ? 'in' : 'out') + '"><td>' + r[0] + '</td><td><span class="dot" style="background:' + COLS[r[1]] + '"></span>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>').join('') + '</tbody>';
      $('#dtHist').innerHTML = '<div>Start: <b>' + f3(hist.length ? hist[0].before : total()) + '</b></div>' +
        hist.map((h, k) => '<div>After Q' + (k + 1) + ': <b>' + f3(h.after) + '</b> (−' + f3(h.before - h.after) + ') <span class="note">' + h.q + '</span></div>').join('');
      const qs = questions(sel), g = gini(sel.idx);
      $('#dtQTitle').textContent = 'Questions for the selected group (' + sel.idx.length + ' fruits, gini = ' + f3(g) + ')';
      if (sel.q) { $('#dtQNote').innerHTML = 'This group is already split with: <b>' + sel.q + '</b> Click one of its groups below it.'; $('#dtQ').innerHTML = ''; }
      else if (g < 1e-12) { $('#dtQNote').innerHTML = 'Leaf node (or terminal node): all fruits are ' + FR[sel.idx[0]][0] + 's. Gini = 0, no further separation.'; $('#dtQ').innerHTML = ''; }
      else if (!qs.length) { $('#dtQNote').innerHTML = 'Further separation is not possible: ' + sel.idx.map(short).join(' and ') + ' have identical features (indistinguishable).'; $('#dtQ').innerHTML = ''; }
      else {
        const m = Math.min(...qs.map(q => q.after));
        const sorted = qs.slice().sort((a, b) => a.after - b.after);
        $('#dtQNote').innerHTML = 'Gini of the tree before: <b>' + f3(total()) + '</b>. The best question gives the lowest Gini after the split.';
        $('#dtQ').innerHTML = '<thead><tr><th>Question</th><th>True / False</th><th>Gini after</th><th>Decrease</th><th></th></tr></thead><tbody>' +
          sorted.map((q, k) => '<tr' + (q.after < m + 1e-12 ? ' class="best"' : '') + '><td>' + q.t + '</td><td>' + q.T.length + ' / ' + q.F.length + '</td><td>' + f3(q.after) + '</td><td>' + f3(q.dec) + '</td><td><button type="button" class="btn-ghost" data-q="' + qs.indexOf(q) + '">Use</button></td></tr>').join('') + '</tbody>';
        MLS.$$('#dtQ [data-q]', host).forEach(b => (b.onclick = () => { apply(sel, qs[Number(b.dataset.q)]); upd(); }));
      }
      const open = leaves(root).some(l => gini(l.idx) > 1e-12 && questions(l).length);
      $('#dtBest').disabled = !open; $('#dtAll').disabled = !open;
      F.caption(open ? 'Select a group and choose a question, or use the best question.' : '<b>Final form of the decision tree.</b> Total Gini ' + f3(total()) + ': only the identical Apple G and Pear G cannot be separated.');
      F.plot.redraw(); F.refreshTable();
    }
    $('#dtBest').onclick = () => {
      let sel = find(root, selId);
      if (!sel || sel.q || gini(sel.idx) < 1e-12 || !questions(sel).length) sel = leaves(root).find(l => gini(l.idx) > 1e-12 && questions(l).length);
      if (sel) { apply(sel, bestQ(sel)); upd(); }
    };
    $('#dtAll').onclick = () => { growAll(); upd(); };
    $('#dtReset').onclick = () => { reset(); upd(); };
    upd();
  };

  /* ================================================================
     INTERACTIVE 3: K Nearest Neighbors (slides 188 to 192)
     ================================================================ */
  MLS.registerHelp({
    knn_k: { title: 'k', html: 'The number of nearest neighbours that vote. For 2 classes choose an odd k, so there are no ties. With 3 classes, k should not be a multiple of 3.' },
    knn_data: { title: 'The examples', html: '<b>Economy</b>: months of an economy described by industrial production growth and retail sales growth (both in %), labelled growth, recession or normal. <b>Classes a and o</b>: the two-class example of slide 188.' },
    knn_q: { title: 'The new observation', html: 'Drag the gray point (or click anywhere) to move the new observation. Its class is decided by the vote of its k nearest neighbours.' },
    knn_rank: { title: 'Ranked distances', html: 'The (Euclidean) distance of the gray observation to every labelled observation, ranked from shortest to longest (ascending order). The first k vote.' }
  });
  FIGS.knn = function (host) {
    const DS = {
      econ: {
        name: 'Economy', classes: ['growth', 'recession', 'normal'], colors: ['--series-4', '--series-3', '--series-2'], shapes: ['circle', 'square', 'triangle'],
        x: 'Industrial production growth (%)', y: 'Retail sales growth (%)', dom: [-6, 8], q: [0.6, 4.6], pts: (() => {
          const r = MLS.rng(189), out = [];
          [[4.6, 4.4, 0], [-3.2, -2.6, 1], [1.2, 1.0, 2]].forEach(([mx, my, c]) => { for (let i = 0; i < 9; i++) out.push([r.normal(mx, 1.25), r.normal(my, 1.25), c]); });
          return out;
        })()
      },
      ao: {
        name: 'Classes a and o', classes: ['a', 'o'], colors: ['--series-1', '--series-2'], letters: true,
        x: 'x1', y: 'x2', dom: [0, 10], q: [5.1, 5.0], pts: (() => {
          const r = MLS.rng(188), out = [];
          for (let i = 0; i < 11; i++) out.push([r.normal(3.4, 1.3), r.normal(5.2, 1.6), 0]);
          for (let i = 0; i < 11; i++) out.push([r.normal(6.8, 1.3), r.normal(4.9, 1.6), 1]);
          return out;
        })()
      }
    };
    let ds = DS.econ, q = ds.q.slice(), k = 3;
    host.innerHTML =
      '<div class="ifig"><div class="ifig-head"><span class="badge">Interactive</span><h3>K Nearest Neighbors: rank the distances, the k nearest vote</h3></div>' +
      '<div class="ifig-grid"><div>' +
        '<div class="card"><label class="field" style="margin-top:0" for="knnDs">Example' + MLS.helpBtn('knn_data') + '</label><select id="knnDs"><option value="econ">Economy: growth, recession, normal (3 classes)</option><option value="ao">Classes a and o (2 classes)</option></select>' +
          '<div class="field-row"><label for="knnK">k (number of neighbours)' + MLS.helpBtn('knn_k') + '</label><output id="knnKv"></output></div><input type="range" id="knnK" min="1" max="15" step="1" value="3">' +
          '<div class="btn-row" style="margin-top:8px"><button type="button" class="btn-ghost btn-small" id="knnRst">&#8634; Back to the start</button>' + MLS.helpBtn('knn_q') + '</div></div>' +
      '</div><div><div class="stat-grid" id="knnStats"></div><div id="knnFig"></div>' +
        '<div class="card" style="margin-top:10px"><b>Ranked distances</b>' + MLS.helpBtn('knn_rank') + '<div class="tbl-wrap" style="max-height:300px;overflow:auto;margin-top:6px"><table class="tbl knn-tbl" id="knnTbl"></table></div></div>' +
      '</div></div></div>';
    const $ = s => host.querySelector(s);
    let F, P;
    function build() {
      $('#knnFig').innerHTML = '';
      F = MLS.figure($('#knnFig'), {
        title: ds.name, sub: 'Drag the gray point. The circle grows until exactly k observations are inside.', file: 'knn-' + MLS.slug(ds.name), help: 'knn_q',
        plot: { x: { domain: ds.dom, label: ds.x }, y: { domain: ds.dom, label: ds.y }, square: 0.82, onPointerDown: (x, y) => { q = [x, y]; upd(); return true; }, onPointerMove: (x, y) => { q = [Math.max(ds.dom[0], Math.min(ds.dom[1], x)), Math.max(ds.dom[0], Math.min(ds.dom[1], y))]; upd(); } },
        data: () => ({ cols: ['Rank', 'x1', 'x2', 'Class', 'Distance', 'Votes'], rows: ranked().map((d, i) => [i + 1, d.p[0], d.p[1], ds.classes[d.p[2]], d.d, i < k ? 'yes' : '']) })
      });
      P = F.plot;
      F.legend(ds.classes.map((c, i) => ({ label: c, color: MLS.css(ds.colors[i]), shape: ds.shapes ? ds.shapes[i] : 'circle' })).concat([{ label: 'new observation', color: '#8A8F9C' }]));
    }
    const ranked = () => ds.pts.map(p => ({ p, d: Math.hypot(p[0] - q[0], p[1] - q[1]) })).sort((a, b) => a.d - b.d);
    function vote(R) {
      const v = ds.classes.map(() => 0); R.slice(0, k).forEach(d => v[d.p[2]]++);
      const m = Math.max(...v), win = v.map((x, i) => x === m ? i : -1).filter(i => i >= 0);
      return { v, win };
    }
    function upd() {
      const R = ranked(), V = vote(R), rad = R[k - 1].d;
      $('#knnKv').textContent = k;
      const tie = V.win.length > 1, nc = ds.classes.length;
      const ruleBad = nc === 2 ? k % 2 === 0 : k % nc === 0;
      $('#knnStats').innerHTML =
        MLS.statCard('Votes', ds.classes.map((c, i) => V.v[i]).join(' / '), ds.classes.join(' / ')) +
        MLS.statCard('Classified as', tie ? 'Tie' : ds.classes[V.win[0]], tie ? 'no majority: change k' : 'majority of the ' + k + ' nearest', tie ? 'bad' : 'good') +
        MLS.statCard('Circle radius', f2(rad), 'distance of the ' + k + (k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th') + ' neighbour');
      $('#knnTbl').innerHTML = '<thead><tr><th>Rank</th><th>Class</th><th>Distance</th></tr></thead><tbody>' +
        R.map((d, i) => '<tr class="' + (i < k ? 'nn' : '') + (i === k ? ' cut' : '') + '"><td>' + (i + 1) + (i < k ? ' ✓' : '') + '</td><td><span class="dot" style="background:' + MLS.css(ds.colors[d.p[2]]) + '"></span>' + ds.classes[d.p[2]] + '</td><td>' + f2(d.d) + '</td></tr>').join('') + '</tbody>';
      F.caption((tie ? '<b>Tie:</b> ' + V.win.map(i => ds.classes[i]).join(' and ') + ' have ' + V.v[V.win[0]] + ' votes each, so there is no majority. ' : '') +
        (ruleBad ? 'k = ' + k + (nc === 2 ? ' is even: with 2 classes choose an odd k so that there are no ties.' : ' is a multiple of the ' + nc + ' classes: ties are possible.') : 'k = ' + k + ': the ' + k + ' nearest neighbours vote.'));
      P.draw(() => {
        const cx = P.sx(q[0]), cy = P.sy(q[1]), rp = rad / (P.xd[1] - P.xd[0]) * (P.W - P.m.l - P.m.r);
        P.node('circle', { cx, cy, r: rp, fill: MLS.rgba(MLS.css('--amber'), 0.16), stroke: MLS.css('--amber'), 'stroke-width': 2, 'stroke-dasharray': '6 4' });
        R.slice(0, k).forEach(d => P.segment(q[0], q[1], d.p[0], d.p[1], { color: MLS.css(ds.colors[d.p[2]]), width: 1.8 }));
        if (ds.letters) {
          ds.pts.forEach((p, i) => { const t = P.text(p[0], p[1], ds.classes[p[2]], { anchor: 'middle', dy: 5, size: 17, weight: 700, color: MLS.css(ds.colors[p[2]]) }); t.setAttribute('font-family', 'IBM Plex Mono, monospace'); });
          P.points(R.slice(0, k).map(d => d.p), { hollow: true, color: P.C.ink, r: 11 });
        } else {
          P.points(ds.pts, { color: d => MLS.css(ds.colors[d[2]]), shape: d => ds.shapes[d[2]], r: 6, highlight: d => R.slice(0, k).some(x => x.p === d), tip: d => ds.classes[d[2]] + '<br>' + ds.x + ': ' + f2(d[0]) + '<br>' + ds.y + ': ' + f2(d[1]) + '<br>Distance: <b>' + f2(Math.hypot(d[0] - q[0], d[1] - q[1])) + '</b>' });
        }
        P.points([q], { color: '#8A8F9C', r: 9, ringColor: P.C.ink });
        P.text(q[0], q[1], ds.letters ? 'c' : '?', { anchor: 'middle', dy: 4.5, size: 12, color: '#fff', halo: false });
      });
      F.refreshTable();
    }
    $('#knnDs').onchange = e => { ds = DS[e.target.value]; q = ds.q.slice(); build(); upd(); };
    $('#knnK').oninput = e => { k = Number(e.target.value); upd(); };
    $('#knnRst').onclick = () => { q = ds.q.slice(); k = 3; $('#knnK').value = 3; upd(); };
    build(); upd();
  };
  /* shared helpers for the other figure files */
  FIGS._h = { diagram, box, line, label, arrow, arrowHead, drawTree, treeColors, tw };
})();
