/* =====================================================================
   4MLClass app: home menu, chapter reader (slide order), checks
   Routes:  #/                 home
            #/p1/<ch>/<step>   chapter <ch> (1-based), step <step> (1-based or "check")
   (c) 2026 Periklis Gogas, EMEF Lab. MIT License.
   ===================================================================== */
(function () {
  'use strict';
  const MLS = window.MLS;
  const C = window.CLASS;
  const FIGS = window.FIGS || {};
  const view = () => document.getElementById('view');

  /* ---------- helpers ---------- */
  const pres = id => C.pres.find(p => p.id === id);
  function stepsOf(ch) { return ch.steps.concat(ch.quiz && ch.quiz.length ? [{ t: 'Check: ' + ch.short, check: true }] : []); }
  function quizDone(pid, ci) { return MLS.store.get('quiz:' + pid + ':' + ci, {}); }
  function hashSeed(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  MLS.registerHelp({
    _progress: { title: 'Progress', html: 'The bar shows where you are in this chapter. The last step of every chapter is a short check with multiple-choice questions.' },
    _check: { title: 'Check', html: 'Pick an answer. A wrong answer is marked and you can try again. The explanation appears when you find the right one. Your answers stay on this device only.' },
    _soon: { title: 'Coming later', html: 'This slide visual becomes an interactive figure in a later build of 4MLClass.' }
  });

  /* ---------- deep-dive links to 4MLSim and 4Cast Lab ---------- */
  MLS.registerHelp({ _deep: { title: 'Deep dive', html: '<b>4MLSim</b> (Machine Learning Simulation Lab) has one in-depth simulation per topic. <b>4Cast Lab</b> is the free app to train these models on your own data. Both open in a new tab.' } });
  function deepHTML(list) {
    if (!list || !list.length) return '';
    const A = MLS.APP;
    return '<div class="deep"><span class="deep-t">&#128269; Deep dive' + MLS.helpBtn('_deep') + '</span>' + list.map(d => d.app === '4cast'
      ? '<a class="deep-a" href="' + A.fourCastUrl + '" target="_blank" rel="noopener"><b>4Cast Lab</b><span>try it with your own data</span>&#8599;</a>'
      : '<a class="deep-a" href="' + A.simUrl + 'modules/' + d.id + '.html" target="_blank" rel="noopener"><b>4MLSim</b><span>' + d.t + '</span>&#8599;</a>').join('') + '</div>';
  }

  /* ---------- home ---------- */
  function renderHome() {
    document.title = '4MLClass b' + MLS.APP.buildNo + ' | Machine Learning Class Companion';
    const last = MLS.store.get('last', null);
    let h = '<p class="home-intro">The class companion for the lectures of Prof. Periklis Gogas. It follows the slides in the same order, with interactive versions of the slide figures and a short check at the end of every chapter.</p>';
    if (last && /^#\/p\d\/\d+\/(\d+|check)$/.test(last)) {
      const m = last.match(/^#\/(p\d)\/(\d+)\/(\d+|check)$/), P = pres(m[1]), ch = P && P.chapters[Number(m[2]) - 1];
      if (ch) h += '<div class="continue">&#9654; <span>Continue where you stopped: <b>' + Number(m[2]) + '. ' + ch.title + '</b></span><a class="btn btn-small" href="' + last + '">Continue</a></div>';
    }
    C.pres.forEach((P, pi) => {
      h += '<section class="pres' + (P.planned ? ' planned' : '') + '"><div class="pres-head"><span class="pres-no">' + (pi + 1) + '</span><div><h2>' + P.title + '</h2><p>' + P.sub + '</p></div>' + (P.planned ? '<span class="soon-badge">Coming later</span>' : '') + '</div><div class="ch-cards">';
      P.chapters.forEach((ch, ci) => {
        if (P.planned) {
          h += '<div class="ch-card planned"><span class="no">' + (ci + 1) + '</span><div><h3>' + ch.title + '</h3><div class="meta">' + (ch.slides ? 'Slides ' + ch.slides : '') + '</div></div></div>';
          return;
        }
        const done = quizDone(P.id, ci + 1), nq = (ch.quiz || []).length, nd = Object.keys(done).length;
        h += '<a class="ch-card" href="#/' + P.id + '/' + (ci + 1) + '/1"><span class="no">' + (ci + 1) + '</span><div><h3>' + ch.title + '</h3><div class="meta"><span>Slides ' + ch.slides + '</span><span>&middot; ' + ch.steps.length + ' steps</span>' +
          (ch.inter ? '<span class="tag inter" title="Interactive figure">&#9881; ' + ch.inter + '</span>' : '') +
          (nq ? '<span class="tag' + (nd === nq ? ' done' : '') + '">Check ' + nd + '/' + nq + '</span>' : '') + '</div></div></a>';
      });
      h += '</div></section>';
    });
    const url = MLS.APP.siteUrl;
    h += '<section class="pres"><div class="pres-head"><span class="pres-no">&#9638;</span><div><h2>On your phone</h2><p>Open, install and use 4MLClass offline</p></div></div>' +
      '<div class="get-app"><div class="qr-small">' + MLS.qrSVG(url, 4) + '</div><div><p>Scan the code with the phone camera, or open <a href="' + url + '" target="_blank" rel="noopener">' + url.replace('https://', '') + '</a>.</p>' +
      '<p>Then choose <b>Install app</b> (Android, Chrome, Edge) or <b>Share &gt; Add to Home Screen</b> (iPhone). The app opens in its own window and works offline.</p>' +
      '<div class="btn-row" style="margin-top:8px">' + (MLS.canInstall() ? '<button type="button" class="btn-navy btn-small" id="homeInstall">&#11015; Install app</button>' : '') + '<button type="button" class="btn-ghost btn-small" id="homeQR">&#9638; Show the QR code large</button></div></div></div></section>';
    view().innerHTML = h;
    const hi = document.getElementById('homeInstall'); if (hi) hi.onclick = MLS.install;
    document.getElementById('homeQR').onclick = () => MLS.showQR();
    window.scrollTo(0, 0);
  }

  /* ---------- reader ---------- */
  function renderStep(pid, ci, si) {
    const P = pres(pid); if (!P || P.planned) return renderHome();
    const ch = P.chapters[ci - 1]; if (!ch) return renderHome();
    const all = stepsOf(ch);
    let idx = si === 'check' ? all.length - 1 : Math.max(0, Math.min(all.length - 1, Number(si) - 1));
    const st = all[idx];
    MLS.store.set('last', '#/' + pid + '/' + ci + '/' + (st.check ? 'check' : idx + 1));
    document.title = ci + '. ' + ch.short + ' | 4MLClass b' + MLS.APP.buildNo;
    const href = k => '#/' + pid + '/' + ci + '/' + (all[k].check ? 'check' : k + 1);
    const done = quizDone(pid, ci);
    const list = '<nav class="rd-steps" aria-label="Steps in this chapter"><ol>' + all.map((s, k) =>
      '<li' + (s.check ? ' class="check"' : '') + '><a href="' + href(k) + '"' + (k === idx ? ' aria-current="step"' : '') + '>' + s.t + (s.fig ? '<span class="ico" title="Interactive figure">&#9881;</span>' : '') + (s.check && Object.keys(done).length === ch.quiz.length ? '<span class="ico">&#10003;</span>' : '') + '</a></li>').join('') + '</ol></nav>';
    /* previous / next across chapters */
    let prev = null, next = null;
    if (idx > 0) prev = { href: href(idx - 1), label: all[idx - 1].t };
    else if (ci > 1) { const pc = P.chapters[ci - 2]; prev = { href: '#/' + pid + '/' + (ci - 1) + '/check', label: 'Check: ' + pc.short }; }
    if (idx < all.length - 1) next = { href: href(idx + 1), label: all[idx + 1].t };
    else if (ci < P.chapters.length) next = { href: '#/' + pid + '/' + (ci + 1) + '/1', label: (ci + 1) + '. ' + P.chapters[ci].title };
    else if (P.closing) next = { href: '#/' + pid + '/end', label: P.closing.t };
    else next = { href: '#/', label: 'All chapters' };

    let body;
    if (st.check) body = '<div class="step-card"><h2>Check: ' + ch.short + MLS.helpBtn('_check') + '</h2><div class="step-slides">' + ch.quiz.length + ' questions</div><div id="quiz"></div></div>';
    else body = '<article class="step-card"><h2>' + st.t + '</h2><div class="step-slides">Slide' + (/[-,]/.test(st.s) ? 's ' : ' ') + st.s + '</div><div class="step-body">' + st.h + '</div>' + deepHTML(st.deep) + '</article>';

    view().innerHTML =
      '<div class="rd-top"><div class="rd-bar">' +
        '<a class="btn btn-ghost btn-small" href="#/" title="All chapters">&#9776; Chapters</a>' +
        '<div class="rd-title"><small>Presentation ' + (C.pres.indexOf(P) + 1) + ' &middot; Chapter ' + ci + ' of ' + P.chapters.length + '</small>' + ch.title + '</div>' +
        '<span class="rd-count">Step ' + (idx + 1) + ' / ' + all.length + MLS.helpBtn('_progress') + '</span>' +
        '<button type="button" class="btn-ghost btn-icon" id="rdPrev" title="Back (left arrow)"' + (prev ? '' : ' disabled') + '>&#9664;</button>' +
        '<button type="button" class="btn-icon" id="rdNext" title="Next (right arrow)"' + (next ? '' : ' disabled') + '>&#9654;</button>' +
      '</div><div class="rd-progress"><i style="width:' + Math.round((idx + 1) / all.length * 100) + '%"></i></div></div>' +
      '<details class="rd-steps-mobile"><summary>Steps in this chapter (' + (idx + 1) + ' of ' + all.length + ')</summary>' + list + '</details>' +
      '<div class="rd-grid">' + list + '<div>' + body +
        '<div class="rd-nav">' +
          (prev ? '<button type="button" class="btn-ghost prev" data-go="' + prev.href + '"><span class="nb-col">&#9664; Back<span>' + prev.label + '</span></span></button>' : '<span></span>') +
          (next ? '<button type="button" class="next" data-go="' + next.href + '"><span class="nb-col">Next &#9654;<span>' + next.label + '</span></span></button>' : '<span></span>') +
        '</div></div></div>';
    const v = view();
    if (prev) v.querySelector('#rdPrev').onclick = () => (location.hash = prev.href);
    if (next) v.querySelector('#rdNext').onclick = () => (location.hash = next.href);
    MLS.$$('[data-go]', v).forEach(b => (b.onclick = () => (location.hash = b.dataset.go)));
    if (st.check) renderQuiz(v.querySelector('#quiz'), pid, ci, ch);
    else mountBody(v);
    window.scrollTo(0, 0);
  }

  function renderEnd(pid) {
    const P = pres(pid), E = P.closing, n = P.chapters.length;
    document.title = E.t + ' | 4MLClass b' + MLS.APP.buildNo;
    MLS.store.set('last', '#/' + pid + '/' + n + '/check');
    view().innerHTML =
      '<div class="rd-top"><div class="rd-bar"><a class="btn btn-ghost btn-small" href="#/">&#9776; Chapters</a><div class="rd-title"><small>Presentation ' + (C.pres.indexOf(P) + 1) + ' &middot; Closing</small>' + E.t + '</div></div></div>' +
      '<article class="step-card ethics"><h2>' + E.t + '</h2><div class="step-slides">Slide ' + E.s + '</div><div class="step-body">' + E.h + '</div></article>' +
      '<div class="rd-nav"><button type="button" class="btn-ghost" data-go="#/' + pid + '/' + n + '/check"><span class="nb-col">&#9664; Back<span>Check: ' + P.chapters[n - 1].short + '</span></span></button><button type="button" data-go="#/"><span class="nb-col">All chapters &#9654;<span>Back to the menu</span></span></button></div>';
    MLS.$$('[data-go]', view()).forEach(b => (b.onclick = () => (location.hash = b.dataset.go)));
    mountBody(view());
    window.scrollTo(0, 0);
  }

  /* reveal buttons, figure mounts, "coming later" boxes, math */
  function mountBody(root) {
    MLS.$$('[data-reveal]', root).forEach(b => {
      const t = root.querySelector('#' + b.dataset.reveal);
      if (t) t.hidden = true;
      b.onclick = () => { if (!t) return; t.hidden = !t.hidden; b.textContent = t.hidden ? (b.dataset.label || 'Show the answer') : 'Hide'; };
      b.dataset.label = b.textContent;
    });
    MLS.$$('[data-soon]', root).forEach(d => {
      d.className = 'soon-fig';
      d.innerHTML = '&#9881; <b>Interactive figure: ' + d.dataset.soon + '</b>' + MLS.helpBtn('_soon') + '<br>This slide visual becomes interactive in a later build.';
    });
    MLS.$$('[data-fig]', root).forEach(d => {
      const f = FIGS[d.dataset.fig];
      if (f) { try { f(d); } catch (e) { d.innerHTML = '<div class="box-warn">This figure could not start: ' + MLS.esc(e.message) + '</div>'; console.error(e); } }
    });
    MLS.renderMath(root);
  }

  /* ---------- checks ---------- */
  function renderQuiz(host, pid, ci, ch) {
    const key = 'quiz:' + pid + ':' + ci;
    const done = MLS.store.get(key, {});
    const L = 'ABCDE';
    const score = MLS.el('div', { class: 'qz-score' });
    const list = MLS.el('div', { class: 'ch-list' });
    host.appendChild(score); host.appendChild(list);
    function upd() {
      const n = ch.quiz.length, k = Object.keys(done).length;
      score.textContent = k + ' of ' + n + ' answered correctly' + (k === n ? '. Well done!' : '.');
    }
    ch.quiz.forEach((it, i) => {
      /* the correct answer is always written first in the content; here the options are shuffled once
         with a fixed seed per question, so its position is random but the same on every visit */
      const r = MLS.rng(hashSeed(pid + ':' + ci + ':' + i + ':' + it.q));
      const order = r.shuffle(it.a.map((_, k) => k));
      const box = MLS.el('div', { class: 'ch' });
      const status = MLS.el('span', { class: 'ch-status' + (done[i] ? ' done' : '') }, done[i] ? '&#10003; Done' : 'Answer');
      const head = MLS.el('div', { class: 'ch-head qz-head' });
      head.innerHTML = '<span class="ch-badge">Q' + (i + 1) + '</span><div class="ch-q">' + it.q + '</div>';
      head.appendChild(status); box.appendChild(head);
      const opts = MLS.el('div', { class: 'ch-opts' }), fb = MLS.el('div', { class: 'ch-feedback' });
      order.forEach((k, pos) => {
        const b = MLS.el('button', { type: 'button', class: 'ch-opt' }, '<span class="ltr">' + L[pos] + '</span>' + it.a[k]);
        b.onclick = () => {
          if (k === 0) {
            b.classList.add('right');
            fb.innerHTML = '<b>Correct.</b> ' + (it.e || '');
            done[i] = true; MLS.store.set(key, done);
            status.className = 'ch-status done'; status.innerHTML = '&#10003; Done';
            opts.querySelectorAll('button').forEach(x => (x.disabled = true)); upd();
          } else { b.classList.add('wrong'); b.disabled = true; fb.innerHTML = '<b>Not quite.</b> Try another answer.'; }
          MLS.renderMath(fb);
        };
        opts.appendChild(b);
        if (done[i]) { b.disabled = true; if (k === 0) b.classList.add('right'); }
      });
      if (done[i]) fb.innerHTML = '<b>Answered.</b> ' + (it.e || '');
      box.appendChild(opts); box.appendChild(fb); list.appendChild(box);
    });
    const again = MLS.el('div', { class: 'ch-actions' });
    const rb = MLS.el('button', { type: 'button', class: 'btn-ghost btn-small' }, '&#8634; Try the check again');
    rb.onclick = () => { MLS.store.del(key); host.innerHTML = ''; renderQuiz(host, pid, ci, ch); };
    again.appendChild(rb); host.appendChild(again);
    MLS.renderMath(host); upd();
  }

  /* ---------- router ---------- */
  function route() {
    MLS.tip.hide();
    const h = location.hash || '#/';
    let m;
    if ((m = h.match(/^#\/(p\d)\/(\d+)\/(\d+|check)$/))) renderStep(m[1], Number(m[2]), m[3]);
    else if ((m = h.match(/^#\/(p\d)\/end$/))) renderEnd(m[1]);
    else renderHome();
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, select, textarea, [contenteditable]')) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') { const b = document.getElementById('rdNext'); if (b && !b.disabled) b.click(); }
    if (e.key === 'ArrowLeft') { const b = document.getElementById('rdPrev'); if (b && !b.disabled) b.click(); }
  });
  document.addEventListener('DOMContentLoaded', route);
})();
