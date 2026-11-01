/* =====================================================================
   4MLSim Core: small, readable machine learning algorithms, data sets
   and metrics for the Core Playground. No dependencies; also runs in
   Node (module.exports) for checks against scikit-learn.
   ===================================================================== */
(function (root) {
  'use strict';
  const ML = {};

  /* ---------------------------------------------------------------
     random numbers (same generator as MLS.rng)
     --------------------------------------------------------------- */
  ML.rng = function (seed) {
    let a = (Number(seed) >>> 0) || 1;
    function random() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    let spare = null;
    function normal(mu, sd) {
      mu = mu || 0; sd = sd === undefined ? 1 : sd;
      if (spare !== null) { const s = spare; spare = null; return mu + sd * s; }
      let u = 0; while (u === 0) u = random();
      const v = random(), r = Math.sqrt(-2 * Math.log(u));
      spare = r * Math.sin(2 * Math.PI * v);
      return mu + sd * r * Math.cos(2 * Math.PI * v);
    }
    return {
      random, normal,
      uniform: (lo, hi) => lo + (hi - lo) * random(),
      int: (lo, hi) => lo + Math.floor(random() * (hi - lo + 1)),
      shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
    };
  };

  /* ---------------------------------------------------------------
     small helpers
     --------------------------------------------------------------- */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const sigmoid = z => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
  function softmax(z) { const m = Math.max(...z), e = z.map(v => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); }
  ML.sigmoid = sigmoid; ML.softmax = softmax;

  /* standardize with the training set's mean and standard deviation */
  ML.scaler = function (X) {
    const p = X[0].length, n = X.length, mu = new Array(p).fill(0), sd = new Array(p).fill(0);
    X.forEach(r => r.forEach((v, j) => (mu[j] += v / n)));
    X.forEach(r => r.forEach((v, j) => (sd[j] += (v - mu[j]) ** 2 / n)));
    for (let j = 0; j < p; j++) sd[j] = Math.sqrt(sd[j]) || 1;
    return { mu, sd, t: x => x.map((v, j) => (v - mu[j]) / sd[j]) };
  };

  /* solve A x = b (Gaussian elimination with partial pivoting) */
  function solve(A, b) {
    const n = b.length, M = A.map((r, i) => r.slice().concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      const d = M[c][c]; if (Math.abs(d) < 1e-14) return null;
      for (let r = c + 1; r < n; r++) { const f = M[r][c] / d; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
    return x;
  }
  ML.solve = solve;

  /* split: the last 20% of a random order is the test set */
  ML.split = function (n, seed, share) {
    const idx = ML.rng(seed * 7 + 3).shuffle(Array.from({ length: n }, (_, i) => i));
    const nTe = Math.round((share === undefined ? 0.2 : share) * n), test = new Array(n).fill(false);
    idx.slice(n - nTe).forEach(i => (test[i] = true));
    return test;
  };

  /* =================================================================
     data sets.  Every generator returns
       { X: [[x1, x2]] or [[x]], y: [] (class index or number),
         names: [axis names], classes: [class names] (classification),
         task: 'class' | 'reg' | 'clust' }
     ================================================================= */
  const DATA = {};
  function gauss2(r, n, cls, specs) {   /* specs: [[mx, sx, my, sy], ...] per class; cls(i) picks the class */
    const X = [], y = [];
    for (let i = 0; i < n; i++) { const k = cls(i), s = specs[k]; X.push([r.normal(s[0], s[1]), r.normal(s[2], s[3])]); y.push(k); }
    return { X, y };
  }
  const round = (v, d) => +v.toFixed(d);
  DATA.banks = {
    task: 'class', label: 'Bank failures', n: 150,
    note: 'Banks described by two financial ratios. Failed banks tend to have more debt per unit of equity and less capital. About 30% of the banks failed.',
    gen(r, n) {
      const X = [], y = [];
      for (let i = 0; i < n; i++) {
        const f = r.random() < 0.3 ? 1 : 0;
        const de = f ? r.normal(6.2, 1.6) : r.normal(3.4, 1.3), t1 = f ? r.normal(9, 2.2) : r.normal(12.8, 2.3);
        X.push([round(clamp(de, 0.3, 11), 2), round(clamp(t1, 2, 22), 1)]); y.push(f);
      }
      return { X, y, names: ['Debt-to-equity ratio', 'Tier 1 capital ratio (%)'], classes: ['Healthy', 'Failed'], pos: 1 };
    }
  };
  DATA.cycle = {
    task: 'class', label: 'Recession / normal / growth', n: 150,
    note: 'Months of an economy described by the purchasing managers\' index (PMI) and the change in the unemployment rate over the last 12 months. Three classes.',
    gen(r, n) {
      const d = gauss2(r, n, () => r.int(0, 2), [[44.5, 2.8, 1.1, 0.55], [50.5, 2.2, 0.05, 0.4], [55.5, 2.6, -0.75, 0.4]]);
      d.X = d.X.map(x => [round(x[0], 1), round(x[1], 2)]);
      return Object.assign(d, { names: ['PMI (index)', 'Change in unemployment (points)'], classes: ['Recession', 'Normal', 'Growth'] });
    }
  };
  DATA.fruits = {
    task: 'class', label: 'Fruits', n: 120,
    note: 'Fruits measured by diameter and height, as in the decision tree example of the lecture. Apples and pears overlap.',
    gen(r, n) {
      const d = gauss2(r, n, () => r.int(0, 3), [[7.4, 0.7, 7.0, 0.7], [6.4, 0.7, 9.4, 1.0], [3.8, 0.5, 18, 2], [1.8, 0.3, 2.1, 0.35]]);
      d.X = d.X.map(x => [round(Math.max(0.8, x[0]), 1), round(Math.max(0.8, x[1]), 1)]);
      return Object.assign(d, { names: ['Diameter (cm)', 'Height (cm)'], classes: ['Apple', 'Pear', 'Banana', 'Grape'] });
    }
  };
  DATA.blobs2 = {
    task: 'class', label: 'Generic: two groups', n: 120, generic: true,
    note: 'Two groups of points that overlap a little.',
    gen(r, n) { const d = gauss2(r, n, i => i % 2, [[-1, 0.9, -0.6, 0.9], [1.1, 0.9, 0.7, 0.9]]); return Object.assign(d, { names: ['x1', 'x2'], classes: ['Class 0', 'Class 1'], pos: 1 }); }
  };
  DATA.circles = {
    task: 'class', label: 'Generic: circles', n: 160, generic: true,
    note: 'One class inside a ring of the other. No straight line can separate them.',
    gen(r, n) {
      const X = [], y = [];
      for (let i = 0; i < n; i++) { const k = i % 2, a = r.uniform(0, 2 * Math.PI), rad = (k ? 1 : 2.2) + r.normal(0, 0.25); X.push([rad * Math.cos(a), rad * Math.sin(a)]); y.push(k); }
      return { X, y, names: ['x1', 'x2'], classes: ['Outer ring', 'Inner circle'], pos: 1 };
    }
  };
  DATA.moons = {
    task: 'class', label: 'Generic: moons', n: 160, generic: true,
    note: 'Two interleaving half circles.',
    gen(r, n) {
      const X = [], y = [];
      for (let i = 0; i < n; i++) { const k = i % 2, t = r.uniform(0, Math.PI); X.push(k ? [1 - Math.cos(t) + r.normal(0, 0.18), 0.5 - Math.sin(t) + r.normal(0, 0.18)] : [Math.cos(t) + r.normal(0, 0.18), Math.sin(t) + r.normal(0, 0.18)]); y.push(k); }
      return { X, y, names: ['x1', 'x2'], classes: ['Moon A', 'Moon B'], pos: 1 };
    }
  };
  DATA.xor = {
    task: 'class', label: 'Generic: XOR', n: 160, generic: true,
    note: 'Class 1 in two opposite corners, class 0 in the other two.',
    gen(r, n) {
      const X = [], y = [];
      for (let i = 0; i < n; i++) { const a = r.uniform(-1, 1), b = r.uniform(-1, 1); X.push([a + r.normal(0, 0.08), b + r.normal(0, 0.08)]); y.push(a * b > 0 ? 1 : 0); }
      return { X, y, names: ['x1', 'x2'], classes: ['Class 0', 'Class 1'], pos: 1 };
    }
  };
  DATA.kwh = {
    task: 'reg', label: 'Temperature and electricity use', n: 80,
    note: 'Daily electricity use of a household against the outside temperature: heating on cold days, air-conditioning on hot days.',
    gen(r, n) {
      const X = [], y = [];
      for (let i = 0; i < n; i++) { const t = r.uniform(-5, 38); X.push([round(t, 1)]); y.push(round(9 + 0.55 * Math.max(0, 16 - t) + 0.9 * Math.max(0, t - 22) + r.normal(0, 1.2), 2)); }
      return { X, y, names: ['Temperature (°C)', 'Electricity use (kWh per day)'] };
    }
  };
  DATA.power = {
    task: 'reg', label: 'Gas price and electricity price', n: 80,
    note: 'Wholesale electricity price against the natural gas price: a roughly straight-line relation.',
    gen(r, n) {
      const X = [], y = [];
      for (let i = 0; i < n; i++) { const g = r.uniform(20, 120); X.push([round(g, 1)]); y.push(round(25 + 1.9 * g + r.normal(0, 14), 1)); }
      return { X, y, names: ['Natural gas price (€/MWh)', 'Electricity price (€/MWh)'] };
    }
  };
  DATA.line = {
    task: 'reg', label: 'Generic: straight line', n: 60, generic: true, note: 'A straight line plus noise.',
    gen(r, n) { const X = [], y = []; for (let i = 0; i < n; i++) { const x = r.uniform(0, 10); X.push([x]); y.push(5 + 1.2 * x + r.normal(0, 1.5)); } return { X, y, names: ['x', 'y'] }; }
  };
  DATA.wave = {
    task: 'reg', label: 'Generic: wave', n: 80, generic: true, note: 'A wave plus noise.',
    gen(r, n) { const X = [], y = []; for (let i = 0; i < n; i++) { const x = r.uniform(0, 10); X.push([x]); y.push(10 + 3 * Math.sin(0.8 * x) + r.normal(0, 0.6)); } return { X, y, names: ['x', 'y'] }; }
  };
  DATA.customers = {
    task: 'clust', label: 'Supermarket customers', n: 150,
    note: 'Customers described by yearly spending and visits per month. The groups are not labelled: the algorithm must find them.',
    gen(r, n) {
      const d = gauss2(r, n, () => r.int(0, 2), [[1.3, 0.45, 2.2, 0.8], [3.6, 0.6, 7, 1.2], [7.5, 0.9, 4, 1]]);
      d.X = d.X.map(x => [round(Math.max(0.2, x[0]), 2), round(Math.max(0.5, x[1]), 1)]);
      return Object.assign(d, { names: ['Yearly spending (thousand €)', 'Visits per month'] });
    }
  };
  DATA.blobs3 = {
    task: 'clust', label: 'Generic: three groups', n: 150, generic: true, note: 'Three round groups.',
    gen(r, n) { const d = gauss2(r, n, i => i % 3, [[-2, 0.6, 0, 0.6], [1.5, 0.6, 1.5, 0.6], [1, 0.6, -1.8, 0.6]]); return Object.assign(d, { names: ['x1', 'x2'] }); }
  };
  DATA.moonsU = {
    task: 'clust', label: 'Generic: moons', n: 160, generic: true, note: 'Two interleaving half circles, without labels.',
    gen(r, n) { const d = DATA.moons.gen(r, n); return { X: d.X, y: d.y, names: d.names }; }
  };
  ML.DATA = DATA;

  /* =================================================================
     classification models: fit(X, y, K, opts) -> { proba(x) -> [K] }
     X is already standardized by the caller (except trees, which do
     not need it; standardizing does not change their splits' meaning).
     ================================================================= */
  const CLS = {};

  /* features for the logit: inputs, plus squares and product when degree = 2 */
  function polyFeat(x, deg) {
    if (deg < 2) return x.slice();
    const f = x.slice();
    for (let i = 0; i < x.length; i++) for (let j = i; j < x.length; j++) f.push(x[i] * x[j]);
    return f;
  }
  ML.polyFeat = polyFeat;

  /* logit (binary) and multinomial logit; ridge penalty lambda/2 * |w|^2 on the slopes (as scikit-learn with C = 1/lambda) */
  CLS.logit = function (X, y, K, o) {
    const deg = o.degree || 1, lam = o.lambda === undefined ? 0.01 : o.lambda;
    const F = X.map(x => [1].concat(polyFeat(x, deg))), p = F[0].length, n = F.length;
    if (K === 2) {
      let b = new Array(p).fill(0);
      for (let it = 0; it < 100; it++) {
        const g = new Array(p).fill(0), H = Array.from({ length: p }, () => new Array(p).fill(0));
        F.forEach((f, i) => { const pr = sigmoid(f.reduce((s, v, j) => s + v * b[j], 0)), w = pr * (1 - pr); for (let j = 0; j < p; j++) { g[j] += (pr - y[i]) * f[j]; for (let k = 0; k < p; k++) H[j][k] += w * f[j] * f[k]; } });
        for (let j = 1; j < p; j++) { g[j] += lam * b[j]; H[j][j] += lam; }
        const step = solve(H, g); if (!step) break;
        b = b.map((v, j) => v - step[j]);
        if (Math.max(...step.map(Math.abs)) < 1e-10) break;
      }
      return { coef: b, proba: x => { const pr = sigmoid([1].concat(polyFeat(x, deg)).reduce((s, v, j) => s + v * b[j], 0)); return [1 - pr, pr]; } };
    }
    /* multinomial: Newton on all K x p coefficients */
    const P = K * p; let w = new Array(P).fill(0);
    const prob = f => softmax(Array.from({ length: K }, (_, k) => f.reduce((s, v, j) => s + v * w[k * p + j], 0)));
    for (let it = 0; it < 100; it++) {
      const g = new Array(P).fill(0), H = Array.from({ length: P }, () => new Array(P).fill(0));
      F.forEach((f, i) => {
        const pr = prob(f);
        for (let k = 0; k < K; k++) {
          const e = pr[k] - (y[i] === k ? 1 : 0);
          for (let j = 0; j < p; j++) g[k * p + j] += e * f[j];
          for (let l = 0; l < K; l++) { const c = pr[k] * ((k === l ? 1 : 0) - pr[l]); if (!c) continue; for (let j = 0; j < p; j++) for (let m = 0; m < p; m++) H[k * p + j][l * p + m] += c * f[j] * f[m]; }
        }
      });
      for (let k = 0; k < K; k++) for (let j = 1; j < p; j++) { g[k * p + j] += lam * w[k * p + j]; H[k * p + j][k * p + j] += lam; }
      for (let k = 0; k < K; k++) H[k * p][k * p] += 1e-9;      /* intercepts: only identified up to a constant */
      const step = solve(H, g); if (!step) break;
      w = w.map((v, j) => v - step[j]);
      if (Math.max(...step.map(Math.abs)) < 1e-10) break;
    }
    return { coef: w, proba: x => prob([1].concat(polyFeat(x, deg))) };
  };

  /* k nearest neighbours: share of each class among the k closest training points */
  function nearest(X, x, k) {
    const d = X.map((r, i) => { let s = 0; for (let j = 0; j < r.length; j++) s += (r[j] - x[j]) ** 2; return [s, i]; });
    d.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return d.slice(0, Math.min(k, d.length)).map(v => v[1]);
  }
  ML.nearest = nearest;
  CLS.knn = function (X, y, K, o) {
    const k = o.k || 5;
    return { proba: x => { const c = new Array(K).fill(0), nb = nearest(X, x, k); nb.forEach(i => (c[y[i]] += 1 / nb.length)); return c; }, neighbours: x => nearest(X, x, k) };
  };

  /* ---------------------------------------------------------------
     decision tree (CART). Classification: Gini; regression: squared error.
     rows: indices into X; returns a node tree. Splits at midpoints.
     --------------------------------------------------------------- */
  const gini = c => { const n = c.reduce((a, b) => a + b, 0); return n ? 1 - c.reduce((s, v) => s + (v / n) ** 2, 0) : 0; };
  ML.gini = gini;
  function buildTree(X, y, rows, o, depth, rng) {
    const K = o.K, reg = !K, n = rows.length;
    const node = { n, depth };
    if (reg) { node.value = rows.reduce((s, i) => s + y[i], 0) / n; node.imp = rows.reduce((s, i) => s + (y[i] - node.value) ** 2, 0) / n; }
    else { node.counts = new Array(K).fill(0); rows.forEach(i => node.counts[y[i]]++); node.imp = gini(node.counts); node.value = node.counts.map(c => c / n); }
    if (depth >= o.maxDepth || n < 2 * (o.minLeaf || 1) || node.imp < 1e-12) return node;
    const p = X[0].length;
    let feats = Array.from({ length: p }, (_, j) => j);
    if (o.maxFeatures && o.maxFeatures < p) feats = rng.shuffle(feats.slice()).slice(0, o.maxFeatures);
    let best = null;
    for (const j of feats) {
      const ord = rows.slice().sort((a, b) => X[a][j] - X[b][j] || a - b);
      if (reg) {
        let sl = 0, sl2 = 0; const st = ord.reduce((s, i) => s + y[i], 0), st2 = ord.reduce((s, i) => s + y[i] * y[i], 0);
        for (let t = 0; t < n - 1; t++) {
          const v = y[ord[t]]; sl += v; sl2 += v * v;
          const a = X[ord[t]][j], b = X[ord[t + 1]][j]; if (a === b) continue;
          const nl = t + 1, nr = n - nl; if (nl < (o.minLeaf || 1) || nr < (o.minLeaf || 1)) continue;
          const sse = (sl2 - sl * sl / nl) + ((st2 - sl2) - (st - sl) ** 2 / nr);
          if (!best || sse < best.score - 1e-12) best = { j, thr: (a + b) / 2, score: sse, t };
        }
      } else {
        const L = new Array(K).fill(0), R = node.counts.slice();
        for (let t = 0; t < n - 1; t++) {
          const c = y[ord[t]]; L[c]++; R[c]--;
          const a = X[ord[t]][j], b = X[ord[t + 1]][j]; if (a === b) continue;
          const nl = t + 1, nr = n - nl; if (nl < (o.minLeaf || 1) || nr < (o.minLeaf || 1)) continue;
          const score = nl * gini(L) + nr * gini(R);
          if (!best || score < best.score - 1e-12) best = { j, thr: (a + b) / 2, score };
        }
      }
    }
    if (!best) return node;      /* as scikit-learn: a split is made even when it does not lower the impurity (needed e.g. for XOR) */
    node.feat = best.j; node.thr = best.thr;
    node.left = buildTree(X, y, rows.filter(i => X[i][best.j] <= best.thr), o, depth + 1, rng);
    node.right = buildTree(X, y, rows.filter(i => X[i][best.j] > best.thr), o, depth + 1, rng);
    return node;
  }
  function treeLeaf(node, x) { while (node.left) node = x[node.feat] <= node.thr ? node.left : node.right; return node; }
  ML.buildTree = buildTree; ML.treeLeaf = treeLeaf;
  CLS.tree = function (X, y, K, o) {
    const root = buildTree(X, y, X.map((_, i) => i), { K, maxDepth: o.depth || 3 }, 0, ML.rng(o.seed || 1));
    return { root, proba: x => treeLeaf(root, x).value };
  };

  /* random forest: bootstrap samples, one variable tried at each split (of 2), trees vote */
  CLS.forest = function (X, y, K, o) {
    const r = ML.rng((o.seed || 1) * 31 + 7), n = X.length, p = X[0].length, trees = [];
    for (let t = 0; t < (o.trees || 50); t++) {
      const rows = Array.from({ length: n }, () => Math.floor(r.random() * n));
      trees.push(buildTree(X, y, rows, { K, maxDepth: o.depth || 6, maxFeatures: Math.max(1, Math.floor(Math.sqrt(p))) }, 0, r));
    }
    return {
      trees,
      proba: x => { const v = new Array(K).fill(0); trees.forEach(tr => { const pr = treeLeaf(tr, x).value; let b = 0; for (let k = 1; k < K; k++) if (pr[k] > pr[b]) b = k; v[b] += 1 / trees.length; }); return v; }
    };
  };

  /* ---------------------------------------------------------------
     gradient-boosted trees, XGBoost style: each new tree is fitted to
     the gradients g and curvatures h of the loss; leaf weight -G/(H+lambda),
     split gain G_L^2/(H_L+l) + G_R^2/(H_R+l) - G^2/(H+l).
     --------------------------------------------------------------- */
  function xgbTree(X, g, h, rows, o, depth) {
    const lam = o.lambda === undefined ? 1 : o.lambda, mcw = o.minChild === undefined ? 1 : o.minChild;
    let G = 0, H = 0; rows.forEach(i => { G += g[i]; H += h[i]; });
    const node = { w: -G / (H + lam), n: rows.length };
    if (depth >= o.maxDepth || rows.length < 2) return node;
    let best = null; const base = G * G / (H + lam);
    for (let j = 0; j < X[0].length; j++) {
      const ord = rows.slice().sort((a, b) => X[a][j] - X[b][j] || a - b);
      let gl = 0, hl = 0;
      for (let t = 0; t < ord.length - 1; t++) {
        gl += g[ord[t]]; hl += h[ord[t]];
        const a = X[ord[t]][j], b = X[ord[t + 1]][j]; if (a === b) continue;
        const gr = G - gl, hr = H - hl; if (hl < mcw || hr < mcw) continue;
        const gain = 0.5 * (gl * gl / (hl + lam) + gr * gr / (hr + lam) - base);
        if (gain > 1e-12 && (!best || gain > best.gain)) best = { j, thr: (a + b) / 2, gain };
      }
    }
    if (!best) return node;
    node.feat = best.j; node.thr = best.thr;
    node.left = xgbTree(X, g, h, rows.filter(i => X[i][best.j] <= best.thr), o, depth + 1);
    node.right = xgbTree(X, g, h, rows.filter(i => X[i][best.j] > best.thr), o, depth + 1);
    return node;
  }
  const xgbOut = (node, x) => { while (node.left) node = x[node.feat] <= node.thr ? node.left : node.right; return node.w; };
  ML.xgbTree = xgbTree; ML.xgbOut = xgbOut;
  CLS.xgb = function (X, y, K, o) {
    const n = X.length, eta = o.eta || 0.3, rounds = o.rounds || 50, opt = { maxDepth: o.depth || 3 }, rows = X.map((_, i) => i);
    if (K === 2) {
      const F = new Array(n).fill(0), trees = [];          /* start: probability 0.5 for everyone (margin 0) */
      for (let t = 0; t < rounds; t++) {
        const pr = F.map(sigmoid), g = pr.map((p, i) => p - y[i]), h = pr.map(p => Math.max(p * (1 - p), 1e-16));
        const tr = xgbTree(X, g, h, rows, opt, 0); trees.push(tr);
        for (let i = 0; i < n; i++) F[i] += eta * xgbOut(tr, X[i]);
      }
      return { trees, proba: x => { const f = trees.reduce((s, tr) => s + eta * xgbOut(tr, x), 0), p = sigmoid(f); return [1 - p, p]; } };
    }
    const F = Array.from({ length: n }, () => new Array(K).fill(0)), trees = [];
    for (let t = 0; t < rounds; t++) {
      const pr = F.map(softmax), round = [];
      for (let k = 0; k < K; k++) {
        const g = pr.map((p, i) => p[k] - (y[i] === k ? 1 : 0)), h = pr.map(p => Math.max(2 * p[k] * (1 - p[k]), 1e-16));
        round.push(xgbTree(X, g, h, rows, opt, 0));
      }
      trees.push(round);
      for (let i = 0; i < n; i++) for (let k = 0; k < K; k++) F[i][k] += eta * xgbOut(round[k], X[i]);
    }
    return { trees, proba: x => softmax(Array.from({ length: K }, (_, k) => trees.reduce((s, r) => s + eta * xgbOut(r[k], x), 0))) };
  };

  /* ---------------------------------------------------------------
     support vector machine. Dual coordinate descent; the bias is
     handled by adding 1 to the kernel (as in LIBLINEAR).
     More than 2 classes: one class against the rest.
     --------------------------------------------------------------- */
  ML.kernel = function (o, p) {
    const gam = o.gamma || 1 / p, deg = o.degree || 3;
    if (o.kernel === 'rbf') return (a, b) => { let s = 0; for (let j = 0; j < a.length; j++) s += (a[j] - b[j]) ** 2; return Math.exp(-gam * s); };
    if (o.kernel === 'poly') return (a, b) => { let s = 0; for (let j = 0; j < a.length; j++) s += a[j] * b[j]; return Math.pow(gam * s + 1, deg); };
    return (a, b) => { let s = 0; for (let j = 0; j < a.length; j++) s += a[j] * b[j]; return s; };
  };
  function svmBinary(Kx, s, C, maxPass) {          /* s: labels +1/-1 ; Kx: augmented kernel matrix */
    const n = s.length, a = new Array(n).fill(0), f = new Array(n).fill(0);   /* f_i = sum_j a_j s_j K_ij */
    const order = Array.from({ length: n }, (_, i) => i), r = ML.rng(12345);
    for (let pass = 0; pass < (maxPass || 2000); pass++) {
      r.shuffle(order); let viol = 0;
      for (const i of order) {
        const G = s[i] * f[i] - 1, Q = Kx[i][i];
        let pg = G; if (a[i] <= 0) pg = Math.min(G, 0); else if (a[i] >= C) pg = Math.max(G, 0);
        viol = Math.max(viol, Math.abs(pg));
        if (Math.abs(pg) < 1e-12) continue;
        const na = clamp(a[i] - G / Q, 0, C), d = (na - a[i]) * s[i];
        if (d) { for (let j = 0; j < n; j++) f[j] += d * Kx[i][j]; a[i] = na; }
      }
      if (viol < 1e-4) break;
    }
    return a;
  }
  /* Platt scaling: probability = 1 / (1 + exp(A f + B)), fitted on the training decision values */
  function platt(fv, t) {
    let A = 0, B = 0;
    const np = t.filter(v => v).length, nn = t.length - np, hi = (np + 1) / (np + 2), lo = 1 / (nn + 2);
    const tt = t.map(v => (v ? hi : lo));
    for (let it = 0; it < 100; it++) {
      let g1 = 0, g2 = 0, h11 = 1e-12, h22 = 1e-12, h21 = 0;
      fv.forEach((f, i) => { const p = sigmoid(-(A * f + B)), d = tt[i] - p, w = p * (1 - p); g1 += f * d; g2 += d; h11 += f * f * w; h22 += w; h21 += f * w; });
      const det = h11 * h22 - h21 * h21; if (Math.abs(det) < 1e-18) break;
      const dA = -(h22 * g1 - h21 * g2) / det, dB = -(-h21 * g1 + h11 * g2) / det;
      A += dA; B += dB; if (Math.abs(dA) + Math.abs(dB) < 1e-10) break;
    }
    return f => sigmoid(-(A * f + B));
  }
  CLS.svm = function (X, y, K, o) {
    const n = X.length, ker = ML.kernel(o, X[0].length), C = o.C || 1;
    const Kx = X.map(a => X.map(b => ker(a, b) + 1));
    const one = cls => { const s = y.map(v => (v === cls ? 1 : -1)), a = svmBinary(Kx, s, C); const sv = []; a.forEach((v, i) => { if (v > 1e-8) sv.push(i); });
      return { a, s, sv, f: x => sv.reduce((acc, i) => acc + a[i] * s[i] * (ker(X[i], x) + 1), 0) }; };
    if (K === 2) {
      const m = one(1), fv = X.map((x, i) => m.sv.reduce((acc, j) => acc + m.a[j] * m.s[j] * Kx[j][i], 0)), pr = platt(fv, y.map(v => v === 1));
      return { sv: m.sv, decision: x => m.f(x), proba: x => { const p = pr(m.f(x)); return [1 - p, p]; } };
    }
    const ms = Array.from({ length: K }, (_, k) => one(k)), sv = [...new Set(ms.flatMap(m => m.sv))];
    return { sv, decision: x => ms.map(m => m.f(x)), proba: x => { const d = ms.map(m => m.f(x)); let b = 0; for (let k = 1; k < K; k++) if (d[k] > d[b]) b = k; return d.map((_, k) => (k === b ? 1 : 0)); } };
  };

  /* ---------------------------------------------------------------
     neural network: hidden layers of neurons, softmax (classes) or
     linear (regression) output; trained by backpropagation with Adam.
     --------------------------------------------------------------- */
  const ACT = {
    relu: { f: z => (z > 0 ? z : 0), d: (z, a) => (z > 0 ? 1 : 0) },
    tanh: { f: z => Math.tanh(z), d: (z, a) => 1 - a * a },
    sigmoid: { f: z => sigmoid(z), d: (z, a) => a * (1 - a) }
  };
  ML.trainNet = function (X, Y, sizes, o) {      /* Y: rows of targets (one-hot or [y]); sizes: [in, h1, ..., out] */
    const r = ML.rng((o.seed || 1) * 17 + 5), act = ACT[o.act || 'relu'], out = o.out || 'softmax', L = sizes.length - 1;
    const W = [], b = [];
    for (let l = 0; l < L; l++) {
      const fan = sizes[l], sc = (o.act === 'relu' || !o.act) && l < L - 1 ? Math.sqrt(2 / fan) : Math.sqrt(1 / fan);
      W.push(Array.from({ length: sizes[l + 1] }, () => Array.from({ length: fan }, () => r.normal(0, sc))));
      b.push(new Array(sizes[l + 1]).fill(0));
    }
    const forward = x => {
      const A = [x], Z = [];
      for (let l = 0; l < L; l++) {
        const z = W[l].map((row, k) => row.reduce((s, w, j) => s + w * A[l][j], b[l][k]));
        Z.push(z);
        A.push(l < L - 1 ? z.map(act.f) : out === 'softmax' ? softmax(z) : z);
      }
      return { A, Z };
    };
    const mW = W.map(m => m.map(row => row.map(() => 0))), vW = W.map(m => m.map(row => row.map(() => 0)));
    const mb = b.map(v => v.map(() => 0)), vb = b.map(v => v.map(() => 0));
    const lr = o.lr || 0.02, b1 = 0.9, b2 = 0.999, l2 = o.l2 === undefined ? 1e-4 : o.l2, n = X.length, epochs = o.epochs || 800, hist = [];
    for (let ep = 1; ep <= epochs; ep++) {
      const gW = W.map(m => m.map(row => row.map(() => 0))), gb = b.map(v => v.map(() => 0));
      let loss = 0;
      for (let i = 0; i < n; i++) {
        const { A, Z } = forward(X[i]); const yhat = A[L];
        let d = yhat.map((v, k) => (v - Y[i][k]) / n);
        loss += out === 'softmax' ? -Math.log(Math.max(1e-12, yhat[Y[i].indexOf(1)])) / n : 0.5 * yhat.reduce((s, v, k) => s + (v - Y[i][k]) ** 2, 0) / n;
        for (let l = L - 1; l >= 0; l--) {
          for (let k = 0; k < d.length; k++) { gb[l][k] += d[k]; const row = gW[l][k]; for (let j = 0; j < row.length; j++) row[j] += d[k] * A[l][j]; }
          if (l > 0) { const nd = new Array(sizes[l]).fill(0); for (let k = 0; k < d.length; k++) for (let j = 0; j < nd.length; j++) nd[j] += W[l][k][j] * d[k]; d = nd.map((v, j) => v * act.d(Z[l - 1][j], A[l][j])); }
        }
      }
      const c1 = 1 - Math.pow(b1, ep), c2 = 1 - Math.pow(b2, ep);
      for (let l = 0; l < L; l++) {
        for (let k = 0; k < W[l].length; k++) {
          for (let j = 0; j < W[l][k].length; j++) {
            const g = gW[l][k][j] + l2 * W[l][k][j];
            mW[l][k][j] = b1 * mW[l][k][j] + (1 - b1) * g; vW[l][k][j] = b2 * vW[l][k][j] + (1 - b2) * g * g;
            W[l][k][j] -= lr * (mW[l][k][j] / c1) / (Math.sqrt(vW[l][k][j] / c2) + 1e-8);
          }
          const g = gb[l][k]; mb[l][k] = b1 * mb[l][k] + (1 - b1) * g; vb[l][k] = b2 * vb[l][k] + (1 - b2) * g * g;
          b[l][k] -= lr * (mb[l][k] / c1) / (Math.sqrt(vb[l][k] / c2) + 1e-8);
        }
      }
      if (ep === 1 || ep % 10 === 0) hist.push([ep, loss]);
    }
    return { W, b, hist, run: x => forward(x).A[L] };
  };
  CLS.ann = function (X, y, K, o) {
    const sizes = [X[0].length].concat(new Array(o.layers || 1).fill(o.neurons || 8), [K]);
    const net = ML.trainNet(X, y.map(v => Array.from({ length: K }, (_, k) => (k === v ? 1 : 0))), sizes, { act: o.act, seed: o.seed, epochs: o.epochs || 600, lr: 0.02 });
    return { hist: net.hist, proba: x => net.run(x) };
  };
  ML.CLS = CLS;

  /* =================================================================
     regression models (one input): fit(X, y, opts) -> { predict(x) }
     X standardized by the caller; y in its own units.
     ================================================================= */
  const REG = {};
  REG.linear = function (X, y) {
    const n = X.length, mx = X.reduce((s, x) => s + x[0], 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
    let sxy = 0, sxx = 0; X.forEach((x, i) => { sxy += (x[0] - mx) * (y[i] - my); sxx += (x[0] - mx) ** 2; });
    const b = sxx ? sxy / sxx : 0, a = my - b * mx;
    return { a, b, predict: x => a + b * x[0] };
  };
  REG.knn = function (X, y, o) { const k = o.k || 5; return { predict: x => { const nb = nearest(X, x, k); return nb.reduce((s, i) => s + y[i], 0) / nb.length; } }; };
  REG.tree = function (X, y, o) { const root = buildTree(X, y, X.map((_, i) => i), { maxDepth: o.depth || 3 }, 0, ML.rng(1)); return { root, predict: x => treeLeaf(root, x).value }; };
  REG.forest = function (X, y, o) {
    const r = ML.rng((o.seed || 1) * 31 + 7), n = X.length, trees = [];
    for (let t = 0; t < (o.trees || 50); t++) { const rows = Array.from({ length: n }, () => Math.floor(r.random() * n)); trees.push(buildTree(X, y, rows, { maxDepth: o.depth || 6 }, 0, r)); }
    return { trees, predict: x => trees.reduce((s, tr) => s + treeLeaf(tr, x).value, 0) / trees.length };
  };
  REG.xgb = function (X, y, o) {
    const n = X.length, eta = o.eta || 0.3, base = y.reduce((s, v) => s + v, 0) / n, F = new Array(n).fill(base), trees = [], rows = X.map((_, i) => i);
    for (let t = 0; t < (o.rounds || 50); t++) {
      const g = F.map((f, i) => f - y[i]), h = new Array(n).fill(1), tr = xgbTree(X, g, h, rows, { maxDepth: o.depth || 3 }, 0);
      trees.push(tr); for (let i = 0; i < n; i++) F[i] += eta * xgbOut(tr, X[i]);
    }
    return { base, trees, predict: x => base + trees.reduce((s, tr) => s + eta * xgbOut(tr, x), 0) };
  };
  /* support vector regression: errors inside the band of +/- epsilon cost nothing.
     min 1/2 b'Kb + eps |b|_1 - y'b, -C <= b_i <= C  (dual, bias in the kernel), on standardized y */
  REG.svr = function (X, y, o) {
    const n = X.length, my = y.reduce((s, v) => s + v, 0) / n, sy = Math.sqrt(y.reduce((s, v) => s + (v - my) ** 2, 0) / n) || 1;
    const t = y.map(v => (v - my) / sy), eps = (o.eps === undefined ? 0.5 : o.eps) / sy, C = o.C || 1, ker = ML.kernel(o, 1);
    const Kx = X.map(a => X.map(b => ker(a, b) + 1)), beta = new Array(n).fill(0), f = new Array(n).fill(0), r = ML.rng(4321), order = X.map((_, i) => i);
    for (let pass = 0; pass < 3000; pass++) {
      r.shuffle(order); let ch = 0;
      for (const i of order) {
        const Q = Kx[i][i], gi = f[i] - Q * beta[i] - t[i], z = -gi;
        const nb = clamp(Math.sign(z) * Math.max(0, Math.abs(z) - eps) / Q, -C, C), d = nb - beta[i];
        if (d) { for (let j = 0; j < n; j++) f[j] += d * Kx[i][j]; beta[i] = nb; ch = Math.max(ch, Math.abs(d)); }
      }
      if (ch < 1e-7) break;
    }
    const sv = []; beta.forEach((v, i) => { if (Math.abs(v) > 1e-8) sv.push(i); });
    return { sv, eps: eps * sy, predict: x => my + sy * sv.reduce((s, i) => s + beta[i] * (ker(X[i], x) + 1), 0) };
  };
  REG.ann = function (X, y, o) {
    const n = y.length, my = y.reduce((s, v) => s + v, 0) / n, sy = Math.sqrt(y.reduce((s, v) => s + (v - my) ** 2, 0) / n) || 1;
    const sizes = [1].concat(new Array(o.layers || 1).fill(o.neurons || 8), [1]);
    const net = ML.trainNet(X, y.map(v => [(v - my) / sy]), sizes, { act: o.act, seed: o.seed, out: 'linear', epochs: o.epochs || 1500, lr: 0.02 });
    return { hist: net.hist, predict: x => my + sy * net.run(x)[0] };
  };
  ML.REG = REG;

  /* =================================================================
     clustering
     ================================================================= */
  /* k-means, one step at a time: state { centers, labels, iter, moved } */
  ML.kmeansInit = function (X, k, seed) {
    const idx = ML.rng(seed * 11 + 1).shuffle(X.map((_, i) => i)).slice(0, k);
    return { centers: idx.map(i => X[i].slice()), labels: null, iter: 0, done: false };
  };
  ML.kmeansAssign = (X, C) => X.map(x => { let b = 0, bd = Infinity; C.forEach((c, k) => { const d = (x[0] - c[0]) ** 2 + (x[1] - c[1]) ** 2; if (d < bd - 1e-15) { bd = d; b = k; } }); return b; });
  ML.kmeansStep = function (X, st) {
    const labels = ML.kmeansAssign(X, st.centers), k = st.centers.length;
    const sum = Array.from({ length: k }, () => [0, 0, 0]);
    X.forEach((x, i) => { sum[labels[i]][0] += x[0]; sum[labels[i]][1] += x[1]; sum[labels[i]][2]++; });
    const centers = st.centers.map((c, j) => (sum[j][2] ? [sum[j][0] / sum[j][2], sum[j][1] / sum[j][2]] : c.slice()));
    const same = st.labels && labels.every((v, i) => v === st.labels[i]);
    return { centers, labels, iter: st.iter + 1, done: !!same, prev: st.centers };
  };
  ML.wcss = (X, labels, centers) => X.reduce((s, x, i) => s + (x[0] - centers[labels[i]][0]) ** 2 + (x[1] - centers[labels[i]][1]) ** 2, 0);

  /* agglomerative (hierarchical) clustering, Lance-Williams updates.
     Returns merges [a, b, height, size] with scipy's numbering (new cluster = n + step). */
  ML.hclust = function (X, linkage) {
    const n = X.length, D = X.map(a => X.map(b => { let s = 0; for (let j = 0; j < a.length; j++) s += (a[j] - b[j]) ** 2; return Math.sqrt(s); }));
    const ward = linkage === 'ward', active = new Map(), size = {}, merges = [];
    for (let i = 0; i < n; i++) { active.set(i, i); size[i] = 1; }
    const dist = {}; const key = (a, b) => (a < b ? a + ',' + b : b + ',' + a);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) dist[key(i, j)] = ward ? D[i][j] : D[i][j];
    let ids = Array.from({ length: n }, (_, i) => i);
    for (let step = 0; step < n - 1; step++) {
      let best = null;
      for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) { const d = dist[key(ids[x], ids[y])]; if (!best || d < best[2] - 1e-12) best = [ids[x], ids[y], d]; }
      const [a, b, h] = best, c = n + step; size[c] = size[a] + size[b];
      merges.push([Math.min(a, b), Math.max(a, b), h, size[c]]);
      ids = ids.filter(v => v !== a && v !== b);
      for (const q of ids) {
        const da = dist[key(a, q)], db = dist[key(b, q)], na = size[a], nb = size[b], nq = size[q];
        let d;
        if (linkage === 'single') d = Math.min(da, db);
        else if (linkage === 'complete') d = Math.max(da, db);
        else if (ward) d = Math.sqrt(((na + nq) * da * da + (nb + nq) * db * db - nq * h * h) / (na + nb + nq));
        else d = (na * da + nb * db) / (na + nb);
        dist[key(c, q)] = d;
      }
      ids.push(c);
    }
    return merges;
  };
  /* cut the tree into k clusters: undo the last k-1 merges */
  ML.hcut = function (merges, n, k) {
    const parent = {}; const find = v => (parent[v] === undefined ? v : (parent[v] = find(parent[v])));
    merges.slice(0, n - k).forEach((m, s) => { parent[m[0]] = n + s; parent[m[1]] = n + s; });
    const roots = {}, labels = [];
    for (let i = 0; i < n; i++) { const r = find(i); if (roots[r] === undefined) roots[r] = Object.keys(roots).length; labels.push(roots[r]); }
    return labels;
  };

  /* =================================================================
     metrics
     ================================================================= */
  ML.confusion = function (yt, yp, K) { const M = Array.from({ length: K }, () => new Array(K).fill(0)); yt.forEach((v, i) => M[v][yp[i]]++); return M; };
  /* binary: positive class pos (default 1). Rows = actual, columns = predicted. */
  ML.binaryMetrics = function (M, pos) {
    pos = pos === undefined ? 1 : pos; const neg = 1 - pos;
    const TP = M[pos][pos], FN = M[pos][neg], FP = M[neg][pos], TN = M[neg][neg], n = TP + FN + FP + TN;
    const div = (a, b) => (b ? a / b : NaN);
    const sens = div(TP, TP + FN), spec = div(TN, TN + FP), prec = div(TP, TP + FP);
    return { TP, FN, FP, TN, n, acc: div(TP + TN, n), mis: div(FP + FN, n), sens, spec, fa: div(FP, FP + TN), prec, f1: div(2 * prec * sens, prec + sens) };
  };
  ML.multiMetrics = function (M) {
    const K = M.length, n = M.flat().reduce((a, b) => a + b, 0); let diag = 0; for (let k = 0; k < K; k++) diag += M[k][k];
    const per = M.map((row, k) => { const act = row.reduce((a, b) => a + b, 0), pred = M.reduce((s, r) => s + r[k], 0), sens = act ? M[k][k] / act : NaN, prec = pred ? M[k][k] / pred : NaN; return { sens, prec, f1: 2 * prec * sens / (prec + sens), n: act }; });
    return { n, acc: n ? diag / n : NaN, mis: n ? 1 - diag / n : NaN, per };
  };
  /* ROC: points (false alarm rate, sensitivity) for every threshold, and the area under it */
  ML.roc = function (score, isPos) {
    const idx = score.map((s, i) => i).sort((a, b) => score[b] - score[a]);
    const P = isPos.filter(v => v).length, N = isPos.length - P, pts = [[0, 0, Infinity]];
    let tp = 0, fp = 0, auc = 0;
    for (let t = 0; t < idx.length;) {
      const s = score[idx[t]]; let u = t;
      while (u < idx.length && score[idx[u]] === s) { if (isPos[idx[u]]) tp++; else fp++; u++; }
      const prev = pts[pts.length - 1], x = N ? fp / N : 0, y = P ? tp / P : 0;
      auc += (x - prev[0]) * (y + prev[1]) / 2; pts.push([x, y, s]); t = u;
    }
    return { pts, auc: P && N ? auc : NaN };
  };
  ML.regMetrics = function (y, f) {
    const n = y.length; if (!n) return null;
    let se = 0, ae = 0, pe = 0, ape = 0, okp = 0; const my = y.reduce((s, v) => s + v, 0) / n; let st = 0;
    y.forEach((v, i) => { const e = v - f[i]; se += e * e; ae += Math.abs(e); st += (v - my) ** 2; if (v !== 0) { pe += e / v; ape += Math.abs(e / v); okp++; } });
    return { n, mse: se / n, rmse: Math.sqrt(se / n), mae: ae / n, mpe: okp ? 100 * pe / okp : NaN, mape: okp ? 100 * ape / okp : NaN, r2: st > 0 ? 1 - se / st : NaN };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = ML;
  else { root.MLS = root.MLS || {}; root.MLS.ml = ML; }
})(typeof window !== 'undefined' ? window : this);
