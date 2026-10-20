"use strict";

/* ============================================================
   Kelas Manajemen UT: data kurikulum
   Sumber: Katalog Kurikulum FEB UT 2024/2025 (Program Studi
   54/Manajemen S1) dan Tinjauan Mata Kuliah resmi UT.
   Semester 4 memuat mata kuliah yang benar-benar diambil
   Darren pada 2026.2 dengan kode EMBS/MKDI.
   ============================================================ */

const SEMESTERS = [
  {
    n: 1, sks: 19, tag: "review", tagLabel: "Ulas Ulang",
    sub: "Fondasi: cara berpikir ekonom, berbisnis, dan berbahasa akademik.",
    courses: [
      { code: "ESPA4122", name: "Matematika Ekonomi", sks: 3 },
      { code: "EKMA4111", name: "Pengantar Bisnis", sks: 3 },
      { code: "MKWU4101", name: "Pendidikan Agama", sks: 3, ba: "MKDU4221 / MKWU4102-4107" },
      { code: "MKWU4108", name: "Bahasa Indonesia", sks: 3 },
      { code: "MKWU4109", name: "Pendidikan Kewarganegaraan", sks: 3, ba: "MKDU4111" },
      { code: "EKMA4116", name: "Manajemen", sks: 4 }
    ]
  },
  {
    n: 2, sks: 19, tag: "review", tagLabel: "Ulas Ulang",
    sub: "Angka mulai bicara: akuntansi, statistika, dan ekonomi mikro.",
    courses: [
      { code: "EKMA4115", name: "Pengantar Akuntansi", sks: 4 },
      { code: "ESPA4123", name: "Statistika Ekonomi", sks: 3 },
      { code: "EKSI4205", name: "Bank dan Lembaga Keuangan Non Bank", sks: 3 },
      { code: "ESPA4314", name: "Perekonomian Indonesia", sks: 3 },
      { code: "ESPA4111", name: "Pengantar Ekonomi Mikro", sks: 3 },
      { code: "EKMA4159", name: "Komunikasi Bisnis", sks: 3 }
    ]
  },
  {
    n: 3, sks: 18, tag: "review", tagLabel: "Ulas Ulang",
    sub: "Mesin organisasi: biaya, sistem informasi, dan perilaku manusia di tempat kerja.",
    courses: [
      { code: "ADBI4201", name: "Bahasa Inggris Niaga", sks: 2 },
      { code: "EKMA4157", name: "Organisasi", sks: 3 },
      { code: "EKMA4315", name: "Akuntansi Biaya", sks: 3 },
      { code: "ESPA4110", name: "Pengantar Ekonomi Makro", sks: 3 },
      { code: "EKMA4316", name: "Hukum Bisnis", sks: 2 },
      { code: "EKMA4434", name: "Sistem Informasi Manajemen", sks: 3, ba: "EMBS4321" },
      { code: "EKMA4367", name: "Hubungan Industrial", sks: 2 }
    ]
  },
  {
    n: 4, sks: 18, tag: "now", tagLabel: "Sedang Berjalan",
    sub: "Semester kamu sekarang: enam kelas inti manajemen, semuanya dengan materi lengkap di situs ini.",
    note: "Enam kartu pertama adalah kelas aktifmu di 2026.2 dengan kode EMBS dan MKDI. Di katalog, Manajemen Operasi, Manajemen Pemasaran, Riset Operasi, dan Manajemen SDM tercatat dengan kode EKMA4215, EKMA4216, EKMA4413, dan EKMA4214. Ekonomi Moneter dan Ekonomi Manajerial adalah mata kuliah paket Semester 4 lainnya di katalog.",
    courses: [
      { code: "MKDI4203", name: "Kewirausahaan di Era Digital", sks: 3, ba: "MKWI4203", lesson: true },
      { code: "EMBS4212", name: "Manajemen Pemasaran", sks: 3, lesson: true },
      { code: "EMBS4211", name: "Manajemen Operasi", sks: 3, lesson: true },
      { code: "EMBS4210", name: "Manajemen Keuangan", sks: 3, lesson: true },
      { code: "EMBS4209", name: "Manajemen Sumber Daya Manusia", sks: 3, ba: "EKMA4214", lesson: true },
      { code: "EMBS4208", name: "Riset Operasi", sks: 3, ba: "EKMA4413", lesson: true },
      { code: "ESPA4227", name: "Ekonomi Moneter", sks: 3 },
      { code: "EKMA4312", name: "Ekonomi Manajerial", sks: 3 }
    ]
  },
  {
    n: 5, sks: 18, tag: "preview", tagLabel: "Pratinjau",
    sub: "Naik kelas ke strategi: konsumen, perilaku organisasi, dan arah perusahaan.",
    note: "Satu mata kuliah paket semester ini sudah kamu selesaikan lebih awal: Manajemen Keuangan (EKMA4213 di katalog) kamu ambil di Semester 4 sebagai EMBS4210. Materi lengkapnya ada di Semester 4.",
    courses: [
      { code: "EKMA4366", name: "Pengembangan SDM", sks: 3 },
      { code: "EKMA4414", name: "Manajemen Strategik", sks: 3 },
      { code: "EKMA4567", name: "Perilaku Konsumen", sks: 3 },
      { code: "EKMA4158", name: "Perilaku Organisasi", sks: 3 },
      { code: "EKMA4369", name: "Manajemen Operasi Jasa", sks: 3, ba: "EMBS4316" }
    ]
  },
  {
    n: 6, sks: 17, tag: "preview", tagLabel: "Pratinjau",
    sub: "Pendalaman analitis: portofolio, rantai pasokan, dan metode penelitian.",
    courses: [
      { code: "EKMA4314", name: "Akuntansi Manajemen", sks: 3 },
      { code: "EKSI4203", name: "Teori Portofolio dan Analisis Investasi", sks: 3 },
      { code: "EKMA4476", name: "Audit SDM", sks: 2 },
      { code: "ISIP4216", name: "Metode Penelitian Sosial", sks: 3 },
      { code: "EKMA4371", name: "Manajemen Rantai Pasokan", sks: 3 },
      { code: "EKMA4478", name: "Analisis Kasus Bisnis", sks: 3 }
    ]
  },
  {
    n: 7, sks: 18, tag: "preview", tagLabel: "Pratinjau",
    sub: "Menjelang garis akhir: pemasaran strategik, perubahan, dan Tugas Akhir Program.",
    courses: [
      { code: "EKMA4568", name: "Pemasaran Jasa", sks: 3 },
      { code: "ADBI4211", name: "Manajemen Resiko dan Asuransi", sks: 3 },
      { code: "EKMA4565", name: "Manajemen Perubahan", sks: 2, ba: "EMBS4324" },
      { code: "EKMA4370", name: "Kewirausahaan", sks: 3 },
      { code: "EKMA4475", name: "Pemasaran Strategik", sks: 3 },
      { code: "EKMA4500", name: "Tugas Akhir Program (TAP)", sks: 4 },
      { code: "EKMA4560", name: "Karya Ilmiah", sks: 0, ba: "MKWI4560 (panduan)" }
    ]
  },
  {
    n: 8, sks: 17, tag: "preview", tagLabel: "Pratinjau",
    sub: "Semester penutup: penganggaran, kinerja, kualitas, dan kelayakan bisnis.",
    courses: [
      { code: "EKMA4570", name: "Penganggaran", sks: 3 },
      { code: "EKMA4263", name: "Manajemen Kinerja", sks: 3 },
      { code: "EKMA4311", name: "Studi Kelayakan Bisnis", sks: 3 },
      { code: "EKMA4265", name: "Manajemen Kualitas", sks: 3 },
      { code: "EKMA4473", name: "Pengembangan Produk", sks: 2 },
      { code: "EKMA4569", name: "Perencanaan Pemasaran", sks: 3 }
    ]
  }
];

/* ============================================================
   Materi pelajaran Semester 4.
   Ruang lingkup topik mengikuti Tinjauan Mata Kuliah resmi UT;
   semua penjelasan ditulis ulang dengan bahasa sendiri.
   ============================================================ */

const LESSONS = {

MKDI4203: {
  name: "Kewirausahaan di Era Digital",
  ba: "MKWI4203, Edisi 2 · 380 halaman · Penulis: Hetty Karunia Tunjungsari dan Ginta Ginting",
  bigIdea: "Mata kuliah ini melatih kamu berpikir dan bertindak seperti wirausaha di zaman serba digital: <strong>melihat peluang dari masalah sehari-hari, mengujinya dengan cepat dan murah, lalu membangun model bisnis yang bisa tumbuh</strong>. Intinya bukan sekadar membuka usaha, tetapi cara berpikir kreatif dan inovatif yang juga berguna di dalam perusahaan tempat kamu bekerja.",
  topics: [
    { t: "Perkembangan dunia usaha di era digital", d: "Bagaimana internet, ponsel pintar, dan platform digital mengubah cara usaha lahir, bersaing, dan melayani pelanggan." },
    { t: "Peran dan karakteristik kunci wirausaha", d: "Ciri wirausaha yang berhasil: berani mengambil risiko terukur, proaktif, tahan banting, dan orientasi pada peluang." },
    { t: "Mengenal potensi diri", d: "Memetakan minat, keahlian, dan sumber daya yang kamu punya sebagai bahan bakar memilih jenis usaha." },
    { t: "Identifikasi peluang usaha di era digital", d: "Teknik menemukan celah pasar dari keluhan pelanggan, tren pencarian, dan perubahan gaya hidup." },
    { t: "Memahami konsumen di era digital", d: "Perilaku pembeli online: riset lewat ulasan, membandingkan harga dalam hitungan detik, dan membeli karena rekomendasi." },
    { t: "Model bisnis di era digital", d: "Merancang cara usaha menciptakan dan menangkap nilai, antara lain dengan Business Model Canvas sembilan elemen." },
    { t: "Blue Ocean Strategy untuk bisnis digital", d: "Menciptakan ruang pasar baru yang belum diperebutkan, bukan berdarah-darah di pasar yang sudah penuh pesaing." },
    { t: "Kepemimpinan dan pembentukan tim", d: "Memimpin usaha kecil di era digital: membagi peran, memilih rekan pendiri, dan menjaga ritme kerja tim." },
    { t: "Pemasaran di era digital", d: "Dasar memasarkan produk lewat kanal digital: media sosial, marketplace, konten, dan komunitas pelanggan." }
  ],
  concepts: [
    { term: "Wirausaha", gloss: "Orang yang mengorganisasikan sumber daya untuk menciptakan nilai baru dan berani menanggung risikonya." },
    { term: "Inovasi", gloss: "Menghadirkan cara, produk, atau model yang baru dan benar-benar dipakai pasar, bukan sekadar ide." },
    { term: "Business Model Canvas", gloss: "Peta satu halaman berisi sembilan elemen: segmen pelanggan, proposisi nilai, kanal, hubungan pelanggan, arus pendapatan, sumber daya utama, aktivitas utama, mitra utama, dan struktur biaya." },
    { term: "Blue Ocean Strategy", gloss: "Strategi menciptakan pasar baru tanpa pesaing langsung, dengan menaikkan nilai bagi pembeli sambil menekan biaya." },
    { term: "Red Ocean", gloss: "Pasar yang sudah sesak: semua pemain berebut pelanggan yang sama sampai margin habis." },
    { term: "Proposisi nilai", gloss: "Alasan utama pelanggan memilih kamu: masalah apa yang kamu selesaikan dan dengan cara apa yang lebih baik." },
    { term: "Validasi peluang", gloss: "Menguji ide dengan bukti nyata dari calon pelanggan sebelum mengeluarkan modal besar." },
    { term: "Pivot", gloss: "Mengubah arah produk atau model bisnis setelah belajar dari respons pasar, tanpa mengganti visi besar." }
  ],
  example: {
    title: "Contoh: kedai kopi kecil membaca peluang digital",
    body: "Sebuah kedai kopi di dekat kampus sepi pada jam kuliah karena mahasiswa tidak sempat antre. Pemiliknya memetakan <strong>Business Model Canvas</strong>: segmennya mahasiswa, proposisi nilainya kopi enak tanpa antre, kanalnya diubah menjadi pemesanan lewat WhatsApp dan aplikasi, dan arus pendapatannya ditambah paket langganan mingguan. Ia tidak menurunkan harga seperti pesaing di red ocean, melainkan menjual kecepatan dan kepastian: pesan dari kelas, ambil di gerbang. Itulah blue ocean versi sederhana: nilai naik, perang harga dihindari."
  },
  quiz: [
    { q: "Apa perbedaan utama red ocean dan blue ocean?", a: "Red ocean adalah pasar yang sudah penuh pesaing yang berebut pelanggan yang sama, biasanya lewat perang harga. Blue ocean adalah ruang pasar baru yang kamu ciptakan sendiri, sehingga persaingan menjadi tidak relevan karena kamu menawarkan nilai yang berbeda." },
    { q: "Mengapa mengenal potensi diri didahulukan sebelum memilih peluang usaha?", a: "Karena peluang yang bagus di atas kertas akan sulit dijalankan bila tidak cocok dengan minat, keahlian, dan sumber daya pemiliknya. Usaha yang selaras dengan potensi diri lebih bertahan lama karena pemiliknya mau menekuninya saat masa sulit." },
    { q: "Sebutkan tiga dari sembilan elemen Business Model Canvas dan fungsinya.", a: "Contoh: segmen pelanggan (siapa yang dilayani), proposisi nilai (alasan pelanggan memilih kamu), dan arus pendapatan (dari mana uang masuk). Tiga lainnya misalnya kanal distribusi, sumber daya utama, dan struktur biaya. Canvas dipakai untuk melihat bisnis sebagai satu sistem, bukan potongan terpisah." }
  ]
},

EMBS4212: {
  name: "Manajemen Pemasaran",
  ba: "EMBS4212 · 472 halaman · Penulis: Andi Muhammad Sadat dan Andriyansah",
  bigIdea: "Pemasaran modern bukan lagi soal memasang iklan, tetapi <strong>memahami manusia yang membeli: siapa mereka, apa yang mereka butuhkan, dan bagaimana membangun hubungan jangka panjang lewat kanal digital</strong>. Mata kuliah ini membawamu dari konsep pemasaran klasik ke praktik era digital: segmentasi, iklan daring, media sosial, sampai mengelola hubungan pelanggan secara digital.",
  topics: [
    { t: "Konsep pemasaran tradisional dan pemasaran digital", d: "Pergeseran dari pemasaran satu arah menuju percakapan dua arah yang terukur dan personal." },
    { t: "Lingkungan pemasaran di era digital", d: "Faktor mikro dan makro yang memengaruhi pasar, termasuk isu hijau dan keberlanjutan yang kini dituntut konsumen." },
    { t: "Diferensiasi, targeting, dan segmentasi", d: "Membagi pasar menjadi kelompok yang bermakna, memilih target yang paling layak, lalu tampil beda di benak mereka." },
    { t: "Periklanan daring", d: "Merancang iklan di mesin pencari dan media sosial: tujuan, audiens, anggaran, dan cara membaca hasilnya." },
    { t: "Manajemen media sosial", d: "Mengelola kanal sosial sebagai aset bisnis: kalender konten, interaksi, dan penanganan komentar." },
    { t: "Perilaku dan wawasan konsumen digital", d: "Cara konsumen mencari, menilai, dan memutuskan pembelian di layar ponsel mereka." },
    { t: "Manajemen hubungan pelanggan digital (DCRM)", d: "Memakai data dan teknologi untuk merawat pelanggan agar kembali membeli dan merekomendasikan." },
    { t: "Riset pemasaran di era digital", d: "Mengumpulkan bukti sebelum mengambil keputusan: survei online, data perilaku, dan eksperimen kecil." },
    { t: "Pengembangan produk baru dan pertumbuhan jangka panjang", d: "Dari ide ke peluncuran, dan bagaimana produk baru menjaga perusahaan tetap tumbuh." }
  ],
  concepts: [
    { term: "Segmentasi", gloss: "Membagi pasar besar menjadi kelompok kecil yang mirip kebutuhan dan perilakunya, agar pesan bisa tepat sasaran." },
    { term: "Targeting", gloss: "Memilih segmen mana yang akan dilayani secara serius berdasarkan daya tarik dan kemampuan perusahaan." },
    { term: "Diferensiasi", gloss: "Keunggulan nyata yang membuat produkmu dipilih, bukan sekadar klaim berbeda." },
    { term: "Positioning", gloss: "Tempat yang ingin kamu duduki di benak pelanggan, dirangkum dalam satu kesan yang jelas." },
    { term: "DCRM", gloss: "Digital Customer Relationship Management: mengelola hubungan pelanggan dengan data dan kanal digital, dari sapaan personal sampai program loyalitas." },
    { term: "Customer lifetime value", gloss: "Total nilai yang dihasilkan satu pelanggan selama ia berhubungan dengan perusahaan, bukan hanya sekali beli." },
    { term: "Konversi", gloss: "Perubahan status pengunjung menjadi pembeli, atau pembeli menjadi pelanggan tetap." },
    { term: "Green marketing", gloss: "Pemasaran yang menonjolkan keberlanjutan secara jujur, bukan sekadar pencitraan hijau." }
  ],
  example: {
    title: "Contoh: toko sepatu lokal memakai DCRM",
    body: "Sebuah toko sepatu mencatat nomor WhatsApp pembeli (dengan izin) dan riwayat ukurannya. Saat model baru datang, hanya pelanggan yang pernah membeli kategori itu yang dikirimi pesan personal berisi foto, ukuran yang tersedia untuk kakinya, dan voucher ulang tahun. Hasilnya, pesan terasa membantu, bukan spam. Inilah <strong>DCRM</strong> dalam praktik: data dipakai untuk membuat pelanggan merasa dikenal, sehingga mereka kembali tanpa harus selalu diskon besar."
  },
  quiz: [
    { q: "Apa beda segmentasi, targeting, dan positioning?", a: "Segmentasi membagi pasar menjadi kelompok-kelompok. Targeting memilih kelompok mana yang dilayani. Positioning menentukan kesan apa yang ingin ditanamkan di benak kelompok itu. Urutannya selalu STP: segmentasi dulu, baru target, baru posisi." },
    { q: "Sebutkan dua manfaat DCRM bagi perusahaan.", a: "Pertama, retensi naik: pelanggan yang merasa dikenal lebih jarang pindah ke pesaing. Kedua, biaya pemasaran lebih efisien karena penawaran dikirim ke orang yang relevan berdasarkan riwayatnya, bukan disebar acak. Dampak lanjutannya: nilai seumur pelanggan naik dan rekomendasi dari mulut ke mulut tumbuh." },
    { q: "Mengapa isu hijau masuk ke pelajaran pemasaran?", a: "Karena keberlanjutan kini memengaruhi keputusan beli, terutama konsumen muda. Perusahaan yang terbukti peduli lingkungan mendapat kepercayaan, sedangkan yang hanya berpura-pura hijau berisiko ditinggalkan dan viral secara negatif." }
  ]
},

EMBS4211: {
  name: "Manajemen Operasi",
  ba: "EMBS4211 · 702 halaman · Penulis: Adi Djoko Guritno dan Megita Ryanjani Tanuputri",
  bigIdea: "Manajemen operasi adalah dapur di balik setiap produk dan layanan: <strong>bagaimana perusahaan merancang, menjalankan, dan memperbaiki proses yang mengubah bahan, waktu, dan tenaga menjadi sesuatu yang sampai ke pelanggan dengan mutu baik, tepat waktu, dan biaya masuk akal</strong>. Kalau pemasaran menjanjikan, operasi yang menepati janji itu setiap hari.",
  topics: [
    { t: "Pengertian dan ruang lingkup manajemen operasi", d: "Fungsi operasi sebagai salah satu fungsi inti perusahaan, dan keputusan khas yang diambil manajer operasi." },
    { t: "Rancangan operasi", d: "Merancang produk dan proses: pilihan lokasi, tata letak, dan kapasitas awal agar aliran kerja tidak macet." },
    { t: "Manajemen kualitas", d: "Menjaga mutu dari hulu ke hilir: standar, pengendalian mutu, dan perbaikan berkelanjutan." },
    { t: "Manajemen proyek", d: "Mengelola pekerjaan sekali jalan yang punya tenggat: penjadwalan, jalur kritis, dan pengendalian biaya." },
    { t: "Peramalan", d: "Memperkirakan permintaan masa depan sebagai dasar keputusan persediaan, kapasitas, dan jadwal produksi." },
    { t: "Manajemen rantai pasok", d: "Mengatur aliran barang, informasi, dan uang dari pemasok sampai pelanggan akhir agar tidak tersendat." },
    { t: "Perencanaan sumber daya", d: "Menyeimbangkan kapasitas, persediaan, dan kebutuhan material agar produksi tidak kelebihan atau kekurangan." },
    { t: "Sistem produksi tepat waktu (Just in Time)", d: "Memproduksi sesuai kebutuhan saat itu juga, menekan stok dan pemborosan sampai serendah mungkin." },
    { t: "Teknologi informasi dalam manajemen operasi", d: "Peran sistem informasi dan otomasi untuk memantau proses secara real time dan mengambil keputusan lebih cepat." }
  ],
  concepts: [
    { term: "Proses", gloss: "Rangkaian langkah yang mengubah input menjadi output. Mengelola operasi pada dasarnya mengelola proses." },
    { term: "Kapasitas", gloss: "Jumlah maksimum yang bisa dihasilkan sistem dalam satu periode. Semua rencana harus tunduk pada angka ini." },
    { term: "Peramalan (forecasting)", gloss: "Seni dan sains memperkirakan permintaan, selalu salah pada tingkat tertentu, tetapi jauh lebih baik daripada menebak tanpa data." },
    { term: "Rantai pasok", gloss: "Jaringan pemasok, produsen, distributor, dan pengecer yang harus bergerak terkoordinasi, bukan sendiri-sendiri." },
    { term: "Bullwhip effect", gloss: "Guncangan kecil pada permintaan di hilir membesar saat merambat ke hulu karena tiap pihak menebak-nebak dan menimbun stok pengaman." },
    { term: "Just in Time", gloss: "Sistem tarik: produksi dan pengiriman hanya terjadi saat ada kebutuhan nyata, sehingga stok dan pemborosan menyusut." },
    { term: "Jalur kritis", gloss: "Rangkaian aktivitas terpanjang dalam proyek. Terlambat di sini berarti seluruh proyek terlambat." },
    { term: "Biaya kualitas", gloss: "Total biaya untuk mencegah cacat, memeriksa mutu, dan menanggung kegagalan. Mencegah hampir selalu lebih murah daripada memperbaiki." }
  ],
  example: {
    title: "Contoh: distributor minuman kehabisan stok dan kelebihan stok sekaligus",
    body: "Sebuah distributor makanan dan minuman menghadapi permintaan naik, tetapi informasi stok antar gudang tidak terhubung. Akibatnya satu gudang kehabisan barang laris sementara gudang lain menimbun barang lambat. Obatnya bukan membeli gudang baru, melainkan <strong>koordinasi rantai pasok</strong>: data persediaan dan penjualan dibagikan terbuka antar titik, jadwal pengiriman diselaraskan dengan peramalan bersama, dan pemasok diberi akses melihat level stok. Begitu informasi mengalir, bullwhip effect melemah dan kedua masalah tadi menyusut bersamaan."
  },
  quiz: [
    { q: "Mengapa peramalan penting padahal tidak pernah tepat seratus persen?", a: "Karena hampir semua keputusan operasi bersandar padanya: berapa bahan dibeli, berapa pekerja dijadwalkan, berapa kapasitas disiapkan. Ramalan yang wajar mengurangi dua kerugian sekaligus, yaitu kehabisan stok yang mengecewakan pelanggan dan stok berlebih yang mengikat uang." },
    { q: "Apa inti gagasan Just in Time?", a: "Produksi dan pengadaan ditarik oleh kebutuhan nyata, bukan didorong oleh jadwal menebak. Barang datang dan dibuat tepat saat dibutuhkan, dalam jumlah yang dibutuhkan, sehingga persediaan, ruang simpan, dan pemborosan ditekan." },
    { q: "Apa yang terjadi bila koordinasi rantai pasok buruk?", a: "Informasi terlambat dan terdistorsi. Dampaknya: kehabisan stok di satu titik dan penumpukan di titik lain, biaya logistik membengkak, pemasok salah membaca permintaan (bullwhip effect), dan pelanggan akhir yang menanggung kecewanya." }
  ]
},

EMBS4210: {
  name: "Manajemen Keuangan",
  ba: "EMBS4210 · 402 halaman · Penulis: Said Kelana Asnawi",
  bigIdea: "Manajemen keuangan menjawab tiga pertanyaan besar perusahaan: <strong>uang ditanam di mana, uang didapat dari mana, dan berapa nilai yang adil untuk semuanya</strong>. Mata kuliah ini membangun fondasinya dari nol: membaca laporan keuangan, mengelola modal kerja harian, memahami nilai waktu uang, menilai saham dan obligasi, sampai memilih struktur pendanaan jangka panjang.",
  topics: [
    { t: "Pengantar manajemen keuangan, pasar keuangan, dan kompensasi", d: "Peran manajer keuangan, tujuan perusahaan, tempat uang berputar, dan cara perusahaan membayar orang-orangnya." },
    { t: "Analisis laporan keuangan", d: "Membaca neraca dan laporan laba rugi dengan rasio, untuk menilai sehat tidaknya sebuah perusahaan." },
    { t: "Manajemen keuangan jangka pendek", d: "Mengelola modal kerja sehari-hari: kas, piutang, dan persediaan, agar perusahaan tidak kehabisan napas." },
    { t: "Nilai waktu dari uang", d: "Prinsip paling fundamental: rupiah hari ini lebih berharga daripada rupiah tahun depan karena bisa berputar." },
    { t: "Risiko dan pengembalian", d: "Hubungan abadi dalam keuangan: hasil yang lebih tinggi selalu menuntut kesediaan menanggung risiko lebih besar." },
    { t: "Valuasi saham dan utang", d: "Menghitung nilai wajar saham dan obligasi dari aliran kas masa depannya yang didiskontokan." },
    { t: "Pendanaan jangka panjang dan struktur modal", d: "Memilih campuran utang dan modal sendiri, memahami leverage, dan kapan campuran itu menaikkan nilai perusahaan." },
    { t: "IPO, leasing, dan instrumen hybrid", d: "Cara-cara khusus mencari dana: menawarkan saham ke publik, menyewa aset, dan surat berharga campuran seperti obligasi konversi dan waran." },
    { t: "Keuangan internasional dan kurs tukar", d: "Bagaimana perubahan nilai tukar mengubah kesimpulan atas proyek dan pendanaan lintas negara." }
  ],
  concepts: [
    { term: "Nilai waktu uang", gloss: "Uang yang diterima lebih awal bernilai lebih tinggi karena bisa diinvestasikan dan bertumbuh selama menunggu." },
    { term: "Nilai masa depan dan nilai sekarang", gloss: "Dua arah menghitung: memajukan uang hari ini dengan bunga, atau menarik uang masa depan ke nilai hari ini dengan diskonto." },
    { term: "Modal kerja", gloss: "Selisih aset lancar dan kewajiban lancar. Inilah bahan bakar operasional harian perusahaan." },
    { term: "Rasio keuangan", gloss: "Perbandingan angka laporan keuangan untuk membaca likuiditas, kemampuan membayar utang, dan profitabilitas secara cepat." },
    { term: "Dividend Discount Model", gloss: "Menilai saham dari seluruh dividen masa depannya. Versi Gordon memakai pertumbuhan dividen yang konstan." },
    { term: "Leverage", gloss: "Pemakaian biaya tetap, terutama utang, untuk memperbesar hasil bagi pemilik. Pedang bermata dua: memperbesar untung dan rugi sekaligus." },
    { term: "Struktur modal", gloss: "Campuran utang dan ekuitas yang membiayai perusahaan. Campuran yang tepat menurunkan biaya modal rata-rata." },
    { term: "Risiko", gloss: "Kemungkinan hasil nyata meleset dari harapan. Dalam keuangan, risiko yang lebih tinggi harus dibayar dengan imbal hasil yang lebih tinggi." }
  ],
  example: {
    title: "Contoh: menilai saham dengan model Gordon",
    body: "Sebuah perusahaan baru membayar dividen Rp2.000 per saham. Dividen diperkirakan tumbuh 5 persen selamanya, dan investor menuntut imbal hasil 11 persen. Apakah harga pasar Rp40.000 kemahalan?",
    calc: "Dividen tahun depan (D1) = 2.000 x 1,05 = Rp2.100\nNilai wajar = D1 / (11% - 5%) = 2.100 / 0,06 = Rp35.000\nHarga pasar Rp40.000 berarti saham dinilai terlalu tinggi (overvalued).\nCatatan sensitivitas: asumsi tumbuh 7% membuat nilai wajar melonjak, asumsi 3% membuatnya jatuh. Model ini sangat peka pada angka pertumbuhan."
  },
  quiz: [
    { q: "Mengapa Rp1 juta hari ini lebih berharga daripada Rp1 juta tahun depan?", a: "Karena uang hari ini bisa langsung diputar dan bertumbuh, sedangkan uang tahun depan belum bisa dipakai, terpapar risiko tidak terbayar, dan nilainya digerogoti inflasi. Selisih itulah yang dihitung konsep nilai waktu uang." },
    { q: "Apa yang dikelola dalam manajemen modal kerja, dan mengapa penting?", a: "Kas, piutang, dan persediaan. Penting karena inilah aktivitas rutin yang menentukan perusahaan bisa beroperasi besok pagi: gaji terbayar, bahan tersedia, tagihan tertagih. Banyak perusahaan bangkrut bukan karena rugi, tetapi karena kehabisan kas." },
    { q: "Apa kelemahan utama model Gordon untuk menilai saham?", a: "Model ini mengasumsikan dividen tumbuh konstan selamanya, padahal bisnis nyata naik turun. Hasilnya juga sangat sensitif: mengubah asumsi pertumbuhan sedikit saja bisa mengubah nilai wajar secara drastis, jadi model ini hanya cocok untuk perusahaan yang sudah matang dan stabil." }
  ]
},

EMBS4209: {
  name: "Manajemen Sumber Daya Manusia",
  ba: "EKMA4214, Edisi 3 · 452 halaman · Penulis: Yun Iswanto dan Adie Yusuf",
  bigIdea: "Perusahaan boleh punya mesin dan modal yang sama, tetapi yang membedakan hasil akhirnya adalah orang-orangnya. <strong>MSDM adalah sistem untuk mendapatkan orang yang tepat, mengembangkan kemampuannya, menilai dan menghargai kinerjanya secara adil, serta menjaga mereka tetap sehat, aman, dan produktif</strong>. Mata kuliah ini membedah seluruh siklus itu dari perencanaan sampai pengembangan karier.",
  topics: [
    { t: "Konsep dasar dan fungsi MSDM", d: "Kedudukan MSDM sebagai salah satu fungsi inti manajemen dan kompetensi utama lulusan Program Studi Manajemen." },
    { t: "Perencanaan sumber daya manusia", d: "Memperkirakan kebutuhan orang dari sisi jumlah dan kemampuan, lalu menyelaraskannya dengan rencana perusahaan." },
    { t: "Pengangkatan karyawan", d: "Rekrutmen, seleksi, dan penempatan: menarik kandidat yang tepat dan menaruhnya di posisi yang tepat." },
    { t: "Pemberhentian karyawan", d: "Mengakhiri hubungan kerja secara sah, adil, dan manusiawi, termasuk pensiun dan pesangon." },
    { t: "Pengupahan dan pemberian tunjangan", d: "Merancang kompensasi yang adil ke dalam, bersaing ke luar, dan memotivasi ke depan." },
    { t: "Penilaian kinerja", d: "Mengukur hasil kerja dengan tujuan, proses, dan metode yang jelas agar penilaian tidak sekadar kesan atasan." },
    { t: "Penghargaan", d: "Menghubungkan hasil penilaian dengan pengakuan finansial dan nonfinansial yang terasa adil." },
    { t: "Pelatihan, pengembangan, dan pengembangan karier", d: "Menaikkan kemampuan hari ini lewat pelatihan, dan menyiapkan orang untuk peran yang lebih besar lewat jalur karier." },
    { t: "Keselamatan, kesehatan kerja, kepemimpinan, dan produktivitas", d: "Menjaga tempat kerja yang aman dan sehat, peran pemimpin dalam tim, dan hasil akhir berupa produktivitas." }
  ],
  concepts: [
    { term: "Perencanaan SDM", gloss: "Proses memastikan perusahaan punya jumlah dan jenis orang yang tepat pada waktu yang tepat." },
    { term: "Analisis jabatan", gloss: "Mengurai satu pekerjaan menjadi tugas, tanggung jawab, dan syarat orangnya. Fondasi bagi rekrutmen, upah, dan penilaian." },
    { term: "Kompensasi", gloss: "Seluruh imbalan yang diterima karyawan: gaji, tunjangan, insentif, dan fasilitas, sebagai balas jasa atas kontribusinya." },
    { term: "Penilaian kinerja", gloss: "Penilaian sistematis atas hasil kerja seseorang terhadap standar yang disepakati, dipakai untuk keputusan promosi, pelatihan, dan penghargaan." },
    { term: "Bias penilai", gloss: "Kesalahan khas saat menilai: terlalu lunak, terlalu keras, menilai dari kesan terakhir saja, atau menyamaratakan semua orang." },
    { term: "Pengembangan karier", gloss: "Jalur pertumbuhan seseorang di dalam organisasi, direncanakan bersama antara karyawan dan perusahaan." },
    { term: "K3", gloss: "Keselamatan dan kesehatan kerja: kewajiban perusahaan sekaligus investasi, karena tempat kerja yang aman menurunkan kecelakaan dan biaya tersembunyi." },
    { term: "Produktivitas", gloss: "Perbandingan keluaran terhadap masukan. Dalam MSDM, produktivitas naik lewat kemampuan, motivasi, dan sistem kerja yang baik." }
  ],
  example: {
    title: "Contoh: penilaian kinerja yang berantakan di perusahaan logistik",
    body: "Di sebuah perusahaan logistik besar, penilaian tahunan hanya berupa kesan atasan tanpa indikator tertulis. Akibatnya karyawan rajin dan karyawan santai menerima nilai yang mirip, promosi terasa seperti soal kedekatan, dan yang terbaik justru keluar duluan. Perbaikannya dimulai dari <strong>tujuan dan metode</strong>: tetapkan indikator yang terukur untuk tiap jabatan, latih penilai menghindari bias, adakan sesi kalibrasi antar manajer, dan hubungkan hasil penilaian secara terbuka dengan rencana pelatihan dan jalur karier. Penilaian berhenti menjadi formalitas dan mulai menjadi alat pengembangan."
  },
  quiz: [
    { q: "Mengapa penilaian kinerja harus punya tujuan, proses, dan metode yang jelas?", a: "Karena hasil penilaian dipakai untuk keputusan besar: promosi, kenaikan upah, pelatihan, bahkan pemberhentian. Tanpa standar yang jelas, penilaian berubah menjadi kesan pribadi penilai, terasa tidak adil, dan karyawan kehilangan kepercayaan pada seluruh sistem SDM." },
    { q: "Apa hubungan penilaian kinerja dengan pengembangan karier?", a: "Penilaian menunjukkan kekuatan dan celah kemampuan seseorang. Dari situ perusahaan menyusun pelatihan yang tepat dan menyiapkan orang tersebut untuk jenjang berikutnya. Tanpa data penilaian, rencana karier hanya tebakan dan promosi mudah meleset." },
    { q: "Sebutkan dua kesalahan umum penilai dan cara mengatasinya.", a: "Contoh: efek halo, yaitu menilai semua aspek tinggi hanya karena satu kesan baik, dan penilaian berdasarkan kejadian terakhir saja. Cara mengatasinya: gunakan indikator tertulis per jabatan, catat kinerja sepanjang periode (bukan mengingat di akhir tahun), dan latih para penilai sebelum musim penilaian." }
  ]
},

EMBS4208: {
  name: "Riset Operasi",
  ba: "EKMA4413, Edisi 3 · 418 halaman · Penulis: Pangestu Subagyo",
  bigIdea: "Riset operasi adalah cara mengambil keputusan dengan matematika, bukan firasat. <strong>Ketika sumber daya terbatas, entah itu orang, mesin, waktu, atau uang, riset operasi membantu menemukan kombinasi terbaik yang bisa dibuktikan dengan angka</strong>: rute termurah, jadwal paling efisien, jumlah stok paling pas, dan antrean yang tidak menyiksa pelanggan.",
  topics: [
    { t: "Pendahuluan, probabilitas, dan kurva normal", d: "Pondasi berpikir kuantitatif: peluang kejadian dan sebaran normal sebagai alat membaca ketidakpastian." },
    { t: "Teori keputusan", d: "Memilih tindakan terbaik dalam kondisi pasti, berisiko, dan tidak pasti dengan kriteria yang terukur." },
    { t: "Pengawasan persediaan", d: "Menentukan berapa banyak memesan dan kapan memesan agar biaya total persediaan paling rendah." },
    { t: "Linear programming: metode grafik", d: "Merumuskan masalah alokasi sumber daya sebagai model linear dan menyelesaikan kasus dua variabel secara visual." },
    { t: "Linear programming: metode simpleks", d: "Menyelesaikan model linear yang besar dan nyata dengan prosedur bertahap sampai solusi optimal ditemukan." },
    { t: "Metode transportasi", d: "Mengirim barang dari beberapa gudang ke beberapa tujuan dengan total biaya kirim paling murah." },
    { t: "Model penugasan dan model antrean", d: "Memasangkan orang dengan pekerjaan secara paling efisien, dan merancang layanan agar antrean tidak meledak." },
    { t: "Analisis jaringan kerja", d: "Memetakan proyek sebagai jaringan aktivitas untuk menemukan jalur kritis dan waktu penyelesaian." },
    { t: "Game theory dan dasar integer programming", d: "Berpikir strategis menghadapi pesaing, dan model yang variabelnya harus berupa bilangan bulat." }
  ],
  concepts: [
    { term: "Model", gloss: "Representasi sederhana dari masalah nyata. Model yang baik membuang detail tak penting dan menyimpan hubungan yang menentukan." },
    { term: "Fungsi tujuan", gloss: "Satu kalimat matematika tentang apa yang dioptimalkan: keuntungan maksimum, biaya minimum, atau waktu tersingkat." },
    { term: "Kendala (constraint)", gloss: "Batasan yang tidak boleh dilanggar: stok bahan, jam kerja, kapasitas mesin. Solusi optimal selalu lahir di dalam batas ini." },
    { term: "EOQ", gloss: "Economic Order Quantity: jumlah pesanan yang menyeimbangkan biaya pesan dan biaya simpan sehingga totalnya minimum." },
    { term: "Metode simpleks", gloss: "Algoritme yang berjalan dari satu sudut daerah layak ke sudut yang lebih baik sampai tidak ada lagi perbaikan. Tulang punggung penyelesaian linear programming besar." },
    { term: "Model penugasan", gloss: "Kasus khusus transportasi: setiap pekerja mendapat tepat satu pekerjaan, dipilih agar total waktu atau biaya paling kecil." },
    { term: "Sistem antrean multichannel multiphase", gloss: "Antrean dengan beberapa jalur layanan dan beberapa tahap proses, seperti bengkel: daftar, periksa, perbaiki, lalu bayar." },
    { term: "Jalur kritis (CPM)", gloss: "Rantai aktivitas terpanjang dalam jaringan proyek. Inilah penentu umur proyek; aktivitas di luar rantai ini punya waktu longgar." }
  ],
  example: {
    title: "Contoh: bengkel dengan empat teknisi dan antrean bertahap",
    body: "Sebuah bengkel menerima empat jenis pekerjaan dan punya empat teknisi dengan kecepatan berbeda-beda di tiap jenis pekerjaan. Memasangkan teknisi secara asal membuat satu orang kewalahan dan yang lain menganggur. <strong>Model penugasan</strong> menyelesaikan ini dengan tabel biaya atau waktu, lalu memilih kombinasi pasangan yang totalnya paling kecil. Alur layanannya sendiri adalah antrean <strong>multichannel multiphase</strong>: pelanggan melewati satu meja pendaftaran, lalu dua teknisi pemeriksaan, kemudian perbaikan, dan terakhir satu kasir. Dua model berbeda untuk dua pertanyaan berbeda dalam satu bengkel yang sama."
  },
  quiz: [
    { q: "Apa dua unsur yang selalu ada dalam model linear programming?", a: "Fungsi tujuan yang akan dimaksimalkan atau diminimalkan, dan sekumpulan kendala berupa persamaan atau pertidaksamaan linear. Tanpa kendala, jawaban selalu tak terbatas; tanpa fungsi tujuan, tidak ada yang bisa disebut optimal." },
    { q: "Kapan model penugasan dipakai, dan apa syaratnya?", a: "Saat sejumlah pekerja atau mesin harus dipasangkan satu-satu dengan sejumlah pekerjaan. Syaratnya jumlah sumber sama dengan jumlah pekerjaan (matriks bujur sangkar) dan setiap pasangan punya nilai biaya atau waktu yang diketahui. Tujuannya total paling efisien." },
    { q: "Mengapa antrean bengkel disebut multichannel multiphase?", a: "Karena ada lebih dari satu jalur atau pelayan pada tahap tertentu (multichannel, misalnya dua teknisi pemeriksaan dan beberapa teknisi perbaikan) dan pelanggan melewati beberapa tahap layanan berurutan (multiphase: pendaftaran, pemeriksaan, perbaikan, pembayaran). Satu kasir di tahap akhir tidak mengubah klasifikasinya selama tahap lain bercabang." }
  ]
}

};

/* ============================================================
   Logika aplikasi
   ============================================================ */

const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

const COURSE_INDEX = new Map();
SEMESTERS.forEach((sem) => {
  sem.courses.forEach((c) => COURSE_INDEX.set(c.code, { sem, course: c }));
});

function statusOf(sem) {
  if (sem.tag === "review") return { label: "Ulas Ulang", badge: "badge-review", cta: "Lihat ringkasan" };
  if (sem.tag === "now") return { label: "Sedang Berjalan", badge: "badge-now", cta: "Lihat ringkasan" };
  return { label: "Pratinjau", badge: "badge-preview", cta: "Intip dulu" };
}

function renderMap() {
  const wrap = $("#semesterList");
  wrap.innerHTML = SEMESTERS.map((sem) => {
    const st = statusOf(sem);
    const cards = sem.courses.map((c) => {
      const hasLesson = !!c.lesson;
      return `
      <button type="button" class="course-card ${hasLesson ? "is-lesson" : ""}" data-code="${c.code}" data-search="${(c.code + " " + c.name).toLowerCase()}">
        <span class="course-code">${c.code}${c.ba ? " · BA " + c.ba.split(" ")[0] : ""}</span>
        <span class="course-name">${c.name}</span>
        <span class="course-foot">
          <span>${c.sks} sks</span>
          <span class="course-cta">${hasLesson ? "Buka pelajaran &rarr;" : st.cta + " &rarr;"}</span>
        </span>
      </button>`;
    }).join("");
    return `
    <article class="semester ${sem.tag === "now" ? "semester-now" : ""} reveal" data-semester="${sem.n}">
      <div class="semester-head">
        <div class="semester-num" aria-hidden="true">${sem.n}</div>
        <div class="semester-head-text">
          <span class="badge ${st.badge}">${st.label}</span>
          <h2 class="semester-title">Semester ${sem.n}</h2>
          <p class="semester-sub">${sem.sub} · ${sem.sks} sks paket</p>
        </div>
      </div>
      ${sem.note ? `<p class="semester-note">${sem.note}</p>` : ""}
      <div class="course-grid">${cards}</div>
    </article>`;
  }).join("");

  $$(".course-card", wrap).forEach((card) => {
    card.addEventListener("click", () => openCourse(card.dataset.code));
  });
  observeReveals(wrap);
}

function openCourse(code) {
  const hit = COURSE_INDEX.get(code);
  if (!hit) return;
  if (hit.course.lesson && LESSONS[code]) {
    location.hash = "#/pelajaran/" + code;
  } else {
    openPreview(hit.sem, hit.course);
  }
}

/* ---------- Pratinjau (mata kuliah tanpa materi lengkap) ---------- */
const modal = $("#previewModal");
function openPreview(sem, course) {
  const st = statusOf(sem);
  $("#modalEyebrow").textContent = "Semester " + sem.n + " · " + st.label;
  $("#modalTitle").textContent = course.name;
  $("#modalMeta").textContent = course.code + " · " + course.sks + " sks" + (course.ba ? " · Bahan ajar " + course.ba : "");
  $("#modalBody").textContent = sem.tag === "review"
    ? "Kamu sudah menempuh mata kuliah ini pada Semester " + sem.n + ". Materi ringkas versi Kelas Manajemen UT untuk kelas ini sedang disusun agar kamu bisa mengulasnya kembali dengan cepat."
    : "Mata kuliah ini menunggumu di Semester " + sem.n + ". Materi ringkas versi Kelas Manajemen UT untuk kelas ini sedang disusun, jadi saat semesternya tiba kamu tinggal membuka dan belajar.";
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closePreview() {
  modal.hidden = true;
  document.body.style.overflow = "";
}
$$("[data-close]", modal).forEach((el) => el.addEventListener("click", closePreview));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closePreview(); });

/* ---------- Halaman pelajaran ---------- */
function lessonNav(code) {
  const order = Object.keys(LESSONS);
  const i = order.indexOf(code);
  const prev = i > 0 ? order[i - 1] : null;
  const next = i < order.length - 1 ? order[i + 1] : null;
  return `<nav class="lesson-nav">
    ${prev ? `<a href="#/pelajaran/${prev}">&larr; ${LESSONS[prev].name}</a>` : "<span></span>"}
    ${next ? `<a class="next" href="#/pelajaran/${next}">${LESSONS[next].name} &rarr;</a>` : ""}
  </nav>`;
}

function renderLesson(code) {
  const L = LESSONS[code];
  const hit = COURSE_INDEX.get(code);
  if (!L || !hit) { location.hash = "#/"; return; }
  const topics = L.topics.map((tp, i) => `
    <li class="topic-item">
      <span class="topic-num">${String(i + 1).padStart(2, "0")}</span>
      <p class="topic-title">${tp.t}</p>
      <p class="topic-desc">${tp.d}</p>
    </li>`).join("");
  const concepts = L.concepts.map((c) => `
    <div class="concept"><p class="concept-term">${c.term}</p><p class="concept-gloss">${c.gloss}</p></div>`).join("");
  const quiz = L.quiz.map((q) => `
    <div class="quiz-item">
      <p class="quiz-q">${q.q}</p>
      <button type="button" class="quiz-btn">Lihat jawaban</button>
      <p class="quiz-a">${q.a}</p>
    </div>`).join("");

  $("#lessonContent").innerHTML = `
  <article class="lesson">
    <a class="back-link" href="#/">&larr; Kembali ke peta semester</a>
    <p class="lesson-eyebrow">Semester 4 · Sedang Berjalan · Materi Lengkap</p>
    <h1 class="lesson-title">${L.name}</h1>
    <p class="lesson-meta">${code} · ${hit.course.sks} sks · Bahan ajar ${L.ba}</p>

    <div class="big-idea">
      <h2>Ide Besarnya</h2>
      <p>${L.bigIdea}</p>
    </div>

    <section class="lesson-section">
      <h2>Peta Topik</h2>
      <p>Sembilan modul Buku Materi Pokok, diringkas jadi satu peta jalan. Baca urut dari atas untuk membangun pemahaman dari fondasi.</p>
      <ol class="topic-list">${topics}</ol>
    </section>

    <section class="lesson-section">
      <h2>Konsep Kunci</h2>
      <p>Istilah yang harus langsung nyala di kepala begitu disebut dosen atau muncul di soal ujian.</p>
      <div class="concept-grid">${concepts}</div>
    </section>

    <section class="lesson-section">
      <h2>Contoh Nyata</h2>
      <div class="example-box">
        <h3>${L.example.title}</h3>
        <p>${L.example.body}</p>
        ${L.example.calc ? `<div class="calc">${L.example.calc}</div>` : ""}
      </div>
    </section>

    <section class="lesson-section">
      <h2>Uji Dirimu</h2>
      <p>Jawab dulu di kepala atau di kertas, baru buka jawabannya. Jujur pada prosesnya membuat materi menempel lebih lama.</p>
      ${quiz}
    </section>

    ${lessonNav(code)}
  </article>`;

  $$(".quiz-btn", $("#lessonContent")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".quiz-item");
      const open = item.classList.toggle("open");
      btn.textContent = open ? "Sembunyikan jawaban" : "Lihat jawaban";
    });
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

/* ---------- Router ---------- */
function route() {
  const hash = location.hash || "#/";
  const m = hash.match(/^#\/pelajaran\/([A-Z0-9]+)$/);
  if (m && LESSONS[m[1]]) {
    $("#viewMap").hidden = true;
    $("#viewLesson").hidden = false;
    renderLesson(m[1]);
  } else {
    $("#viewLesson").hidden = true;
    $("#viewMap").hidden = false;
  }
}
window.addEventListener("hashchange", route);

/* ---------- Pencarian ---------- */
const searchInput = $("#searchInput");
function applySearch() {
  const q = searchInput.value.trim().toLowerCase();
  let visibleCards = 0;
  $$(".semester").forEach((sec) => {
    let any = false;
    $$(".course-card", sec).forEach((card) => {
      const hit = !q || card.dataset.search.includes(q);
      card.style.display = hit ? "" : "none";
      if (hit) { any = true; visibleCards++; }
    });
    sec.style.display = any ? "" : "none";
  });
  $("#noResult").hidden = visibleCards > 0;
  $("#searchHint").textContent = q
    ? visibleCards + " mata kuliah cocok dengan pencarianmu."
    : "51 mata kuliah dari Semester 1 sampai 8. Klik kartu Semester 4 untuk membuka pelajaran lengkapnya.";
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
    /* Elemen yang sudah terlihat saat dimuat langsung ditampilkan pada
       frame berikutnya, tanpa menunggu callback observer yang asinkron. */
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => el.classList.add("shown"));
    } else {
      revealObserver.observe(el);
    }
  });
  /* Jaring pengaman terakhir: apa pun yang masih tersembunyi setelah
     1.5 detik di dalam viewport tetap ditampilkan. */
  setTimeout(() => {
    els.forEach((el) => {
      if (el.classList.contains("shown")) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("shown");
    });
  }, 1500);
}

/* ---------- Mulai ---------- */
renderMap();
route();
observeReveals(document);
requestAnimationFrame(() => { $("#progressFill").style.width = "43.75%"; });
