// Session 1's class chat: fictional messages from class 8A at SMP Kotakata.
// Written natively in each language, not translated, so the slang reads
// naturally in both. Every message is made up; students never type or
// upload their own chats.
//
// The pools have jobs (docs/plan/02-sessions.md, section 3):
//   test   20 messages for "test on new messages". The first four are
//          puzzle 1's. Several break the obvious rules on purpose.
//   train  the chat history Kata's examples are collected from.
//   days   what arrives while Kata works: two ordinary days, then the
//          class starts using new slang Kata has never seen.

export type Label = 'penting' | 'santai'
export const LABELS: Label[] = ['penting', 'santai']

export interface Message {
  text: string
  label: Label
}

type Corpus = { test: Message[]; train: Message[]; days: Message[][] }

const P = (text: string): Message => ({ text, label: 'penting' })
const S = (text: string): Message => ({ text, label: 'santai' })

const ID: Corpus = {
  test: [
    P('besok ulangan matematika bab 3'),
    S('wkwk lucu banget'),
    P('ulangan IPA diundur ke Kamis'),
    S('makan bakso yuk pulang sekolah'),
    P('bsk ul mtk jgn lupa belajar'),
    S('besok main ke mall yuk'),
    P('PR bahasa Indonesia halaman 20 ya'),
    S('PR nya susah bgt wkwk'),
    P('besok libur, ada rapat guru'),
    S('ada yang mabar nanti malam?'),
    P('jadwal piket kita ganti hari Rabu'),
    S('kucingku lucu bgt liat deh'),
    P('tugas kelompok dikumpulkan Jumat'),
    S('kantin rame banget tadi'),
    P('jangan lupa bawa buku paket IPS'),
    S('nonton film apa ya weekend ini'),
    P('upacara jam 7, pakai topi'),
    S('sumpah tadi kocak parah'),
    P('nilai ulangan sudah dibagikan wali kelas'),
    S('ulangan tadi susah ya wkwk'),
  ],
  train: [
    P('besok ulangan bahasa Inggris'),
    S('wkwk kocak banget'),
    P('ulangan matematika hari Senin'),
    S('ada yang mau mabar?'),
    P('bsk ul ipa bab 2'),
    S('makan mie ayam yuk'),
    P('jgn lupa PR mtk halaman 15'),
    S('kucing tetangga lucu bgt'),
    P('PR IPS dikumpulkan besok'),
    S('nonton apa ya malam ini'),
    P('tugas seni dikumpulkan hari Kamis'),
    S('sumpah ngantuk banget'),
    P('besok bawa buku gambar'),
    S('besok main futsal yuk'),
    P('jadwal piket minggu ini kelompok 2'),
    S('wkwkwk parah'),
    P('hari Jumat libur karena rapat guru'),
    S('kantin hari ini enak'),
    P('upacara besok jam 7 pakai seragam lengkap'),
    S('lagi dengerin lagu apa?'),
    P('nilai tugas sudah dibagikan wali kelas'),
    S('siapa punya stiker baru'),
    P('kumpulkan uang kas ke bendahara besok'),
    S('mantap jiwa'),
    P('ulangan susulan hari Rabu di perpus'),
    S('nanti malam main game bareng yuk'),
    P('jangan lupa bawa buku paket IPA'),
    S('liat deh videonya lucu'),
    P('PR bahasa Indonesia nomor 1 sampai 10'),
    S('PR nya banyak bgt capek wkwk'),
    P('tugas kelompok presentasi minggu depan'),
    S('ulangan tadi gampang ya'),
    P('bu guru bilang besok ulangan harian'),
    S('jajan yuk pulang sekolah'),
    P('jadwal pelajaran berubah mulai Senin'),
    S('gas lah'),
    P('libur semester mulai tanggal 20'),
    S('filmnya seru banget'),
    P('bsk bawa jas lab buat praktikum'),
    S('haha iya bener'),
    P('jam pelajaran kedua kosong, ada tugas dari guru'),
    S('bakso depan sekolah mantap'),
    P('pengumuman: rapat OSIS jam 1 di aula'),
    S('weekend ini ke mana?'),
    P('remedial ulangan matematika hari Kamis'),
    S('aku telat bangun wkwk'),
    P('wali kelas minta orang tua tanda tangan rapor'),
    S('lucu bgt sih kamu'),
  ],
  days: [
    [P('besok ulangan IPS'), S('mabar yuk nanti'), P('PR mtk dikumpulkan Senin'), S('wkwk lucu'), P('jadwal piket hari Selasa'), S('makan yuk')],
    [P('bawa buku paket besok'), S('nonton yuk'), P('upacara jam 7'), S('kocak parah'), P('tugas bahasa halaman 30'), S('kantin yuk')],
    // From day 3 the class uses new words Kata has never seen.
    [P('remed fisika dimajuin'), S('otw gercep'), P('deadline makalah dimajuin'), S('gaskeun spill'), P('dispen lomba sampai siang'), S('healing dulu otw')],
    [P('remed bahasa dimajuin pagi'), S('spill dong gercep'), P('deadline poster dimajuin'), S('otw healing'), P('dispen remed siang'), S('gaskeun otw')],
    [P('deadline remed dimajuin'), S('gercep gaskeun'), P('dispen deadline pagi'), S('spill healing'), P('remed dispen siang'), S('otw spill')],
  ],
}

const EN: Corpus = {
  test: [
    P('maths test tomorrow chapter 3'),
    S('lol so funny'),
    P('science test moved to Thursday'),
    S('bakso after school?'),
    P('tmrw maths test dont forget to revise'),
    S('mall tomorrow?'),
    P('english hw page 20'),
    S('the hw is so hard lol'),
    P('no school tomorrow, teachers meeting'),
    S('anyone gaming tonight?'),
    P('our cleaning rota changed to Wednesday'),
    S('my cat is so cute look'),
    P('group project due Friday'),
    S('canteen was packed today'),
    P('bring the history textbook'),
    S('what movie this weekend'),
    P('assembly at 7, wear the school tie'),
    S('omg that was hilarious'),
    P('test results are up on the class page'),
    S('that test was hard lol'),
  ],
  train: [
    P('english test tomorrow'),
    S('lol so dumb'),
    P('maths test on Monday'),
    S('anyone up for gaming?'),
    P('tmrw science test chapter 2'),
    S('noodles after school?'),
    P('dont forget maths hw page 15'),
    S('next door cat is so cute'),
    P('history hw due tomorrow'),
    S('what are we watching tonight'),
    P('art project due Thursday'),
    S('omg so sleepy'),
    P('bring your sketchbook tomorrow'),
    S('football tomorrow?'),
    P('cleaning rota this week is group 2'),
    S('lmao dead'),
    P('no school Friday, teachers meeting'),
    S('canteen food was good today'),
    P('assembly tomorrow at 7, full uniform'),
    S('what song are you listening to'),
    P('hw marks are up on the class page'),
    S('who has the new stickers'),
    P('class fund money due tomorrow'),
    S('mall after school, who is in?'),
    P('makeup test on Wednesday in the library'),
    S('gaming tonight together?'),
    P('dont forget the science textbook'),
    S('look at this video lol'),
    P('english hw questions 1 to 10'),
    S('so much hw im tired lol'),
    P('group presentation next week'),
    S('that test was easy'),
    P('the teacher said test tomorrow'),
    S('snacks after school?'),
    P('timetable changes from Monday'),
    S('lets go'),
    P('holidays start on the 20th'),
    S('the movie was so good'),
    P('tmrw bring lab coats for the practical'),
    S('haha so true'),
    P('second lesson is free, teacher left hw'),
    S('bakso outside school is the best'),
    P('notice: student council meeting at 1 in the hall'),
    S('where are you going this weekend?'),
    P('maths retest on Thursday'),
    S('i overslept lol'),
    P('parents need to sign the report card'),
    S('ur so funny'),
  ],
  days: [
    [P('history test tomorrow'), S('gaming later?'), P('maths hw due Monday'), S('lol funny'), P('cleaning rota on Tuesday'), S('food?')],
    [P('bring the textbook tomorrow'), S('movie?'), P('assembly at 7'), S('so dead lmao'), P('english hw page 30'), S('canteen?')],
    // From day 3 the class uses new words Kata has never seen.
    [P('physics resit rescheduled'), S('omw bet'), P('essay deadline rescheduled'), S('slay vibes'), P('excused for the contest till noon'), S('omw vibes')],
    [P('english resit rescheduled early'), S('bet slay'), P('poster deadline rescheduled'), S('vibes omw'), P('excused resit noon'), S('slay bet')],
    [P('deadline resit rescheduled'), S('bet vibes'), P('excused deadline early'), S('slay omw'), P('resit excused noon'), S('omw slay')],
  ],
}

export const CORPUS: Record<'id' | 'en', Corpus> = { id: ID, en: EN }
