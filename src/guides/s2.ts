import { PHOTOS } from '../levels/vision/model'
import type { Card } from './types'
import type { SessionGuide } from './types'

/** One card per row of a photo's numbers, so a group can rebuild and shade the picture. */
const rows = (id: 'dinda' | 'sari') => (lang: 'id' | 'en'): Card[] =>
  PHOTOS[id].brightness.map((row, r) => ({ text: row.join(' '), label: `${lang === 'id' ? 'Baris' : 'Row'} ${r + 1}` }))

export const GUIDE_S2: SessionGuide = {
  session: 's2',
  title: { id: 'Filter Kamera', en: 'Camera Filter' },
  bigQuestion: {
    id: 'Gimana filter kamera tahu di mana mataku?',
    en: 'How does a camera filter know where my eyes are?',
  },
  kelas: '8',
  kka: {
    elements: [
      { id: 'Pemanfaatan dan Pengembangan KA', en: 'Pemanfaatan dan Pengembangan KA (using and developing AI)' },
      { id: 'Literasi dan Etika KA', en: 'Literasi dan Etika KA (AI literacy and ethics)' },
    ],
    materi: [
      { id: 'Kelas VIII: Pemanfaatan Perangkat Penginderaan', en: 'Grade VIII: Pemanfaatan Perangkat Penginderaan (using sensing devices)' },
      { id: 'CP: KA menerima informasi dari sensor dan menggabungkannya', en: 'CP: AI takes in information from sensors and combines it' },
      { id: 'CP: perbedaan cara manusia dan KA mengenali sesuatu', en: 'CP: how people and AI recognise things differently' },
    ],
  },
  goals: [
    { id: 'Menjelaskan bahwa bagi komputer, gambar adalah kumpulan angka (piksel).', en: 'Explain that to a computer, a picture is a grid of numbers (pixels).' },
    { id: 'Menyusun detektor sederhana (gelap, tepi, pasangan) dan menggabungkannya untuk menemukan mata.', en: 'Build simple detectors (dark, edges, pairs) and combine them to find the eyes.' },
    { id: 'Menjelaskan kenapa satu sensor bisa tertipu, dan kenapa menggabungkan dua sensor lebih bisa dipercaya.', en: 'Explain why one sensor can be fooled, and why combining two sensors is more trustworthy.' },
  ],
  forParents: {
    id: 'Anak membuat filter kacamata hitam seperti di aplikasi kamera. Ia melihat bahwa foto hanyalah angka, lalu menyusun detektor kecil untuk menemukan mata. Filternya gagal di ruang gelap dan tertipu poster, dan anak memperbaikinya dengan sensor jarak.',
    en: 'Your child builds a sunglasses filter like the ones in camera apps. They see that a photo is just numbers, then build small detectors to find the eyes. The filter fails in a dark room and is fooled by a poster, and your child fixes it with a depth sensor.',
  },
  terms: [
    { term: 'Pixel', def: { id: 'Satu titik di gambar. Bagi komputer, setiap piksel adalah angka kecerahan.', en: 'One dot in a picture. To a computer, each pixel is a brightness number.' } },
    { term: 'Edge Detection', def: { id: 'Mencari tempat angka piksel melompat jauh, yang biasanya batas sebuah benda.', en: 'Finding where pixel numbers jump a lot, which is usually the edge of a thing.' } },
    { term: 'Object Detection', def: { id: 'Menemukan benda di gambar dengan menggabungkan beberapa detektor kecil.', en: 'Finding a thing in a picture by combining several small detectors.' } },
    { term: 'Sensor Fusion', def: { id: 'Menggabungkan beberapa sensor, misalnya kamera dan sensor jarak.', en: 'Combining several sensors, such as a camera and a depth sensor.' } },
    { term: 'Computer Vision', def: { id: 'Cara komputer "melihat": dari angka, ke pola, ke keputusan.', en: 'How a computer "sees": from numbers, to patterns, to a decision.' } },
  ],
  prep: {
    guru: [
      { id: 'Buka aastr.id/kotakata/main/s2 di setiap perangkat.', en: 'Open aastr.id/kotakata/main/s2 on every device.' },
      { id: 'Cetak kartu baris foto (lampiran) dan siapkan kertas kotak 12×12 serta pensil per kelompok.', en: 'Print the photo row cards (appendix) and have a 12×12 squared sheet and a pencil for each group.' },
      { id: 'Semua wajah di sesi ini adalah tokoh piksel fiksi. Tidak ada foto siswa yang dipakai.', en: 'Every face in this session is a fictional pixel character. No student photos are used.' },
    ],
    ortu: [
      { id: 'Buka aastr.id/kotakata/main/s2. Tidak perlu daftar.', en: 'Open aastr.id/kotakata/main/s2. No sign-up needed.' },
      { id: 'Siapkan satu HP dengan aplikasi kamera yang punya filter wajah, untuk dicoba bersama di akhir.', en: 'Have a phone with a camera app that has face filters, to try together at the end.' },
    ],
  },
  warmup: {
    guru: [
      { id: 'Tanyakan: "Siapa yang pernah pakai filter kamera? Bagaimana filternya tahu di mana matamu?"', en: 'Ask: "Who has used a camera filter? How does it know where your eyes are?"' },
      { id: 'Catat jawaban sebagai asesmen awal: apakah siswa mengira kamera "melihat" seperti manusia?', en: 'Note the answers as the initial assessment: do students think a camera "sees" the way people do?' },
    ],
    ortu: {
      id: 'Tanyakan: "Menurutmu, kamera HP melihat wajahmu seperti mata kita, atau dengan cara lain?"',
      en: 'Ask: "Do you think a phone camera sees your face like our eyes do, or some other way?"',
    },
  },
  puzzles: [
    {
      title: { id: 'Tahap 1 · Gambar adalah angka', en: 'Stage 1 · A picture is numbers' },
      happens: { id: 'Foto Dinda tampil sebagai angka 0 sampai 9. Filter awal menandai semua piksel di bawah 3, termasuk rambut, jadi kacamatanya salah.', en: "Dinda's photo shows as numbers from 0 to 9. The starting filter marks every pixel below 3, hair included, so the sunglasses land wrong." },
      stuck: { id: 'Siswa menaikkan angka, padahal harus diturunkan.', en: 'Students raise the number when it needs to go down.' },
      say: { id: '"Berapa angka di mata? Berapa di rambut? Angka berapa yang hanya dimiliki mata?"', en: '"What number are the eyes? And the hair? Which number do only the eyes have?"' },
    },
    {
      title: { id: 'Tahap 2 · Cari wajahnya', en: 'Stage 2 · Find the face' },
      happens: { id: 'Ada dua titik gelap di dinding di foto Raka. Siswa mencari tepi wajah, lalu hanya memakai titik di dalamnya.', en: "Raka's photo has two dark dots on the wall. Students find the face's edges, then only use dots inside them." },
      stuck: { id: 'Angka tepi terlalu besar, jadi garis wajah tidak tertutup.', en: "The edge number is too big, so the face's outline doesn't close." },
      say: { id: '"Di mana angkanya melompat jauh? Apakah garis tosca-nya mengelilingi wajah?"', en: '"Where do the numbers jump a lot? Does the teal line go all the way round the face?"' },
    },
    {
      title: { id: 'Tahap 3 · Mata selalu berpasangan', en: 'Stage 3 · Eyes come in pairs' },
      happens: { id: 'Lima foto teman. Tahi lalat Sari juga gelap dan di dalam wajah. Blok "berpasangan sejajar" hanya mengambil dua titik di baris yang sama.', en: "Five friends' photos. Sari's mole is dark and inside the face too. The \"level pairs\" block only takes two dots in the same row." },
      stuck: { id: 'Kulit Bimo yang gelap ikut tertandai kalau angkanya terlalu besar.', en: "Bimo's darker skin gets marked too if the number is too big." },
      say: { id: '"Apa bedanya mata dan tahi lalat? Apakah filtermu adil untuk semua warna kulit?"', en: '"What makes eyes different from a mole? Is your filter fair to every skin tone?"' },
    },
    {
      title: { id: 'Tahap 4 · Ruang gelap', en: 'Stage 4 · A dark room' },
      happens: { id: 'Dua foto diambil di ruang gelap. Semua angkanya kecil, jadi seluruh wajah tertandai. "Atur kecerahan otomatis" merentangkan angkanya lagi.', en: 'Two photos were taken in a dark room. Every number is small, so the whole face gets marked. "Auto brightness" stretches the numbers back out.' },
      stuck: { id: 'Blok kecerahan ditaruh setelah blok gelap, jadi terlambat.', en: 'Students put the brightness block after the dark block, where it comes too late.' },
      say: { id: '"Filter membaca blok dari atas ke bawah. Kapan kecerahan perlu diatur?"', en: '"The filter reads the blocks top to bottom. When does the brightness need fixing?"' },
    },
    {
      title: { id: 'Tahap 5 · Bukan wajah sungguhan', en: 'Stage 5 · Not a real face' },
      happens: { id: 'Salah satu foto adalah poster wajah. Kamera saja memasang kacamata di poster itu. Sensor jarak tahu poster itu datar dan jauh.', en: 'One photo is a poster of a face. The camera alone puts sunglasses on it. The depth sensor knows the poster is flat and far away.' },
      stuck: { id: 'Siswa mencoba mengubah angka gelap atau tepi, padahal kamera memang tidak bisa membedakan.', en: "Students keep changing the dark or edge numbers, but the camera really can't tell the difference." },
      say: { id: '"Kalau dilihat dari angka saja, apa bedanya poster dan wajah? Apa yang bisa mengukur jarak?"', en: '"Looking only at the numbers, how is the poster different from a face? What could measure distance?"' },
    },
    {
      title: { id: 'Bonus · Filter topi', en: 'Bonus · Hat filter' },
      happens: { id: 'Semua delapan foto. Topi harus duduk di atas kepala, termasuk di ruang gelap, tanpa tertipu poster.', en: 'All eight photos. The hat has to sit on top of the head, in the dark room too, without being fooled by the poster.' },
      stuck: { id: 'Topi dari garis tepi ikut terpasang di poster.', en: 'A hat placed from the edges also lands on the poster.' },
      say: { id: '"Sensor mana yang tahu bentuk kepala, bahkan dalam gelap?"', en: '"Which sensor knows the shape of a head, even in the dark?"' },
    },
  ],
  debrief: {
    guru: [
      { q: { id: 'Apa yang sebenarnya "dilihat" kamera?', en: 'What does a camera actually "see"?' }, a: { id: 'Angka. Polanya, seperti tepi dan pasangan, harus dicari dari angka itu.', en: 'Numbers. Patterns such as edges and pairs have to be found from those numbers.' } },
      { q: { id: 'Kenapa filter gagal di ruang gelap dan di foto Bimo?', en: "Why did the filter fail in the dark room and on Bimo's photo?" }, a: { id: 'Angka yang dipakai cocok untuk sebagian foto saja. Filter yang tidak dicoba di banyak kondisi bisa tidak adil.', en: 'The numbers chosen only suited some photos. A filter not tested in many conditions can be unfair.' } },
      { q: { id: 'Bagaimana manusia mengenali teman? Apa bedanya dengan Kata?', en: 'How do people recognise a friend? How is that different from Kata?' }, a: { id: 'Manusia memakai suara, cara berjalan, konteks, dan ingatan. Kata hanya memakai sensor yang diberikan.', en: 'People use voice, the way someone walks, context and memory. Kata only uses the sensors it is given.' } },
      { q: { id: 'Kenapa HP sungguhan memakai sensor jarak untuk membuka kunci dengan wajah?', en: 'Why do real phones use a depth sensor for face unlock?' }, a: { id: 'Supaya tidak bisa dibuka dengan foto. Ini contoh sensor fusion.', en: "So a photo can't unlock it. That is sensor fusion." } },
    ],
    ortu: [
      { id: 'Kalau kamera hanya melihat angka, kenapa filter bisa salah tempat?', en: 'If a camera only sees numbers, why can a filter land in the wrong place?' },
      { id: 'Kenapa penting mencoba filter pada banyak wajah dan cahaya yang berbeda?', en: 'Why does it matter to test a filter on many faces and in different light?' },
      { id: 'Bagaimana HP kita tahu bahwa yang membuka kunci adalah wajah sungguhan?', en: 'How does our phone know that a real face, not a photo, is unlocking it?' },
    ],
  },
  exitTicket: [
    { q: { id: 'Piksel mata bernilai 0, rambut 2, kulit 6. Angka berapa yang menandai mata saja: "lebih gelap dari 1" atau "lebih gelap dari 3"?', en: 'Eye pixels are 0, hair 2, skin 6. Which marks only the eyes: "darker than 1" or "darker than 3"?' }, a: { id: '"Lebih gelap dari 1".', en: '"Darker than 1".' } },
    { q: { id: 'Filter memasang kacamata di poster wajah. Sensor apa yang bisa membantu?', en: 'A filter puts sunglasses on a poster of a face. Which sensor could help?' }, a: { id: 'Sensor jarak (kedalaman).', en: 'A depth sensor.' } },
    { q: { id: 'Filter hanya dicoba di foto terang. Apa yang bisa terjadi?', en: 'A filter was only tried on bright photos. What could happen?' }, a: { id: 'Filter gagal di foto gelap atau untuk sebagian orang.', en: 'It fails on dark photos or for some people.' } },
  ],
  misconceptions: [
    { belief: { id: '"Kamera melihat wajah seperti mata kita."', en: '"A camera sees a face like our eyes do."' }, reply: { id: 'Tahap 1: kamera hanya menerima angka. "Wajah" adalah pola yang dicari dari angka itu.', en: 'Stage 1: the camera only gets numbers. A "face" is a pattern found in those numbers.' } },
    { belief: { id: '"Kalau berhasil di satu foto, pasti berhasil di semua."', en: '"If it works on one photo, it works on all of them."' }, reply: { id: 'Tahap 3 dan 4: filter yang sama gagal karena tahi lalat, warna kulit, dan ruang gelap.', en: 'Stages 3 and 4: the same filter fails because of a mole, skin tone and a dark room.' } },
    { belief: { id: '"AI tidak bisa tertipu."', en: '"AI can\'t be fooled."' }, reply: { id: 'Tahap 5: kamera saja tertipu poster. Butuh sensor kedua.', en: 'Stage 5: the camera alone is fooled by a poster. It takes a second sensor.' } },
  ],
  extension: {
    guru: [
      { id: 'Diskusi etika (8 menit): kamera pengenal wajah di tempat umum. Data siapa yang dikumpulkan, dan siapa yang boleh memakainya? Ini menjadi pemanasan untuk Sesi 6.', en: 'Ethics discussion (8 minutes): face-recognition cameras in public places. Whose data is collected, and who may use it? This warms up Session 6.' },
      { id: 'Lanjutan: daftar sensor di HP (kamera, mikrofon, GPS, sensor jarak, akselerometer) dan untuk apa masing-masing dipakai.', en: 'Follow-up: list the sensors in a phone (camera, microphone, GPS, proximity, accelerometer) and what each is used for.' },
    ],
    ortu: {
      id: 'Coba filter wajah di HP bersama. Uji di cahaya terang dan redup, pakai topi, atau arahkan ke foto. Kapan filternya gagal?',
      en: 'Try a face filter on a phone together. Test it in bright and dim light, with a hat on, or pointed at a photo. When does it fail?',
    },
  },
  unplugged: {
    guru: [
      { id: 'Setiap kelompok mendapat 12 kartu baris foto. Mereka menyalin angkanya ke kertas kotak 12×12.', en: 'Each group gets the 12 row cards for a photo. They copy the numbers onto a 12×12 squared sheet.' },
      { id: 'Arsir kotak yang angkanya kecil. Wajah siapa yang muncul?', en: 'Shade the squares with small numbers. Whose face appears?' },
      { id: 'Kelompok menulis aturan untuk menemukan mata ("lebih gelap dari ..."), lalu menukar aturannya dengan kelompok yang mendapat foto lain. Apakah aturannya tetap berhasil?', en: 'Groups write a rule for finding the eyes ("darker than ..."), then swap rules with a group that has the other photo. Does the rule still work?' },
    ],
    ortu: [
      { id: 'Salin angka dari kartu baris ke kertas kotak, lalu arsir bersama.', en: 'Copy the numbers from the row cards onto squared paper, then shade them together.' },
      { id: 'Tanyakan: "Kalau kamu komputer dan hanya punya angka-angka ini, bagaimana kamu tahu di mana matanya?"', en: 'Ask: "If you were a computer with only these numbers, how would you find the eyes?"' },
    ],
  },
  cardSets: [
    { title: { id: 'Kartu baris foto Dinda', en: "Dinda's photo row cards" }, showLabel: true, cards: rows('dinda') },
    { title: { id: 'Kartu baris foto Sari (ada tahi lalat)', en: "Sari's photo row cards (with a mole)" }, showLabel: true, cards: rows('sari') },
  ],
  mapping: [
    { framework: 'KKA Fase D', covers: { id: 'Pemanfaatan dan Pengembangan KA (perangkat penginderaan, menggabungkan informasi sensor); Literasi dan Etika KA (perbedaan manusia dan KA). Materi kelas VIII.', en: 'Pemanfaatan dan Pengembangan KA (sensing devices, combining sensor information); Literasi dan Etika KA (how people and AI differ). Grade VIII material.' } },
    { framework: 'AI4K12 (grade 6–8)', covers: { id: '1-A-ii (menggabungkan sensor), 1-A-iii (gambar sebagai piksel), 1-B-ii dan 1-B-iv (mendeteksi fitur dan benda).', en: '1-A-ii (combining sensors), 1-A-iii (images as pixels), 1-B-ii and 1-B-iv (detecting features and objects).' } },
    { framework: 'UNESCO (2024)', covers: { id: 'CG4.3.1.1 (cara kerja AI berbasis data), CG4.2.1.1 (keadilan dan inklusi).', en: 'CG4.3.1.1 (how data-driven AI works), CG4.2.1.1 (fairness and inclusion).' } },
  ],
}
