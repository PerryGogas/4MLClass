/* =====================================================================
   4MLClass figures for Presentation 2 "Metrics to evaluate our forecasts":
   the confusion matrix, the threshold T with a logit, the ROC curve and
   the regression metrics.
   (c) 2026 Periklis Gogas, EMEF Lab. MIT License.
   ===================================================================== */
(function () {
  'use strict';
  const MLS = window.MLS, FIGS = window.FIGS;
  const f2 = x => MLS.fmt(x, 2), f3 = x => MLS.fmt(x, 3);
  const pct = x => (Number.isFinite(x) ? (Math.round(x * 1000) / 10).toFixed(1).replace(/\.0$/, '') + '%' : 'n/a');
  const col = n => MLS.css('--series-' + n);
  const RED = () => col(8), BLUE = () => col(1), GREEN = () => col(3);
  const euro = v => '€' + Math.round(v).toLocaleString('en-US');
  function shell(host, title, side, main) {
    host.innerHTML = '<div class="ifig"><div class="ifig-head"><span class="badge">Interactive</span><h3>' + title + '</h3></div><div class="ifig-grid"><div>' + side + '</div><div>' + main + '</div></div></div>';
    return s => host.querySelector(s);
  }
  const slider = (id, label, min, max, step, val, help) => '<div class="field-row"><label for="' + id + '">' + label + (help ? MLS.helpBtn(help) : '') + '</label><output id="' + id + 'V"></output></div><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">';
  const frac = (a, b) => (b ? a + '/' + b + ' = ' + pct(a / b) : 'n/a');
  function metrics(c) {
    const { TN, FP, FN, TP } = c, n = TN + FP + FN + TP, P = TP + FN, N = TN + FP, d = (a, b) => (b ? a / b : NaN);
    const sens = d(TP, P), spec = d(TN, N), prec = d(TP, TP + FP);
    return { n, P, N, acc: d(TP + TN, n), mis: d(FP + FN, n), sens, spec, fa: d(FP, N), prec, f1: d(2 * prec * sens, prec + sens) };
  }
  /* small confusion matrix (slide layout: rows actual 0/1, columns predicted 0/1) */
  function cmHTML(c, mode, names) {
    const r0 = c.TN + c.FP, r1 = c.FN + c.TP;
    const v = (x, r) => (mode === 'pct' ? (r ? pct(x / r) : 'n/a') : String(x));
    const nm = names || ['0', '1'];
    return '<table class="cm-tbl"><thead><tr><th colspan="2" rowspan="2"></th><th colspan="2">Predicted</th></tr><tr><th>' + nm[0] + '</th><th>' + nm[1] + '</th></tr></thead><tbody>' +
      '<tr><th rowspan="2" class="cm-act">Actual</th><th>' + nm[0] + '</th><td class="cm-ok" data-c="TN"><small>TN</small>' + v(c.TN, r0) + '</td><td class="cm-bad" data-c="FP"><small>FP</small>' + v(c.FP, r0) + '</td></tr>' +
      '<tr><th>' + nm[1] + '</th><td class="cm-bad" data-c="FN"><small>FN</small>' + v(c.FN, r1) + '</td><td class="cm-ok" data-c="TP"><small>TP</small>' + v(c.TP, r1) + '</td></tr></tbody></table>';
  }

  /* ================================================================
     1. The confusion matrix and its metrics (slides 6 to 24, 40, 41)
     ================================================================ */
  MLS.registerHelp({
    cm_pre: { title: 'Examples from the slides', html: 'Load an example from the slides. In the 12 observations you can click a prediction to change it; in the others you can type the four counts.' },
    cm_mode: { title: 'Counts or %', html: '<b>Counts</b>: the number of cases. <b>%</b>: the percentages as a proportion of the actual class (each row adds up to 100%).' },
    cm_hover: { title: 'Which cells?', html: 'Point at a metric to highlight the cells of the confusion matrix it uses.' }
  });
  FIGS.cmatrix = function (host) {
    const PRE = {
      obs12: { t: '12 observations (slides 7 to 10)', names: ['0', '1'], pos: '1 → infected / bankruptcy' },
      orange: { t: 'Actual case from Orange (slide 11)', c: { TN: 195, FP: 20, FN: 17, TP: 88 }, names: ['0', '1'], pos: '1' },
      svm19: { t: 'Bank failures, linear SVM (slide 19)', c: { TN: 929, FP: 33, FN: 41, TP: 440 }, names: ['0', '1'], pos: '1 → failed bank' },
      A: { t: 'Sample A (slide 22)', c: { TN: 6, FP: 3, FN: 4, TP: 7 }, names: ['Red', 'Blue'], pos: 'Blue' },
      B: { t: 'Sample B (slide 23)', c: { TN: 99, FP: 3, FN: 5, TP: 3 }, names: ['Red', 'Blue'], pos: 'Blue' },
      C: { t: 'Sample C (slide 24)', c: { TN: 99, FP: 0, FN: 1, TP: 0 }, names: ['Red', 'Blue'], pos: 'Blue' },
      svm40: { t: 'SVM on 1,279 banks (slide 40)', c: { TN: 1157, FP: 7, FN: 3, TP: 112 }, names: ['Solvent', 'Insolvent'], pos: 'Insolvent' },
      naive: { t: 'Naive model: "all are insolvent" (slide 41)', c: { TN: 0, FP: 1164, FN: 0, TP: 115 }, names: ['Solvent', 'Insolvent'], pos: 'Insolvent' }
    };
    const ACT = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], PRED0 = [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0];
    let pre = PRE[host.dataset.pre] ? host.dataset.pre : 'obs12', pred = PRED0.slice(), c = PRE[pre].c ? Object.assign({}, PRE[pre].c) : null, mode = 'n';
    const $ = shell(host, 'The confusion matrix and its metrics',
      '<div class="card"><label class="field" style="margin-top:0" for="cmPre">Example' + MLS.helpBtn('cm_pre') + '</label><select id="cmPre">' + Object.keys(PRE).map(k => '<option value="' + k + '">' + PRE[k].t + '</option>').join('') + '</select>' +
        '<div class="field-row"><label>Show' + MLS.helpBtn('cm_mode') + '</label></div><div class="seg" id="cmMode"><button type="button" data-v="n" aria-pressed="true">Counts</button><button type="button" data-v="pct" aria-pressed="false">% of actual</button></div>' +
        '<div id="cmEdit" style="margin-top:10px"></div></div>',
      '<div id="cmObs"></div><div class="cm-wrap"><div id="cmM"></div><div id="cmMet"></div></div>');
    function counts() {
      if (pre !== 'obs12') return c;
      const k = { TN: 0, FP: 0, FN: 0, TP: 0 };
      ACT.forEach((a, i) => { const p = pred[i]; k[a ? (p ? 'TP' : 'FN') : (p ? 'FP' : 'TN')]++; });
      return k;
    }
    function edit() {
      if (pre === 'obs12') { $('#cmEdit').innerHTML = '<div class="note">Click a prediction in the table to change it.</div><button type="button" class="btn-ghost btn-small" id="cmBack">&#8634; The slide predictions</button>'; $('#cmBack').onclick = () => { pred = PRED0.slice(); upd(); }; return; }
      $('#cmEdit').innerHTML = '<div class="note">Type the counts:</div><div class="cm-inputs">' + ['TN', 'FP', 'FN', 'TP'].map(k => '<label>' + k + '<input type="number" min="0" step="1" value="' + c[k] + '" data-k="' + k + '"></label>').join('') + '</div>';
      MLS.$$('#cmEdit input', host).forEach(inp => (inp.oninput = () => { const v = Math.max(0, Math.round(Number(inp.value))); if (Number.isFinite(v)) { c[inp.dataset.k] = v; upd(); } }));
    }
    function upd() {
      const k = counts(), m = metrics(k), nm = PRE[pre].names;
      if (pre === 'obs12') {
        const res = ACT.map((a, i) => (a ? (pred[i] ? 'TP' : 'FN') : (pred[i] ? 'FP' : 'TN')));
        $('#cmObs').innerHTML = '<div class="tbl-wrap" style="margin-bottom:10px"><table class="tbl obs-tbl"><tbody>' +
          '<tr><th>Individual number</th>' + ACT.map((_, i) => '<td>' + (i + 1) + '</td>').join('') + '</tr>' +
          '<tr><th>Actual classification</th>' + ACT.map(a => '<td>' + a + '</td>').join('') + '</tr>' +
          '<tr><th>Predicted classification</th>' + pred.map((p, i) => '<td><button type="button" class="btn-ghost obs-btn" data-i="' + i + '">' + p + '</button></td>').join('') + '</tr>' +
          '<tr><th>Result</th>' + res.map(r => '<td class="' + (r[0] === 'T' ? 'cm-ok' : 'cm-bad') + '">' + r + '</td>').join('') + '</tr></tbody></table></div>';
        MLS.$$('.obs-btn', host).forEach(b => (b.onclick = () => { const i = Number(b.dataset.i); pred[i] = 1 - pred[i]; upd(); }));
      } else $('#cmObs').innerHTML = '';
      $('#cmM').innerHTML = '<div class="note" style="margin:0 0 4px">Positive class: <b>' + PRE[pre].pos + '</b></div>' + cmHTML(k, mode, nm) +
        '<div class="note">n = ' + m.n + ' &middot; actual 1 (P) = ' + m.P + ' &middot; actual 0 (N) = ' + m.N + '</div>';
      const rows = [
        ['Accuracy', 'how good is the model overall?', '\\frac{TP+TN}{TP+FN+FP+TN}', frac(k.TP + k.TN, m.n), 'TP TN'],
        ['Misclassification rate', 'how bad is the model overall?', '\\frac{FN+FP}{all} = 1 - Acc', frac(k.FN + k.FP, m.n), 'FN FP'],
        ['Sensitivity (recall)', 'what % of 1s are forecasted correctly?', '\\frac{TP}{TP+FN}', frac(k.TP, m.P), 'TP FN'],
        ['Specificity', 'what % of 0s are forecasted correctly?', '\\frac{TN}{TN+FP}', frac(k.TN, m.N), 'TN FP'],
        ['False alarms', '1 − specificity: 0s forecasted as 1s', '\\frac{FP}{N}', frac(k.FP, m.N), 'FP TN'],
        ['Precision', 'from the 1s forecasted, how many are correct?', '\\frac{TP}{TP+FP}', frac(k.TP, k.TP + k.FP), 'TP FP'],
        ['F1', 'balancing sensitivity and precision', '\\frac{2 \\cdot Prec \\cdot Sens}{Prec + Sens}', Number.isFinite(m.f1) ? pct(m.f1) : 'n/a', 'TP FN FP']
      ];
      $('#cmMet').innerHTML = '<table class="q-tbl met-tbl"><thead><tr><th>Metric' + MLS.helpBtn('cm_hover') + '</th><th>Formula</th><th>Value</th></tr></thead><tbody>' +
        rows.map(r => '<tr data-cells="' + r[4] + '"><td><b>' + r[0] + '</b><div class="note" style="margin:0">' + r[1] + '</div></td><td>' + MLS.tex(r[2]) + '</td><td><b>' + r[3] + '</b></td></tr>').join('') + '</tbody></table>';
      MLS.$$('.met-tbl tr[data-cells]', host).forEach(tr => {
        tr.onmouseenter = () => tr.dataset.cells.split(' ').forEach(cc => { const td = host.querySelector('#cmM td[data-c="' + cc + '"]'); if (td) td.classList.add('hl'); });
        tr.onmouseleave = () => MLS.$$('#cmM td.hl', host).forEach(td => td.classList.remove('hl'));
      });
    }
    $('#cmPre').onchange = e => { pre = e.target.value; c = PRE[pre].c ? Object.assign({}, PRE[pre].c) : null; edit(); upd(); };
    MLS.$$('#cmMode button', host).forEach(b => (b.onclick = () => { mode = b.dataset.v; MLS.$$('#cmMode button', host).forEach(x => x.setAttribute('aria-pressed', String(x === b))); upd(); }));
    $('#cmPre').value = pre;
    edit(); upd();
  };

  /* ================================================================
     2. The threshold T with a logit model, and the cost (slides 29 to 38)
     ================================================================ */
  MLS.registerHelp({
    th_T: { title: 'Threshold T', html: 'Models give a probability that a bank fails. If the probability is above T we classify the bank as failed (1), else as healthy (0). The default is T = 0.5.' },
    th_cost: { title: 'The cost function', html: 'C = (cost of a FP) × FP + (cost of a FN) × FN. The costs are not symmetrical: here a missed bank failure (FN) costs 1000 times more than a false alarm (FP).' },
    th_sc: { title: 'The banks', html: 'Two cases from the slides. In slide 30 the failed and the healthy banks are clearly apart. From slide 31 one failed bank has a low probability of default (0.35).' }
  });
  FIGS.threshold = function (host) {
    const k = 1.1, x0 = 5, pOf = x => 1 / (1 + Math.exp(-k * (x - x0))), xOf = p => x0 + Math.log(p / (1 - p)) / k;
    const SC = { s30: { t: 'Slide 30: clear separation', f: [0.58, 0.72, 0.86, 0.94, 0.98] }, s31: { t: 'Slides 31 to 36: one failed bank at 0.35', f: [0.35, 0.62, 0.84, 0.93, 0.98] } };
    const healthy = [0.02, 0.05, 0.12, 0.25];
    let sc = 's31', T = 0.5, cFP = 100000, cFN = 100000000;
    const banks = () => healthy.map(p => ({ p, y: 0 })).concat(SC[sc].f.map(p => ({ p, y: 1 }))).map(b => Object.assign(b, { x: xOf(b.p) }));
    const $ = shell(host, 'Changing the threshold T: a logit model for bank defaults',
      '<div class="card"><label class="field" style="margin-top:0" for="thSc">Banks' + MLS.helpBtn('th_sc') + '</label><select id="thSc"><option value="s30">' + SC.s30.t + '</option><option value="s31" selected>' + SC.s31.t + '</option></select>' +
        slider('thT', 'Threshold T', 0.05, 0.95, 0.01, 0.5, 'th_T') +
        '<div class="btn-row" style="margin-top:6px"><button type="button" class="btn-ghost btn-small" data-t="0.5">T = 0.5</button><button type="button" class="btn-ghost btn-small" data-t="0.3">T = 0.3</button><button type="button" class="btn-ghost btn-small" data-t="0.2">T = 0.2</button></div></div>' +
      '<div class="card"><b>The cost function</b>' + MLS.helpBtn('th_cost') + '<label class="field" for="thFP">Cost of a FP (false alarm) €</label><input type="number" id="thFP" min="0" step="1000" value="100000">' +
        '<label class="field" for="thFN">Cost of a FN (missed failure) €</label><input type="number" id="thFN" min="0" step="1000" value="100000000">' +
        '<button type="button" class="btn-secondary btn-small" id="thBest" style="margin-top:8px">Find the lowest-cost T</button></div>',
      '<div class="stat-grid" id="thStats"></div><div id="thFig"></div>');
    const F = MLS.figure($('#thFig'), {
      title: 'Forecast bank defaults with a logit model', sub: 'x: debt-to-equity ratio ↑ → risk of default ↑. Blue: healthy, red: failed.', file: 'threshold-logit',
      plot: { x: { domain: [0, 10], label: 'x: debt-to-equity ratio' }, y: { domain: [-0.04, 1.04], label: 'y: probability of default' }, aspect: 0.62 },
      data: () => ({ cols: ['Debt-to-equity', 'Probability of default', 'Actual', 'Classified'], rows: banks().map(b => [Number(b.x.toFixed(2)), b.p, b.y ? 'Failed' : 'Healthy', b.p > T ? 'Failed' : 'Healthy']) })
    });
    function conf(t) { const c = { TN: 0, FP: 0, FN: 0, TP: 0 }; banks().forEach(b => { const p = b.p > t ? 1 : 0; c[b.y ? (p ? 'TP' : 'FN') : (p ? 'FP' : 'TN')]++; }); return c; }
    const cost = c => cFP * c.FP + cFN * c.FN;
    function upd() {
      $('#thTV').textContent = f2(T);
      const c = conf(T), m = metrics(c), B = banks();
      $('#thStats').innerHTML = '<div class="stat cm-stat">' + cmHTML(c, 'n', ['0', '1']) + '</div>' +
        MLS.statCard('Sensitivity (failed)', pct(m.sens), c.TP + ' of ' + m.P, m.sens === 1 ? 'good' : 'bad') +
        MLS.statCard('Specificity', pct(m.spec), c.TN + ' of ' + m.N + ' · false alarms ' + pct(m.fa), m.spec === 1 ? 'good' : 'bad') +
        MLS.statCard('Precision (failed)', pct(m.prec), c.TP + '/' + (c.TP + c.FP)) +
        MLS.statCard('Accuracy', pct(m.acc), (c.TP + c.TN) + '/' + m.n) +
        MLS.statCard('Total cost C', euro(cost(c)), c.FN + ' FN × ' + euro(cFN) + ' + ' + c.FP + ' FP × ' + euro(cFP), (cost(c) ? 'bad' : 'good') + ' sm');
      F.plot.draw(P => {
        P.rect(0, T, 10, 1.04, { fill: MLS.rgba(RED(), 0.06) });
        P.fn(pOf, { color: GREEN(), width: 3, samples: 300 });
        B.forEach(b => { P.segment(b.x, 0, b.x, b.p, { color: P.C.muted, dash: '3 4' }); P.segment(0, b.p, b.x, b.p, { color: P.C.grid, dash: '3 4' }); });
        P.hline(T, { color: RED(), width: 2.5 });
        P.text(0.15, T, 'T = ' + f2(T), { dy: -6, size: 12.5, color: RED() });
        const wrong = b => (b.p > T ? 1 : 0) !== b.y;
        P.points(B.map(b => [b.x, 0, b]), { color: d => (d[2].y ? RED() : BLUE()), r: 8, highlight: d => wrong(d[2]), tip: d => (d[2].y ? 'Failed' : 'Healthy') + ' bank<br>Probability of default: <b>' + f2(d[2].p) + '</b><br>Classified as ' + (d[2].p > T ? 'failed' : 'healthy') + (wrong(d[2]) ? ' → <b>' + (d[2].y ? 'False Negative' : 'False Positive') + '</b>' : '') });
        P.points(B.map(b => [b.x, b.p, b]), { color: d => (d[2].y ? RED() : BLUE()), r: 4.5 });
      });
      const msg = c.FN && c.FP ? 'We have both a False Negative and a False Positive.' : c.FN ? '<b>False Negative:</b> a failed bank is classified as healthy. What is the cost? What can we do?' : c.FP ? '<b>We now have a False Positive.</b> What is the cost?' : 'No misclassifications at this threshold.';
      F.caption(msg + ' A bank is classified as failed when its probability is above T.');
      F.refreshTable();
    }
    $('#thSc').onchange = e => { sc = e.target.value; upd(); };
    $('#thT').oninput = e => { T = Number(e.target.value); upd(); };
    MLS.$$('[data-t]', host).forEach(b => (b.onclick = () => { T = Number(b.dataset.t); $('#thT').value = T; upd(); }));
    $('#thFP').oninput = e => { cFP = Math.max(0, Number(e.target.value) || 0); upd(); };
    $('#thFN').oninput = e => { cFN = Math.max(0, Number(e.target.value) || 0); upd(); };
    $('#thBest').onclick = () => {
      let best = null;
      for (let t = 0.05; t <= 0.951; t += 0.01) { const v = cost(conf(t)); if (!best || v < best.v - 1e-9) best = { t, v }; }
      T = Math.round(best.t * 100) / 100; $('#thT').value = T; upd();
      MLS.toast('Lowest cost at T = ' + f2(T) + ': ' + euro(best.v));
    };
    upd();
  };

  /* ================================================================
     3. The ROC curve and AUC (slides 42 to 46)
     ================================================================ */
  MLS.registerHelp({
    roc_T: { title: 'Threshold', html: 'If p > T → classify as 1 (failed); if p ≤ T → classify as 0. Threshold = 1: everything is 0, the point (0, 0). Threshold = 0: everything is 1, the point (1, 1).' },
    roc_abc: { title: 'Choosing a point', html: 'Each point of the ROC curve is a threshold. <b>A</b>: few false alarms but we miss failures. <b>B</b>: a balance (closest to the top-left corner). <b>C</b>: we find almost all failures but with many false alarms. The best point depends on the problem at hand.' },
    roc_auc: { title: 'Intuitive definition of AUC', html: '"If we randomly select one positive instance and one negative instance from our dataset, the AUC is the probability that the model will assign a higher predicted probability to the positive instance than to the negative one." Draw pairs to check it.' }
  });
  FIGS.roc = function (host) {
    const r = MLS.rng(4246), B = [];
    for (let i = 0; i < 40; i++) B.push({ y: 1, p: 1 / (1 + Math.exp(-(1.5 * r.normal(1.25, 1) - 1.4))) });
    for (let i = 0; i < 80; i++) B.push({ y: 0, p: 1 / (1 + Math.exp(-(1.5 * r.normal(0, 1) - 1.4))) });
    B.forEach(b => (b.p = Math.round(b.p * 1000) / 1000));
    const R = MLS.ml.roc(B.map(b => b.p), B.map(b => b.y === 1)), P = B.filter(b => b.y).length, N = B.length - P;
    const at = t => { let tp = 0, fp = 0; B.forEach(b => { if (b.p > t) { if (b.y) tp++; else fp++; } }); return { tpr: tp / P, fpr: fp / N, tp, fp }; };
    let youden = { t: 0.5, j: -1 }; for (let t = 0.01; t < 1; t += 0.01) { const a = at(t), j = a.tpr - a.fpr; if (j > youden.j) youden = { t: Math.round(t * 100) / 100, j }; }
    const ABC = { A: 0.7, B: youden.t, C: 0.15 };
    let T = 0.5, ref = false, pairs = { n: 0, k: 0 };
    const pr = MLS.rng(MLS.newSeed());
    const Phi = z => { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
    const PhiInv = q => { let lo = -8, hi = 8; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Phi(m) < q) lo = m; else hi = m; } return (lo + hi) / 2; };
    const $ = shell(host, 'The ROC curve: every threshold is a point',
      '<div class="card">' + slider('rcT', 'Threshold T', 0, 1, 0.01, 0.5, 'roc_T') +
        '<div class="field-row"><label>Choose a point' + MLS.helpBtn('roc_abc') + '</label></div><div class="btn-row"><button type="button" class="btn-ghost btn-small" data-p="A">A</button><button type="button" class="btn-ghost btn-small" data-p="B">B</button><button type="button" class="btn-ghost btn-small" data-p="C">C</button></div>' +
        '<label class="check"><input type="checkbox" id="rcRef"> Show perfect, good and random curves</label></div>' +
      '<div class="card"><b>AUC as a probability</b>' + MLS.helpBtn('roc_auc') + '<div class="btn-row" style="margin-top:6px"><button type="button" class="btn-secondary btn-small" id="rc1">Draw 1 pair</button><button type="button" class="btn-ghost btn-small" id="rc100">Draw 100 pairs</button><button type="button" class="btn-ghost btn-small" id="rc0">&#8634;</button></div><div class="note" id="rcPair"></div></div>',
      '<div class="stat-grid" id="rcStats"></div><div class="fig-grid"><div id="rcFig"></div><div id="rcDist"></div></div>');
    const F = MLS.figure($('#rcFig'), {
      title: 'ROC curve: Receiver Operating Characteristic', sub: '120 banks, 40 failed', file: 'roc-curve',
      plot: { x: { domain: [0, 1], label: 'False Positive Rate (1 − specificity): 0s classified as 1s' }, y: { domain: [0, 1], label: 'Sensitivity: TP rate' }, square: 0.9 },
      data: () => ({ cols: ['Threshold', 'False positive rate', 'Sensitivity'], rows: R.pts.slice(1).map(q => [q[2], Number(q[0].toFixed(4)), Number(q[1].toFixed(4))]) })
    });
    const D = MLS.figure($('#rcDist'), {
      title: 'Predicted probabilities', sub: 'Banks to the right of T are classified as failed', file: 'roc-probabilities',
      plot: { x: { domain: [0, 1], label: 'Predicted probability of failure' }, y: { domain: [-0.6, 1.6], ticks: false }, square: 0.9 },
      data: () => ({ cols: ['Bank', 'Actual', 'Probability'], rows: B.map((b, i) => [i + 1, b.y ? 'Failed' : 'Healthy', b.p]) })
    });
    const jit = B.map(() => pr.uniform(-0.35, 0.35));
    function upd() {
      $('#rcTV').textContent = f2(T);
      const a = at(T);
      $('#rcStats').innerHTML = MLS.statCard('Threshold', f2(T)) + MLS.statCard('Sensitivity (TPR)', pct(a.tpr), a.tp + ' of ' + P + ' failed found') + MLS.statCard('False alarms (FPR)', pct(a.fpr), a.fp + ' of ' + N + ' healthy') + MLS.statCard('AUC', f3(R.auc), R.auc >= 0.8 ? 'good' : 'fair', R.auc >= 0.8 ? 'good' : '');
      F.plot.draw(Pl => {
        Pl.line([[0, 0], [1, 1]], { color: Pl.C.muted, dash: '6 5', width: 1.4 });
        if (ref) {
          Pl.line([[0, 0], [0, 1], [1, 1]], { color: GREEN(), width: 2, dash: '2 3' });
          const a8 = Math.SQRT2 * PhiInv(0.8); Pl.line(Array.from({ length: 101 }, (_, i) => { const x = i / 100; return [x, x <= 0 ? 0 : x >= 1 ? 1 : Phi(a8 + PhiInv(x))]; }), { color: col(7), width: 2, dash: '7 4' });
        }
        Pl.line(R.pts.map(q => [q[0], q[1]]), { color: col(5), width: 3 });
        Object.keys(ABC).forEach(kk => { const q = at(ABC[kk]); Pl.points([[q.fpr, q.tpr]], { color: Pl.C.surface, ringColor: Pl.C.ink, r: 5 }); Pl.text(q.fpr, q.tpr, kk, { dx: -14, dy: -6, size: 13 }); });
        Pl.points([[a.fpr, a.tpr]], { color: RED(), r: 8, ringColor: Pl.C.ink, tip: () => 'T = ' + f2(T) + '<br>Sensitivity ' + pct(a.tpr) + '<br>False alarms ' + pct(a.fpr) });
        Pl.text(1, 1, 'Threshold = 0', { anchor: 'end', dy: 16, dx: -4, size: 11.5, color: Pl.C.muted });
        Pl.text(0, 0, 'Threshold = 1', { dx: 6, dy: -8, size: 11.5, color: Pl.C.muted });
      });
      F.legend([{ label: 'Our model (AUC ' + f2(R.auc) + ')', color: col(5), line: true }, { label: 'Random (AUC 0.5)', color: MLS.css('--chart-muted'), line: true, dash: '6 5' }].concat(ref ? [{ label: 'Perfect (AUC 1.0)', color: GREEN(), line: true, dash: '2 3' }, { label: 'Good (AUC 0.8)', color: col(7), line: true, dash: '7 4' }] : []));
      F.caption('The curve starts at (0, 0) and ends at (1, 1); each point is a different threshold. Lower T → more 1s → sensitivity ↑ but false alarms ↑.');
      D.plot.draw(Pl => {
        Pl.rect(T, -0.6, 1, 1.6, { fill: MLS.rgba(RED(), 0.07) });
        Pl.points(B.map((b, i) => [b.p, b.y + jit[i] * 0.9, b]), { color: d => (d[2].y ? RED() : BLUE()), r: 4.2, highlight: d => (d[2].p > T ? 1 : 0) !== d[2].y });
        Pl.vline(T, { color: RED(), width: 2.4 });
        Pl.text(0.01, 1, 'Failed', { dy: -28, size: 12.5, color: RED() }); Pl.text(0.01, 0, 'Healthy', { dy: -24, size: 12.5, color: BLUE() });
      });
      D.caption('Ringed: misclassified at T = ' + f2(T) + '.');
      F.refreshTable(); D.refreshTable();
      $('#rcPair').innerHTML = pairs.n ? 'The failed bank had the higher probability in <b>' + pairs.k + ' of ' + pairs.n + '</b> pairs = ' + pct(pairs.k / pairs.n) + '. AUC = ' + f3(R.auc) + '.' + (pairs.last ? '<br>Last pair: failed ' + f3(pairs.last[0]) + ' vs healthy ' + f3(pairs.last[1]) : '') : 'Pick one failed and one healthy bank at random: which has the higher probability?';
    }
    function draw(k) {
      const pos = B.filter(b => b.y), neg = B.filter(b => !b.y);
      for (let i = 0; i < k; i++) { const a = pos[pr.int(0, pos.length - 1)].p, b = neg[pr.int(0, neg.length - 1)].p; pairs.n++; pairs.k += a > b ? 1 : a === b ? 0.5 : 0; pairs.last = [a, b]; }
      upd();
    }
    $('#rcT').oninput = e => { T = Number(e.target.value); upd(); };
    MLS.$$('[data-p]', host).forEach(b => (b.onclick = () => { T = ABC[b.dataset.p]; $('#rcT').value = T; upd(); }));
    $('#rcRef').onchange = e => { ref = e.target.checked; upd(); };
    $('#rc1').onclick = () => draw(1); $('#rc100').onclick = () => draw(100); $('#rc0').onclick = () => { pairs = { n: 0, k: 0 }; upd(); };
    upd();
  };

  /* ================================================================
     4. Regression metrics (slides 48 to 50)
     ================================================================ */
  MLS.registerHelp({
    rm_drag: { title: 'Move the points', html: 'Drag any point. The regression line is fitted again (least squares) and all metrics are recalculated. The red segments are the errors yᵢ − ŷᵢ.' },
    rm_out: { title: 'An outlier', html: 'One month with very unusual sales. Compare how much MSE and RMSE (squared errors) react compared to MAE.' }
  });
  FIGS.regMetrics = function (host) {
    const BASE = [[1, 12], [2, 15.5], [3, 14.5], [4, 19], [5, 20.5], [6, 23.5], [7, 22.5], [8, 28]];
    let pts = BASE.map(p => p.slice()), drag = -1, outlier = false;
    const $ = shell(host, 'Regression metrics: how far are the forecasts from the actual values?',
      '<div class="card"><div class="note" style="margin-top:0">Drag the points.' + MLS.helpBtn('rm_drag') + '</div><div class="btn-row" style="margin-top:8px"><button type="button" class="btn-ghost btn-small" id="rmOut">Add an outlier</button>' + MLS.helpBtn('rm_out') + '<button type="button" class="btn-ghost btn-small" id="rmReset">&#8634; Reset</button></div>' +
        '<table class="q-tbl" id="rmMet" style="margin-top:10px"></table></div>',
      '<div id="rmFig"></div><div class="card" style="margin-top:10px"><div class="tbl-wrap"><table class="tbl" id="rmTab"></table></div></div>');
    const F = MLS.figure($('#rmFig'), {
      title: 'Monthly sales and advertising', sub: 'yᵢ: actual sales; ŷᵢ: forecast on the regression line', file: 'regression-metrics',
      plot: { x: { domain: [0, 9], label: 'Advertising (k€), input values' }, y: { domain: [5, 45], label: 'Sales (k€), output values' }, aspect: 0.62,
        onPointerDown: (x, y) => { let bi = -1, bd = 16; pts.forEach((p, i) => { const d = Math.hypot(F.plot.sx(p[0]) - F.plot.sx(x), F.plot.sy(p[1]) - F.plot.sy(y)); if (d < bd) { bd = d; bi = i; } }); drag = bi; return bi >= 0; },
        onPointerMove: (x, y) => { if (drag >= 0) { pts[drag] = [Math.max(0.3, Math.min(8.7, x)), Math.max(6, Math.min(44, y))]; upd(); } },
        onPointerUp: () => { drag = -1; } },
      data: () => ({ cols: ['Month', 'Advertising', 'Actual y', 'Forecast ŷ', 'Error'], rows: rowsOf().map((r, i) => [i + 1, r.x, r.y, Number(r.f.toFixed(3)), Number(r.e.toFixed(3))]) })
    });
    function fit() { const S = MLS.stat.ols(pts.map(p => p[0]), pts.map(p => p[1])); return S; }
    function rowsOf() { const S = fit(); return pts.map(p => { const f = S.b0 + S.b1 * p[0]; return { x: p[0], y: p[1], f, e: p[1] - f }; }); }
    function upd() {
      const S = fit(), R = rowsOf(), M = MLS.ml.regMetrics(R.map(r => r.y), R.map(r => r.f));
      const L = [['MSE', 'Mean Squared Error', 'MSE=\\frac{1}{N}\\sum (y_i-\\hat y_i)^2', f3(M.mse)], ['RMSE', 'Root Mean Squared Error', 'RMSE=\\sqrt{MSE}', f3(M.rmse) + ' k€'], ['MAE', 'Mean Absolute Error', 'MAE=\\frac{1}{N}\\sum |y_i-\\hat y_i|', f3(M.mae) + ' k€'],
        ['MPE', 'Mean Percentage Error', 'MPE=\\frac{100\\%}{N}\\sum \\frac{y_i-\\hat y_i}{y_i}', f2(M.mpe) + '%'], ['MAPE', 'Mean Absolute Percentage Error', 'MAPE=\\frac{100\\%}{N}\\sum \\left|\\frac{y_i-\\hat y_i}{y_i}\\right|', f2(M.mape) + '%'], ['R²', 'R-squared', 'R^2=1-\\frac{RSS}{TSS}', f3(M.r2)]];
      $('#rmMet').innerHTML = '<thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>' + L.map(l => '<tr><td><b>' + l[0] + '</b> <span class="note">' + l[1] + '</span><div>' + MLS.tex(l[2]) + '</div></td><td><b>' + l[3] + '</b></td></tr>').join('') + '</tbody>';
      $('#rmTab').innerHTML = '<thead><tr><th>Month</th>' + R.map((_, i) => '<th>' + (i + 1) + '</th>').join('') + '</tr></thead><tbody>' +
        [['Actual yᵢ', r => f2(r.y)], ['Forecast ŷᵢ', r => f2(r.f)], ['Error yᵢ − ŷᵢ', r => f2(r.e)], ['Squared error', r => f2(r.e * r.e)], ['Absolute % error', r => f2(Math.abs(r.e / r.y) * 100) + '%']].map(([t, g]) => '<tr><td>' + t + '</td>' + R.map(r => '<td>' + g(r) + '</td>').join('') + '</tr>').join('') + '</tbody>';
      F.plot.draw(P => {
        P.fn(x => S.b0 + S.b1 * x, { color: GREEN(), width: 3 });
        R.forEach(r => P.segment(r.x, r.y, r.x, r.f, { color: RED(), width: 2.2 }));
        P.points(R.map(r => [r.x, r.f]), { color: GREEN(), r: 3.5, ring: false });
        P.points(pts, { color: BLUE(), r: 7, tip: (d, i) => 'Month ' + (i + 1) + '<br>Actual ' + f2(d[1]) + '<br>Forecast ' + f2(R[i].f) + '<br>Error ' + f2(R[i].e) });
      });
      F.legend([{ label: 'Actual yᵢ', color: BLUE() }, { label: 'Regression line ŷ', color: GREEN(), line: true }, { label: 'Error yᵢ − ŷᵢ', color: RED(), line: true }]);
      F.caption('ŷ = ' + f2(S.b0) + ' + ' + f2(S.b1) + ' × advertising. ' + (outlier ? 'With the outlier, MSE and RMSE rise much more than MAE: squaring makes large errors count more.' : 'The line is as close as possible to all points: it minimizes the sum of squared errors.'));
      F.refreshTable();
    }
    $('#rmOut').onclick = () => { if (!outlier) { pts.push([4.5, 40]); outlier = true; } upd(); };
    $('#rmReset').onclick = () => { pts = BASE.map(p => p.slice()); outlier = false; upd(); };
    upd();
  };
})();
