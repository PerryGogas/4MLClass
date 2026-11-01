/* =====================================================================
   4MLClass figures, build 2: the remaining interactive figures of
   Presentation 1 (hierarchical clustering, ANN n1 and n2, activation
   functions, gradient descent, random forest, XGBoost, SVM, kernel
   trick, SVR, ensembles).
   (c) 2026 Periklis Gogas, EMEF Lab. MIT License.
   ===================================================================== */
(function () {
  'use strict';
  const MLS = window.MLS, FIGS = window.FIGS, H = FIGS._h, ML = () => MLS.ml;
  const f2 = x => MLS.fmt(x, 2), f3 = x => MLS.fmt(x, 3), pct = x => (Number.isFinite(x) ? MLS.fmt(100 * x, 1) + '%' : 'n/a');
  const col = n => MLS.css('--series-' + n);
  const RED = () => col(8), BLUE = () => col(1), GREEN = () => col(3), AMBER = () => col(4), ORANGE = () => col(2);

  function shell(host, title, side, main, wide) {
    host.innerHTML = '<div class="ifig"><div class="ifig-head"><span class="badge">Interactive</span><h3>' + title + '</h3></div>' +
      (wide ? main : '<div class="ifig-grid"><div>' + side + '</div><div>' + main + '</div></div>') + '</div>';
    return s => host.querySelector(s);
  }
  const slider = (id, label, min, max, step, val, help) => '<div class="field-row"><label for="' + id + '">' + label + (help ? MLS.helpBtn(help) : '') + '</label><output id="' + id + 'V"></output></div><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">';
  const seg = (id, items, on) => '<div class="seg" id="' + id + '" role="group">' + items.map(([v, t]) => '<button type="button" data-v="' + v + '" aria-pressed="' + (v === on) + '">' + t + '</button>').join('') + '</div>';
  function bindSeg($, id, fn) { MLS.$$('#' + id + ' button', $('.ifig') ? $('.ifig') : document).forEach(b => (b.onclick = () => { MLS.$$('button', b.parentNode).forEach(x => x.setAttribute('aria-pressed', String(x === b))); fn(b.dataset.v); })); }
  const circle = (P, x, y, rpx, o) => P.node('circle', { cx: P.sx(x), cy: P.sy(y), r: rpx, fill: o.fill || 'none', stroke: o.stroke || 'none', 'stroke-width': o.width || 1.5, 'stroke-dasharray': o.dash, opacity: o.opacity }, o.parent);

  /* ================================================================
     1. Hierarchical clustering (slides 60 to 62)
     ================================================================ */
  MLS.registerHelp({
    hc_k: { title: 'Number of clusters', html: 'Cut the dendrogram at the number of clusters we want. Each cut leaves k groups; the dashed line shows where we cut.' },
    hc_step: { title: 'Merge step by step', html: '<b>Step</b> merges the two closest groups (here: the distance between their closest elements). <b>Reset</b> starts again with every element alone.' }
  });
  FIGS.hclust = function (host) {
    const L = ['A', 'B', 'C', 'D', 'E', 'F'];
    const X = [[1.0, 5.6], [2.4, 6.3], [3.0, 3.6], [7.2, 3.9], [6.6, 2.6], [7.2, 2.2]];
    const n = X.length, M = ML().hclust(X, 'single');
    /* closest pair of elements behind every merge (single linkage) */
    const members = {}; for (let i = 0; i < n; i++) members[i] = [i];
    M.forEach((m, s) => { members[n + s] = members[m[0]].concat(members[m[1]]); });
    const link = M.map(m => { let best = null; members[m[0]].forEach(a => members[m[1]].forEach(b => { const d = Math.hypot(X[a][0] - X[b][0], X[a][1] - X[b][1]); if (!best || d < best[2]) best = [a, b, d]; })); return best; });
    const name = id => members[id].map(i => L[i]).sort().join(', ');
    /* leaf order for the dendrogram */
    const order = []; (function w(id) { if (id < n) { order.push(id); return; } const m = M[id - n]; w(m[0]); w(m[1]); })(2 * n - 2);
    const xpos = {}; order.forEach((id, k) => (xpos[id] = k + 0.5));
    M.forEach((m, s) => (xpos[n + s] = (xpos[m[0]] + xpos[m[1]]) / 2));
    let done = 0;
    const $ = shell(host, 'Hierarchical clustering: merge the closest, then cut the dendrogram',
      '<div class="card"><b>Merge step by step</b>' + MLS.helpBtn('hc_step') +
        '<div class="btn-row" style="margin-top:8px"><button type="button" class="btn-secondary btn-small" id="hcStep">&#10142; Step</button><button type="button" class="btn-ghost btn-small" id="hcEnd">&#9197; All</button><button type="button" class="btn-ghost btn-small" id="hcReset">&#8634; Reset</button></div>' +
        slider('hcK', 'Number of clusters', 1, 6, 1, 6, 'hc_k') +
        '<ol class="phase-list" id="hcList" style="margin-top:10px"></ol></div>',
      '<div class="fig-grid"><div id="hcPts"></div><div id="hcDen"></div></div>');
    const palette = () => [col(1), col(8), col(3), col(4), col(7), col(5)];
    const Fp = MLS.figure($('#hcPts'), {
      title: 'Data: A, B, C, D, E, F', sub: 'Euclidean distance', file: 'hclust-points',
      plot: { x: { domain: [0, 8.5], label: 'x1' }, y: { domain: [1, 7.5], label: 'x2' }, aspect: 0.8 },
      data: () => ({ cols: ['Element', 'x1', 'x2', 'Cluster'], rows: X.map((p, i) => [L[i], p[0], p[1], labels()[i] + 1]) })
    });
    const Fd = MLS.figure($('#hcDen'), {
      title: 'Dendrogram', sub: 'Height = distance at which two groups merge', file: 'hclust-dendrogram',
      plot: { x: { domain: [0, n], ticks: false }, y: { domain: [0, M[n - 2][2] * 1.12], label: 'Height (distance)' }, aspect: 0.8 },
      data: () => ({ cols: ['Merge', 'Groups', 'Height'], rows: M.map((m, s) => [s + 1, name(m[0]) + ' + ' + name(m[1]), Number(m[2].toFixed(3))]) })
    });
    const labels = () => ML().hcut(M, n, n - done);
    function upd() {
      const k = n - done, lab = labels(), pal = palette();
      $('#hcK').value = k; $('#hcKV').textContent = k;
      $('#hcList').innerHTML = M.map((m, s) => '<li class="' + (s < done ? 'past' : '') + (s === done - 1 ? ' on' : '') + '">' + (s === 0 ? '1st group' : s === 1 ? '2nd group' : 'Merge') + ': ' + name(m[0]) + ' + ' + name(m[1]) + ' at ' + f2(m[2]) + '</li>').join('');
      Fp.plot.draw(P => {
        for (let s = 0; s < done; s++) { const [a, b] = link[s]; P.segment(X[a][0], X[a][1], X[b][0], X[b][1], { color: P.C.muted, width: 2, dash: '5 4' }); }
        if (done < n - 1) { const [a, b] = link[done]; P.segment(X[a][0], X[a][1], X[b][0], X[b][1], { color: MLS.css('--amber'), width: 3 }); }
        P.points(X, { color: (d, i) => (done ? pal[lab[i] % 6] : col(1)), r: 9, tip: (d, i) => L[i] + ' (' + f2(d[0]) + ', ' + f2(d[1]) + ')' });
        X.forEach((p, i) => P.text(p[0], p[1], L[i], { anchor: 'middle', dy: -14, size: 14 }));
      });
      Fp.caption(done < n - 1 ? 'Next merge (orange): <b>' + name(M[done][0]) + '</b> + <b>' + name(M[done][1]) + '</b>, the closest elements at distance ' + f2(M[done][2]) + '.' : 'All elements are included in one group.');
      Fd.plot.draw(P => {
        M.forEach((m, s) => {
          const on = s < done, c = on ? P.C.ink : P.C.axis, w = on ? 2.4 : 1.2, ha = m[0] < n ? 0 : M[m[0] - n][2], hb = m[1] < n ? 0 : M[m[1] - n][2], xa = xpos[m[0]], xb = xpos[m[1]];
          P.segment(xa, ha, xa, m[2], { color: c, width: w }); P.segment(xb, hb, xb, m[2], { color: c, width: w }); P.segment(xa, m[2], xb, m[2], { color: c, width: w });
        });
        order.forEach(id => P.text(xpos[id], 0, L[id], { anchor: 'middle', dy: 18, size: 13, color: done ? palette()[lab[id] % 6] : P.C.text }));
        if (done > 0 && done < n - 1) { const h = (M[done - 1][2] + M[done][2]) / 2; P.hline(h, { color: RED(), width: 2, dash: '7 5' }); P.text(n - 0.05, h, k + ' clusters', { anchor: 'end', dy: -6, size: 12.5, color: RED() }); }
      });
      Fd.caption(done ? 'Cut at <b>' + k + '</b> cluster' + (k > 1 ? 's' : '') + ': ' + groups(lab).join(' | ') : 'Every element is its own cluster. Press Step.');
      Fp.refreshTable(); Fd.refreshTable();
    }
    function groups(lab) { const g = {}; lab.forEach((c, i) => (g[c] = (g[c] || []).concat(L[i]))); return Object.values(g).map(a => a.join(', ')); }
    $('#hcStep').onclick = () => { if (done < n - 1) done++; upd(); };
    $('#hcEnd').onclick = () => { done = n - 1; upd(); };
    $('#hcReset').onclick = () => { done = 0; upd(); };
    $('#hcK').oninput = e => { done = n - Number(e.target.value); upd(); };
    upd();
  };

  /* ================================================================
     2. ANN: n1 and n2, combining ReLU neurons (slides 94 to 97)
     ================================================================ */
  MLS.registerHelp({
    nn_x: { title: 'Input x', html: 'Move x and see which neurons fire. A ReLU neuron is <b>off</b> (output 0) while w·x + b ≤ 0 and <b>on</b> after that.' },
    nn_tab: { title: 'The neurons', html: 'Each hidden neuron computes ReLU(x + bias). The output layer adds them with the output weights: y = Σ weight × ReLU(x + bias). Change the numbers and watch the shape change.' }
  });
  FIGS.reluMix = function (host) {
    const PRE = {
      two: { t: '2 neurons (slides 95, 96)', N: [{ b: -2, w: 1 }, { b: -4, w: -1 }] },
      five: { t: '5 ReLU neurons (slide 97)', N: [{ b: -1, w: 1 }, { b: -2, w: -1 }, { b: -3, w: -2 }, { b: -4, w: 3 }, { b: -5, w: -1 }] }
    };
    let pre = 'two', N = PRE.two.N.map(o => Object.assign({}, o)), x = 3;
    const $ = shell(host, 'Creating complex non-linearity with ReLU neurons',
      '<div class="card">' + seg('nnPre', [['two', '2 neurons'], ['five', '5 neurons']], 'two') +
        slider('nnX', 'Input x', 0, 7, 0.05, 3, 'nn_x') +
        '<div style="margin-top:10px"><b>Hidden neurons</b>' + MLS.helpBtn('nn_tab') + '<table class="q-tbl" id="nnTab" style="margin-top:4px"></table></div></div>',
      '<div class="stat-grid" id="nnStats"></div><div id="nnFig"></div>');
    const F = MLS.figure($('#nnFig'), {
      title: 'Hidden layer outputs and the final output', file: 'relu-combination',
      plot: { x: { domain: [0, 7], label: 'Input (x)' }, y: { domain: [-3, 5], label: 'Activation output' }, aspect: 0.6 },
      data: () => ({ cols: ['x'].concat(N.map((_, k) => 'n' + (k + 1)), ['Output']), rows: Array.from({ length: 29 }, (_, i) => { const v = i * 0.25; return [v].concat(N.map(o => o.w * relu(v + o.b)), [out(v)]); }) })
    });
    const relu = z => (z > 0 ? z : 0), out = v => N.reduce((s, o) => s + o.w * relu(v + o.b), 0);
    function table() {
      $('#nnTab').innerHTML = '<thead><tr><th>Neuron</th><th>Bias</th><th>Output weight</th></tr></thead><tbody>' +
        N.map((o, k) => '<tr><td style="color:' + col(1 + (k % 7)) + '">n' + (k + 1) + '</td><td><input type="number" step="0.5" value="' + o.b + '" data-k="' + k + '" data-f="b" style="width:70px"></td><td><input type="number" step="0.5" value="' + o.w + '" data-k="' + k + '" data-f="w" style="width:70px"></td></tr>').join('') + '</tbody>';
      MLS.$$('#nnTab input', host).forEach(inp => (inp.oninput = () => { const v = Number(inp.value); if (Number.isFinite(v)) { N[inp.dataset.k][inp.dataset.f] = v; upd(); } }));
    }
    function upd() {
      $('#nnXV').textContent = f2(x);
      const st = N.map(o => x + o.b > 0);
      $('#nnStats').innerHTML = N.map((o, k) => MLS.statCard('n' + (k + 1), st[k] ? 'on' : 'off', 'ReLU(' + f2(x) + (o.b < 0 ? ' − ' + f2(-o.b) : ' + ' + f2(o.b)) + ') = ' + f2(relu(x + o.b)), st[k] ? 'good' : '')).join('') + MLS.statCard('Output y', f2(out(x)), 'Σ weight × neuron');
      F.plot.draw(P => {
        N.forEach((o, k) => P.fn(v => o.w * relu(v + o.b), { color: col(1 + (k % 7)), width: 1.6, dash: '6 4' }));
        P.fn(out, { color: RED(), width: 3.5, samples: 400 });
        P.vline(x, { color: P.C.muted, dash: '3 3' });
        P.points([[x, out(x)]], { color: RED(), r: 7, ringColor: P.C.ink });
      });
      F.legend(N.map((o, k) => ({ label: 'n' + (k + 1) + ': ' + (o.w >= 0 ? '' : '−') + (Math.abs(o.w) === 1 ? '' : f2(Math.abs(o.w)) + '·') + 'ReLU(x ' + (o.b < 0 ? '− ' + f2(-o.b) : '+ ' + f2(o.b)) + ')', color: col(1 + (k % 7)), line: true, dash: '6 4' })).concat([{ label: 'Final output', color: RED(), line: true, width: 3.5 }]));
      const on = st.filter(Boolean).length;
      F.caption(pre === 'two' ? (x < 2 ? '<b>Segment 1 (x &lt; 2):</b> both neurons are off → output = 0 (flat).' : x < 4 ? '<b>Segment 2 (2 &lt; x &lt; 4):</b> only n1 is on → output rises with slope 1.' : '<b>Segment 3 (x &gt; 4):</b> n2 also turns on; its slope (−1) cancels n1’s slope (+1) → flat again.') + ' (With the slide numbers.)'
        : on + ' of ' + N.length + ' neurons are on at x = ' + f2(x) + '. Every neuron that turns on adds a bend ("hinge") to the output.');
      F.refreshTable();
    }
    bindSeg($, 'nnPre', v => { pre = v; N = PRE[v].N.map(o => Object.assign({}, o)); table(); upd(); });
    $('#nnX').oninput = e => { x = Number(e.target.value); upd(); };
    table(); upd();
  };

  /* ================================================================
     3. Activation functions (slide 99)
     ================================================================ */
  MLS.registerHelp({ af_z: { title: 'Input z', html: 'The number that arrives at the neuron: w·x + b. Each activation function turns it into the neuron’s output y.' } });
  FIGS.activations = function (host) {
    const A = [
      { id: 'sig', t: 'Sigmoid', f: z => 1 / (1 + Math.exp(-z)), d: 'Constrains to [0, 1]', c: 1 },
      { id: 'tanh', t: 'tanh', f: z => Math.tanh(z), d: 'Constrains to [−1, 1], centered at 0', c: 7 },
      { id: 'relu', t: 'ReLU', f: z => Math.max(0, z), d: 'Eliminates negative values', c: 8 },
      { id: 'leaky', t: 'Leaky ReLU', f: z => Math.max(0.1 * z, z), d: 'Weakens negative values', c: 4 },
      { id: 'elu', t: 'ELU (α = 1)', f: z => (z >= 0 ? z : Math.exp(z) - 1), d: 'Limits negative values to −α', c: 3 }
    ];
    const on = { sig: true, tanh: true, relu: true, leaky: false, elu: false };
    let z = -1;
    const $ = shell(host, 'Activation functions: what they do to y',
      '<div class="card">' + A.map(a => '<label class="check"><input type="checkbox" data-a="' + a.id + '"' + (on[a.id] ? ' checked' : '') + '><span style="color:' + col(a.c) + ';font-weight:700">' + a.t + '</span></label>').join('') +
        slider('afZ', 'Input z', -6, 6, 0.1, -1, 'af_z') + '<table class="q-tbl" id="afTab" style="margin-top:8px"></table></div>',
      '<div id="afFig"></div>');
    const F = MLS.figure($('#afFig'), {
      title: 'Activation functions', file: 'activation-functions',
      plot: { x: { domain: [-6, 6], label: 'Input z' }, y: { domain: [-1.5, 3], label: 'Output y' }, aspect: 0.62 },
      data: () => ({ cols: ['z'].concat(A.map(a => a.t)), rows: Array.from({ length: 25 }, (_, i) => { const v = -6 + i * 0.5; return [v].concat(A.map(a => Number(a.f(v).toFixed(4)))); }) })
    });
    function upd() {
      $('#afZV').textContent = f2(z);
      $('#afTab').innerHTML = '<thead><tr><th>Function</th><th>y at z = ' + f2(z) + '</th></tr></thead><tbody>' + A.filter(a => on[a.id]).map(a => '<tr><td>' + a.t + '<div class="note" style="margin:0">' + a.d + '</div></td><td>' + f3(a.f(z)) + '</td></tr>').join('') + '</tbody>';
      F.plot.draw(P => {
        P.hline(0, { color: P.C.axis }); P.vline(0, { color: P.C.axis }); P.hline(1, { color: P.C.grid, dash: '3 3' }); P.hline(-1, { color: P.C.grid, dash: '3 3' });
        A.filter(a => on[a.id]).forEach(a => { P.fn(a.f, { color: col(a.c), width: 2.6, samples: 300 }); P.points([[z, a.f(z)]], { color: col(a.c), r: 6 }); });
        P.vline(z, { color: P.C.muted, dash: '4 4' });
      });
      F.legend(A.filter(a => on[a.id]).map(a => ({ label: a.t, color: col(a.c), line: true })));
      F.caption(z < 0 ? 'A negative input: ReLU gives 0 (the neuron does not fire), Leaky ReLU keeps a small part, sigmoid stays between 0 and 1.' : 'A positive input: ReLU fires as strong as z; sigmoid and tanh flatten out near 1.');
      F.refreshTable();
    }
    MLS.$$('[data-a]', host).forEach(c => (c.onchange = () => { on[c.dataset.a] = c.checked; upd(); }));
    $('#afZ').oninput = e => { z = Number(e.target.value); upd(); };
    upd();
  };

  /* ================================================================
     4. Gradient descent: local and global minima (slides 101 to 106)
     ================================================================ */
  MLS.registerHelp({
    gd_eta: { title: 'Learning rate (step size)', html: 'How big a step we take: new θ = θ − learning rate × slope. Too small: we get trapped in the nearest (local) minimum. Larger: we can jump over the hill to the global minimum. Too large: we jump around.' },
    gd_start: { title: 'Initial weight', html: 'The weights are chosen randomly at first. Here you choose where the search starts. In the 2-weights view, click on the map.' },
    gd_mode: { title: '1 or 2 weights', html: 'With 1 weight the error is a curve. With 2 weights it is a surface (a landscape): we navigate down to the lowest point.' }
  });
  FIGS.gradDescent = function (host) {
    const L1 = t => 0.12 * (t - 3) ** 2 * (t - 6.2) ** 2 - 0.5 * t + 6;
    const d1 = t => (L1(t + 1e-5) - L1(t - 1e-5)) / 2e-5;
    const L2 = (a, b) => 3 - 2.4 * Math.exp(-((a - 6.2) ** 2 + (b - 6) ** 2) / 3.2) - 1.3 * Math.exp(-((a - 2.6) ** 2 + (b - 3) ** 2) / 1.6) + 0.035 * ((a - 4.5) ** 2 + (b - 4.5) ** 2);
    const g2 = (a, b) => [(L2(a + 1e-5, b) - L2(a - 1e-5, b)) / 2e-5, (L2(a, b + 1e-5) - L2(a, b - 1e-5)) / 2e-5];
    let mode = '1', eta = 0.1, t0 = 2, path = [t0], s0 = [1.4, 1.6], path2 = [s0.slice()];
    const $ = shell(host, 'Gradient descent: find the minimum of the error',
      '<div class="card">' + seg('gdMode', [['1', '1 weight'], ['2', '2 weights']], '1') + MLS.helpBtn('gd_mode') +
        slider('gdEta', 'Learning rate', 0.02, 0.6, 0.02, 0.1, 'gd_eta') + '<div id="gdStartRow">' + slider('gdT0', 'Initial weight θ', 1.2, 8, 0.1, 2, 'gd_start') + '</div>' +
        '<div class="btn-row" style="margin-top:6px"><button type="button" class="btn-ghost btn-small" id="gdA">η = 0.1 (2 → 3)</button><button type="button" class="btn-ghost btn-small" id="gdB">η = 0.4 (2 → 6)</button></div>' +
        '<div id="gdStep" style="margin-top:10px"></div></div>',
      '<div class="stat-grid" id="gdStats"></div><div id="gdFig"></div>');
    let F = null;
    function build() {
      $('#gdFig').innerHTML = '';
      if (mode === '1') F = MLS.figure($('#gdFig'), {
        title: 'Local and global minima', sub: 'Error (loss) as we change one weight θ', file: 'gradient-descent-1',
        plot: { x: { domain: [1, 8], label: 'Weight θ' }, y: { domain: [2, 12], label: 'Error (loss)' }, aspect: 0.6 },
        data: () => ({ cols: ['Step', 'θ', 'Error', 'Slope'], rows: path.map((t, i) => [i, t, L1(t), d1(t)]) })
      });
      else F = MLS.figure($('#gdFig'), {
        title: 'The loss landscape with 2 weights', sub: 'Dark = high error. Click to choose the starting point.', file: 'gradient-descent-2',
        plot: { x: { domain: [0, 9], label: 'Weight w1' }, y: { domain: [0, 9], label: 'Weight w2' }, square: 0.82, onClick: (a, b) => { s0 = [a, b]; path2 = [s0.slice()]; upd(); } },
        data: () => ({ cols: ['Step', 'w1', 'w2', 'Error'], rows: path2.map((p, i) => [i, p[0], p[1], L2(p[0], p[1])]) })
      });
      $('#gdStartRow').hidden = mode === '2'; $('#gdA').parentNode.hidden = mode === '2';
    }
    const cur = () => (mode === '1' ? path[path.length - 1] : path2[path2.length - 1]);
    function step() {
      if (mode === '1') { const t = cur(), nt = Math.max(1, Math.min(8, t - eta * d1(t))); path.push(nt); return Math.abs(nt - t) > 1e-4 && path.length < 300; }
      const p = cur(), g = g2(p[0], p[1]), e2 = eta * 1.5, np = [Math.max(0, Math.min(9, p[0] - e2 * g[0])), Math.max(0, Math.min(9, p[1] - e2 * g[1]))];
      path2.push(np); return Math.hypot(np[0] - p[0], np[1] - p[1]) > 1e-4 && path2.length < 300;
    }
    function reset() { path = [t0]; path2 = [s0.slice()]; }
    let grid = null;
    function upd() {
      $('#gdEtaV').textContent = f2(eta); $('#gdT0V').textContent = f2(t0);
      if (mode === '1') {
        const t = cur(), s = d1(t), glob = Math.abs(t - 6.38) < 0.3, loc = Math.abs(t - 3.27) < 0.3 && Math.abs(s) < 0.05;
        $('#gdStats').innerHTML = MLS.statCard('Step', String(path.length - 1)) + MLS.statCard('θ', f2(t)) + MLS.statCard('Error', f3(L1(t))) + MLS.statCard('Slope (derivative)', f3(s), s > 0 ? 'positive → decrease θ' : s < 0 ? 'negative → increase θ' : 'zero → stop', glob ? 'good' : loc ? 'bad' : '');
        F.plot.draw(P => {
          P.fn(L1, { color: col(1), width: 3, samples: 300 });
          const sl = d1(t); P.line([[t - 0.8, L1(t) - 0.8 * sl], [t + 0.8, L1(t) + 0.8 * sl]], { color: AMBER(), width: 2.2 });
          for (let i = 1; i < path.length; i++) P.arrow(path[i - 1], L1(path[i - 1]), path[i], L1(path[i]), { color: RED(), width: 1.4, head: 6 });
          P.points(path.map(v => [v, L1(v)]), { color: RED(), r: 3.5, ring: false });
          P.points([[t, L1(t)]], { color: RED(), r: 8, ringColor: P.C.ink, tip: () => 'θ = ' + f2(t) + '<br>Error = ' + f3(L1(t)) });
          P.text(3.27, L1(3.27), 'local minimum', { anchor: 'middle', dy: 22, size: 12, color: P.C.muted });
          P.text(6.38, L1(6.38), 'global minimum', { anchor: 'middle', dy: 22, size: 12, color: P.C.muted });
        });
        F.caption(loc ? '<b>Trapped</b> in the local minimum near θ = 3: the slope is zero, so the steps stop. Try a larger learning rate.' : glob && Math.abs(s) < 0.05 ? '<b>Global minimum</b> near θ = 6: the lowest error.' : 'The orange line is the slope. If the derivative is positive (θ↑ → e↑) we decrease θ; if negative we increase θ.');
      } else {
        const p = cur(), e = L2(p[0], p[1]), glob = Math.hypot(p[0] - 6.1, p[1] - 5.9) < 0.6, loc = Math.hypot(p[0] - 2.75, p[1] - 3.1) < 0.6;
        $('#gdStats').innerHTML = MLS.statCard('Step', String(path2.length - 1)) + MLS.statCard('w1, w2', f2(p[0]) + ', ' + f2(p[1])) + MLS.statCard('Error', f3(e), glob ? 'global minimum' : loc ? 'local minimum' : '', glob ? 'good' : loc ? 'bad' : '');
        if (!grid) {
          const xs = Array.from({ length: 91 }, (_, i) => i * 0.1), V = xs.map(b => xs.map(a => L2(a, b)));
          const mn = Math.min(...V.flat()), mx = Math.max(...V.flat()), sc = MLS.lossScale();
          grid = { xs, V, url: MLS.gridImage(V, v => sc((v - mn) / (mx - mn))), levels: Array.from({ length: 10 }, (_, i) => mn + (mx - mn) * (i + 0.5) / 10) };
        }
        F.plot.draw(P => {
          P.image(grid.url, 0, 9, 0, 9, { smooth: true });
          P.contour(grid.V, grid.xs, grid.xs, grid.levels, { color: '#ffffff', opacity: 0.45 });
          P.line(path2, { color: RED(), width: 2.4 });
          P.points([path2[0]], { color: '#ffffff', r: 6, ringColor: P.C.ink });
          P.points([p], { color: RED(), r: 8, ringColor: '#ffffff' });
          P.text(6.2, 6, 'global', { anchor: 'middle', dy: 26, size: 12, color: '#ffffff', halo: false });
          P.text(2.6, 3, 'local', { anchor: 'middle', dy: 24, size: 12, color: '#ffffff', halo: false });
        });
        F.caption('We change the 2 weights together, always downhill (against the gradient). ' + (loc ? '<b>Trapped in the local minimum.</b> Real networks need a dense search for the global minimum: training time ↑.' : glob ? '<b>Global minimum reached.</b>' : 'Click the map to start somewhere else.'));
      }
      F.refreshTable();
    }
    const stp = MLS.stepper($('#gdStep'), { step, reset, after: upd, runMax: 300, speed: 6 });
    bindSeg($, 'gdMode', v => { stp.stop(); mode = v; build(); reset(); upd(); });
    $('#gdEta').oninput = e => { eta = Number(e.target.value); reset(); upd(); };
    $('#gdT0').oninput = e => { t0 = Number(e.target.value); reset(); upd(); };
    $('#gdA').onclick = () => { eta = 0.1; t0 = 2; $('#gdEta').value = 0.1; $('#gdT0').value = 2; reset(); upd(); };
    $('#gdB').onclick = () => { eta = 0.4; t0 = 2; $('#gdEta').value = 0.4; $('#gdT0').value = 2; reset(); upd(); };
    build(); upd();
  };

  /* ================================================================
     5. Random forest: bootstrap samples, trees, vote (slides 147 to 151)
     ================================================================ */
  MLS.registerHelp({
    rf_boot: { title: 'Bootstrapping', html: 'Sampling with replacement: we draw n times from the sample of size n. The same observation can be selected more than once, and some observations are not selected at all.' },
    rf_trees: { title: 'Number of trees', html: 'Each tree is grown on its own bootstrapped sample, trying one randomly chosen variable at each split (k = √j, here √2 → 1). With 1 tree you see a single decision tree; with many trees the forest votes.' },
    rf_new: { title: 'A new bank', html: 'Click on the chart to place a new bank. Every tree votes failed or healthy; the majority decides.' }
  });
  FIGS.forest = function (host) {
    const r0 = MLS.rng(147), LET = 'ABCDE';
    let boot = [];
    const draw3 = () => { boot = [0, 1, 2].map(() => Array.from({ length: 5 }, () => r0.int(0, 4))); };
    draw3();
    const D = ML().DATA.banks.gen(ML().rng(2018), 90), X = D.X, y = D.y, n = X.length;
    const tr = ML().rng(151), trees = [];
    for (let t = 0; t < 60; t++) { const rows = Array.from({ length: n }, () => Math.floor(tr.random() * n)); trees.push(ML().buildTree(X, y, rows, { K: 2, maxDepth: 6, maxFeatures: 1 }, 0, tr)); }
    let m = 25, q = [5.2, 10.6];
    const vote = (x, k) => { let f = 0; for (let t = 0; t < k; t++) { const v = ML().treeLeaf(trees[t], x).value; if (v[1] > v[0]) f++; } return f; };
    const $ = shell(host, 'Random forests: bootstrap samples, many trees, one vote',
      '<div class="card"><b>Bootstrapping</b>' + MLS.helpBtn('rf_boot') + '<div class="note">Initial sample of size 5. Create 3 new samples of size 5, random selection with replacement.</div><div id="rfBoot" style="margin-top:6px"></div><button type="button" class="btn-ghost btn-small" id="rfDraw" style="margin-top:6px">&#127922; Draw 3 new samples</button></div>' +
      '<div class="card">' + slider('rfM', 'Number of trees', 1, 60, 1, 25, 'rf_trees') + '<div class="note">Click on the chart to place a new bank.' + MLS.helpBtn('rf_new') + '</div></div>',
      '<div class="stat-grid" id="rfStats"></div><div id="rfFig"></div>');
    const F = MLS.figure($('#rfFig'), {
      title: 'Bank failures: the forest votes', sub: 'Background: share of trees that vote "failed"', file: 'random-forest-vote',
      plot: { x: { domain: [0, 11], label: D.names[0] }, y: { domain: [2, 22], label: D.names[1] }, aspect: 0.72, onClick: (a, b) => { q = [a, b]; upd(); } },
      data: () => ({ cols: ['Tree', 'Vote for the new bank'], rows: trees.slice(0, m).map((t, i) => { const v = ML().treeLeaf(t, q).value; return [i + 1, v[1] > v[0] ? 'Failed' : 'Healthy']; }) })
    });
    let cache = {};
    function bg(k) {
      if (cache[k]) return cache[k];
      const nx = 66, ny = 60, V = [];
      for (let j = 0; j < ny; j++) { const row = []; for (let i = 0; i < nx; i++) row.push(vote([(i + 0.5) * 11 / nx, 2 + (j + 0.5) * 20 / ny], k) / k); V.push(row); }
      const a = MLS.hexToRgb(BLUE()), b = MLS.hexToRgb(RED());
      return (cache[k] = MLS.gridImage(V, v => [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v, a[2] + (b[2] - a[2]) * v, 70]));
    }
    document.addEventListener('mls:theme', () => { cache = {}; });
    function upd() {
      $('#rfMV').textContent = m;
      $('#rfBoot').innerHTML = '<div class="flow" style="margin-bottom:6px"><span>' + LET.split('').join(' ') + '</span></div>' + boot.map((s, k) => {
        const cnt = {}; s.forEach(v => (cnt[v] = (cnt[v] || 0) + 1));
        const miss = [0, 1, 2, 3, 4].filter(v => !cnt[v]).map(v => LET[v]);
        return '<div style="font-size:13.5px;margin-top:4px"><b>Sample ' + (k + 1) + ':</b> <span class="mono">' + s.map(v => cnt[v] > 1 ? '<b style="color:' + RED() + '">' + LET[v] + '</b>' : LET[v]).join(' ') + '</span> <span class="note">not selected: ' + (miss.join(', ') || 'none') + '</span></div>';
      }).join('') + '<div class="note">Red letters were selected more than once.</div>';
      const f = vote(q, m), h = m - f, fail = f > h, tie = f === h;
      $('#rfStats').innerHTML = MLS.statCard('Trees', String(m)) + MLS.statCard('Votes', f + ' / ' + h, 'failed / healthy') + MLS.statCard('Forest decision', tie ? 'Tie' : fail ? 'Failed' : 'Healthy', 'the majority', tie ? '' : fail ? 'bad' : 'good');
      F.plot.draw(P => {
        P.image(bg(m), 0, 11, 2, 22, { smooth: false });
        P.points(X, { color: (d, i) => (y[i] ? RED() : BLUE()), shape: (d, i) => (y[i] ? 'square' : 'circle'), r: 4.5, tip: (d, i) => (y[i] ? 'Failed' : 'Healthy') + ' bank<br>' + D.names[0] + ': ' + f2(d[0]) + '<br>' + D.names[1] + ': ' + f2(d[1]) });
        P.points([q], { color: '#8A8F9C', r: 9, ringColor: P.C.ink }); P.text(q[0], q[1], '?', { anchor: 'middle', dy: 4.5, size: 12, color: '#fff', halo: false });
      });
      F.legend([{ label: 'Healthy', color: BLUE() }, { label: 'Failed', color: RED(), shape: 'square' }, { label: 'New bank', color: '#8A8F9C' }]);
      F.caption(m === 1 ? 'One tree: its regions follow the training data closely (it tends to overfit).' : 'Each of the ' + m + ' trees votes; the forest decides democratically: the majority.');
      F.refreshTable();
    }
    $('#rfDraw').onclick = () => { draw3(); upd(); };
    $('#rfM').oninput = MLS.debounce(e => { m = Number(e.target.value); upd(); }, 30);
    $('#rfM').addEventListener('input', e => { $('#rfMV').textContent = e.target.value; });
    upd();
  };

  /* ================================================================
     6. XGBoost: start at 0.5, each tree corrects the errors (slides 155, 156)
     ================================================================ */
  MLS.registerHelp({
    xg_eta: { title: 'Learning rate η', html: 'Each new tree is added with a small weight η, so that we do not blindly trust every new tree. Small η: many small corrections. Large η: big jumps.' },
    xg_err: { title: 'The errors', html: 'For every bank: actual (1 = failed, 0 = healthy) minus predicted probability. The next tree is built to predict these errors (the gradients) and corrects them.' }
  });
  FIGS.xgboost = function (host) {
    const r = MLS.rng(158), X = [], y = [];
    for (let i = 0; i < 36; i++) { const x = r.uniform(0.5, 10); const p = 1 / (1 + Math.exp(-0.75 * (x - 5.5))); X.push([Number(x.toFixed(2))]); y.push(r.random() < p ? 1 : 0); }
    let eta = 0.3, trees = [], Fv = new Array(X.length).fill(0);
    const sig = z => 1 / (1 + Math.exp(-z)), rows = X.map((_, i) => i);
    const predF = x => trees.reduce((s, t) => s + eta * ML().xgbOut(t, [x]), 0);
    function step() {
      const p = Fv.map(sig), g = p.map((v, i) => v - y[i]), h = p.map(v => Math.max(v * (1 - v), 1e-9));
      const t = ML().xgbTree(X, g, h, rows, { maxDepth: 2, lambda: 1 }, 0); trees.push(t);
      for (let i = 0; i < X.length; i++) Fv[i] += eta * ML().xgbOut(t, X[i]);
      return trees.length < 60;
    }
    function reset() { trees = []; Fv = new Array(X.length).fill(0); }
    const $ = shell(host, 'XGBoost: start at 0.5, then every new tree corrects the errors',
      '<div class="card">' + slider('xgEta', 'Learning rate η', 0.05, 1, 0.05, 0.3, 'xg_eta') + '<div id="xgStep" style="margin-top:10px"></div>' +
      '<ol class="phase-list" style="margin-top:10px"><li>Initialization: 0.5 for all observations.</li><li>Gradient calculation: how wrong is each prediction.</li><li>Training a new tree on these gradients.</li><li>Add to set with learning rate η.</li><li>Iteration until the error no longer decreases.</li></ol></div>',
      '<div class="stat-grid" id="xgStats"></div><div class="fig-grid"><div id="xgFig"></div><div id="xgErr"></div></div>');
    const F = MLS.figure($('#xgFig'), {
      title: 'Predicted probability of failure', sub: 'Banks: 1 = failed, 0 = healthy', file: 'xgboost-probability',
      plot: { x: { domain: [0, 10.5], label: 'Debt-to-equity ratio' }, y: { domain: [-0.08, 1.08], label: 'Probability of failure' }, aspect: 0.7 },
      data: () => ({ cols: ['Debt-to-equity', 'Actual', 'Predicted probability'], rows: X.map((x, i) => [x[0], y[i], Number(sig(Fv[i]).toFixed(4))]) })
    });
    const E = MLS.figure($('#xgErr'), {
      title: 'Errors for the next tree', sub: 'Actual − predicted', file: 'xgboost-errors', help: 'xg_err',
      plot: { x: { domain: [0, 10.5], label: 'Debt-to-equity ratio' }, y: { domain: [-1, 1], label: 'Error' }, aspect: 0.7 },
      data: () => ({ cols: ['Debt-to-equity', 'Error'], rows: X.map((x, i) => [x[0], Number((y[i] - sig(Fv[i])).toFixed(4))]) })
    });
    function upd() {
      $('#xgEtaV').textContent = f2(eta);
      const p = Fv.map(sig), ll = -p.reduce((s, v, i) => s + (y[i] ? Math.log(v) : Math.log(1 - v)), 0) / p.length, acc = p.filter((v, i) => (v > 0.5 ? 1 : 0) === y[i]).length / p.length;
      $('#xgStats').innerHTML = MLS.statCard('Trees', String(trees.length)) + MLS.statCard('Log loss', f3(ll), 'lower is better') + MLS.statCard('Accuracy (T = 0.5)', trees.length ? pct(acc) : 'n/a');
      F.plot.draw(P => {
        P.hline(0.5, { color: P.C.axis, dash: '4 4' });
        const pts = []; for (let i = 0; i <= 420; i++) { const v = i * 10.5 / 420; pts.push([v, sig(predF(v))]); }
        P.line(pts, { color: GREEN(), width: 3 });
        P.points(X.map((x, i) => [x[0], y[i]]), { color: (d, i) => (y[i] ? RED() : BLUE()), r: 5, tip: (d, i) => 'Debt-to-equity ' + f2(d[0]) + '<br>' + (y[i] ? 'Failed' : 'Healthy') + '<br>Predicted: <b>' + pct(p[i]) + '</b>' });
      });
      F.caption(trees.length ? 'After ' + trees.length + ' tree' + (trees.length > 1 ? 's' : '') + ' the prediction follows the data more closely.' : 'Initialization: we start with 0.5 for all observations. Press Step to add the first tree.');
      E.plot.draw(P => {
        P.hline(0, { color: P.C.axis });
        X.forEach((x, i) => { const e = y[i] - p[i]; P.segment(x[0], 0, x[0], e, { color: e > 0 ? RED() : BLUE(), width: 4 }); });
      });
      E.caption('Red: failed banks predicted too low. Blue: healthy banks predicted too high. The next tree tries to predict these errors.');
      F.refreshTable(); E.refreshTable();
    }
    MLS.stepper($('#xgStep'), { step, reset, after: upd, runMax: 60, speed: 4 });
    $('#xgEta').oninput = e => { eta = Number(e.target.value); reset(); upd(); };
    upd();
  };

  /* ================================================================
     7. SVM: the best separator, the margin and C (slides 162 to 168)
     ================================================================ */
  MLS.registerHelp({
    svm_c: { title: 'C: error tolerance', html: 'C is a hyperparameter we tune. Small C: a wide margin that allows more errors. Large C: a narrow margin that tries hard to classify every training point correctly.' },
    svm_rand: { title: 'Try a random line', html: 'There is an infinite number of lines that separate the two classes. A random one can misclassify new, unknown observations (the hollow points).' }
  });
  FIGS.svm = function (host) {
    const mk = (seed, sd, a, b) => { const r = MLS.rng(seed), X = [], y = []; for (let i = 0; i < 22; i++) { X.push([r.normal(a[0], sd), r.normal(a[1], sd * 0.9)]); y.push(0); } for (let i = 0; i < 22; i++) { X.push([r.normal(b[0], sd), r.normal(b[1], sd * 0.9)]); y.push(1); } return { X, y }; };
    const DS = { sep: mk(162, 0.75, [3.2, 3.0], [6.9, -0.6]), mix: mk(168, 1.3, [4.0, 2.3], [6.3, 0.0]) };
    const NEW = [[5.3, 1.9, 0], [4.8, 0.2, 1], [5.9, 1.1, 1]];
    let ds = 'sep', C = 1, show = 'svm', rnd = null;
    const $ = shell(host, 'Support Vector Machines: the best separator',
      '<div class="card"><label class="field" style="margin-top:0" for="svDs">Data</label><select id="svDs"><option value="sep">Easy to separate (slide 162)</option><option value="mix">Impossible to separate perfectly (slide 168)</option></select>' +
        '<div class="btn-row" style="margin-top:10px"><button type="button" class="btn-ghost btn-small" id="svRnd">&#127922; Try a random line</button>' + MLS.helpBtn('svm_rand') + '<button type="button" class="btn-small" id="svSvm">SVM: maximum margin</button></div>' +
        slider('svC', 'C (log scale)', -2, 2, 0.1, 0, 'svm_c') + '</div>',
      '<div class="stat-grid" id="svStats"></div><div id="svFig"></div>');
    const F = MLS.figure($('#svFig'), {
      title: 'Healthy and bankrupt firms', sub: 'Hollow points: 3 new unknown observations', file: 'svm-separator',
      plot: { x: { domain: [0, 10], label: 'Debt-to-equity ratio' }, y: { domain: [-4, 6], label: 'Return on assets (%)' }, square: 0.82 },
      data: () => ({ cols: ['Debt-to-equity', 'ROA', 'Class'], rows: DS[ds].X.map((p, i) => [p[0], p[1], DS[ds].y[i] ? 'Bankrupt' : 'Healthy']) })
    });
    function fit() {
      const d = DS[ds], m = ML().CLS.svm(d.X, d.y, 2, { kernel: 'linear', C });
      /* w, b of the linear decision function f(x) = w·x + b (bias through the +1 in the kernel) */
      const f0 = m.decision([0, 0]), w = [m.decision([1, 0]) - f0, m.decision([0, 1]) - f0];
      return { w, b: f0, sv: m.sv };
    }
    let svm = fit();
    const cls = (L, p) => (L.w[0] * p[0] + L.w[1] * p[1] + L.b > 0 ? 1 : 0);
    /* a random line that separates the training data (as on slide 162), preferably one that misclassifies new data */
    function randomLine() {
      const r = MLS.rng(MLS.newSeed()), d = DS[ds]; let first = null, any = null;
      for (let k = 0; k < 600; k++) {
        const a = r.uniform(-4, 1.5), mx = r.uniform(4.2, 6), my = r.uniform(0, 2.4), L = { w: [-a, 1], b: -(my - a * mx) };
        if (d.X.filter((p, i) => cls(L, p) === d.y[i]).length < d.X.length / 2) { L.w = L.w.map(v => -v); L.b = -L.b; }
        const e = d.X.filter((p, i) => cls(L, p) !== d.y[i]).length;
        if (!any || e < any.e) any = Object.assign(L, { e });
        if (e === 0) { if (!first) first = L; if (NEW.some(p => cls(L, p) !== p[2])) return L; }
      }
      return first || any;
    }
    function lineSeg(L, off) { const pts = []; if (Math.abs(L.w[1]) > 1e-9) { for (const x of [-1, 11]) pts.push([x, (off - L.b - L.w[0] * x) / L.w[1]]); } else { const x = (off - L.b) / L.w[0]; pts.push([x, -5], [x, 7]); } return pts; }
    function upd() {
      $('#svCV').textContent = f2(Math.pow(10, Number($('#svC').value)));
      const d = DS[ds], L = show === 'svm' ? svm : rnd;
      /* orient the random line so that it classifies the training data as well as possible */
      if (show === 'rand') { const ok = d.X.filter((p, i) => cls(L, p) === d.y[i]).length; if (ok < d.X.length / 2) { L.w = L.w.map(v => -v); L.b = -L.b; } }
      const errTr = d.X.filter((p, i) => cls(L, p) !== d.y[i]).length, errNew = NEW.filter(p => cls(L, p) !== p[2]).length;
      const wn = Math.hypot(L.w[0], L.w[1]);
      $('#svStats').innerHTML = MLS.statCard('Separator', show === 'svm' ? 'SVM' : 'Random line') + MLS.statCard('Training errors', String(errTr), 'of ' + d.X.length, errTr ? 'bad' : 'good') + MLS.statCard('New observations misclassified', String(errNew), 'of 3', errNew ? 'bad' : 'good') +
        (show === 'svm' ? MLS.statCard('Margin width', f2(2 / wn), svm.sv.length + ' support vectors') : '');
      F.plot.draw(P => {
        if (show === 'svm') { P.line(lineSeg(L, 1), { color: P.C.muted, width: 1.5, dash: '6 5' }); P.line(lineSeg(L, -1), { color: P.C.muted, width: 1.5, dash: '6 5' }); }
        P.line(lineSeg(L, 0), { color: show === 'svm' ? GREEN() : AMBER(), width: 3 });
        P.points(d.X, { color: (p, i) => (d.y[i] ? ORANGE() : BLUE()), shape: (p, i) => (d.y[i] ? 'square' : 'circle'), r: 5.5, highlight: (p, i) => cls(L, p) !== d.y[i] });
        if (show === 'svm') P.points(svm.sv.map(i => d.X[i]), { hollow: true, color: P.C.ink, r: 10 });
        P.points(NEW, { hollow: true, color: p => (p[2] ? ORANGE() : BLUE()), shape: p => (p[2] ? 'square' : 'circle'), r: 7, highlight: p => cls(L, p) !== p[2], tip: p => 'New ' + (p[2] ? 'bankrupt' : 'healthy') + ' firm<br>' + (cls(L, p) === p[2] ? 'classified correctly' : '<b>misclassified</b>') });
      });
      F.legend([{ label: 'Class 0: healthy', color: BLUE() }, { label: 'Class 1: bankrupt', color: ORANGE(), shape: 'square' }, { label: 'Separator', color: show === 'svm' ? GREEN() : AMBER(), line: true }].concat(show === 'svm' ? [{ label: 'Margin', color: MLS.css('--chart-muted'), line: true, dash: '6 5' }, { label: 'Support vector (circled)', color: MLS.css('--chart-ink'), shape: 'circle' }] : []));
      F.caption(show === 'svm' ? 'The SVM finds the observations at the edges (support vectors) and fits the line that maximizes the distance from them.' + (ds === 'mix' ? ' The classes overlap: C sets how many errors we tolerate.' : '') : 'A random separating line: ' + errNew + ' of the 3 new unknown observations are misclassified (ringed).');
      F.refreshTable();
    }
    $('#svDs').onchange = e => { ds = e.target.value; svm = fit(); if (show === 'rand') rnd = randomLine(); upd(); };
    $('#svRnd').onclick = () => { show = 'rand'; rnd = randomLine(); upd(); };
    $('#svSvm').onclick = () => { show = 'svm'; upd(); };
    $('#svC').oninput = MLS.debounce(e => { C = Math.pow(10, Number(e.target.value)); svm = fit(); show = 'svm'; upd(); }, 60);
    upd();
  };

  /* ================================================================
     8. The kernel trick: polynomial kernel in 1 and 2 dimensions (slides 171 to 177)
     ================================================================ */
  MLS.registerHelp({
    kt_lift: { title: 'Add a dimension', html: 'We create the new dimension from the data we already have. In 1 dimension: x² (the squared distance of the debt-to-equity from the middle). In 2 dimensions: x1² + x2².' },
    kt_h: { title: 'The separator in the feature space', html: 'In the higher dimension a straight line (1D → 2D) or a flat plane (2D → 3D) separates the classes. Projected back to the data space it becomes 2 cut points or a circle.' },
    kt_rot: { title: 'Rotate the 3D view', html: 'Turn the 3-dimensional feature space to see how the plane separates the two classes.' }
  });
  FIGS.kernel = function (host) {
    let mode = '1', lift = 0, h = 0.2, rot = 35;
    const r = MLS.rng(176), D1 = [];
    [[0.6, 1], [1.0, 1], [1.4, 1], [1.9, 1], [3.1, 0], [3.6, 0], [4.0, 0], [4.4, 0], [4.9, 0], [5.3, 0], [6.6, 1], [7.1, 1], [7.5, 1], [8.0, 1]].forEach(p => D1.push(p));
    const mid = 4.2;
    const D2 = []; for (let i = 0; i < 40; i++) { const a = r.uniform(0, 2 * Math.PI), rr = r.normal(0.35, 0.12); D2.push([rr * Math.cos(a), rr * Math.sin(a), 0]); }
    for (let i = 0; i < 60; i++) { const a = r.uniform(0, 2 * Math.PI), rr = r.normal(1.0, 0.08); D2.push([rr * Math.cos(a), rr * Math.sin(a), 1]); }
    const $ = shell(host, 'The kernel trick: project the data to more dimensions',
      '<div class="card">' + seg('ktMode', [['1', '1 dimension'], ['2', '2 dimensions']], '1') +
        slider('ktLift', 'Add the new dimension', 0, 1, 0.02, 0, 'kt_lift') + slider('ktH', 'Separator height', 0, 1, 0.01, 0.2, 'kt_h') +
        '<div id="ktRotRow">' + slider('ktRot', 'Rotate the 3D view', 0, 90, 1, 35, 'kt_rot') + '</div></div>',
      '<div class="stat-grid" id="ktStats"></div><div class="fig-grid" id="ktFigs"></div>');
    let F1 = null, F2 = null;
    function build() {
      $('#ktFigs').innerHTML = '<div id="ktA"></div>' + (mode === '2' ? '<div id="ktB"></div>' : '');
      $('#ktRotRow').hidden = mode === '1';
      if (mode === '1') {
        F1 = MLS.figure($('#ktA'), { title: 'Polynomial kernel: 1 dimension', sub: 'Debt-to-equity: too high → risk, too low → cannot get financing', file: 'kernel-1d',
          plot: { x: { domain: [0, 8.5], label: 'Debt-to-equity ratio' }, y: { domain: [-1, 17], label: () => (lift > 0 ? 'New dimension: (x − ' + mid + ')²' : 'One dimension only') }, aspect: 0.62 },
          data: () => ({ cols: ['Debt-to-equity', '(x − mid)²', 'Bank'], rows: D1.map(p => [p[0], Number(((p[0] - mid) ** 2).toFixed(3)), p[1] ? 'Bad' : 'Good']) }) });
        F2 = null;
      } else {
        F1 = MLS.figure($('#ktA'), { title: 'Data space: 2 dimensions', sub: 'Not linearly separable', file: 'kernel-2d', plot: { x: { domain: [-1.5, 1.5], label: 'x1' }, y: { domain: [-1.5, 1.5], label: 'x2' }, square: 0.9 },
          data: () => ({ cols: ['x1', 'x2', 'x1² + x2²', 'Class'], rows: D2.map(p => [p[0], p[1], p[0] ** 2 + p[1] ** 2, p[2] ? 'A' : 'B']) }) });
        F2 = H.diagram($('#ktB'), { title: 'Feature space: 3 dimensions', sub: 'z = x1² + x2²', file: 'kernel-3d', height: w => Math.round(w * 0.9), draw: draw3d });
      }
    }
    function hval() { return mode === '1' ? 0.2 + h * 15 : 0.05 + h * 1.4; }
    function draw3d(P) {
      const W = P.W, Hh = P.H, a = rot * Math.PI / 180, el = 0.42, sc = W * 0.26, cx = W / 2, cy = Hh * 0.62, zs = Hh * 0.33;
      const pr = (x, yy, z) => { const X = x * Math.cos(a) - yy * Math.sin(a), Y = x * Math.sin(a) + yy * Math.cos(a); return [cx + X * sc, cy + Y * sc * Math.sin(el) - z * lift * zs]; };
      const hv = hval();
      const corners = [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]].map(c => pr(c[0], c[1], 0));
      P.node('path', { d: 'M' + corners.map(c => c.join(',')).join('L') + 'z', fill: MLS.rgba(MLS.css('--chart-ink'), 0.04), stroke: P.C.axis }, P.overlay);
      const pts = D2.map(p => ({ p, z: p[0] ** 2 + p[1] ** 2, depth: p[0] * Math.sin(a) + p[1] * Math.cos(a) })).sort((u, v) => u.depth - v.depth);
      const drawPts = below => pts.forEach(o => { if ((o.z * lift < hv * lift) !== below) return; const s = pr(o.p[0], o.p[1], o.z); P.node('circle', { cx: s[0], cy: s[1], r: 4, fill: o.p[2] ? RED() : BLUE(), stroke: P.C.surface, 'stroke-width': 1 }, P.overlay); });
      drawPts(true);
      if (lift > 0.05) { const pl = [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]].map(c => pr(c[0], c[1], hv)); P.node('path', { d: 'M' + pl.map(c => c.join(',')).join('L') + 'z', fill: MLS.rgba(GREEN(), 0.28), stroke: GREEN(), 'stroke-width': 1.5 }, P.overlay); }
      drawPts(false);
      H.label(P, W / 2, 18, lift > 0.05 ? 'A flat plane separates the two classes' : 'Move "Add the new dimension"', { size: 12.5 });
    }
    function upd() {
      $('#ktLiftV').textContent = Math.round(lift * 100) + '%'; $('#ktHV').textContent = f2(hval()); $('#ktRotV').textContent = rot + '°';
      const hv = hval();
      if (mode === '1') {
        const cut = Math.sqrt(hv), lo = mid - cut, hi = mid + cut;
        const err = D1.filter(p => ((p[0] - mid) ** 2 > hv ? 1 : 0) !== p[1]).length;
        $('#ktStats').innerHTML = MLS.statCard('Misclassified', lift > 0.9 ? String(err) : 'n/a', 'with the separator', lift > 0.9 ? (err ? 'bad' : 'good') : '') + MLS.statCard('Cut points', lift > 0.9 ? f2(lo) + ' and ' + f2(hi) : 'n/a', 'back in the data space');
        F1.plot.draw(P => {
          P.hline(0, { color: P.C.axis });
          if (lift > 0.9) { P.hline(hv, { color: GREEN(), width: 2.5 }); P.vline(lo, { color: GREEN(), dash: '5 4' }); P.vline(hi, { color: GREEN(), dash: '5 4' }); P.rect(lo, -1, hi, 0, { fill: MLS.rgba(BLUE(), 0.12) }); }
          if (lift > 0) P.fn(x => lift * (x - mid) ** 2, { color: P.C.grid, width: 1.5, dash: '3 4' });
          P.points(D1.map(p => [p[0], lift * (p[0] - mid) ** 2, p[1]]), { color: d => (d[2] ? RED() : BLUE()), shape: d => (d[2] ? 'square' : 'circle'), r: 6.5, tip: d => 'Debt-to-equity ' + f2(d[0]) + '<br>' + (d[2] ? 'Bad bank' : 'Good bank') });
        });
        F1.legend([{ label: 'Good banks', color: BLUE() }, { label: 'Bad banks', color: RED(), shape: 'square' }].concat(lift > 0.9 ? [{ label: 'Separator', color: GREEN(), line: true }] : []));
        F1.caption(lift < 0.05 ? '<b>When a line is not enough...</b> One cut point on this line cannot separate the bad banks on both sides from the good ones.' : lift < 0.9 ? 'Lifting each bank by (x − ' + mid + ')²: the bad banks at both ends go up.' : 'In 2 dimensions a straight line separates the classes. Back in the data space it becomes 2 cut points.');
        F1.refreshTable();
      } else {
        const err = D2.filter(p => ((p[0] ** 2 + p[1] ** 2) > hv ? 1 : 0) !== p[2]).length;
        $('#ktStats').innerHTML = MLS.statCard('Misclassified', lift > 0.9 ? String(err) : 'n/a', 'with the plane', lift > 0.9 ? (err ? 'bad' : 'good') : '') + MLS.statCard('Circle radius', lift > 0.9 ? f2(Math.sqrt(hv)) : 'n/a', 'the plane projected back');
        F1.plot.draw(P => {
          if (lift > 0.9) circle(P, 0, 0, Math.sqrt(hv) / 3 * (P.W - P.m.l - P.m.r), { stroke: GREEN(), width: 2.5, fill: MLS.rgba(GREEN(), 0.08) });
          P.points(D2, { color: d => (d[2] ? RED() : BLUE()), r: 4 });
        });
        F1.caption(lift > 0.9 ? 'With the inverse function the flat plane becomes a <b>circle</b> in the original data space: a nonlinear separator.' : 'One class forms a ring around the other: no straight line can separate them.');
        F2.plot.redraw(); F1.refreshTable();
      }
    }
    bindSeg($, 'ktMode', v => { mode = v; build(); upd(); });
    $('#ktLift').oninput = e => { lift = Number(e.target.value); upd(); };
    $('#ktH').oninput = e => { h = Number(e.target.value); upd(); };
    $('#ktRot').oninput = e => { rot = Number(e.target.value); upd(); };
    h = 0.2; build(); upd();
  };

  /* ================================================================
     9. SVR: the error tolerance band (slides 182 to 185)
     ================================================================ */
  MLS.registerHelp({
    svr_eps: { title: 'ε: width of the band', html: 'Errors inside the band (from −ε to +ε) are set to zero: too close = makes no difference. Only observations outside the band count.' },
    svr_k: { title: 'Kernel', html: '<b>Linear</b>: a straight band. <b>RBF</b>: the kernel trick gives a nonlinear (curved) band.' }
  });
  FIGS.svr = function (host) {
    const r = MLS.rng(183), DS = {
      lin: { t: 'Advertising and sales', x: 'Advertising (k€)', y: 'Sales (k€)', pts: Array.from({ length: 26 }, () => { const x = r.uniform(0.5, 9.5); return [x, 8 + 2.1 * x + r.normal(0, 1.7)]; }), dom: [0, 10], ydom: [2, 34] },
      curve: { t: 'Temperature and electricity consumption', x: 'Temperature (°C)', y: 'Consumption (kWh)', pts: Array.from({ length: 30 }, () => { const x = r.uniform(0, 40); return [x, 8 + 0.035 * (x - 20) ** 2 + r.normal(0, 0.9)]; }), dom: [0, 40], ydom: [4, 24] }
    };
    let ds = 'lin', ker = 'linear', eps = 1.5, model = null;
    const $ = shell(host, 'Support Vector Regression: the error tolerance band',
      '<div class="card"><label class="field" style="margin-top:0" for="srDs">Data</label><select id="srDs"><option value="lin">Advertising and sales</option><option value="curve">Temperature and consumption (U shape)</option></select>' +
        '<label class="field" for="srK">Kernel' + MLS.helpBtn('svr_k') + '</label><select id="srK"><option value="linear">Linear</option><option value="rbf">RBF (kernel trick)</option></select>' +
        slider('srE', 'ε (half width of the band)', 0, 4, 0.1, 1.5, 'svr_eps') + '</div>',
      '<div class="stat-grid" id="srStats"></div><div id="srFig"></div>');
    let F;
    function build() {
      const d = DS[ds]; $('#srFig').innerHTML = '';
      F = MLS.figure($('#srFig'), { title: d.t, sub: 'Points outside the band count; circled points are support vectors', file: 'svr-band',
        plot: { x: { domain: d.dom, label: d.x }, y: { domain: d.ydom, label: d.y }, aspect: 0.62 },
        data: () => ({ cols: [d.x, d.y, 'Predicted', 'Inside the band'], rows: d.pts.map(p => { const f = model.predict([p[0]]); return [p[0], p[1], Number(f.toFixed(3)), Math.abs(p[1] - f) <= eps + 1e-9 ? 'yes' : 'no']; }) }) });
    }
    function fit() { const d = DS[ds], sx = d.dom[1] - d.dom[0]; model = ML().REG.svr(d.pts.map(p => [p[0]]), d.pts.map(p => p[1]), { kernel: ker, eps, C: 10, gamma: 30 / (sx * sx) }); }
    function upd() {
      $('#srEV').textContent = f2(eps);
      const d = DS[ds], inside = d.pts.filter(p => Math.abs(p[1] - model.predict([p[0]])) <= eps + 1e-6).length;
      $('#srStats').innerHTML = MLS.statCard('Inside the band', String(inside), 'error set to zero') + MLS.statCard('Outside the band', String(d.pts.length - inside), 'these errors count') + MLS.statCard('Support vectors', String(model.sv.length), 'define the band');
      F.plot.draw(P => {
        const xs = Array.from({ length: 121 }, (_, i) => d.dom[0] + (d.dom[1] - d.dom[0]) * i / 120), f = xs.map(x => model.predict([x]));
        const up = xs.map((x, i) => [x, f[i] + eps]), dn = xs.map((x, i) => [x, f[i] - eps]).reverse();
        P.node('path', { d: 'M' + up.concat(dn).map(p => P.sx(p[0]).toFixed(1) + ',' + P.sy(p[1]).toFixed(1)).join('L') + 'z', fill: MLS.rgba(RED(), 0.16), stroke: 'none' });
        P.line(up, { color: RED(), width: 1.2, dash: '5 4' }); P.line(dn.slice().reverse(), { color: RED(), width: 1.2, dash: '5 4' });
        P.line(xs.map((x, i) => [x, f[i]]), { color: RED(), width: 2.8 });
        P.points(d.pts, { color: p => (Math.abs(p[1] - model.predict([p[0]])) <= eps + 1e-6 ? MLS.rgba(BLUE(), 0.55) : BLUE()), r: 5.5, tip: p => d.x + ': ' + f2(p[0]) + '<br>' + d.y + ': ' + f2(p[1]) + '<br>Predicted: ' + f2(model.predict([p[0]])) });
        P.points(model.sv.map(i => d.pts[i]), { hollow: true, color: P.C.ink, r: 10 });
      });
      F.caption('The band goes from −ε to +ε around the line. Training sets 1. the line position and 2. ε, the width of the band. ' + (ker === 'rbf' ? 'With the RBF kernel the band bends with the data.' : ''));
      F.refreshTable();
    }
    $('#srDs').onchange = e => { ds = e.target.value; ker = ds === 'curve' ? 'rbf' : 'linear'; $('#srK').value = ker; eps = ds === 'curve' ? 1 : 1.5; $('#srE').value = eps; build(); fit(); upd(); };
    $('#srK').onchange = e => { ker = e.target.value; fit(); upd(); };
    $('#srE').oninput = MLS.debounce(e => { eps = Number(e.target.value); fit(); upd(); }, 50);
    build(); fit(); upd();
  };

  /* ================================================================
     10. Ensembles: bagging, stacking, boosting (slides 195 to 199)
     ================================================================ */
  MLS.registerHelp({ en_step: { title: 'Step by step', html: '<b>Step</b> follows the data through the method, one stage at a time. <b>Reset</b> starts again.' } });
  FIGS.ensembles = function (host) {
    const M = {
      bag: { t: 'Bagging', steps: ['Data set', 'Create n bootstrapped samples (random sampling with replacement)', 'Use the same algorithm on each sample', 'Voting or average', 'Prediction'],
        q: 'Question: what algorithm was like this? → Random forests' },
      st1: { t: 'Stacking 1', steps: ['Data set', 'n different algorithms; each uses the full data set', 'Each algorithm makes its prediction', 'Voting or average', 'Prediction'] },
      st2: { t: 'Stacking 2', steps: ['Data set', 'n different algorithms (weak learners); each uses the full data set', 'Their predictions form a new data set', 'Train a random forest on it (meta learner)', 'Prediction'] },
      boo: { t: 'Boosting', steps: ['Data set: one algorithm, one data set', 'Model 1 classifies the data', 'Misclassified observations get heavier weight for the next model', 'Model 2, Model 3, ... correct the errors of the previous models', 'Weighted vote by model accuracy → result'],
        q: 'Question: what algorithm was like this? → XGBoost' }
    };
    let m = 'bag', s = 0;
    const $ = shell(host, 'Ensemble learning: training multiple models instead of just one', '', '<div class="card" style="margin-bottom:10px">' + seg('enM', Object.keys(M).map(k => [k, M[k].t]), 'bag') +
      '<div class="btn-row" style="margin-top:8px"><button type="button" class="btn-secondary btn-small" id="enStep">&#10142; Step</button><button type="button" class="btn-ghost btn-small" id="enReset">&#8634; Reset</button>' + MLS.helpBtn('en_step') + '</div><ol class="phase-list" id="enList" style="margin-top:8px"></ol><div class="note" id="enQ"></div></div><div id="enFig"></div>', true);
    const r0 = MLS.rng(195);
    const dots = Array.from({ length: 8 }, (_, i) => i % 3 === 0 ? 1 : 0);
    const F = H.diagram($('#enFig'), { title: 'How the method works', file: 'ensembles', height: w => Math.round(Math.max(260, Math.min(340, w * 0.42))), minWidth: 560, draw });
    function draw(P) {
      const W = P.W, Hh = P.H, on = k => s >= k, acc = MLS.css('--accent'), mut = P.C.axis;
      const bx = (x, y, w, h, t, k, o) => H.box(P, x, y, w, h, Object.assign({ text: t, fill: on(k) ? MLS.css('--tint') : P.C.surface, stroke: on(k) ? acc : mut, sw: s === k ? 3 : 1.3, fs: 12 }, o || {}));
      const ar = (x1, y1, x2, y2, k) => H.arrow(P, x1, y1, x2, y2, { color: on(k) ? acc : mut, width: on(k) ? 2 : 1.2 });
      const x0 = W * 0.08, x1 = W * 0.3, x2 = W * 0.53, x3 = W * 0.74, x4 = W * 0.92, ys = [Hh * 0.22, Hh * 0.5, Hh * 0.78];
      bx(x0, Hh / 2, W * 0.12, 44, ['Data set'], 0);
      if (m === 'boo') {
        const wts = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 2.2, 1, 1, 2.2, 1, 1, 1], [1, 1.4, 1, 2.4, 1.4, 1, 1, 1]];
        ys.forEach((y, k) => {
          bx(x2, y, W * 0.14, 36, ['Model ' + (k + 1)], k === 0 ? 1 : 3);
          ar(k === 0 ? x0 + W * 0.06 : x2, k === 0 ? Hh / 2 : ys[k - 1] + 18, k === 0 ? x2 - W * 0.07 : x2, y - 18, k === 0 ? 1 : 3);
          if (k < 2) H.label(P, x2 - 10, (y + ys[k + 1]) / 2, 'heavier weight on misclassified', { anchor: 'end', size: 11, color: on(2) ? MLS.css('--danger') : P.C.muted });
          const w = wts[Math.min(k, s >= 2 ? k : 0)];
          w.forEach((v, i) => P.node('circle', { cx: x1 - W * 0.09 + i * W * 0.025, cy: y, r: 3 + v * 2.2, fill: dots[i] ? RED() : BLUE(), opacity: on(1) ? 0.9 : 0.35 }, P.overlay));
          ar(x2 + W * 0.07, y, x3 - W * 0.04, Hh / 2, 4);
        });
        P.node('circle', { cx: x3, cy: Hh / 2, r: 12, fill: on(4) ? acc : P.C.surface, stroke: on(4) ? acc : mut, 'stroke-width': 2 }, P.overlay);
        H.label(P, x3, Hh / 2 + 32, 'Weighted vote', { size: 11.5 }); ar(x3 + 14, Hh / 2, x4 - W * 0.06, Hh / 2, 4); bx(x4, Hh / 2, W * 0.11, 36, ['Result'], 4);
        return;
      }
      const left = m === 'bag' ? ['Bootstrapped sample 1', 'Bootstrapped sample 2', 'Bootstrapped sample n'] : null;
      ys.forEach((y, k) => {
        if (left) { bx(x1, y, W * 0.17, 34, [left[k]], 1); ar(x0 + W * 0.06, Hh / 2, x1 - W * 0.085, y, 1); ar(x1 + W * 0.085, y, x2 - W * 0.07, y, 2); }
        else ar(x0 + W * 0.06, Hh / 2, x2 - W * 0.07, y, 1);
        bx(x2, y, W * 0.14, 34, [m === 'bag' ? 'Algorithm' : 'Algorithm ' + (k === 2 ? 'n' : k + 1)], m === 'bag' ? 2 : 1, { fill: on(m === 'bag' ? 2 : 1) ? (m === 'bag' ? MLS.css('--tint') : MLS.css('--warn-bg')) : P.C.surface });
        ar(x2 + W * 0.07, y, (m === 'st2' ? x3 - W * 0.06 : x3 - W * 0.02), Hh / 2, m === 'bag' ? 3 : 2);
      });
      if (m === 'st2') {
        bx(x3, Hh / 2, W * 0.11, 44, ['New data set'], 2);
        bx(x3 + W * 0.0, Hh * 0.16, W * 0.13, 30, ['Random forest'], 3, { fill: on(3) ? MLS.css('--warn-bg') : P.C.surface });
        ar(x3, Hh / 2 - 22, x3, Hh * 0.16 + 15, 3); ar(x3 + W * 0.065, Hh * 0.16, x4 - W * 0.05, Hh / 2 - 18, 4);
        H.label(P, x2, Hh - 8, 'Weak learners', { size: 11.5 }); H.label(P, x3, Hh * 0.16 - 22, 'Meta learner', { size: 11.5 });
      } else {
        P.node('circle', { cx: x3, cy: Hh / 2, r: 12, fill: on(3) ? acc : P.C.surface, stroke: on(3) ? acc : mut, 'stroke-width': 2 }, P.overlay);
        H.label(P, x3, Hh / 2 + 32, 'Voting or average', { size: 11.5 }); ar(x3 + 14, Hh / 2, x4 - W * 0.06, Hh / 2, 4);
      }
      bx(x4, Hh / 2, W * 0.11, 36, ['Prediction'], 4);
    }
    function upd() {
      const L = M[m].steps;
      $('#enList').innerHTML = L.map((t, k) => '<li class="' + (k === s ? 'on' : k < s ? 'past' : '') + '">' + t + '</li>').join('') ;
      $('#enQ').innerHTML = M[m].q && s >= L.length - 1 ? '<b>' + M[m].q + '</b>' : '';
      F.plot.redraw();
      F.caption(L[s]);
    }
    bindSeg($, 'enM', v => { m = v; s = 0; upd(); });
    $('#enStep').onclick = () => { s = Math.min(M[m].steps.length - 1, s + 1); upd(); };
    $('#enReset').onclick = () => { s = 0; upd(); };
    void r0; upd();
  };
})();
