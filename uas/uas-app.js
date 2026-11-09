"use strict";
/* UAS Prep Pack Semester 4 - render dari uas-data.js.
   Checklist tersimpan lokal di peramban (uas_checklist_v1).
   Tema memakai kunci yang sama dengan situs utama (kelasut-theme). */

var DATA = window.UAS_DATA;
var CHECK_KEY = "uas_checklist_v1";

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

function totalTopics() {
  return DATA.courses.reduce(function (n, c) { return n + c.topics.length; }, 0);
}

function updateProgress() {
  var total = totalTopics();
  var done = Object.keys(checks).filter(function (k) { return checks[k]; }).length;
  var pct = total ? Math.round((done / total) * 100) : 0;
  var fill = document.getElementById("uasProgressFill");
  var track = document.getElementById("uasProgressTrack");
  var note = document.getElementById("uasProgressNote");
  if (fill) fill.style.width = pct + "%";
  if (track) track.setAttribute("aria-valuenow", String(pct));
  if (note) note.textContent = done === 0
    ? "Belum ada topik yang dicentang."
    : done + " dari " + total + " topik dicentang (" + pct + "%).";
}

function renderNav() {
  var nav = document.getElementById("courseNav");
  nav.innerHTML = DATA.courses.map(function (c, i) {
    return '<a class="uas-nav-card" href="#uas-' + esc(c.kode) + '">' +
      '<span class="uas-nav-num">' + (i + 1) + '</span>' +
      '<span class="uas-nav-code">' + esc(c.kode) + '</span>' +
      '<span class="uas-nav-name">' + esc(c.nama) + '</span>' +
      '<span class="uas-nav-foot"><span>' + c.sks + ' sks</span><span>12 soal latihan</span></span>' +
      '</a>';
  }).join("");
}

function questionHTML(c, q, i) {
  var id = "ans-" + c.kode + "-" + (i + 1);
  return '<article class="uas-q">' +
    '<p class="uas-q-tag">' + esc(q.tag) + ' &middot; Soal ' + (i + 1) + ' dari 12</p>' +
    '<p class="uas-q-text">' + esc(q.q) + '</p>' +
    '<button type="button" class="uas-reveal" aria-expanded="false" aria-controls="' + id + '">Lihat jawaban dan alasan</button>' +
    '<div class="uas-a" id="' + id + '" hidden>' +
    '<p><strong>Jawaban:</strong> ' + esc(q.a) + '</p>' +
    '<p><strong>Alasan:</strong> ' + esc(q.why) + '</p>' +
    '</div></article>';
}

function courseHTML(c, i) {
  var kelasUrl = DATA.meta.kelasBase + c.kode;
  var topics = c.topics.map(function (t, ti) {
    var key = c.kode + ":" + ti;
    var on = !!checks[key];
    return '<li class="uas-topic"><label>' +
      '<input type="checkbox" data-check="' + esc(key) + '"' + (on ? " checked" : "") + '> ' +
      '<span>' + esc(t) + '</span></label></li>';
  }).join("");
  var keys = c.keys.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  var conf = c.confusion.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  var qs = c.questions.map(function (q, qi) { return questionHTML(c, q, qi); }).join("");
  return '<section class="uas-course" id="uas-' + esc(c.kode) + '" aria-label="UAS ' + esc(c.nama) + '">' +
    '<div class="uas-course-head">' +
    '<p class="uas-course-eyebrow">Mata kuliah ' + (i + 1) + ' dari 6 &middot; ' + esc(c.kode) + ' &middot; ' + c.sks + ' sks</p>' +
    '<h2>' + esc(c.nama) + '</h2>' +
    '<p class="uas-bigidea">' + esc(c.bigIdea) + '</p>' +
    '<div class="uas-links">' +
    '<a class="uas-link" href="' + esc(kelasUrl) + '">Buka halaman belajar di Kelas UT</a>' +
    '<a class="uas-link" href="' + esc(c.soalutUrl) + '" target="_blank" rel="noopener">Latihan tambahan di SoalUT (' + esc(c.soalutKode) + ')</a>' +
    '</div>' +
    '<div class="uas-audio"><p>Dengarkan briefing audio ' + esc(c.nama) + '</p>' +
    '<audio controls preload="metadata" src="../audio/' + esc(c.audioFile) + '">Browser kamu tidak mendukung pemutar audio.</audio></div>' +
    '<button type="button" class="btn-ghost uas-print" data-print="' + esc(c.kode) + '">Cetak lembar ingat ' + esc(c.nama) + '</button>' +
    '</div>' +
    '<div class="uas-recall"><h3>Lembar ingat: 9 topik</h3>' +
    '<ol class="uas-topics">' + topics + '</ol>' +
    '<h3>5 kunci</h3><ul>' + keys + '</ul>' +
    '<h3>Kebingungan umum, diluruskan</h3><ul>' + conf + '</ul>' +
    '<h3>' + esc(c.example.title) + '</h3><p>' + esc(c.example.body) + '</p></div>' +
    '<div class="uas-practice"><h3>Latihan: 12 soal</h3>' +
    '<p class="uas-practice-note">Jawab dulu dengan menulis langkahmu, baru buka kuncinya.</p>' + qs + '</div>' +
    '</section>';
}

function render() {
  document.getElementById("orderNote").textContent = DATA.meta.orderNote;
  renderNav();
  document.getElementById("courseSections").innerHTML =
    DATA.courses.map(courseHTML).join("");
  updateProgress();
}

document.addEventListener("click", function (ev) {
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

render();
