"use strict";

/* ============================================================
   Kelas Manajemen UT v2
   Data dimuat dari data.js (window.KMUT_DATA) hasil gabungan
   scripts/merge-data.js dari content/*.json. Halaman mata
   kuliah disusun ulang mengikuti gaya belajar aktif yang
   tersimpan di localStorage "kmut_style".
   ============================================================ */

const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

const SUBJECTS = ((window.KMUT_DATA && window.KMUT_DATA.subjects) || []).slice().sort((a, b) =>
  a.semester - b.semester || (a.kode < b.kode ? -1 : a.kode > b.kode ? 1 : 0));
const BY_KODE = new Map(SUBJECTS.map((s) => [s.kode, s]));

/* ---------- Empat gaya belajar ---------- */
const STYLES = {
  visual: {
    name: "Visual",
    glyph: "▦",
    tag: "Belajar lewat gambar dan peta",
    desc: "Setiap mata kuliah dibuka sebagai peta: kotak topik mengalir dari awal sampai akhir, lima kunci tampil sebagai kartu, dan semuanya terlihat dalam sekali pandang.",
    line: "Situs ini sedang tersusun untuk mata kamu: setiap mata kuliah tampil sebagai peta dan kartu, jadi bentuk besarnya terlihat dulu sebelum kamu masuk ke detailnya."
  },
  auditori: {
    name: "Auditori",
    glyph: "♫",
    tag: "Belajar lewat mendengar",
    desc: "Setiap mata kuliah dibuka dengan briefing audio yang bisa kamu putar. Dengarkan dulu sampai gambar besarnya jelas, transkrip dan poin kuncinya menyusul di bawahnya.",
    line: "Situs ini sedang tersusun untuk telinga kamu: setiap mata kuliah dibuka dengan briefing audio. Putar dulu sampai utuh, baru baca transkrip dan poin kuncinya."
  },
  baca: {
    name: "Baca-Tulis",
    glyph: "✎",
    tag: "Belajar lewat membaca dan menulis",
    desc: "Materi mengalir seperti artikel: ide besar di awal, lalu topik demi topik dengan penjelasan penuh, ditutup ruang catatan untuk kamu tulis ulang dengan katamu sendiri.",
    line: "Situs ini sedang tersusun untuk pembaca dan penulis: materi mengalir runtut seperti artikel, dan di tiap mata kuliah ada ruang catatan agar kamu bisa menulis ulang dengan katamu sendiri."
  },
  praktik: {
    name: "Praktik",
    glyph: "⚙",
    tag: "Belajar lewat mencoba dan latihan",
    desc: "Kamu langsung mencoba. Contoh dan kuis tampil paling depan, lima kunci menjadi kartu hafalan yang bisa dibalik, dan konsep menyusul setelah tanganmu kotor.",
    line: "Situs ini sedang tersusun untuk tangan kamu: contoh dan kuis tampil duluan di setiap mata kuliah. Coba dulu, salah tidak apa-apa, konsepnya menyusul setelah kamu mencoba."
  }
};
const STYLE_IDS = Object.keys(STYLES);

/* ---------- Metadata semester (dari katalog FEB UT 2024/2025) ---------- */
const SEM_META = {
  1: { tag: "review", sub: "Fondasi: cara berpikir ekonom, berbisnis, dan berbahasa akademik." },
  2: { tag: "review", sub: "Angka mulai bicara: akuntansi, statistika, dan ekonomi mikro." },
  3: { tag: "review", sub: "Mesin organisasi: biaya, sistem informasi, dan perilaku manusia di tempat kerja." },
  4: { tag: "now", sub: "Semester kamu sekarang: enam kelas inti manajemen, semuanya dengan materi lengkap di situs ini.",
       note: "Enam kelas aktifmu di 2026.2 tercatat dengan kode EMBS dan MKDI. Di katalog, Manajemen Operasi, Manajemen Pemasaran, Riset Operasi, dan Manajemen SDM tercatat dengan kode EKMA4215, EKMA4216, EKMA4413, dan EKMA4214." },
  5: { tag: "preview", sub: "Naik kelas ke strategi: konsumen, perilaku organisasi, dan arah perusahaan.",
       note: "Satu mata kuliah paket semester ini sudah kamu selesaikan lebih awal: Manajemen Keuangan (EKMA4213 di katalog) kamu ambil di Semester 4 sebagai EMBS4210. Materi lengkapnya ada di Semester 4." },
  6: { tag: "preview", sub: "Pendalaman analitis: portofolio, rantai pasokan, dan metode penelitian." },
  7: { tag: "preview", sub: "Menjelang garis akhir: pemasaran strategik, perubahan, dan Tugas Akhir Program." },
  8: { tag: "preview", sub: "Semester penutup: penganggaran, kinerja, kualitas, dan kelayakan bisnis." }
};

function statusOf(n) {
  const tag = (SEM_META[n] || {}).tag || "preview";
  if (tag === "review") return { label: "Ulas Ulang", badge: "badge-review" };
  if (tag === "now") return { label: "Sedang Berjalan", badge: "badge-now" };
  return { label: "Pratinjau", badge: "badge-preview" };
}

function sumberLabel(s) {
  return s.sumber === "TM" ? "Tinjauan Mata Kuliah resmi UT" : "silabus standar bidang";
}

/* ---------- Gaya belajar: simpan, terapkan, gerbang ---------- */
const gate = $("#styleGate");
const gateGrid = $("#gateGrid");
const gateClose = $("#gateClose");
let currentStyle = null;

function savedStyle() {
  try {
    const v = localStorage.getItem("kmut_style");
    return STYLE_IDS.includes(v) ? v : null;
  } catch (e) { return null; }
}

function persistStyle(id) {
  try { localStorage.setItem("kmut_style", id); } catch (e) { /* abaikan */ }
}

function buildGate() {
  gateGrid.innerHTML = STYLE_IDS.map((id) => {
    const st = STYLES[id];
    return `
    <button type="button" class="gate-card" data-style="${id}" aria-pressed="false">
      <span class="gate-card-glyph" aria-hidden="true">${st.glyph}</span>
      <span class="gate-card-name">${st.name}</span>
      <span class="gate-card-tag">${st.tag}</span>
      <span class="gate-card-desc">${st.desc}</span>
    </button>`;
  }).join("");
  $$(".gate-card", gateGrid).forEach((card) => {
    card.addEventListener("click", () => setStyle(card.dataset.style, true, true));
  });
}

function openGate(closable) {
  gate.hidden = false;
  gateClose.hidden = !closable;
  document.body.classList.add("gate-open");
  let firstCard = null;
  let activeCard = null;
  $$(".gate-card", gateGrid).forEach((card) => {
    const active = card.dataset.style === currentStyle;
    card.classList.toggle("is-active", active);
    card.setAttribute("aria-pressed", active ? "true" : "false");
    if (!firstCard) firstCard = card;
    if (active) activeCard = card;
  });
  const focusTarget = activeCard || firstCard;
  if (focusTarget) focusTarget.focus();
}

function closeGate() {
  gate.hidden = true;
  document.body.classList.remove("gate-open");
  const chip = $("#styleChip");
  if (chip) chip.focus();
}

gateClose.addEventListener("click", closeGate);
document.addEventListener("keydown", (e) => {
  if (gate.hidden) return;
  if (e.key === "Escape" && currentStyle) { closeGate(); return; }
  if (e.key === "Tab") {
    const items = $$(".gate-card", gateGrid);
    if (!gateClose.hidden) items.push(gateClose);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

function setStyle(id, closeAfter, persist) {
  if (!STYLE_IDS.includes(id)) return;
  currentStyle = id;
  if (persist) persistStyle(id);
  document.documentElement.dataset.style = id;
  const st = STYLES[id];
  $(".style-chip-label").textContent = "Gaya: " + st.name;
  $("#modeEyebrow").textContent = "Mode " + st.name + " aktif · Universitas Terbuka · Program Studi Manajemen (S1)";
  $("#modeLine").textContent = st.line;
  if (closeAfter) closeGate();
  route();
}

$("#styleChip").addEventListener("click", () => openGate(true));

/* Tautan dalam: ?gaya=visual dan seterusnya. Bila ada, gaya dari
   tautan didahulukan daripada pilihan tersimpan, tetapi tidak ikut
   disimpan: localStorage hanya berubah lewat pilihan eksplisit
   pengguna di gerbang gaya. */
function deepLinkStyle() {
  try {
    const v = new URLSearchParams(location.search).get("gaya");
    return STYLE_IDS.includes(v) ? v : null;
  } catch (e) { return null; }
}

/* ---------- Beranda: peta semester dari data ---------- */
function renderMap() {
  const wrap = $("#semesterList");
  const bySem = new Map();
  SUBJECTS.forEach((s) => {
    if (!bySem.has(s.semester)) bySem.set(s.semester, []);
    bySem.get(s.semester).push(s);
  });

  wrap.innerHTML = Array.from(bySem.keys()).sort((a, b) => a - b).map((n) => {
    const meta = SEM_META[n] || {};
    const st = statusOf(n);
    const list = bySem.get(n);
    const cards = list.map((s) => `
      <button type="button" class="course-card" data-code="${s.kode}" data-search="${(s.kode + " " + s.nama + " " + s.bahanAjar).toLowerCase()}">
        <span class="course-code">${s.kode}${s.bahanAjar && s.bahanAjar !== s.kode ? " · BA " + s.bahanAjar : ""}</span>
        <span class="course-name">${s.nama}</span>
        <span class="course-foot">
          <span>${s.sks === 0 ? "tanpa beban sks" : s.sks + " sks"}</span>
          <span class="course-cta">Buka pelajaran &rarr;</span>
        </span>
      </button>`).join("");
    return `
    <article class="semester reveal" data-semester="${n}">
      <div class="semester-head">
        <div class="semester-num" aria-hidden="true">${n}</div>
        <div class="semester-head-text">
          <span class="badge ${st.badge}">${st.label}</span>
          <h2 class="semester-title">Semester ${n}</h2>
          <p class="semester-sub">${meta.sub || ""} · ${list.length} mata kuliah dengan materi lengkap</p>
        </div>
      </div>
      ${meta.note ? `<p class="semester-note">${meta.note}</p>` : ""}
      <div class="course-grid">${cards}</div>
    </article>`;
  }).join("");

  $$(".course-card", wrap).forEach((card) => {
    card.addEventListener("click", () => { location.hash = "#/mapel/" + card.dataset.code; });
  });
  $("#statSubjects").textContent = SUBJECTS.length;
  $("#searchHint").textContent = SUBJECTS.length + " mata kuliah dari Semester 1 sampai 8 sudah punya halaman belajar lengkap. Klik kartunya untuk membuka.";
  observeReveals(wrap);
}

/* ---------- Blok bangunan halaman mata kuliah ---------- */
function splitKey(str) {
  const i = str.indexOf(": ");
  if (i > 0) return { term: str.slice(0, i), gloss: str.slice(i + 2) };
  return { term: str, gloss: "" };
}

function subjectHeader(s) {
  const st = statusOf(s.semester);
  return `
    <a class="back-link" href="#/">&larr; Kembali ke peta semester</a>
    <p class="subject-eyebrow">Semester ${s.semester} · ${st.label} · Mode ${STYLES[currentStyle].name}</p>
    <h1 class="subject-title">${s.nama}</h1>
    <p class="subject-meta">${s.kode} · ${s.sks === 0 ? "tanpa beban sks" : s.sks + " sks"} · Bahan ajar ${s.bahanAjar} · Sumber: ${sumberLabel(s)}</p>`;
}

function quizHTML(s) {
  const items = s.quiz.map((q, qi) => `
    <div class="quiz-item">
      <p class="quiz-q">${q.q}</p>
      <button type="button" class="quiz-btn" aria-expanded="false" aria-controls="quiz-a-${qi}">Lihat jawaban</button>
      <p class="quiz-a" id="quiz-a-${qi}">${q.a}</p>
    </div>`).join("");
  return `<section class="subject-section">
    <h2>Uji Dirimu</h2>
    <p>Jawab dulu di kepala atau dengan suara keras, baru buka jawabannya. Jujur pada prosesnya membuat materi menempel lebih lama.</p>
    ${items}
  </section>`;
}

function exampleHTML(s, heading) {
  if (!s.example) return "";
  return `<section class="subject-section">
    <h2>${heading || "Contoh Nyata"}</h2>
    <div class="example-box">
      <h3>${s.example.title}</h3>
      <p>${s.example.body}</p>
      ${s.example.calc ? `<div class="calc">${s.example.calc}</div>` : ""}
    </div>
  </section>`;
}

function topicsFlowHTML(s) {
  const boxes = s.topics.map((tp, i) => `
    <div class="topic-box">
      <span class="topic-box-num">${i + 1}</span>
      <p class="topic-box-title">${tp.t}</p>
      <p class="topic-box-desc">${tp.d}</p>
    </div>${i < s.topics.length - 1 ? `<span class="map-arrow" aria-hidden="true">&rarr;</span>` : ""}`).join("");
  return `<section class="subject-section">
    <h2>Peta Topik</h2>
    <p>${s.topics.length} modul, satu alur cerita. Ikuti nomornya dari kotak pertama sampai terakhir, dan kamu memegang seluruh mata kuliah dalam satu gambar.</p>
    <div class="topic-flow">${boxes}</div>
  </section>`;
}

function topicsListHTML(s) {
  const items = s.topics.map((tp, i) => `
    <li class="topic-item">
      <span class="topic-num">${String(i + 1).padStart(2, "0")}</span>
      <p class="topic-title">${tp.t}</p>
      <p class="topic-desc">${tp.d}</p>
    </li>`).join("");
  return `<section class="subject-section">
    <h2>Urutan Topik</h2>
    <p>${s.topics.length} modul dalam urutan belajarnya. Setelah mendengar briefing, daftar ini menunjukkan di mana kamu berada dalam cerita besarnya.</p>
    <ol class="topic-list">${items}</ol>
  </section>`;
}

function keysCardsHTML(s) {
  const cards = s.keys.map((k) => {
    const p = splitKey(k);
    return `<div class="key-card"><p class="key-term">${p.term}</p>${p.gloss ? `<p class="key-gloss">${p.gloss}</p>` : ""}</div>`;
  }).join("");
  return `<section class="subject-section">
    <h2>Lima Kunci</h2>
    <p>Kalau waktu tinggal lima menit, baca lima kartu ini. Selebihnya adalah pengembangan dari kelimanya.</p>
    <div class="key-grid">${cards}</div>
  </section>`;
}

function keysListHTML(s) {
  const items = s.keys.map((k) => {
    const p = splitKey(k);
    if (!p.gloss) return `<li><span class="key-term">${p.term}</span></li>`;
    return `<li><span class="key-term">${p.term}:</span> ${p.gloss}</li>`;
  }).join("");
  return `<section class="subject-section">
    <h2>Lima Kunci</h2>
    <p>Lima istilah dan gagasan yang paling menentukan di mata kuliah ini.</p>
    <ol class="key-list">${items}</ol>
  </section>`;
}

function audioPlayerHTML(s, cls) {
  return `<audio class="${cls || ""}" controls preload="metadata" src="audio/${s.audioFile}">
    Browser kamu tidak mendukung pemutar audio. Baca transkripnya di bawah.
  </audio>`;
}

function audioHeroHTML(s) {
  if (s.audioFile) {
    return `<section class="audio-hero">
      <h2>Dengarkan briefing ini</h2>
      <p>Briefing audio ${s.nama}: ide besar, lima kunci, satu contoh, dan tiga pertanyaan uji diri, dibacakan runtut. Tekan putar dan dengarkan sampai selesai sebelum membaca apa pun.</p>
      ${audioPlayerHTML(s)}
    </section>`;
  }
  return `<div class="audio-missing">
    <p><strong>Briefing audio belum tersedia untuk mata kuliah ini.</strong> Naskahnya tetap bisa kamu baca sebagai transkrip di bawah, dan halaman ini tetap lengkap dengan ide besar, topik, kunci, contoh, dan kuis.</p>
  </div>`;
}

function transcriptHTML(s) {
  if (!s.audio) return "";
  const paras = s.audio.split(/\n\s*\n/).map((p) => `<p>${p}</p>`).join("");
  return `<details class="transcript">
    <summary>Baca transkrip briefing</summary>
    <div class="transcript-body">${paras}</div>
  </details>`;
}

function audioMiniHTML(s) {
  if (!s.audioFile) return "";
  return `<section class="subject-section">
    <h2>Dengarkan Juga</h2>
    <div class="audio-mini">
      <p>Briefing audio ${s.nama}</p>
      ${audioPlayerHTML(s)}
    </div>
  </section>`;
}

function subjectNav(s) {
  const i = SUBJECTS.indexOf(s);
  const prev = i > 0 ? SUBJECTS[i - 1] : null;
  const next = i < SUBJECTS.length - 1 ? SUBJECTS[i + 1] : null;
  return `<nav class="subject-nav">
    ${prev ? `<a href="#/mapel/${prev.kode}">&larr; ${prev.nama}</a>` : "<span></span>"}
    ${next ? `<a class="next" href="#/mapel/${next.kode}">${next.nama} &rarr;</a>` : ""}
  </nav>`;
}

function bindQuiz(root) {
  $$(".quiz-btn", root).forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".quiz-item");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Sembunyikan jawaban" : "Lihat jawaban";
    });
  });
}

/* ---------- Empat susunan halaman ---------- */
function renderVisual(s) {
  return subjectHeader(s) + `
  <div class="big-idea">
    <h2>Ide Besarnya</h2>
    <p>${s.bigIdea}</p>
    <p class="analogi-line"><strong>Analogi:</strong> ${s.analogi}</p>
  </div>
  ${topicsFlowHTML(s)}
  ${keysCardsHTML(s)}
  ${exampleHTML(s)}
  ${quizHTML(s)}
  ${audioMiniHTML(s)}
  ${subjectNav(s)}`;
}

function renderAuditori(s) {
  return subjectHeader(s) + `
  ${audioHeroHTML(s)}
  ${transcriptHTML(s)}
  <section class="subject-section">
    <h2>Ide Besarnya</h2>
    <blockquote class="pull-quote">
      <p>${s.bigIdea}</p>
      <p class="analogi-line"><strong>Analogi:</strong> ${s.analogi}</p>
    </blockquote>
  </section>
  ${topicsListHTML(s)}
  ${keysListHTML(s)}
  ${quizHTML(s)}
  ${subjectNav(s)}`;
}

function renderBaca(s) {
  const topics = s.topics.map((tp) => `
    <div class="reading-topic">
      <h3>${tp.t}</h3>
      <p>${tp.d}</p>
    </div>`).join("");
  return subjectHeader(s) + `
  <section class="subject-section" style="margin-top:10px">
    <p class="reading-lead">${s.bigIdea}</p>
    <p class="reading-analogi">${s.analogi}</p>
  </section>
  <section class="subject-section">
    <h2>Topik demi Topik</h2>
    <p>${s.topics.length} modul dibaca berurutan, masing-masing dengan penjelasan intinya. Baca pelan-pelan, satu topik sekali duduk.</p>
    ${topics}
  </section>
  ${keysListHTML(s)}
  ${exampleHTML(s)}
  ${quizHTML(s)}
  <section class="subject-section">
    <h2>Catatan Saya</h2>
    <div class="notes-box">
      <p class="notes-help">Tulis ulang inti mata kuliah ini dengan katamu sendiri di sini. Menulis ulang dari ingatan mengunci pemahaman jauh lebih kuat daripada membaca ulang, dan catatan ini tersimpan otomatis di perangkatmu.</p>
      <textarea class="notes-area" id="notesArea" data-kode="${s.kode}" placeholder="Misalnya: inti mata kuliah ini adalah ..."></textarea>
      <p class="notes-status" id="notesStatus">Catatan tersimpan otomatis di perangkat ini.</p>
    </div>
  </section>
  ${audioMiniHTML(s)}
  ${subjectNav(s)}`;
}

function renderPraktik(s) {
  const cards = s.keys.map((k) => {
    const p = splitKey(k);
    return `
    <button type="button" class="flashcard" aria-pressed="false" aria-label="Kartu hafalan: ${p.term}${p.gloss ? ". Penjelasan: " + p.gloss : ""}. Ketuk untuk membalik.">
      <span class="flash-inner">
        <span class="flash-face flash-front">
          <span class="flash-term">${p.term}</span>
          <span class="flash-hint">ketuk untuk membalik</span>
        </span>
        <span class="flash-face flash-back">
          ${p.gloss ? `<span class="flash-term">${p.term}</span>
          <span>${p.gloss}</span>` : `<span>${p.term}</span>`}
        </span>
      </span>
    </button>`;
  }).join("");
  return subjectHeader(s) + `
  <section class="subject-section" style="margin-top:10px">
    <h2>Coba Dulu</h2>
    <p>Tidak ada teori di bagian ini. Kerjakan contohnya, jawab kuisnya, dan biarkan kesalahan pertamamu menunjukkan bagian mana yang perlu kamu baca setelah ini.</p>
  </section>
  ${exampleHTML(s, "Contoh untuk Dikerjakan")}
  ${quizHTML(s)}
  <section class="subject-section">
    <h2>Kartu Hafalan: Lima Kunci</h2>
    <p>Geser dan ketuk tiap kartu untuk membaliknya. Ucapkan dulu isinya dengan suara keras sebelum membalik, itu yang membuat kartu ini bekerja.</p>
    <div class="flash-strip">${cards}</div>
    <p class="flash-note">${s.keys.length} kartu, geser untuk melihat semuanya</p>
  </section>
  <div class="big-idea">
    <h2>Ide Besarnya</h2>
    <p>${s.bigIdea}</p>
    <p class="analogi-line"><strong>Analogi:</strong> ${s.analogi}</p>
  </div>
  ${topicsFlowHTML(s)}
  ${audioMiniHTML(s)}
  ${subjectNav(s)}`;
}

const RENDERERS = { visual: renderVisual, auditori: renderAuditori, baca: renderBaca, praktik: renderPraktik };

function renderSubject(kode) {
  const s = BY_KODE.get(kode);
  if (!s || !currentStyle) { location.hash = "#/"; return; }
  const root = $("#subjectContent");
  root.innerHTML = `<article class="subject">${RENDERERS[currentStyle](s)}</article>`;
  bindQuiz(root);
  $$(".flashcard", root).forEach((card) => {
    card.addEventListener("click", () => {
      const flipped = card.classList.toggle("flipped");
      card.setAttribute("aria-pressed", flipped ? "true" : "false");
    });
  });
  const notes = $("#notesArea", root);
  if (notes) {
    const key = "kmut_notes_" + s.kode;
    try { notes.value = localStorage.getItem(key) || ""; } catch (e) { notes.value = ""; }
    notes.addEventListener("input", () => {
      try {
        localStorage.setItem(key, notes.value);
        $("#notesStatus").textContent = "Tersimpan otomatis barusan di perangkat ini.";
      } catch (e) {
        $("#notesStatus").textContent = "Perangkat ini tidak mengizinkan penyimpanan lokal, catatan tidak tersimpan.";
      }
    });
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

/* ---------- Router ---------- */
let mapNoticePending = false;
function route() {
  const m = (location.hash || "#/").match(/^#\/mapel\/([A-Za-z0-9]+)$/);
  const kode = m ? m[1].toUpperCase() : null;
  if (m && !BY_KODE.has(kode)) mapNoticePending = true;
  if (m && BY_KODE.has(kode) && currentStyle) {
    $("#viewMap").hidden = true;
    $("#viewSubject").hidden = false;
    renderSubject(kode);
  } else {
    $("#viewSubject").hidden = true;
    $("#viewMap").hidden = false;
    const notice = $("#mapNotice");
    if (notice) notice.hidden = !mapNoticePending;
    mapNoticePending = false;
  }
}
window.addEventListener("hashchange", route);

/* ---------- Pencarian ---------- */
const searchInput = $("#searchInput");
function applySearch() {
  const q = searchInput.value.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  const notice = $("#mapNotice");
  if (notice) notice.hidden = true;
  let visibleCards = 0;
  $$(".semester").forEach((sec) => {
    let any = false;
    $$(".course-card", sec).forEach((card) => {
      const hit = !tokens.length || tokens.every((t) => card.dataset.search.includes(t));
      card.style.display = hit ? "" : "none";
      if (hit) { any = true; visibleCards++; }
    });
    sec.style.display = any ? "" : "none";
  });
  $("#noResult").hidden = visibleCards > 0;
  $("#searchHint").textContent = q
    ? visibleCards + " mata kuliah cocok dengan pencarianmu."
    : SUBJECTS.length + " mata kuliah dari Semester 1 sampai 8 sudah punya halaman belajar lengkap. Klik kartunya untuk membuka.";
}
searchInput.addEventListener("input", applySearch);
$("#resetSearch").addEventListener("click", () => {
  searchInput.value = "";
  applySearch();
  searchInput.focus();
});

/* ---------- Mode gelap ---------- */
const themeToggle = $("#themeToggle");
function setTheme(name) {
  document.documentElement.dataset.theme = name;
  try { localStorage.setItem("kelasut-theme", name); } catch (e) { /* abaikan */ }
  $$('meta[name="theme-color"]').forEach((mt) => {
    mt.removeAttribute("media");
    mt.setAttribute("content", name === "dark" ? "#16120d" : "#faf5ec");
  });
  $(".theme-toggle-label", themeToggle).textContent = name === "dark" ? "Terang" : "Gelap";
}
themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("kelasut-theme"); } catch (e) { saved = null; }
  if (saved) setTheme(saved);
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
})();

/* ---------- Animasi muncul ---------- */
let revealObserver = null;
function observeReveals(root) {
  const els = $$(".reveal", root);
  if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("shown")); return; }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("shown"); revealObserver.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
  }
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => el.classList.add("shown"));
    } else {
      revealObserver.observe(el);
    }
  });
  setTimeout(() => {
    els.forEach((el) => {
      if (el.classList.contains("shown")) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("shown");
    });
  }, 1500);
}

/* ---------- Mulai ---------- */
buildGate();
renderMap();
observeReveals(document);
requestAnimationFrame(() => {
  const pct = 43.75;
  $("#progressFill").style.width = pct + "%";
  const track = $("#progressTrack");
  if (track) track.setAttribute("aria-valuenow", String(Math.round(pct)));
});

const deepLinked = deepLinkStyle();
const initialStyle = deepLinked || savedStyle();
if (initialStyle) {
  setStyle(initialStyle, false, !deepLinked);
} else {
  route();
  openGate(false);
}
