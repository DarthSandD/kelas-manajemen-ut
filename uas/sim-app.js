"use strict";
/* Simulasi UAS - latihan berwaktu dari bank soal uas-mcq.js.
   Skor terbaik tersimpan lokal (uas_sim_best_v1) per cakupan.
   Timer memakai jam peramban; waktu habis berarti jawaban dikumpulkan. */

var BANK = window.UAS_MCQ;
var BEST_KEY = "uas_sim_best_v1";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function $(id) { return document.getElementById(id); }

function loadBest() {
  try {
    var v = JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch (e) { return {}; }
}

function saveBest(v) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(v)); } catch (e) { /* abaikan */ }
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function allCourses() {
  var out = [];
  BANK.semesters.forEach(function (sem) {
    sem.courses.forEach(function (c) {
      out.push({ semester: sem.semester, kode: c.kode, nama: c.nama, sks: c.sks, questions: c.questions });
    });
  });
  return out;
}

var COURSES = allCourses();

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
  return "Semua semester (51 mata kuliah)";
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

function updateSetupNotes() {
  var scope = currentScope();
  var code = $("simCourse").value;
  var sem = parseInt($("simSemester").value, 10);
  var pool = poolFor(scope, code, sem);
  var count = parseInt($("simCount").value, 10);
  $("fieldCourse").hidden = scope !== "course";
  $("fieldSemester").hidden = scope !== "semester";
  $("simPoolNote").textContent = pool.length === 0
    ? "Tidak ada soal untuk pilihan ini."
    : "Tersedia " + pool.length + " soal untuk cakupan ini. Simulasi mengambil " + Math.min(count, pool.length) + " soal secara acak.";
  var best = loadBest()[scopeKey(scope, code, sem)];
  $("simBestNote").textContent = best
    ? "Skor terbaikmu untuk cakupan ini: " + best.score + "/" + best.total + " (" + best.pct + "%)."
    : "";
}

function fillSetup() {
  var courseSel = $("simCourse");
  var html = "";
  BANK.semesters.forEach(function (sem) {
    html += '<optgroup label="Semester ' + sem.semester + '">';
    sem.courses.forEach(function (c) {
      html += '<option value="' + esc(c.kode) + '"' + (c.kode === "EMBS4212" ? " selected" : "") + '>' +
        esc(c.kode) + " " + esc(c.nama) + "</option>";
    });
    html += "</optgroup>";
  });
  courseSel.innerHTML = html;
  var semSel = $("simSemester");
  semSel.innerHTML = BANK.semesters.map(function (sem) {
    return '<option value="' + sem.semester + '"' + (sem.semester === 4 ? " selected" : "") + '>Semester ' + sem.semester + " (" + sem.courses.length + " mata kuliah)</option>";
  }).join("");
  var params = new URLSearchParams(location.search);
  var pScope = params.get("scope");
  var pCode = params.get("code");
  var pSem = params.get("sem");
  if (pScope === "semester" || pScope === "all" || pScope === "course") {
    var radio = document.querySelector('input[name="scope"][value="' + pScope + '"]');
    if (radio) radio.checked = true;
  }
  if (pCode && COURSES.some(function (x) { return x.kode === pCode; })) courseSel.value = pCode;
  if (pSem && !isNaN(parseInt(pSem, 10))) semSel.value = pSem;
  updateSetupNotes();
}

/* ---- Exam state ---- */
var exam = null;
var timerId = null;

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
      picked: -1
    };
  });
  exam = {
    scope: scope, code: code, sem: sem,
    label: scopeLabel(scope, code, sem),
    key: scopeKey(scope, code, sem),
    items: picked, idx: 0, left: minutes * 60, submitted: false
  };
  $("simSetup").hidden = true;
  $("simResult").hidden = true;
  $("simExam").hidden = false;
  $("simExamScope").textContent = exam.label + " - " + picked.length + " soal";
  renderPalette();
  renderQuestion();
  updateTimer();
  timerId = setInterval(function () {
    exam.left--;
    updateTimer();
    if (exam.left <= 0) submitExam(true);
  }, 1000);
  window.scrollTo(0, 0);
}

function updateTimer() {
  var t = $("simTimer");
  t.textContent = fmtTime(Math.max(0, exam.left));
  t.classList.toggle("is-low", exam.left <= 300);
}

function renderPalette() {
  $("simPalette").innerHTML = exam.items.map(function (it, i) {
    var cls = "sim-pal" + (i === exam.idx ? " is-current" : "") + (it.picked >= 0 ? " is-answered" : "");
    return '<button type="button" class="' + cls + '" data-pal="' + i + '">' + (i + 1) + "</button>";
  }).join("");
  $("simExamProgress").textContent = "Soal " + (exam.idx + 1) + " dari " + exam.items.length +
    " - " + exam.items.filter(function (it) { return it.picked >= 0; }).length + " dijawab";
}

function renderQuestion() {
  var it = exam.items[exam.idx];
  $("simQTag").textContent = it.course.kode + " " + it.course.nama + " - " + it.q.tag;
  $("simQText").textContent = it.q.q;
  $("simQOpts").innerHTML = it.options.map(function (o, oi) {
    var cls = "uas-opt" + (it.picked === oi ? " is-picked" : "");
    return '<button type="button" class="' + cls + '" data-opt="' + oi + '">' +
      '<span class="uas-opt-letter">' + "ABCD"[oi] + "</span><span>" + esc(o) + "</span></button>";
  }).join("");
  $("simPrev").disabled = exam.idx === 0;
  $("simNext").disabled = exam.idx === exam.items.length - 1;
  var sub = $("simSubmit");
  sub.textContent = "Selesaikan simulasi";
  sub.removeAttribute("data-armed");
  renderPalette();
}

function submitExam(auto) {
  if (!exam || exam.submitted) return;
  exam.submitted = true;
  if (timerId) { clearInterval(timerId); timerId = null; }
  var correct = exam.items.filter(function (it) { return it.picked === it.correct; }).length;
  var total = exam.items.length;
  var pct = Math.round((correct / total) * 100);
  var best = loadBest();
  var prev = best[exam.key];
  if (!prev || pct > prev.pct || (pct === prev.pct && correct > prev.score)) {
    best[exam.key] = { score: correct, total: total, pct: pct };
    saveBest(best);
  }
  $("simExam").hidden = true;
  $("simResult").hidden = false;
  $("simResultScope").textContent = exam.label + (auto ? " - waktu habis, jawaban dikumpulkan otomatis." : "");
  $("simScoreValue").textContent = correct;
  $("simScoreTotal").textContent = " / " + total;
  $("simScoreNote").textContent = pct + "% benar." +
    (pct >= 80 ? " Kuat. Lanjut ke mata kuliah berikutnya." :
     pct >= 60 ? " Lumayan. Baca lagi pembahasan soal yang salah, lalu ulangi." :
     " Masih jauh. Kembali ke lembar ingat dulu, baru coba lagi.");
  $("simReview").innerHTML = exam.items.map(function (it, i) {
    var ok = it.picked === it.correct;
    var yours = it.picked >= 0 ? "ABCD"[it.picked] + ". " + it.options[it.picked] : "Tidak dijawab.";
    return '<article class="uas-q">' +
      '<p class="uas-q-tag">' + esc(it.course.kode) + " - " + esc(it.q.tag) + " &middot; Soal " + (i + 1) + "</p>" +
      '<p class="uas-q-text">' + esc(it.q.q) + "</p>" +
      '<div class="uas-a"><p><strong>Jawabanmu:</strong> ' + esc(yours) + "</p>" +
      '<p><strong>Jawaban benar:</strong> ' + "ABCD"[it.correct] + ". " + esc(it.options[it.correct]) + "</p>" +
      "<p><strong>Alasan:</strong> " + esc(it.q.why) + "</p>" +
      (ok ? '<p class="uas-mcq-verdict"><strong>Benar.</strong></p>' : '<p class="uas-mcq-verdict"><strong>Belum tepat.</strong></p>') +
      "</div></article>";
  }).join("");
  window.scrollTo(0, 0);
}

document.addEventListener("click", function (ev) {
  var radio = ev.target.closest('input[name="scope"]');
  if (radio) { updateSetupNotes(); return; }
  if (ev.target.closest("#simStart")) { startExam(); return; }
  if (!exam) return;
  var opt = ev.target.closest("#simQOpts .uas-opt");
  if (opt) {
    var it = exam.items[exam.idx];
    it.picked = parseInt(opt.getAttribute("data-opt"), 10);
    renderQuestion();
    return;
  }
  var pal = ev.target.closest("[data-pal]");
  if (pal) { exam.idx = parseInt(pal.getAttribute("data-pal"), 10); renderQuestion(); return; }
  if (ev.target.closest("#simPrev") && exam.idx > 0) { exam.idx--; renderQuestion(); return; }
  if (ev.target.closest("#simNext") && exam.idx < exam.items.length - 1) { exam.idx++; renderQuestion(); return; }
  var sub = ev.target.closest("#simSubmit");
  if (sub) {
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
    $("simResult").hidden = true;
    $("simSetup").hidden = false;
    exam = null;
    updateSetupNotes();
    window.scrollTo(0, 0);
  }
});

document.addEventListener("change", function (ev) {
  if (ev.target.closest("#simCourse") || ev.target.closest("#simSemester") || ev.target.closest("#simCount")) updateSetupNotes();
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

fillSetup();
