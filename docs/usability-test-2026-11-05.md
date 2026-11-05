# Laporan usability test Kotakata

**Tanggal:** 5 November 2026
**Versi yang diuji:** commit `0cb5a81` (4 level), build lokal http://localhost:4180/kotakata/
**Metode:** 4 persona non-teknis, masing-masing dijalankan oleh subagent terpisah. Mereka bermain dari layar kosong (localStorage bersih) lewat UI, di Chrome sungguhan, tanpa membaca kode sumber. Setiap temuan didukung screenshot atau teks yang persis tampil di layar. Screenshot ada di folder scratchpad sesi ini (`ux-rina`, `ux-budi`, `ux-sarah`, `ux-dimas`) dan akan hilang saat sesi berakhir.

## Persona

| Persona | Profil | Bahasa | Layar |
|---|---|---|---|
| **Rina** | 13 th, siswi SMP, belum pernah coding, cuma baca sekilas, menyerah setelah ±5 kali gagal | ID | 1366×768 |
| **Pak Budi** | 45 th, guru IPA SMP, menilai untuk dipakai di kelas, membaca semua teks | ID | 1280×800 |
| **Sarah** | 29 th, marketing, pakai ChatGPT tiap hari, ingin "akhirnya paham" | EN | 1440×900 |
| **Dimas** | 17 th, siswa SMA, gamer, melewati teks, sengaja mencoba merusak | ID | 1024×768 (+800 px) |

## Ringkasan

| | Rina | Pak Budi | Sarah | Dimas |
|---|---|---|---|---|
| Level 1 | ✓ 8 run | ✓ + bonus | ✓ 4 run | ✓ + bonus |
| Level 2 | ✓ 3 run | ✓ + bonus | ✓ 4 run | ✓ + bonus |
| Level 3 | ✓ 6 run | ✓ + bonus | ✓ 6 run | ✓ + bonus |
| Level 4 | **✗ akan berhenti di Tahap 2** | ✓ + bonus | ✓ | ✓ + bonus |
| Memakai jalan pintas tester | Tidak (tapi di L4 T2 memakai pengetahuan tester untuk lanjut) | Tidak | Tidak | Tidak |

**Kesimpulan utama:**

1. **Level 3 dan 4 tidak terlalu berat untuk diselesaikan, tapi terlalu mudah diselesaikan tanpa paham.** Semua persona menyelesaikan Level 3, dan Dimas serta Rina malah menyebutnya level paling seru. Masalahnya, satu tebakan dropdown bisa meloloskan tahap. Akibatnya, pelajaran inti seperti "learning rate kecil = merangkak pelan" dan "context pendek = mengulang" sering tidak pernah terlihat oleh pemain (Sarah: L3 dan L4 dinilai tingkat kesulitan 2 dari 5).
2. **Yang benar-benar menghentikan pemain adalah satu bug di Level 4.** Kalau blok temperature ditaruh di bawah blok "tulis", blok itu tidak terpakai. Log tetap bilang "temperature 0" dan petunjuk menyuruh menaikkan temperature, padahal sudah dinaikkan. Tiga dari empat persona kena masalah ini. Rina akan berhenti main di sini.
3. **Kartu istilah menutupi visual yang sedang dijelaskannya.** Keempat persona melaporkan ini. Di Level 4 masalahnya paling parah, karena bar probabilitas yang jadi inti pelajaran tertutup kartu, lalu hilang begitu run selesai.
4. **Di layar kecil, area kerja blok terlalu sempit.** Semua persona melaporkannya. Di 1024 px, program bahkan tersembunyi di bawah palet blok, gelembung petunjuk menutupi tombol JALANKAN, dan kuis tertutup kolom kategori.
5. **Yang paling berhasil: gelembung petunjuk yang menunjuk blok atau angka yang tepat, dan pratinjau pohon live di Level 2.** Keempat persona menyebut dua hal ini sebagai bagian terbaik game.

## Temuan, diurutkan dari yang paling parah

Kolom "Siapa" menunjukkan persona mana yang mengalaminya. Makin banyak persona yang mengalami, makin kuat bukti masalahnya.

### Blocker

| # | Temuan | Siapa | Bukti | Rekomendasi |
|---|---|---|---|---|
| B1 | **L4 T2: blok temperature di bawah blok "tulis" diabaikan diam-diam.** Log menulis *"Ceritanya sama seperti biasa. Dengan temperature 0, penyair selalu memilih token paling mungkin."* padahal di program tertulis `temperature = 1` (atau 2). Petunjuk mengulang *"Naikkan temperature-nya…"* empat kali, termasuk saat nilainya sudah maksimal. Termometer tetap "T=0". | Rina (akan berhenti), Pak Budi, Dimas | `ux-rina/34-end.png`, `35-end.png`, `37-end.png`; `ux-budi/40-temp.png`; `ux-dimas/31-end.png`, `32-end.png` | Kenali urutan blok yang salah, lalu tampilkan *"Blok temperature ada di bawah blok tulis, jadi belum dipakai. Pindahkan ke atasnya."* Petunjuk di Tahap 3 sudah melakukan hal serupa. Alternatif: pengaturan berlaku di mana pun bloknya diletakkan. |

### Major

| # | Temuan | Siapa | Bukti | Rekomendasi |
|---|---|---|---|---|
| M1 | **Kartu istilah menutupi visual yang dijelaskannya**, misalnya Otak Robot (Training), papan pertanyaan (Split), panah (Gradient), dan bar (Probability, Temperature). | Semua | `ux-sarah/34-l3s1a-dlg2.png`, `43-l4s1-dlg1.png`, `45-l4s2a-dlg1.png`; `ux-rina/06-dlg0.png`, `19-dlg1.png`, `32-dlg0.png`; `ux-dimas/29-popup-id.png` | Taruh kartu di luar stage (misalnya di atas editor blok, atau di bawah stage) dan beri panah atau garis ke bagian yang dibahas. |
| M2 | **Area kerja blok terlalu sempit, dan zoom-nya berubah-ubah antar level.** Lebarnya kira-kira 180–230 px di 1366–1440, dan 85–115 px di 1024. Blok terpotong di tepi kanan, menabrak tombol zoom, lalu workspace bergeser atau mengubah skala setelah blok dijatuhkan. Di L1 teks blok kecil sekali (±9 px), sedangkan di L2 dan L4 kadang besar. | Semua | `ux-sarah/18-l2-bee.png`, `19-l2-reload.png`; `ux-budi/16-q.png`, `21-tree.png`; `ux-rina/01-first-load.png`, `15a-q-dragged.png`; `ux-dimas/16-t8.png` | Satu tingkat zoom tetap yang terbaca di semua level, palet lebih sempit atau bisa diciutkan, editor lebih lebar, dan jangan auto-zoom atau scroll setelah blok dijatuhkan. |
| M3 | **Di 1024 px, program tersembunyi di bawah palet blok.** Program mulai di x≈477, sedangkan palet menutupi x 300–535. Blok yang dilepas di atas palet malah terhapus. | Dimas | `ux-dimas/01-first-load.png`, `05-ws-click.png` | Geser program supaya mulai di sebelah kanan palet, atau ciutkan palet saat layar sempit. |
| M4 | **Gelembung petunjuk menutupi tombol JALANKAN**, dan pemain harus menutupnya dulu. Kadang gelembung juga menyorot blok yang sebenarnya sudah benar. | Sarah, Dimas | `ux-dimas/40-click-run-under-hint.png`; `ux-sarah/11-l1s3-end.png`, `30-l2s2b-end.png` | Jangan pernah taruh gelembung di atas tombol utama. Sorot blok yang memang salah. |
| M5 | **Modal kuis tertutup kolom kategori Blockly di 1024 px.** Huruf A/B/C dan awal teks soal terpotong. | Dimas | `ux-dimas/07-run2.png`, `35-quiz-answered.png` | Naikkan z-index modal. |
| M6 | **Tombol "Lanjut" di kartu istilah terpotong saat stage kecil**, dan tombol Esc tidak menutup kartu. Run tetap tertahan di "BERJALAN...", jadi pemain mengira game macet. | Dimas | `ux-dimas/02-run-6s.png`, `03-popup-wheel.png`, `41-esc-term-popup.png` | Tombol Lanjut selalu terlihat (sticky di bawah kartu), dan Esc menutup kartu. Bisa diselesaikan bersamaan dengan M1. |
| M7 | **Cerita "acak" di Level 4 sama setiap kali game dibuka dari awal.** Tiga sesi baru di temperature 1 semuanya menghasilkan *"sang anjing tidur dekat sang pintu ."*. Satu kelas akan melihat cerita yang persis sama. Penyebabnya sudah dicek di kode: seed run selalu mulai dari 1 setiap kali halaman dimuat (`App.tsx`, `useRef(1)`). | Pak Budi | `ux-budi/52-run1.png` | Mulai seed dari angka acak setiap kali halaman dimuat. |
| M8 | **Di L3 dan L4 pemain bisa lolos tanpa melihat pelajarannya.** Di L3 T2, learning rate 0.5 langsung sampai dalam 1 langkah, jadi pemain tidak pernah melihat 0.1 merangkak dan kehabisan energi. Di L4 T3, pemain bisa langsung lolos tanpa pernah melihat penyair mengulang. | Sarah (utama), Pak Budi | Log Sarah L3 T2 dan L4 T3 | Tahap dimulai dengan program yang sengaja "memperlihatkan masalahnya": L3 T2 dimulai dengan learning rate 0.1 dan 6 langkah yang kehabisan energi, L4 T3 dimulai dengan ingatan 1 kata dan 10 token yang mengulang. Baru setelah itu pemain diminta memperbaikinya. |
| M9 | **Bar probabilitas di L4 kurang mengajar.** Di temperature 0 bawaan, bar hanya menampilkan 100%/0%/0%, padahal kartunya bilang "paling sering muncul". Setelah run selesai, bar langsung hilang dan tulisan "TOKEN BERIKUTNYA?" tinggal kosong. | Sarah, Pak Budi | `ux-sarah/43-l4s1-dlg1.png`, `43-l4s1-end.png`; `ux-budi/39-dlg1.png` | Tampilkan probabilitas asli (misalnya kucing 38%, perapian 25%) dan pengaruh temperature sebagai perbandingan sebelum dan sesudah. Biarkan bar terakhir tetap tampil, atau buat token di gulungan bisa diklik untuk melihat bar-nya. |
| M10 | **Saat blok start dihapus**, log berbunyi *"Belum ada blok di bawah 'saat ▶ ditekan'"* padahal blok itu sudah tidak ada, dan petunjuknya menunjuk blok lain. | Rina | `ux-rina/46b-run-empty-end.png`, `47-end.png` | Kalau blok start tidak ada, tunjuk "saat ▶ ditekan" di palet. |
| M11 | **Blok yang tidak menempel tidak dikenali.** Blok itu kelihatan seperti sudah menempel, lalu petunjuk bilang *"Belum ada kandang burung"* padahal blok burung terlihat di layar. | Rina, Dimas | `ux-rina/20-end.png`, `21a-besar-in-ya.png`; `ux-dimas/17-wrong.png` | Tandai blok yang lepas (abu-abu atau bergetar) dan sesuaikan petunjuknya: *"Blok burungmu belum menempel."* |

### Minor

| # | Temuan | Siapa | Rekomendasi |
|---|---|---|---|
| m1 | **3–4 kartu muncul berturut-turut dalam satu run** (L2 T1: Feature, Split, Leaf, Prediction; L3 T1: Loss, Gradient, Learning Rate). Pemain merasa seperti sedang mengerjakan PR, dan Rina akan mengeklik "Lanjut" terus tanpa membaca. | Semua | Maksimal 1–2 kartu per run. Sisanya muncul di run berikutnya. |
| m2 | **L3 tidak memberi target angka.** *"loss = 0.07… Robot belum sampai di lembah."* dan *"loss = 0.01"* juga belum sampai. Pemain tidak tahu berapa yang dianggap "sampai". | Sarah, Pak Budi, Rina | Tampilkan *"Lembah = loss di bawah 0,01"*, atau gambar zona target di bar loss. |
| m3 | **L3: saat robot memantul di 0.4**, log hanya bilang "belum sampai". Setelah robot terpental, robotnya hilang dari layar dan tulisan energi tetap "10/10". | Pak Budi, Sarah | Tambahkan log *"Robot memantul bolak-balik…"*, tinggalkan penanda tempat robot terpental, dan tampilkan energi yang terpakai. |
| m4 | **Tahap bonus selesai sendiri** di run yang sama dengan tahap utama, sebelum pemain sempat melihat tantangannya (L2, L3, L4). | Semua | Rayakan dengan sengaja (*"Wah, sekalian dapat bonus!"*), atau buat solusi yang paling jelas tidak otomatis lolos bonus. |
| m5 | **Selesai level atau selesai game hanya ditandai baris log**, tanpa layar rekap. | Sarah, Dimas, Rina | Tambahkan kartu "Level selesai" dengan lencana dan tombol "Level berikutnya ▶", plus layar akhir berisi 21 istilah. |
| m6 | **Koleksi kartu ada di bawah lipatan layar**, dan bintang ★★★ tidak pernah dijelaskan. | Semua | Tambahkan tombol "Kartu istilah" di dekat panel tahap, dan satu baris penjelasan: *"Jawab kuis dengan benar untuk mengisi bintang."* |
| m7 | **Kuis muncul sendiri di atas toast lencana**, dan kadang soalnya dari level lain (soal decision tree muncul di L3). Saat jawaban salah, tidak ada penjelasan kenapa. | Rina, Pak Budi | Tampilkan kuis setelah toast, utamakan soal dari level yang sedang dimainkan, dan tambahkan satu kalimat alasan saat jawaban salah. |
| m8 | **4 toast lencana bertumpuk** dan menutupi tombol Kuis dan log. | Rina, Pak Budi | Gabungkan jadi satu toast: *"+4 lencana"*. |
| m9 | **Skor tetap memakai centang saat gagal**: *"10/12 ✓"*, *"4/12 ✓"*. | Sarah | Pakai ✗, atau tanpa tanda, kalau belum 12/12. |
| m10 | **L1: 1 ronde training menghasilkan 0%.** Pemain mengira training malah membuat robot lebih buruk, dan tidak ada yang menghubungkan hasil ini dengan jumlah ronde. | Semua | Tambahkan log *"Penanda masih tertukar. Latih beberapa ronde lagi."* |
| m11 | **STOP menghapus seluruh log** tanpa pesan "dihentikan". Layout juga bergeser ±56 px setiap kali Run atau Stop ditekan. | Dimas, Rina | Tambahkan log *"Program dihentikan"*, dan tombol Kuis tetap di tempatnya. |
| m12 | **"BERSIHKAN" dikira akan menghapus blok.** | Dimas, Rina | Ganti jadi *"Bersihkan layar"* atau *"Ulang animasi"*. |
| m13 | **Mengganti bahasa di tengah run** membuat log campur dua bahasa. | Dimas | Terjemahkan ulang isi log, atau kunci tombol bahasa selama run. |
| m14 | **"sang pintu ." dianggap kalimat selesai**, padahal cuma dua kata. Ada juga spasi sebelum titik. | Pak Budi | Syaratkan subjek dan kata kerja, dan hilangkan spasi sebelum titik. |
| m15 | **Angka di kolom isian dibatasi diam-diam** (999 jadi 10/30/12). | Dimas | Tampilkan pesan batas, atau biarkan saja (tidak merusak apa pun). |

## Copywriting

### Bahasa Indonesia (dari Pak Budi dan Rina)

| Teks sekarang | Masalah | Usulan |
|---|---|---|
| "sang kucing tidur dekat **sang perapian** ." | "sang" adalah terjemahan harfiah "the". Kata ini bernada dongeng dan janggal untuk benda | "Seekor kucing tidur di dekat perapian." (perlu menyesuaikan kalimat-kalimat di model L4) |
| Blok "🍎 apple", "🍌 banana", kartu Label *"misalnya "apple" atau "banana""* | Nama buah bukan istilah teknis, tapi bercampur dengan "apel/pisang" di misi | "🍎 apel", "🍌 pisang" |
| "0.1", "6.25", "0.000" | Sekolah Indonesia memakai koma desimal | "0,1", "6,25" di mode ID |
| "bar probabilitas" vs kartu "Probability" | Dua istilah untuk hal yang sama | Pakai satu saja, misalnya "bar probability" |
| "Tambahkan langkah sampai ia sampai." | "sampai… sampai" berulang | "Tambahkan langkah sampai robot tiba di bendera." |
| "Energi habis! Langkah sisanya tidak dijalankan." (juga muncul saat berhasil) | Terdengar seperti pesan gagal | "Robot sudah sampai, jadi sisa langkah tidak dipakai." |
| Kartu Convergence: "langkah berikutnya tidak membuat loss lebih kecil lagi" | Bertentangan dengan log, karena loss masih turun dari 0.07 ke 0.001 | "…langkah berikutnya hampir tidak mengubah loss lagi." |
| Kuis: "Bergerak di conveyor belt" | Bahasa Inggris non-teknis | "Bergerak di ban berjalan" |
| Dialog Main dari awal: "Blok, kartu istilah, dan bintangmu akan dihapus" | Tidak menyebut progres level dan lencana | Tambahkan "progres level, lencana" |
| Kartu Dataset "diletakkan menurut warna" + Label "Warna tiap titik adalah label-nya" | Kata "warna" dipakai untuk dua hal berbeda | "Titik diletakkan menurut warna kulit dan bentuk buah. Warna titiknya menunjukkan label." |

**Untuk anak 13 tahun (Rina):** istilah "accuracy", "learning rate", "temperature", "token", dan "converge" tidak bisa ditebak artinya. Aturan "istilah teknis tetap dalam bahasa Inggris" tetap bisa dipakai, asalkan istilah itu muncul berdampingan dengan versi Indonesia yang sederhana di blok dan misi. Contohnya "tingkat kejutan (temperature)", "panjang lompatan (learning rate)", dan "tulis 4 kata (token)". Subjudul level seperti "CLASSIFICATION", "GRADIENT DESCENT", dan "LLMS" juga sebaiknya diberi padanan Indonesia, misalnya "Memilah", "Menuruni bukit", dan "Penyair AI".

### Bahasa Inggris (dari Sarah)

Tidak ada teks Indonesia yang bocor di mode EN.

| Teks sekarang | Usulan |
|---|---|
| "write 1 tokens" | Default 4, atau "write [n] token(s)" |
| "then press ▶." | "then press ▶ RUN." |
| "evens out these bars" | "makes the bars more equal, so less likely words sometimes win" |
| "Finish the level before this one" | "Finish the previous level first" |
| "The innkeeper wants a story that always reaches the full stop, at temperature 0." | "Set temperature to 0 and get the bard to finish the sentence with a full stop." |

## Ketepatan konsep (dari Pak Budi)

Ke-21 definisi kartu dinilai **benar dan cocok untuk anak SMP**. Ada tiga catatan:
- **Probability:** kartunya bilang "paling sering", tapi bar menunjukkan 100% (lihat M9).
- **Convergence:** kalimatnya bertentangan dengan angka di log (lihat copywriting di atas).
- **Gradient:** definisinya sedikit abstrak. Akan lebih mudah dipahami kalau dikaitkan dengan "kemiringan" yang dipelajari di IPA atau matematika.

## Tes pemahaman: Sarah menjelaskan ke rekan kerja

> "Training is basically the AI adjusting itself again and again until its guesses match the right answers you gave it… The game called that wrongness 'loss' and drew it as a hill it walks down. You then test it on examples it's never seen… Temperature is a setting for how random the next word is: at 0 it always picks the most likely word… I couldn't tell you what the probability bars actually looked like, though, because they were always hidden or gone."

**Konsep yang sampai:** dataset, label, training, testing, accuracy, classification, konsep-konsep decision tree, loss, token, dan LLM.
**Konsep yang belum sampai:** gradient, probability, dan alasan context penting. Learning rate dan temperature hanya sampai sebagian.

## Yang berhasil (ulangi di level berikutnya)

- **Gelembung petunjuk yang menunjuk blok atau angka yang tepat.** Keempat persona menyebut ini fitur terbaik. Contoh: *"Robot belum pernah lihat pisang…"*, *"Ubah angka ini jadi minimal 10"*, *"Terlalu besar! Robotnya terpental."*
- **Visual yang langsung bereaksi terhadap program:** pratinjau pohon L2, bukit dengan loss dan energi di L3, dan token yang muncul satu per satu di L4.
- **Kotak "Artinya:" di setiap kartu.** Isinya pendek dan sederhana, sampai-sampai Rina tetap membacanya walaupun melewati bagian lain.
- **Lencana untuk kegagalan** (🎢 Terpental, 🔥 Kepanasan). Lencana ini membuat pemain berani bereksperimen.
- **Umpan balik kuis yang ramah:** *"Belum tepat, tapi sekarang kamu tahu."*
- **Ketangguhan.** Dimas mengeklik Run berulang kali, mengisi angka 999, menghapus blok start, mengganti bahasa, dan scroll di tengah animasi. Hasilnya **tidak ada satu pun error** di halaman maupun di konsol.
- **Urutan level.** Pak Budi menilai alurnya naik dengan pelan, dan kaitan antar level (misalnya kartu Learning Rate yang mengingatkan ke Level 1) membantu pemahaman.

## Skor (1–5)

| | Rina | Pak Budi | Sarah | Dimas |
|---|---|---|---|---|
| Tahu harus ngapain | 3 | 4 | 4 | – |
| Kejelasan umpan balik | 3 | – | 4 (L1–2) / 3 (L3–4) | – |
| Seru | 4 | – | 4 | 4 |
| Belajar | 3 | – | 3 | – |
| Kejelasan visual | 3 | – | 3 | 2 (layar kecil) |
| Ketepatan isi | – | 4 | – | – |
| Siap dipakai di kelas | – | 3 | – | – |
| Kualitas bahasa | – | 3,5 | – | – |
| Ketangguhan | – | – | – | 4 |

## Rekomendasi perbaikan, diurutkan

**P0, perbaiki dulu:**
1. B1: blok temperature di bawah "tulis". Buat game mengenali urutan blok, dan perbaiki pesan log serta petunjuknya.
2. M7: seed acak per halaman, supaya cerita L4 benar-benar acak.
3. M1 + M6: pindahkan kartu istilah keluar dari stage, buat tombol Lanjut selalu terlihat, dan Esc bisa menutup kartu.
4. M4 + M5: gelembung petunjuk tidak boleh menutupi tombol JALANKAN, dan z-index modal kuis harus di atas palet.

**P1, supaya L3 dan L4 benar-benar mengajar:**
5. M8: setiap tahap memperlihatkan masalahnya dulu (energi habis di L3 T2, penyair mengulang di L4 T3).
6. M9: tampilkan probabilitas asli dan perbandingan sebelum/sesudah temperature, dan biarkan bar terakhir tetap tampil.
7. m1: batasi 1–2 kartu per run.
8. m2 + m3: target loss terlihat di L3, dan ada penjelasan saat robot memantul atau terpental.
9. Padanan Indonesia sederhana untuk istilah teknis di blok dan misi (untuk anak 13 tahun).

**P2, tata letak dan kerapian:**
10. M2 + M3: zoom blok tetap, editor lebih lebar, dan program tidak tersembunyi di 1024 px.
11. M10 + M11: petunjuk untuk blok start yang hilang dan blok yang tidak menempel.
12. Perbaikan copywriting: "sang", apel/pisang, koma desimal, Convergence, "Energi habis".
13. m4–m15: rayakan bonus, layar akhir level atau game, tombol Kartu istilah, kuis dan toast, ✓ saat gagal, Stop/Bersihkan.
