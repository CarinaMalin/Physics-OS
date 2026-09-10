(function () {
  'use strict';

  var PROGRESS_KEY = 'physicsOS.sem1.progress.v2';

  var modules = [
    {
      id: 'mechanik', code: 'P 1', name: 'Experimentalphysik I', short: 'Mechanik', ects: 9, gop: true, graded: true, mark: 'M',
      topics: ['Newtonsche Mechanik', 'Schwingungen & Wellen', 'Starre Körper', 'Deformierbare Körper', 'Hydrostatik', 'Hydrodynamik', 'Spezielle Relativitätstheorie'],
      links: ['Bewegung → Vektoren & Ableitungen', 'Schwingungen → Differentialgleichungen', 'Starre Körper → Matrizen & Eigenwerte']
    },
    {
      id: 'rechenmethoden', code: 'P 2', name: 'Rechenmethoden', short: 'Theoretische Physik', ects: 9, gop: true, graded: false, mark: 'R',
      topics: ['Komplexe Zahlen', 'Vektoranalysis', 'Koordinatentransformationen', 'Matrizen & Eigenwertprobleme', 'Differentiation', 'Integration', 'Mehrere Veränderliche', 'Distributionen', 'Fourier-Analysis', 'Approximationsmethoden', 'Differentialgleichungen', 'Gauß & Stokes'],
      links: ['Mechanik → Vektoren, DGL & Integrale', 'Schwingungen → komplexe Zahlen & Fourier', 'Felder → Vektoranalysis, Gauß & Stokes']
    },
    {
      id: 'linalg', code: 'P 3', name: 'Mathematik I', short: 'Lineare Algebra', ects: 9, gop: false, graded: false, mark: 'L',
      topics: ['Grundbegriffe der linearen Algebra', 'Vektorräume', 'Lineare Abbildungen', 'Matrizen', 'Determinanten', 'Eigenwerte & Eigenvektoren', 'Diagonalisierung', 'Hauptachsentransformation'],
      links: ['Koordinatenwechsel → Matrizen', 'Starre Körper → Eigenwerte & Hauptachsen', 'Schwingungen → Diagonalisierung']
    },
    {
      id: 'praktikum', code: 'P 4.1', name: 'Grundpraktikum I', short: 'Experiment & Protokoll', ects: 3, gop: false, graded: false, mark: 'P',
      topics: ['Messgrößen & Einheiten', 'Messunsicherheiten', 'Daten auswerten', 'Diagramme & Fits', 'Ergebnisse kritisch bewerten', 'Wissenschaftlich dokumentieren'],
      links: ['Messung → Einheiten & Unsicherheit', 'Auswertung → Plot & Fit', 'Protokoll → nachvollziehbar & kritisch']
    }
  ];

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function saveProgress(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }

  function topicState(moduleId, index) {
    var p = getProgress();
    return Number(p[moduleId] && p[moduleId][index] || 0);
  }

  function cycleTopic(moduleId, index) {
    var p = getProgress();
    if (!p[moduleId]) p[moduleId] = {};
    p[moduleId][index] = (Number(p[moduleId][index] || 0) + 1) % 3;
    saveProgress(p);
  }

  function modulePercent(m) {
    var sum = 0;
    for (var i = 0; i < m.topics.length; i++) sum += topicState(m.id, i);
    return Math.round(sum / (m.topics.length * 2) * 100);
  }

  function overallPercent() {
    var sum = 0, max = 0;
    for (var m = 0; m < modules.length; m++) {
      for (var i = 0; i < modules[m].topics.length; i++) {
        sum += topicState(modules[m].id, i);
        max += 2;
      }
    }
    return max ? Math.round(sum / max * 100) : 0;
  }

  function nextFocus() {
    var order = [modules[0], modules[1], modules[2], modules[3]];
    for (var m = 0; m < order.length; m++) {
      for (var i = 0; i < order[m].topics.length; i++) {
        if (topicState(order[m].id, i) < 2) return { module: order[m], topicIndex: i };
      }
    }
    return { module: modules[0], topicIndex: 0 };
  }

  function moduleCard(m) {
    var p = modulePercent(m);
    return '<button class="sem1-module-card panel" data-sem-module="' + m.id + '">' +
      '<div class="sem1-module-head"><span class="sem1-module-mark">' + m.mark + '</span><span>' + (m.gop ? '<b class="sem1-gop">GOP</b>' : '') + '</span></div>' +
      '<div><small>' + m.code + ' · ' + m.ects + ' ECTS</small><h3>' + m.name + '</h3><span>' + m.short + '</span></div>' +
      '<div class="sem1-progress"><i style="width:' + p + '%"></i></div>' +
      '<div class="sem1-module-foot"><span>' + p + '%</span><span>' + (m.graded ? 'benotet' : 'unbenotet') + ' · öffnen →</span></div>' +
      '</button>';
  }

  function renderSemester() {
    var study = document.getElementById('tab-study');
    if (!study) return false;

    var old = document.getElementById('semesterOne');
    if (old) old.remove();

    var focus = nextFocus();
    var html = '<section class="sem1-shell" id="semesterOne">' +
      '<div class="sem1-topline"><div><span class="sem1-kicker">LMU · 1. SEMESTER</span><h2>Dein Semester</h2></div><div class="sem1-overall"><strong>' + overallPercent() + '%</strong><span>Themenfortschritt</span></div></div>' +
      '<div class="sem1-focus panel"><div><span class="sem1-label">Nächster Fokus</span><strong>' + focus.module.topics[focus.topicIndex] + '</strong><small>' + focus.module.name + (focus.module.gop ? ' · GOP' : '') + '</small></div><button class="secondary" data-sem-module="' + focus.module.id + '">Öffnen</button></div>' +
      '<div class="sem1-grid">' + modules.map(moduleCard).join('') + '</div>' +
      '<div class="sem1-strip panel"><div><span class="sem1-label">GOP</span><strong>Mechanik · Rechenmethoden</strong></div><div class="sem1-gop-state"><span>Mechanik <b>' + modulePercent(modules[0]) + '%</b></span><span>Rechenmethoden <b>' + modulePercent(modules[1]) + '%</b></span></div></div>' +
      '<details class="sem1-tools panel"><summary><span><b>Lernwerkstatt</b><small>Rechenmethoden · Lineare Algebra · Praktikum</small></span><span>⌄</span></summary><div class="sem1-tool-tabs"><button data-sem-tool="complex" class="active">Komplexe Zahlen</button><button data-sem-tool="vector">Vektoren</button><button data-sem-tool="matrix">Matrizen</button><button data-sem-tool="protocol">Protokoll-Check</button></div><div id="semToolBody" class="sem1-tool-body"></div></details>' +
      '</section>';

    var head = study.querySelector('.section-head');
    if (head) head.insertAdjacentHTML('afterend', html); else study.insertAdjacentHTML('afterbegin', html);

    if (head && head.querySelector('h2')) head.querySelector('h2').textContent = 'Studium · 1. Semester';
    var nav = document.querySelector('#nav [data-tab="study"] em');
    if (nav) nav.textContent = '1. Semester';

    bindSemester();
    renderTool('complex');
    updateDashboard();
    return true;
  }

  function bindSemester() {
    var buttons = document.querySelectorAll('[data-sem-module]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].onclick = function () { openModule(this.getAttribute('data-sem-module')); };
    }
    var tools = document.querySelectorAll('[data-sem-tool]');
    for (var j = 0; j < tools.length; j++) {
      tools[j].onclick = function () {
        var all = document.querySelectorAll('[data-sem-tool]');
        for (var k = 0; k < all.length; k++) all[k].classList.remove('active');
        this.classList.add('active');
        renderTool(this.getAttribute('data-sem-tool'));
      };
    }
  }

  function openModule(id) {
    var m = modules.find(function (x) { return x.id === id; });
    if (!m) return;
    var old = document.getElementById('semModal');
    if (old) old.remove();

    var states = ['neu', 'üben', 'sicher'];
    var symbols = ['○', '◐', '●'];
    var rows = '';
    for (var i = 0; i < m.topics.length; i++) {
      var s = topicState(m.id, i);
      rows += '<button class="sem1-topic status-' + s + '" data-topic-index="' + i + '"><span class="sem1-status-dot">' + symbols[s] + '</span><span>' + m.topics[i] + '</span><small>' + states[s] + '</small></button>';
    }
    var links = m.links.map(function (x) { return '<div><b>' + x.split(' → ')[0] + '</b><span>' + (x.split(' → ')[1] || '') + '</span></div>'; }).join('');

    document.body.insertAdjacentHTML('beforeend', '<div class="sem1-modal" id="semModal"><div class="sem1-modal-card"><button class="sem1-close" id="semClose">×</button><div class="sem1-modal-title"><div><span class="sem1-kicker">' + m.code + ' · ' + m.ects + ' ECTS' + (m.gop ? ' · GOP' : '') + '</span><h2>' + m.name + '</h2><p>' + m.short + '</p></div><strong>' + modulePercent(m) + '%</strong></div><div class="sem1-modal-grid"><section><div class="sem1-section-title"><h3>Themen</h3><span>anklicken: neu → üben → sicher</span></div><div class="sem1-topic-list">' + rows + '</div></section><aside><div class="sem1-side-card"><h3>Mathe ↔ Physik</h3>' + links + '</div></aside></div></div></div>');

    document.getElementById('semClose').onclick = function () { document.getElementById('semModal').remove(); };
    document.getElementById('semModal').onclick = function (e) { if (e.target === this) this.remove(); };
    var topicButtons = document.querySelectorAll('#semModal [data-topic-index]');
    for (var j = 0; j < topicButtons.length; j++) {
      topicButtons[j].onclick = function () {
        cycleTopic(m.id, Number(this.getAttribute('data-topic-index')));
        document.getElementById('semModal').remove();
        renderSemester();
        openModule(m.id);
      };
    }
  }

  function renderTool(which) {
    var body = document.getElementById('semToolBody');
    if (!body) return;
    if (which === 'complex') {
      body.innerHTML = '<div class="sem1-practice"><div class="sem1-practice-head"><div><span class="sem1-label">RECHENMETHODEN</span><h3>Komplexe Zahlen</h3></div></div><p class="subtle">Rechne ohne Timer. Beispiel: (3 + 2i) + (4 − 5i) = 7 − 3i.</p><button class="secondary" data-sem-module="rechenmethoden">Rechenmethoden-Themen öffnen</button></div>';
    } else if (which === 'vector') {
      body.innerHTML = '<div class="sem1-practice"><div class="sem1-practice-head"><div><span class="sem1-label">RECHENMETHODEN</span><h3>Vektoren</h3></div></div><p class="subtle">Skalarprodukt, Komponenten und später Vektoranalysis.</p><button class="secondary" data-sem-module="rechenmethoden">Rechenmethoden-Themen öffnen</button></div>';
    } else if (which === 'matrix') {
      body.innerHTML = '<div class="sem1-practice"><div class="sem1-practice-head"><div><span class="sem1-label">LINEARE ALGEBRA</span><h3>Matrizen</h3></div></div><p class="subtle">Determinanten, Eigenwerte und lineare Abbildungen.</p><button class="secondary" data-sem-module="linalg">Lineare Algebra öffnen</button></div>';
    } else {
      body.innerHTML = '<div class="sem1-practice"><div class="sem1-practice-head"><div><span class="sem1-label">GRUNDPRAKTIKUM</span><h3>Protokoll-Check</h3></div></div><p class="subtle">Messgrößen, Einheiten, Unsicherheiten, Plots, Fits und kritische Diskussion.</p><button class="secondary" data-sem-module="praktikum">Grundpraktikum öffnen</button></div>';
    }
    var btn = body.querySelector('[data-sem-module]');
    if (btn) btn.onclick = function () { openModule(this.getAttribute('data-sem-module')); };
  }

  function updateDashboard() {
    var stats = document.querySelector('#tab-home .stats-grid');
    if (!stats) return;
    var card = document.getElementById('sem1DashStat');
    if (!card) {
      card = document.createElement('article');
      card.id = 'sem1DashStat';
      card.className = 'panel stat';
      stats.appendChild(card);
    }
    card.innerHTML = '<strong>' + overallPercent() + '%</strong><span>1. Semester</span>';
    card.onclick = function () { var b = document.querySelector('#nav [data-tab="study"]'); if (b) b.click(); };
  }

  function start() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (renderSemester() || tries > 30) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
