"use strict";
/* UAS Prep Pack - one combined app.
   Views: home, semester, course, simulation (setup, exam, result).
   One shell, hash routing, so the hero is the entry point and every
   part is one tap away. Checklist (uas_checklist_v1) and best sim
   scores (uas_sim_best_v1) keep the keys from the earlier version,
   so saved ticks and scores survive this rebuild.
   Motion uses a real spring integrator (stiffness and damping),
   interruptible, with a reduced-motion fallback. */

var DATA = window.UAS_RECALL;
var CHECK_KEY = "uas_checklist_v1";
var BEST_KEY = "uas_sim_best_v1";
var S4_ORDER_NOTE = "Urutan belajar disarankan dari nilai Tuton terendah: Pemasaran, Riset Operasi, Kewirausahaan, Operasi, Keuangan, SDM.";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function $(id) { return document.getElementById(id); }

function loadChecks() {
  try {
    var v = JSON.parse(localStorage.getItem(CHECK_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch (e) { return {}; }
}

function saveChecks(v) {
  try { localStorage.setItem(CHECK_KEY, JSON.stringify(v)); } catch (e) { /* abaikan */ }
}

function loadBest() {
  try {
    var v = JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch (e) { return {}; }
}

function saveBest(v) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(v)); } catch (e) { /* abaikan */ }
}

var checks = loadChecks();
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- Spring integrator (damped harmonic motion, per frame) ---- */
function makeSpring(stiffness, damping) {
  var x = 0, v = 0, target = 0, raf = 0, onUpdate = null, last = 0;
  function step(t) {
    var dt = Math.min((t - last) / 1000 || 0.016, 1 / 30);
    last = t;
    var a = (-stiffness * (x - target) - damping * v);
    v += a * dt;
    x += v * dt;
    if (Math.abs(x - target) < 0.05 && Math.abs(v) < 0.05) {
      x = target; v = 0; raf = 0;
      if (onUpdate) onUpdate(x);
      return;
    }
    if (onUpdate) onUpdate(x);
    raf = requestAnimationFrame(step);
  }
  return {
    set: function (val) { x = val; v = 0; },
    go: function (to, cb) {
      target = to; onUpdate = cb;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    },
    stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; }
  };
}

var enterSpring = makeSpring(170, 26);
var ringSpring = makeSpring(170, 26);

function enterView(el) {
  if (!el) return;
  if (reduceMotion) { el.style.opacity = ""; el.style.transform = ""; return; }
  enterSpring.stop();
  enterSpring.set(0);
  enterSpring.go(1, function (p) {
    el.style.opacity = String(p);
    el.style.transform = "translateY(" + ((1 - p) * 14).toFixed(1) + "px)";
    if (p === 1) { el.style.opacity = ""; el.style.transform = ""; }
  });
}

/* ---- Progress ---- */
function semOf(n) {
  for (var i = 0; i < DATA.semesters.length; i++) {
    if (DATA.semesters[i].semester === n) return DATA.semesters[i];
  }
  return DATA.semesters[3];
}

function totalTopics() { return DATA.meta.totalTopics; }

function semTopics(sem) {
  return sem.courses.reduce(function (n, c) { return n + c.topics.length; }, 0);
}

function semDone(sem) {
  var done = 0;
  sem.courses.forEach(function (c) {
    c.topics.forEach(function (t, ti) { if (checks[c.kode + ":" + ti]) done++; });
  });
  return done;
}

function courseDone(c) {
  var done = 0;
  c.topics.forEach(function (t, ti) { if (checks[c.kode + ":" + ti]) done++; });
  return done;
}

function courseOf(code) {
  for (var i = 0; i < DATA.semesters.length; i++) {
    var found = null;
    DATA.semesters[i].courses.forEach(function (c) { if (c.kode === code) found = c; });
    if (found) return { sem: DATA.semesters[i], course: found };
  }
  return null;
}

function barHTML(done, total, label) {
  var pct = total ? Math.round((done / total) * 100) : 0;
  return '<div class="uas-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + esc(label) + '">' +
    '<span class="uas-bar-fill" style="transform: scaleX(' + (total ? done / total : 0) + ')"></span></div>';
}

function updateProgress() {
  var total = totalTopics();
  var done = 0;
  DATA.semesters.forEach(function (sem) { done += semDone(sem); });
  var nav = $("appnavProgress");
  if (nav) nav.textContent = done + " dari " + total + " topik";
  document.querySelectorAll("[data-bar-for]").forEach(function (el) {
    var key = el.getAttribute("data-bar-for");
    var d = 0, t = 0;
    if (key === "all") { d = done; t = total; }
    else if (key.indexOf("sem-") === 0) {
      var sem = semOf(parseInt(key.slice(4), 10));
      d = semDone(sem); t = semTopics(sem);
    } else {
      var hit = courseOf(key);
      if (hit) { d = courseDone(hit.course); t = hit.course.topics.length; }
    }
    var fill = el.querySelector(".uas-bar-fill");
    if (fill) fill.style.transform = "scaleX(" + (t ? d / t : 0) + ")";
    el.setAttribute("aria-valuenow", String(t ? Math.round((d / t) * 100) : 0));
    var txt = el.parentElement ? el.parentElement.querySelector("[data-bar-text-for='" + key + "']") : null;
    if (txt) txt.textContent = d + " dari " + t + " topik";
  });
}

/* ---- Router ---- */
function parseRoute() {
  var h = location.hash || "#/";
  var raw = h.replace(/^#\/?/, "");
  var parts = raw.split("?");
  var path = parts[0] || "";
  var query = {};
  if (parts[1]) {
    parts[1].split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0]) query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
    });
  }
  if (path === "" ) return { view: "home" };
  var mSem = path.match(/^sem-(\d)$/);
  if (mSem) return { view: "semester", sem: parseInt(mSem[1], 10) };
  var mCourse = path.match(/^uas-([A-Z0-9]+)$/);
  if (mCourse) return { view: "course", code: mCourse[1] };
  if (path === "sim") return { view: "sim", query: query };
  var legacySem = h.match(/^#sem-(\d)$/);
  if (legacySem) return { view: "semester", sem: parseInt(legacySem[1], 10) };
  var legacyCourse = h.match(/^#uas-([A-Z0-9]+)$/);
  if (legacyCourse) return { view: "course", code: legacyCourse[1] };
  return { view: "home" };
}

function go(hash) {
  if (location.hash === hash) { render(); return; }
  location.hash = hash;
}

var currentRoute = { view: "home" };
var currentSem = 4;

function render() {
  var newRoute = parseRoute();
  var stayingInExam = newRoute.view === "sim" && exam && exam.phase === "exam";
  if (!stayingInExam) pauseTimer();
  currentRoute = newRoute;
  var app = $("app");
  document.querySelectorAll(".uas-appnav-link").forEach(function (a) {
    var nav = a.getAttribute("data-nav");
    var active = (nav === "home" && currentRoute.view === "home") ||
      (nav === "semester" && (currentRoute.view === "semester" || currentRoute.view === "course")) ||
      (nav === "sim" && currentRoute.view === "sim");
    a.classList.toggle("is-active", active);
    if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  if (currentRoute.view === "home") app.innerHTML = homeHTML();
  else if (currentRoute.view === "semester") { currentSem = currentRoute.sem; app.innerHTML = semesterHTML(currentRoute.sem); }
  else if (currentRoute.view === "course") app.innerHTML = courseHTML(currentRoute.code);
  else if (currentRoute.view === "sim") app.innerHTML = simHTML(currentRoute.query);
  window.scrollTo(0, 0);
  enterView(app);
  updateProgress();
  afterRender();
}

function afterRender() {
  if (currentRoute.view === "home") animateRing();
  if (currentRoute.view === "sim") {
    fillSimSetup(currentRoute.query);
    if (exam && exam.phase === "exam") resumeTimer();
    if (exam && exam.phase === "result") renderSimResult();
  }
}

/* ---- Home view ---- */
function homeHTML() {
  var total = totalTopics();
  var done = 0;
  DATA.semesters.forEach(function (sem) { done += semDone(sem); });
  var pct = total ? Math.round((done / total) * 100) : 0;
  var best = loadBest();
  var bestAll = best["all"];
  var bestAny = Object.keys(best).length;
  var sem4 = semOf(4);
  var cards = DATA.semesters.map(function (sem) {
    var d = semDone(sem), t = semTopics(sem);
    return '<a class="uas-sem-card" href="#/sem-' + sem.semester + '">' +
      '<span class="uas-sem-card-name">Semester ' + sem.semester + '</span>' +
      '<span class="uas-sem-card-meta">' + sem.courses.length + ' mata kuliah</span>' +
      '<span data-bar-for="sem-' + sem.semester + '">' + barHTML(d, t, "Kemajuan Semester " + sem.semester) + '</span>' +
      '<span class="uas-bar-text" data-bar-text-for="sem-' + sem.semester + '">' + d + ' dari ' + t + ' topik</span>' +
      '</a>';
  }).join("");
  return '<section class="uas-hero">' +
    '<h1 class="hero-title">Siap UAS, satu tempat.</h1>' +
    '<p class="hero-tagline">Belajar 51 mata kuliah dan uji dirimu dengan simulasi berwaktu, tanpa pindah halaman.</p>' +
    '<div class="uas-hero-deck">' +
    '<div class="uas-ring-wrap">' +
    '<svg class="uas-ring" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Kemajuan checklist ' + pct + ' persen">' +
    '<circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="uas-ring-track"/>' +
    '<circle id="uasRingFill" cx="60" cy="60" r="52" fill="none" stroke-width="10" class="uas-ring-fill" stroke-dasharray="326.7" stroke-dashoffset="326.7" stroke-linecap="round" transform="rotate(-90 60 60)"/>' +
    '</svg>' +
    '<p class="uas-ring-num"><span id="uasRingPct">' + pct + '</span>%</p>' +
    '<p class="uas-ring-label"><span data-bar-text-for="all">' + done + ' dari ' + total + ' topik</span></p>' +
    '</div>' +
    '<div class="uas-hero-actions">' +
    '<a class="uas-hero-card" href="#/sem-4">' +
    '<span class="uas-hero-card-kicker">Lanjutkan belajar</span>' +
    '<span class="uas-hero-card-title">Semester 4</span>' +
    '<span class="uas-hero-card-text">Semester yang sedang berjalan, ' + sem4.courses.length + ' mata kuliah. Buka lembar ingat dan soal latihannya.</span>' +
    '<span class="uas-hero-card-meta"><span data-bar-text-for="sem-4">' + semDone(sem4) + ' dari ' + semTopics(sem4) + ' topik</span></span>' +
    '</a>' +
    '<a class="uas-hero-card uas-hero-card-sim" href="#/sim">' +
    '<span class="uas-hero-card-kicker">Uji dirimu</span>' +
    '<span class="uas-hero-card-title">Simulasi UAS</span>' +
    '<span class="uas-hero-card-text">Ujian latihan berwaktu. Satu mata kuliah, satu semester, atau semua semester.</span>' +
    '<span class="uas-hero-card-meta">' + (bestAll ? 'Skor terbaik semua semester: ' + bestAll.score + '/' + bestAll.total : (bestAny ? bestAny + ' cakupan sudah pernah diuji' : 'Belum ada simulasi')) + '</span>' +
    '</a>' +
    '</div>' +
    '</div>' +
    '</section>' +
    '<h2 class="uas-section-title">Pilih semester</h2>' +
    '<div class="uas-sem-grid">' + cards + '</div>' +
    '<section class="uas-how" aria-label="Cara memakai paket ini">' +
    '<h2>Cara memakai paket ini</h2>' +
    '<ol>' +
    '<li>Pilih semester, lalu mata kuliah. Dengarkan briefing audio sampai selesai, lalu baca lembar ingatnya.</li>' +
    '<li>Jawab 12 soal pilihan ganda dengan mengklik satu jawaban. Benar atau salah langsung terlihat, beserta alasannya. Semester 4 punya tambahan 12 soal uraian dengan kunci yang bisa dibuka.</li>' +
    '<li>Centang topik yang sudah kamu kuasai. Progress tersimpan di peramban ini saja.</li>' +
    '<li>Kalau sudah siap diuji, buka Simulasi UAS dari hero atau dari tiap mata kuliah. Itu latihan berwaktu, bukan soal resmi UT.</li>' +
    '<li>Bila butuh latihan tambahan, buka tautan SoalUT di tiap mata kuliah. Itu bank soal pola ujian, bukan bocoran soal.</li>' +
    '</ol>' +
    '</section>' +
    '<section class="uas-sources" aria-label="Sumber dan batasan">' +
    '<h2>Sumber dan batasan, dibaca dulu</h2>' +
    '<ul>' +
    '<li>Topik tiap mata kuliah berasal dari Tinjauan Mata Kuliah resmi UT yang sudah dipakai Kelas Manajemen UT, ditambah sumber terbuka seperti OpenStax. Tidak ada teks BMP yang disalin.</li>' +
    '<li>Soal pilihan ganda di sini ditulis baru untuk paket ini, dengan kunci yang menjelaskan alasannya. Semester 4 punya tambahan 12 soal uraian per mata kuliah, dan dua mata kuliahnya (Pemasaran dan Riset Operasi) memakai draf UAS yang sudah disiapkan 28 Oktober 2026.</li>' +
    '<li>SoalUT dipakai sebagai bank pola soal dan tautan latihan tambahan per mata kuliah. SoalUT sendiri menyatakan soalnya disusun dari materi modul dan prediksi pola kisi-kisi, bukan soal resmi UT. Periksa sendiri kunci jawabannya: di halaman MSDM SoalUT ada dua kunci yang tampak keliru (soal 4 dan 25), jadi jangan menghafal kunci tanpa memahami alasannya. Sebelas mata kuliah belum punya halaman SoalUT, jadi tautannya tidak ditampilkan.</li>' +
    '<li>Tidak ada klaim tentang tanggal atau format UAS. Soal latihan dan simulasi ini format-neutral: persiapan, bukan prediksi soal yang akan keluar.</li>' +
    '<li>Audio rekap UAS baru (sekitar 5 menit per mata kuliah) belum dibuat. Rencana awal: audio dibuat setelah draf ingat tiap mata kuliah disetujui, agar tidak perlu direkam ulang.</li>' +
    '</ul>' +
    '</section>';
}

function animateRing() {
  var fill = $("uasRingFill");
  var num = $("uasRingPct");
  if (!fill || !num) return;
  var total = totalTopics();
  var done = 0;
  DATA.semesters.forEach(function (sem) { done += semDone(sem); });
  var target = total ? done / total : 0;
  if (reduceMotion) {
    fill.style.strokeDashoffset = String(326.7 * (1 - target));
    num.textContent = String(Math.round(target * 100));
    return;
  }
  ringSpring.stop();
  ringSpring.set(0);
  ringSpring.go(target, function (p) {
    fill.style.strokeDashoffset = String(326.7 * (1 - p));
    num.textContent = String(Math.round(p * 100));
  });
}

/* ---- Semester view ---- */
function semesterHTML(n) {
  var sem = semOf(n);
  var rows = sem.courses.map(function (c, i) {
    var d = courseDone(c), t = c.topics.length;
    var best = loadBest()["course:" + c.kode];
    return '<a class="uas-course-row" href="#/uas-' + esc(c.kode) + '">' +
      '<span class="uas-course-row-num">' + (i + 1) + '</span>' +
      '<span class="uas-course-row-main">' +
      '<span class="uas-course-row-code">' + esc(c.kode) + ' ' + c.sks + ' sks</span>' +
      '<span class="uas-course-row-name">' + esc(c.nama) + '</span>' +
      '<span data-bar-for="' + esc(c.kode) + '">' + barHTML(d, t, "Kemajuan " + c.nama) + '</span>' +
      '<span class="uas-bar-text" data-bar-text-for="' + esc(c.kode) + '">' + d + ' dari ' + t + ' topik</span>' +
      '</span>' +
      '<span class="uas-course-row-side">' +
      '<span>12 soal</span>' +
      (best ? '<span>Skor terbaik ' + best.score + '/' + best.total + '</span>' : '<span>Belum diuji</span>') +
      '</span>' +
      '</a>';
  }).join("");
  return '<p class="uas-back"><a href="#/">Beranda</a></p>' +
    '<h1 class="uas-page-title">Semester ' + sem.semester + '</h1>' +
    '<p class="uas-page-sub">' + sem.courses.length + ' mata kuliah. Klik satu baris untuk membuka lembar ingat dan soal latihannya.</p>' +
    (n === 4 ? '<p class="uas-order">' + esc(S4_ORDER_NOTE) + '</p>' : '') +
    '<div class="uas-course-list">' + rows + '</div>' +
    '<p class="uas-sem-sim"><a class="uas-link uas-link-sim" href="#/sim?scope=semester&amp;sem=' + sem.semester + '">Simulasi Semester ' + sem.semester + '</a></p>';
}

/* ---- Course view ---- */
function mcqHTML(c, q, i) {
  var opts = q.options.map(function (o, oi) {
    return '<button type="button" class="uas-opt" data-q="' + c.kode + '-' + i + '" data-oi="' + oi + '">' +
      '<span class="uas-opt-letter">' + "ABCD"[oi] + '</span><span>' + esc(o) + '</span></button>';
  }).join("");
  return '<article class="uas-q" data-mcq="' + c.kode + '-' + i + '" data-correct="' + q.correct + '">' +
    '<p class="uas-q-tag">' + esc(q.tag) + ', soal ' + (i + 1) + ' dari 12</p>' +
    '<p class="uas-q-text">' + esc(q.q) + '</p>' +
    '<div class="uas-opts" role="group" aria-label="Pilihan jawaban soal ' + (i + 1) + '">' + opts + '</div>' +
    '<div class="uas-a uas-mcq-a" hidden>' +
    '<p class="uas-mcq-verdict"></p>' +
    '<p><strong>Alasan:</strong> ' + esc(q.why) + '</p>' +
    '</div></article>';
}

function openHTML(c, q, i) {
  var id = "ans-" + c.kode + "-" + (i + 1);
  return '<article class="uas-q">' +
    '<p class="uas-q-tag">' + esc(q.tag) + ', soal uraian ' + (i + 1) + ' dari 12</p>' +
    '<p class="uas-q-text">' + esc(q.q) + '</p>' +
    '<button type="button" class="uas-reveal" aria-expanded="false" aria-controls="' + id + '">Lihat jawaban dan alasan</button>' +
    '<div class="uas-a" id="' + id + '" hidden>' +
    '<p><strong>Jawaban:</strong> ' + esc(q.a) + '</p>' +
    '<p><strong>Alasan:</strong> ' + esc(q.why) + '</p>' +
    '</div></article>';
}

function courseHTML(code) {
  var hit = courseOf(code);
  if (!hit) return '<p class="uas-back"><a href="#/">Beranda</a></p><h1 class="uas-page-title">Mata kuliah tidak ditemukan</h1><p>Kode ' + esc(code) + ' tidak ada di paket ini.</p>';
  var sem = hit.sem, c = hit.course;
  var idx = sem.courses.indexOf(c);
  var kelasUrl = DATA.meta.kelasBase + c.kode;
  var topics = c.topics.map(function (t, ti) {
    var key = c.kode + ":" + ti;
    var on = !!checks[key];
    var body = t.d ? '<span class="uas-topic-d">' + esc(t.d) + '</span>' : '';
    return '<li class="uas-topic"><label>' +
      '<input type="checkbox" data-check="' + esc(key) + '"' + (on ? " checked" : "") + '> ' +
      '<span><span class="uas-topic-t">' + esc(t.t) + '</span>' + body + '</span></label></li>';
  }).join("");
  var keys = c.keys.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  var conf = c.confusion.length
    ? '<h3>Kebingungan umum, diluruskan</h3><ul>' + c.confusion.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + '</ul>'
    : '';
  var analogi = c.analogi ? '<p class="uas-analogi">' + esc(c.analogi) + '</p>' : '';
  var soalut = c.soalutUrl
    ? '<a class="uas-link" href="' + esc(c.soalutUrl) + '" target="_blank" rel="noopener">Latihan tambahan di SoalUT (' + esc(c.kode) + ')</a>'
    : '';
  var mcqs = c.mcq.map(function (q, qi) { return mcqHTML(c, q, qi); }).join("");
  var open = c.openQuestions.length
    ? '<div class="uas-practice"><h3>Latihan uraian: 12 soal</h3>' +
      '<p class="uas-practice-note">Jawab dulu dengan menulis langkahmu, baru buka kuncinya.</p>' +
      c.openQuestions.map(function (q, qi) { return openHTML(c, q, qi); }).join("") + '</div>'
    : '';
  var d = courseDone(c), t = c.topics.length;
  return '<p class="uas-back"><a href="#/sem-' + sem.semester + '">Semester ' + sem.semester + '</a></p>' +
    '<p class="uas-course-code">' + esc(c.kode) + ', ' + c.sks + ' sks, mata kuliah ' + (idx + 1) + ' dari ' + sem.courses.length + '</p>' +
    '<h1 class="uas-page-title">' + esc(c.nama) + '</h1>' +
    '<div class="uas-course-progress"><span data-bar-for="' + esc(c.kode) + '">' + barHTML(d, t, "Kemajuan " + c.nama) + '</span>' +
    '<span class="uas-bar-text" data-bar-text-for="' + esc(c.kode) + '">' + d + ' dari ' + t + ' topik</span></div>' +
    '<p class="uas-bigidea">' + esc(c.bigIdea) + '</p>' + analogi +
    '<div class="uas-links">' +
    '<a class="uas-link" href="' + esc(kelasUrl) + '">Buka halaman belajar di Kelas UT</a>' + soalut +
    '<a class="uas-link uas-link-sim" href="#/sim?scope=course&amp;code=' + esc(c.kode) + '">Simulasi mata kuliah ini</a>' +
    '</div>' +
    '<div class="uas-audio"><p>Dengarkan briefing audio ' + esc(c.nama) + '</p>' +
    '<audio controls preload="metadata" src="../audio/' + esc(c.audioFile) + '">Browser kamu tidak mendukung pemutar audio.</audio></div>' +
    '<button type="button" class="btn-ghost uas-print" data-print="' + esc(c.kode) + '">Cetak lembar ingat ' + esc(c.nama) + '</button>' +
    '<div class="uas-recall"><h3>Lembar ingat: ' + c.topics.length + ' topik</h3>' +
    '<ol class="uas-topics">' + topics + '</ol>' +
    '<h3>5 kunci</h3><ul>' + keys + '</ul>' + conf +
    '<h3>' + esc(c.example.title) + '</h3><p>' + esc(c.example.body) + '</p></div>' +
    '<div class="uas-practice"><h3>Latihan pilihan ganda: 12 soal</h3>' +
    '<p class="uas-practice-note">Klik satu jawaban. Benar atau salah langsung terlihat, beserta alasannya. Jawaban latihan tidak disimpan, ulangi kapan saja.</p>' + mcqs + '</div>' +
    open;
}

/* ---- Simulation ---- */
function allCourses() {
  var out = [];
  DATA.semesters.forEach(function (sem) {
    sem.courses.forEach(function (c) {
      out.push({ semester: sem.semester, kode: c.kode, nama: c.nama, sks: c.sks, questions: c.mcq });
    });
  });
  return out;
}

var COURSES = allCourses();
var exam = null;
var timerId = null;

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function poolFor(scope, code, sem) {
  var pool = [];
  if (scope === "course") {
    var c = COURSES.find(function (x) { return x.kode === code; });
    if (c) c.questions.forEach(function (q) { pool.push({ course: c, q: q }); });
  } else if (scope === "semester") {
    COURSES.filter(function (x) { return x.semester === sem; }).forEach(function (c) {
      c.questions.forEach(function (q) { pool.push({ course: c, q: q }); });
    });
  } else {
    COURSES.forEach(function (c) {
      c.questions.forEach(function (q) { pool.push({ course: c, q: q }); });
    });
  }
  return pool;
}

function scopeLabel(scope, code, sem) {
  if (scope === "course") {
    var c = COURSES.find(function (x) { return x.kode === code; });
    return c ? c.kode + " " + c.nama : code;
  }
  if (scope === "semester") return "Semester " + sem;
  return "Semua semester, 51 mata kuliah";
}

function scopeKey(scope, code, sem) {
  if (scope === "course") return "course:" + code;
  if (scope === "semester") return "semester:" + sem;
  return "all";
}

function currentScope() {
  var r = document.querySelector('input[name="scope"]:checked');
  return r ? r.value : "course";
}

function simHTML(query) {
  if (exam && exam.phase === "exam") return simExamHTML();
  if (exam && exam.phase === "result") return simResultHTML();
  return '<p class="uas-back"><a href="#/">Beranda</a></p>' +
    '<h1 class="uas-page-title">Simulasi UAS</h1>' +
    '<p class="uas-page-sub">Ujian latihan berwaktu dari 612 soal pilihan ganda paket UAS. Timer jalan, dan waktu habis berarti jawaban dikumpulkan. Ini latihan, bukan soal resmi UT.</p>' +
    (exam && exam.phase === "paused"
      ? '<div class="uas-sim-promo"><div><p class="uas-sim-promo-title">Simulasi sedang berjalan</p>' +
        '<p class="uas-sim-promo-text">' + esc(exam.label) + ', soal ' + (exam.idx + 1) + ' dari ' + exam.items.length + ', sisa waktu ' + fmtTime(exam.left) + '. Timer dijeda saat kamu pergi.</p></div>' +
        '<button type="button" class="uas-link uas-link-sim" id="simResume">Lanjutkan simulasi</button></div>'
      : '') +
    '<section class="sim-card" aria-label="Atur simulasi">' +
    '<h2>Atur simulasimu</h2>' +
    '<div class="sim-field"><span class="sim-label">Cakupan</span>' +
    '<div class="sim-scope" role="group" aria-label="Cakupan simulasi">' +
    '<label><input type="radio" name="scope" value="course" checked> Satu mata kuliah</label>' +
    '<label><input type="radio" name="scope" value="semester"> Satu semester</label>' +
    '<label><input type="radio" name="scope" value="all"> Semua semester</label>' +
    '</div></div>' +
    '<div class="sim-field" id="fieldCourse"><label class="sim-label" for="simCourse">Mata kuliah</label><select id="simCourse" class="sim-select"></select></div>' +
    '<div class="sim-field" id="fieldSemester" hidden><label class="sim-label" for="simSemester">Semester</label><select id="simSemester" class="sim-select"></select></div>' +
    '<div class="sim-field-row">' +
    '<div class="sim-field"><label class="sim-label" for="simCount">Jumlah soal</label><select id="simCount" class="sim-select"><option value="10">10 soal</option><option value="20" selected>20 soal</option><option value="30">30 soal</option></select></div>' +
    '<div class="sim-field"><label class="sim-label" for="simMinutes">Waktu</label><select id="simMinutes" class="sim-select"><option value="30">30 menit</option><option value="60" selected>60 menit</option><option value="90">90 menit</option></select></div>' +
    '</div>' +
    '<p class="sim-note" id="simPoolNote"></p>' +
    '<p class="sim-note" id="simBestNote"></p>' +
    '<button type="button" class="uas-reveal sim-start" id="simStart">Mulai simulasi</button>' +
    '</section>';
}

function fillSimSetup(query) {
  var courseSel = $("simCourse");
  if (!courseSel) return;
  var html = "";
  DATA.semesters.forEach(function (sem) {
    html += '<optgroup label="Semester ' + sem.semester + '">';
    sem.courses.forEach(function (c) {
      html += '<option value="' + esc(c.kode) + '"' + (c.kode === "EMBS4212" ? " selected" : "") + '>' +
        esc(c.kode) + " " + esc(c.nama) + "</option>";
    });
    html += "</optgroup>";
  });
  courseSel.innerHTML = html;
  var semSel = $("simSemester");
  semSel.innerHTML = DATA.semesters.map(function (sem) {
    return '<option value="' + sem.semester + '"' + (sem.semester === 4 ? " selected" : "") + '>Semester ' + sem.semester + " (" + sem.courses.length + " mata kuliah)</option>";
  }).join("");
  var q = query || {};
  if (q.scope === "semester" || q.scope === "all" || q.scope === "course") {
    var radio = document.querySelector('input[name="scope"][value="' + q.scope + '"]');
    if (radio) radio.checked = true;
  }
  if (q.code && COURSES.some(function (x) { return x.kode === q.code; })) courseSel.value = q.code;
  if (q.sem && !isNaN(parseInt(q.sem, 10))) semSel.value = q.sem;
  updateSimSetupNotes();
}

function updateSimSetupNotes() {
  var scope = currentScope();
  var code = $("simCourse") ? $("simCourse").value : "";
  var sem = $("simSemester") ? parseInt($("simSemester").value, 10) : 4;
  var pool = poolFor(scope, code, sem);
  var count = $("simCount") ? parseInt($("simCount").value, 10) : 20;
  var fc = $("fieldCourse"), fs = $("fieldSemester");
  if (fc) fc.hidden = scope !== "course";
  if (fs) fs.hidden = scope !== "semester";
  var note = $("simPoolNote");
  if (note) note.textContent = pool.length === 0
    ? "Tidak ada soal untuk pilihan ini."
    : "Tersedia " + pool.length + " soal untuk cakupan ini. Simulasi mengambil " + Math.min(count, pool.length) + " soal secara acak.";
  var bestEl = $("simBestNote");
  if (bestEl) {
    var best = loadBest()[scopeKey(scope, code, sem)];
    bestEl.textContent = best
      ? "Skor terbaikmu untuk cakupan ini: " + best.score + "/" + best.total + " (" + best.pct + "%)."
      : "";
  }
}

function fmtTime(sec) {
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

function startExam() {
  var scope = currentScope();
  var code = $("simCourse").value;
  var sem = parseInt($("simSemester").value, 10);
  var count = parseInt($("simCount").value, 10);
  var minutes = parseInt($("simMinutes").value, 10);
  var pool = shuffle(poolFor(scope, code, sem).slice());
  if (pool.length === 0) return;
  var picked = pool.slice(0, Math.min(count, pool.length)).map(function (item) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      course: item.course,
      q: item.q,
      options: order.map(function (oi) { return item.q.options[oi]; }),
      correct: order.indexOf(item.q.correct),
      picked: -1,
      marked: false
    };
  });
  exam = {
    phase: "exam",
    scope: scope, code: code, sem: sem,
    label: scopeLabel(scope, code, sem),
    key: scopeKey(scope, code, sem),
    items: picked, idx: 0, left: minutes * 60, submitted: false
  };
  render();
}

function pauseTimer() {
  if (timerId) { clearInterval(timerId); timerId = null; }
  if (exam && exam.phase === "exam") exam.phase = "paused";
}

function resumeTimer() {
  if (!exam || exam.phase !== "exam" || timerId) return;
  updateTimer();
  timerId = setInterval(function () {
    exam.left--;
    updateTimer();
    if (exam.left <= 0) submitExam(true);
  }, 1000);
}

function updateTimer() {
  var t = $("simTimer");
  if (!t || !exam) return;
  t.textContent = fmtTime(Math.max(0, exam.left));
  t.classList.toggle("is-low", exam.left <= 300);
}

function simExamHTML() {
  var it = exam.items[exam.idx];
  var answered = exam.items.filter(function (x) { return x.picked >= 0; }).length;
  var marked = exam.items.filter(function (x) { return x.marked; }).length;
  var palette = exam.items.map(function (x, i) {
    var cls = "sim-pal" + (i === exam.idx ? " is-current" : "") + (x.picked >= 0 ? " is-answered" : "") + (x.marked ? " is-marked" : "");
    return '<button type="button" class="' + cls + '" data-pal="' + i + '" aria-label="Soal ' + (i + 1) + (x.picked >= 0 ? ", dijawab" : ", belum dijawab") + (x.marked ? ", ditandai" : "") + '">' + (i + 1) + "</button>";
  }).join("");
  var opts = it.options.map(function (o, oi) {
    var cls = "uas-opt" + (it.picked === oi ? " is-picked" : "");
    return '<button type="button" class="' + cls + '" data-opt="' + oi + '">' +
      '<span class="uas-opt-letter">' + "ABCD"[oi] + "</span><span>" + esc(o) + "</span></button>";
  }).join("");
  return '<p class="uas-back"><button type="button" class="uas-back-btn" id="simExit">Keluar dari simulasi</button></p>' +
    '<div class="sim-exam-sticky">' +
    '<div><p class="sim-exam-scope">' + esc(exam.label) + '</p>' +
    '<p class="sim-exam-progress">Soal ' + (exam.idx + 1) + ' dari ' + exam.items.length + ', ' + answered + ' dijawab' + (marked ? ', ' + marked + ' ditandai' : '') + '</p></div>' +
    '<p class="sim-timer" id="simTimer" role="timer" aria-live="off">' + fmtTime(exam.left) + '</p>' +
    '</div>' +
    '<div class="sim-palette" aria-label="Daftar soal">' + palette + '</div>' +
    '<article class="uas-q sim-q">' +
    '<p class="uas-q-tag">' + esc(it.course.kode) + ' ' + esc(it.course.nama) + ', ' + esc(it.q.tag) + '</p>' +
    '<p class="uas-q-text">' + esc(it.q.q) + '</p>' +
    '<div class="uas-opts" role="group" aria-label="Pilihan jawaban">' + opts + '</div>' +
    '</article>' +
    '<div class="sim-nav">' +
    '<button type="button" class="uas-reveal" id="simPrev"' + (exam.idx === 0 ? " disabled" : "") + '>Sebelumnya</button>' +
    '<button type="button" class="uas-reveal" id="simMark">' + (it.marked ? "Hapus tanda" : "Tandai soal ini") + '</button>' +
    '<button type="button" class="uas-reveal" id="simNext"' + (exam.idx === exam.items.length - 1 ? " disabled" : "") + '>Berikutnya</button>' +
    '<button type="button" class="uas-reveal sim-submit" id="simSubmit">Selesaikan simulasi</button>' +
    '</div>' +
    '<p class="sim-note">Jangan muat ulang halaman saat ujian berjalan. Timer dijeda kalau kamu pindah ke bagian lain, dan bisa dilanjutkan dari halaman simulasi.</p>';
}

function renderSimResult() {
  var el = $("simResultBody");
  if (!el || !exam || exam.phase !== "result") return;
  el.innerHTML = simResultInner();
}

function simResultHTML() {
  return '<p class="uas-back"><a href="#/">Beranda</a></p>' +
    '<h1 class="uas-page-title">Hasil simulasi</h1>' +
    '<div id="simResultBody"></div>';
}

function simResultInner() {
  var correct = exam.items.filter(function (it) { return it.picked === it.correct; }).length;
  var wrong = exam.items.filter(function (it) { return it.picked >= 0 && it.picked !== it.correct; }).length;
  var blank = exam.items.filter(function (it) { return it.picked < 0; }).length;
  var total = exam.items.length;
  var pct = Math.round((correct / total) * 100);
  var byCourse = {};
  exam.items.forEach(function (it) {
    var k = it.course.kode;
    byCourse[k] = byCourse[k] || { nama: it.course.nama, ok: 0, n: 0 };
    byCourse[k].n++;
    if (it.picked === it.correct) byCourse[k].ok++;
  });
  var rows = Object.keys(byCourse).map(function (k) {
    var r = byCourse[k];
    var p = Math.round((r.ok / r.n) * 100);
    return '<div class="sim-break-row"><span class="sim-break-code">' + esc(k) + ' ' + esc(r.nama) + '</span>' +
      '<span class="sim-break-bar"><span class="sim-break-fill" style="transform: scaleX(' + (r.ok / r.n) + ')"></span></span>' +
      '<span class="sim-break-num">' + r.ok + '/' + r.n + '</span></div>';
  }).join("");
  var review = exam.items.map(function (it, i) {
    var ok = it.picked === it.correct;
    var yours = it.picked >= 0 ? "ABCD"[it.picked] + ". " + it.options[it.picked] : "Tidak dijawab.";
    return '<article class="uas-q">' +
      '<p class="uas-q-tag">' + esc(it.course.kode) + ', ' + esc(it.q.tag) + ', soal ' + (i + 1) + (it.marked ? ', ditandai saat ujian' : '') + '</p>' +
      '<p class="uas-q-text">' + esc(it.q.q) + '</p>' +
      '<div class="uas-a"><p><strong>Jawabanmu:</strong> ' + esc(yours) + '</p>' +
      '<p><strong>Jawaban benar:</strong> ' + "ABCD"[it.correct] + ". " + esc(it.options[it.correct]) + '</p>' +
      '<p><strong>Alasan:</strong> ' + esc(it.q.why) + '</p>' +
      (ok ? '<p class="uas-mcq-verdict"><strong>Benar.</strong></p>' : '<p class="uas-mcq-verdict"><strong>Belum tepat.</strong></p>') +
      '</div></article>';
  }).join("");
  return '<p class="sim-scope-line">' + esc(exam.label) + (exam.auto ? ', waktu habis, jawaban dikumpulkan otomatis.' : '') + '</p>' +
    '<p class="sim-score"><span>' + correct + '</span><span class="sim-score-total"> / ' + total + '</span></p>' +
    '<p class="sim-score-note">' + pct + '% benar, ' + correct + ' benar, ' + wrong + ' salah, ' + blank + ' tidak dijawab. ' +
    (pct >= 80 ? "Kuat. Lanjut ke mata kuliah berikutnya." :
     pct >= 60 ? "Lumayan. Baca lagi pembahasan soal yang salah, lalu ulangi." :
     "Masih jauh. Kembali ke lembar ingat dulu, baru coba lagi.") + '</p>' +
    '<h3>Per mata kuliah</h3><div class="sim-break">' + rows + '</div>' +
    '<div class="sim-actions">' +
    '<button type="button" class="uas-reveal" id="simRetry">Ulangi dengan soal baru</button>' +
    '<a class="uas-link" href="#/">Kembali ke beranda</a>' +
    '</div>' +
    '<h3>Pembahasan tiap soal</h3>' + review;
}

function submitExam(auto) {
  if (!exam || exam.submitted) return;
  exam.submitted = true;
  exam.auto = !!auto;
  pauseTimer();
  exam.phase = "result";
  var correct = exam.items.filter(function (it) { return it.picked === it.correct; }).length;
  var total = exam.items.length;
  var pct = Math.round((correct / total) * 100);
  var best = loadBest();
  var prev = best[exam.key];
  if (!prev || pct > prev.pct || (pct === prev.pct && correct > prev.score)) {
    best[exam.key] = { score: correct, total: total, pct: pct };
    saveBest(best);
  }
  render();
}

/* ---- Events ---- */
document.addEventListener("click", function (ev) {
  var tab = ev.target.closest(".uas-appnav-link");
  if (tab) {
    if (exam && exam.phase === "exam" && tab.getAttribute("data-nav") === "sim") { pauseTimer(); render(); }
    return;
  }
  var exit = ev.target.closest("#simExit");
  if (exit && exam && exam.phase === "exam") { pauseTimer(); render(); return; }
  var btn = ev.target.closest(".uas-reveal");
  if (btn) {
    var box = btn.closest(".uas-q") ? document.getElementById(btn.getAttribute("aria-controls")) : null;
    if (box) {
      var open = box.hidden;
      box.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Sembunyikan jawaban dan alasan" : "Lihat jawaban dan alasan";
      return;
    }
  }
  var opt = ev.target.closest(".uas-opt");
  if (opt && opt.closest("[data-mcq]")) {
    var qEl = opt.closest(".uas-q");
    if (!qEl || qEl.classList.contains("answered")) return;
    var correct = parseInt(qEl.getAttribute("data-correct"), 10);
    var picked = parseInt(opt.getAttribute("data-oi"), 10);
    qEl.classList.add("answered");
    qEl.querySelectorAll(".uas-opt").forEach(function (o, oi) {
      o.disabled = true;
      if (oi === correct) o.classList.add("is-correct");
      if (oi === picked && picked !== correct) o.classList.add("is-wrong");
    });
    var ans = qEl.querySelector(".uas-mcq-a");
    var verdict = qEl.querySelector(".uas-mcq-verdict");
    if (verdict) verdict.innerHTML = picked === correct
      ? "<strong>Benar.</strong> Jawabanmu tepat."
      : "<strong>Belum tepat.</strong> Jawaban yang benar adalah <strong>" + "ABCD"[correct] + "</strong>.";
    if (ans) ans.hidden = false;
    return;
  }
  var pr = ev.target.closest(".uas-print");
  if (pr) { window.print(); return; }
  var start = ev.target.closest("#simStart");
  if (start) { startExam(); return; }
  var resume = ev.target.closest("#simResume");
  if (resume && exam && exam.phase === "paused") { exam.phase = "exam"; render(); return; }
  if (!exam) return;
  var simOpt = ev.target.closest("#simExamOpts, .sim-q .uas-opt");
  if (simOpt && exam.phase === "exam") {
    var it = exam.items[exam.idx];
    it.picked = parseInt(simOpt.getAttribute("data-opt"), 10);
    render();
    return;
  }
  var pal = ev.target.closest("[data-pal]");
  if (pal && exam.phase === "exam") { exam.idx = parseInt(pal.getAttribute("data-pal"), 10); render(); return; }
  if (ev.target.closest("#simPrev") && exam.phase === "exam" && exam.idx > 0) { exam.idx--; render(); return; }
  if (ev.target.closest("#simNext") && exam.phase === "exam" && exam.idx < exam.items.length - 1) { exam.idx++; render(); return; }
  if (ev.target.closest("#simMark") && exam.phase === "exam") {
    exam.items[exam.idx].marked = !exam.items[exam.idx].marked;
    render();
    return;
  }
  var sub = ev.target.closest("#simSubmit");
  if (sub && exam.phase === "exam") {
    if (!sub.getAttribute("data-armed")) {
      var unanswered = exam.items.filter(function (x) { return x.picked < 0; }).length;
      sub.setAttribute("data-armed", "1");
      sub.textContent = unanswered > 0
        ? "Masih ada " + unanswered + " soal belum dijawab. Klik lagi untuk mengumpulkan."
        : "Klik lagi untuk mengumpulkan jawaban.";
      return;
    }
    submitExam(false);
    return;
  }
  if (ev.target.closest("#simRetry")) {
    exam = null;
    go("#/sim");
    return;
  }
});

document.addEventListener("change", function (ev) {
  var box = ev.target.closest("input[data-check]");
  if (box) {
    checks[box.getAttribute("data-check")] = box.checked;
    saveChecks(checks);
    updateProgress();
    return;
  }
  if (ev.target.closest('input[name="scope"]') || ev.target.closest("#simCourse") || ev.target.closest("#simSemester") || ev.target.closest("#simCount")) {
    updateSimSetupNotes();
  }
});

window.addEventListener("hashchange", render);

(function initTheme() {
  var toggle = $("themeToggle");
  function setTheme(name) {
    document.documentElement.dataset.theme = name;
    try { localStorage.setItem("kelasut-theme", name); } catch (e) { /* abaikan */ }
    var mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.setAttribute("content", name === "dark" ? "#16120d" : "#faf5ec");
    var label = toggle ? toggle.querySelector(".theme-toggle-label") : null;
    if (label) label.textContent = name === "dark" ? "Terang" : "Gelap";
  }
  if (toggle) toggle.addEventListener("click", function () {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  var saved = null;
  try { saved = localStorage.getItem("kelasut-theme"); } catch (e) { saved = null; }
  if (saved) setTheme(saved);
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
})();

render();
