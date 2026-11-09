"use strict";
/* UAS Prep Pack - Semua Semester. Render dari uas-recall.js.
   Checklist tersimpan lokal di peramban (uas_checklist_v1), kunci yang
   sama dengan paket Semester 4, jadi centang lama tetap berlaku.
   Jawaban latihan pilihan ganda hanya untuk sesi ini, tidak disimpan.
   Tema memakai kunci yang sama dengan situs utama (kelasut-theme). */

var DATA = window.UAS_RECALL;
var CHECK_KEY = "uas_checklist_v1";
var SIM_KEY = "uas_sim_best_v1";
var S4_ORDER_NOTE = "Urutan belajar disarankan dari nilai Tuton terendah: Pemasaran, Riset Operasi, Kewirausahaan, Operasi, Keuangan, SDM.";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadChecks() {
  try {
    var v = JSON.parse(localStorage.getItem(CHECK_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch (e) { return {}; }
}

function saveChecks(v) {
  try { localStorage.setItem(CHECK_KEY, JSON.stringify(v)); } catch (e) { /* abaikan */ }
}

var checks = loadChecks();
var currentSem = 4;

function semData(n) {
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

function updateProgress() {
  var total = totalTopics();
  var done = 0;
  DATA.semesters.forEach(function (sem) { done += semDone(sem); });
  var pct = total ? Math.round((done / total) * 100) : 0;
  var fill = document.getElementById("uasProgressFill");
  var track = document.getElementById("uasProgressTrack");
  var note = document.getElementById("uasProgressNote");
  if (fill) fill.style.width = pct + "%";
  if (track) track.setAttribute("aria-valuenow", String(pct));
  if (note) note.textContent = done === 0
    ? "Belum ada topik yang dicentang."
    : done + " dari " + total + " topik dicentang (" + pct + "%).";
  DATA.semesters.forEach(function (sem) {
    var el = document.getElementById("semTabCount-" + sem.semester);
    if (el) el.textContent = semDone(sem) + "/" + semTopics(sem);
  });
}

function renderTabs() {
  var tabs = document.getElementById("semTabs");
  tabs.innerHTML = DATA.semesters.map(function (sem) {
    var active = sem.semester === currentSem;
    return '<button type="button" class="uas-sem-tab' + (active ? " is-active" : "") + '" data-sem="' + sem.semester + '" aria-pressed="' + active + '">' +
      '<span class="uas-sem-num">Semester ' + sem.semester + '</span>' +
      '<span class="uas-sem-count" id="semTabCount-' + sem.semester + '"></span>' +
      '<span class="uas-sem-courses">' + sem.courses.length + ' mata kuliah</span>' +
      '</button>';
  }).join("");
}

function mcqHTML(c, q, i) {
  var opts = q.options.map(function (o, oi) {
    return '<button type="button" class="uas-opt" data-q="' + c.kode + '-' + i + '" data-oi="' + oi + '">' +
      '<span class="uas-opt-letter">' + "ABCD"[oi] + '</span><span>' + esc(o) + '</span></button>';
  }).join("");
  return '<article class="uas-q" data-mcq="' + c.kode + '-' + i + '" data-correct="' + q.correct + '">' +
    '<p class="uas-q-tag">' + esc(q.tag) + ' &middot; Soal ' + (i + 1) + ' dari 12</p>' +
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
    '<p class="uas-q-tag">' + esc(q.tag) + ' &middot; Soal uraian ' + (i + 1) + ' dari 12</p>' +
    '<p class="uas-q-text">' + esc(q.q) + '</p>' +
    '<button type="button" class="uas-reveal" aria-expanded="false" aria-controls="' + id + '">Lihat jawaban dan alasan</button>' +
    '<div class="uas-a" id="' + id + '" hidden>' +
    '<p><strong>Jawaban:</strong> ' + esc(q.a) + '</p>' +
    '<p><strong>Alasan:</strong> ' + esc(q.why) + '</p>' +
    '</div></article>';
}

function courseHTML(c, i, sem) {
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
  var simLink = 'sim.html?scope=course&amp;code=' + esc(c.kode);
  return '<section class="uas-course" id="uas-' + esc(c.kode) + '" aria-label="UAS ' + esc(c.nama) + '">' +
    '<div class="uas-course-head">' +
    '<p class="uas-course-eyebrow">Semester ' + sem.semester + ' &middot; Mata kuliah ' + (i + 1) + ' dari ' + sem.courses.length + ' &middot; ' + esc(c.kode) + ' &middot; ' + c.sks + ' sks</p>' +
    '<h2>' + esc(c.nama) + '</h2>' +
    '<p class="uas-bigidea">' + esc(c.bigIdea) + '</p>' + analogi +
    '<div class="uas-links">' +
    '<a class="uas-link" href="' + esc(kelasUrl) + '">Buka halaman belajar di Kelas UT</a>' + soalut +
    '<a class="uas-link uas-link-sim" href="' + simLink + '">Simulasi UAS mata kuliah ini</a>' +
    '</div>' +
    '<div class="uas-audio"><p>Dengarkan briefing audio ' + esc(c.nama) + '</p>' +
    '<audio controls preload="metadata" src="../audio/' + esc(c.audioFile) + '">Browser kamu tidak mendukung pemutar audio.</audio></div>' +
    '<button type="button" class="btn-ghost uas-print" data-print="' + esc(c.kode) + '">Cetak lembar ingat ' + esc(c.nama) + '</button>' +
    '</div>' +
    '<div class="uas-recall"><h3>Lembar ingat: ' + c.topics.length + ' topik</h3>' +
    '<ol class="uas-topics">' + topics + '</ol>' +
    '<h3>5 kunci</h3><ul>' + keys + '</ul>' + conf +
    '<h3>' + esc(c.example.title) + '</h3><p>' + esc(c.example.body) + '</p></div>' +
    '<div class="uas-practice"><h3>Latihan pilihan ganda: 12 soal</h3>' +
    '<p class="uas-practice-note">Klik satu jawaban. Benar atau salah langsung terlihat, beserta alasannya. Jawaban latihan tidak disimpan, ulangi kapan saja.</p>' + mcqs + '</div>' +
    open +
    '</section>';
}

function renderSemester(n, scrollToCode) {
  currentSem = n;
  var sem = semData(n);
  renderTabs();
  var note = document.getElementById("orderNote");
  if (note) {
    note.textContent = n === 4 ? S4_ORDER_NOTE : "";
    note.style.display = n === 4 ? "" : "none";
  }
  var head = document.getElementById("semHeading");
  if (head) head.textContent = "Semester " + sem.semester + ": " + sem.courses.length + " mata kuliah";
  document.getElementById("courseNav").innerHTML = sem.courses.map(function (c, i) {
    return '<a class="uas-nav-card" href="#uas-' + esc(c.kode) + '">' +
      '<span class="uas-nav-num">' + (i + 1) + '</span>' +
      '<span class="uas-nav-code">' + esc(c.kode) + '</span>' +
      '<span class="uas-nav-name">' + esc(c.nama) + '</span>' +
      '<span class="uas-nav-foot"><span>' + c.sks + ' sks</span><span>12 soal pilihan ganda</span></span>' +
      '</a>';
  }).join("");
  document.getElementById("courseSections").innerHTML =
    sem.courses.map(function (c, i) { return courseHTML(c, i, sem); }).join("");
  updateProgress();
  if (scrollToCode) {
    var el = document.getElementById("uas-" + scrollToCode);
    if (el) el.scrollIntoView();
  }
}

function semesterOfCode(code) {
  for (var i = 0; i < DATA.semesters.length; i++) {
    var found = DATA.semesters[i].courses.some(function (c) { return c.kode === code; });
    if (found) return DATA.semesters[i].semester;
  }
  return 4;
}

function applyHash() {
  var h = location.hash || "";
  var mSem = h.match(/^#sem-(\d)$/);
  if (mSem) { renderSemester(parseInt(mSem[1], 10)); return; }
  var mCode = h.match(/^#uas-([A-Z0-9]+)$/);
  if (mCode) {
    var code = mCode[1];
    renderSemester(semesterOfCode(code), code);
    return;
  }
  renderSemester(currentSem);
}

document.addEventListener("click", function (ev) {
  var tab = ev.target.closest(".uas-sem-tab");
  if (tab) {
    var n = parseInt(tab.getAttribute("data-sem"), 10);
    history.replaceState(null, "", "#sem-" + n);
    renderSemester(n);
    var head = document.getElementById("semHeading");
    if (head) head.scrollIntoView();
    return;
  }
  var btn = ev.target.closest(".uas-reveal");
  if (btn) {
    var box = document.getElementById(btn.getAttribute("aria-controls"));
    if (!box) return;
    var open = box.hidden;
    box.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "Sembunyikan jawaban dan alasan" : "Lihat jawaban dan alasan";
    return;
  }
  var opt = ev.target.closest(".uas-opt");
  if (opt) {
    var qEl = opt.closest(".uas-q");
    if (!qEl || qEl.classList.contains("answered")) return;
    var correct = parseInt(qEl.getAttribute("data-correct"), 10);
    var picked = parseInt(opt.getAttribute("data-oi"), 10);
    qEl.classList.add("answered");
    var opts = qEl.querySelectorAll(".uas-opt");
    opts.forEach(function (o, oi) {
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
  if (pr) { window.print(); }
});

document.addEventListener("change", function (ev) {
  var box = ev.target.closest("input[data-check]");
  if (!box) return;
  checks[box.getAttribute("data-check")] = box.checked;
  saveChecks(checks);
  updateProgress();
});

window.addEventListener("hashchange", applyHash);

(function initTheme() {
  var toggle = document.getElementById("themeToggle");
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

applyHash();
