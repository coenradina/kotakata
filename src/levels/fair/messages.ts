// Session 3's chats. Kata was trained on class 8A (Session 1's chat) and
// now has to work for other people. All messages are fictional.
//
// - cousin: class 8C at a school in Surabaya. In Indonesian they mix in
//   Suroboyoan Javanese; in English, the cousin's class uses a different
//   set of slang. Kata has seen few of these words.
// - donated: an older class's labelled chat, given away for free. Some
//   labels were filled in as a joke, so they're wrong.
// - bimo: Bimo is in 8A but types fast, with lots of typos.
//
// Every message has a sender, so Kata can be scored person by person.

import type { Label, Message } from '../chat/messages'

export type Sender = 'dinda' | 'raka' | 'ayu' | 'bimo'
export interface SentMessage extends Message {
  from: Sender
}

export interface FairCorpus {
  cousin: { history: SentMessage[]; test: SentMessage[] }
  donated: (Message & { wrong?: boolean })[]
  bimo: { history: SentMessage[]; test: SentMessage[] }
  /** One test for everyone: 8A friends, the cousin's class and Bimo, 6 messages each. */
  everyone: SentMessage[]
}

const from =
  (who: Sender) =>
  (label: Label) =>
  (text: string): SentMessage => ({ text, label, from: who })
const AYU = { P: from('ayu')('penting'), S: from('ayu')('santai') }
const BIMO = { P: from('bimo')('penting'), S: from('bimo')('santai') }
const DINDA = { P: from('dinda')('penting'), S: from('dinda')('santai') }
const RAKA = { P: from('raka')('penting'), S: from('raka')('santai') }
// Donated messages: `wrong` marks a label filled in as a joke.
const D = (label: Label, text: string, wrong = false) => ({ text, label, ...(wrong ? { wrong } : {}) })

const ID: FairCorpus = {
  cousin: {
    history: [
      AYU.P('sesuk ulangan mtk rek'),
      AYU.S('ayo dolan nang mall'),
      AYU.P('garapan dikumpulno dino senen'),
      AYU.S('koen wis mangan ta'),
      AYU.P('ojok lali nggowo buku paket'),
      AYU.S('ngakak aku rek'),
      AYU.P('resik resik kelas diganti dino rebo'),
      AYU.S('mabar ta engko bengi'),
      AYU.P('tugase dikumpulno dino jumat'),
      AYU.S('kucingku lucu pol'),
      AYU.P('baris esuk nang lapangan, nggowo topi'),
      AYU.S('kantin rame pol mau'),
      AYU.P('prei sesuk, onok rapat'),
      AYU.S('nonton opo yo engko'),
      AYU.P('bijine ujian wis metu nang grup'),
      AYU.S('sumpah kocak pol'),
      AYU.P('remidi dino kemis rek'),
      AYU.S('ayo mangan bakso'),
      AYU.P('sesuk nggowo jas lab'),
      AYU.S('dolan yok rek'),
    ],
    test: [
      AYU.P('sesuk ulangan ipa bab 4'),
      AYU.S('ngakak pol rek'),
      AYU.P('garapan bahasa dikumpulno sesuk'),
      AYU.S('engko bengi mabar ta'),
      AYU.P('ojok lali nggowo kamus'),
      AYU.S('koen nang endi'),
      AYU.P('dino kemis kelompok telu resik resik kelas'),
      AYU.S('ayo dolan sesuk'),
      AYU.P('tugase dikumpulno dino rebo'),
      AYU.S('lucu pol kucinge'),
      AYU.P('sesuk baris nang lapangan esuk'),
      AYU.S('mangan nang kantin yok'),
      AYU.P('prei dino jemuah, onok rapat'),
      AYU.S('nonton film opo rek'),
      AYU.P('remidi dino senen'),
      AYU.S('sumpah ngantuk pol'),
      AYU.P('bijine garapan wis metu'),
      AYU.S('bakso nang ngarep sekolah enak'),
      AYU.P('jadwale ujian diganti rek'),
      AYU.S('aku telat tangi rek'),
    ],
  },
  donated: [
    D('penting', 'besok ulangan biologi'),
    D('santai', 'wkwk ngakak'),
    D('penting', 'PR kimia dikumpulkan Senin'),
    D('santai', 'mabar nanti?'),
    D('penting', 'jadwal ujian sudah keluar'),
    D('santai', 'makan siang yuk'),
    D('penting', 'bawa buku catatan besok'),
    D('santai', 'lucu banget videonya'),
    D('penting', 'tugas makalah dikumpulkan Jumat'),
    D('santai', 'nonton bareng yuk'),
    D('penting', 'upacara hari Senin pakai topi'),
    D('santai', 'kantin tutup ya?'),
    D('penting', 'rapat kelas jam 2'),
    D('santai', 'kocak parah sumpah'),
    D('penting', 'ulangan fisika diundur'),
    D('santai', 'jajan yuk'),
    D('penting', 'jangan lupa bawa kalkulator'),
    D('santai', 'besok main yuk'),
    D('penting', 'piket kelas hari Kamis'),
    D('santai', 'haha bener banget'),
    D('penting', 'pengumuman libur tanggal 17'),
    D('santai', 'siapa yang online?'),
    D('penting', 'nilai ulangan dibagikan besok'),
    D('santai', 'stiker baru lucu'),
    // The jokes: labels swapped on purpose by whoever filled them in.
    D('santai', 'besok ulangan matematika', true),
    D('santai', 'PR bahasa Inggris halaman 5', true),
    D('santai', 'tugas kelompok dikumpulkan besok', true),
    D('santai', 'jadwal piket ganti', true),
    D('penting', 'wkwk lucu banget', true),
    D('penting', 'mabar yuk nanti malam', true),
    D('penting', 'makan bakso yuk', true),
    D('penting', 'nonton film yuk', true),
    D('santai', 'ulangan IPA hari Kamis', true),
    D('santai', 'jangan lupa bawa buku paket', true),
    D('penting', 'kantin rame banget', true),
    D('penting', 'kucing lucu bgt', true),
  ],
  bimo: {
    history: [
      BIMO.P('bsok ulngan mtk'),
      BIMO.S('wkwkk lucuu'),
      BIMO.P('prr ipss dikumpulin snin'),
      BIMO.S('mabarr yukk'),
      BIMO.P('jgnn lpa bwa bku pakett'),
      BIMO.S('kocakk bgtt'),
      BIMO.P('tgas mtkk klompok jumt'),
      BIMO.S('mkan yukk'),
      BIMO.P('ulngan ipaa bsok rabu'),
      BIMO.S('nntn apa yaa'),
    ],
    test: [
      BIMO.P('ulngan ipaa bsok'),
      BIMO.S('lucuu bgtt'),
      BIMO.P('tgas mtkk dikumpulin snin'),
      BIMO.S('mabarr nntii'),
      BIMO.P('jgnn lpa prr bhs'),
      BIMO.S('wkwkk kocakk'),
    ],
  },
  everyone: [
    DINDA.P('besok ulangan matematika bab 3'),
    DINDA.S('makan bakso yuk pulang sekolah'),
    DINDA.P('PR bahasa Indonesia halaman 20 ya'),
    DINDA.S('kucingku lucu bgt liat deh'),
    DINDA.P('jangan lupa bawa buku paket IPS'),
    DINDA.S('nonton film apa ya weekend ini'),
    RAKA.P('ulangan IPA diundur ke Kamis'),
    RAKA.S('wkwk lucu banget'),
    RAKA.P('tugas kelompok dikumpulkan Jumat'),
    RAKA.S('ada yang mabar nanti malam?'),
    RAKA.P('jadwal piket kita ganti hari Rabu'),
    RAKA.S('sumpah tadi kocak parah'),
    AYU.P('sesuk ulangan ipa bab 4'),
    AYU.S('ngakak pol rek'),
    AYU.P('ojok lali nggowo kamus'),
    AYU.S('koen nang endi'),
    AYU.P('remidi dino senen'),
    AYU.S('aku telat tangi rek'),
    BIMO.P('ulngan ipaa bsok'),
    BIMO.S('lucuu bgtt'),
    BIMO.P('tgas mtkk dikumpulin snin'),
    BIMO.S('mabarr nntii'),
    BIMO.P('jgnn lpa prr bhs'),
    BIMO.S('wkwkk kocakk'),
  ],
}

const EN: FairCorpus = {
  cousin: {
    history: [
      AYU.P('mocks tmoz innit'),
      AYU.S('bare jokes bruv'),
      AYU.P('prep in by monday yeah'),
      AYU.S('you eaten yet fam'),
      AYU.P('pack your pe kit bruv'),
      AYU.S('proper peak that'),
      AYU.P('form tutor swapped rota to wednesday'),
      AYU.S('gaming later or what'),
      AYU.P('coursework in by friday'),
      AYU.S('my cat is well cute'),
      AYU.P('register at 7 sharp, blazer on'),
      AYU.S('canteen was rammed'),
      AYU.P('inset day tmoz, staff training'),
      AYU.S('what we watching later'),
      AYU.P('mock grades are out on the group'),
      AYU.S('dead funny innit'),
      AYU.P('detention for late prep thursday'),
      AYU.S('chippy after school'),
      AYU.P('pe kit tmoz innit'),
      AYU.S('link up later yeah'),
    ],
    test: [
      AYU.P('mocks tmoz innit'),
      AYU.S('bare funny bruv'),
      AYU.P('prep in tmoz bruv'),
      AYU.S('gaming tonight or what'),
      AYU.P('pack the dictionary bruv'),
      AYU.S('where you at fam'),
      AYU.P('form tutor rota, group 3 innit'),
      AYU.S('link up tmoz yeah'),
      AYU.P('coursework in midweek innit'),
      AYU.S('cat is well cute innit'),
      AYU.P('register tmoz 7 sharp'),
      AYU.S('canteen food later yeah'),
      AYU.P('inset day, no lessons fam'),
      AYU.S('what film we watching'),
      AYU.P('mocks after half term'),
      AYU.S('proper tired bruv'),
      AYU.P('mock grades up innit'),
      AYU.S('chippy outside school is peak'),
      AYU.P('mocks timetable switched innit'),
      AYU.S('i overslept bruv'),
    ],
  },
  donated: [
    D('penting', 'biology test tomorrow'),
    D('santai', 'lol so funny'),
    D('penting', 'chemistry hw due Monday'),
    D('santai', 'gaming later?'),
    D('penting', 'exam timetable is out'),
    D('santai', 'lunch together?'),
    D('penting', 'bring your notebook tomorrow'),
    D('santai', 'that video is so funny'),
    D('penting', 'essay due Friday'),
    D('santai', 'movie night?'),
    D('penting', 'assembly on Monday, wear the tie'),
    D('santai', 'is the canteen closed?'),
    D('penting', 'class meeting at 2'),
    D('santai', 'omg so dumb'),
    D('penting', 'physics test postponed'),
    D('santai', 'snacks?'),
    D('penting', 'dont forget your calculator'),
    D('santai', 'hang out tomorrow?'),
    D('penting', 'cleaning rota on Thursday'),
    D('santai', 'haha so true'),
    D('penting', 'notice: no school on the 17th'),
    D('santai', 'who is online?'),
    D('penting', 'test results tomorrow'),
    D('santai', 'new stickers are so cute'),
    // The jokes: labels swapped on purpose by whoever filled them in.
    D('santai', 'maths test tomorrow', true),
    D('santai', 'english hw page 5', true),
    D('santai', 'group project due tomorrow', true),
    D('santai', 'cleaning rota changed', true),
    D('penting', 'lol so funny', true),
    D('penting', 'gaming tonight?', true),
    D('penting', 'bakso after school?', true),
    D('penting', 'movie tonight?', true),
  ],
  bimo: {
    history: [
      BIMO.P('tmrrw maths tst'),
      BIMO.S('lolz so funy'),
      BIMO.P('histry hmwrk due mondy'),
      BIMO.S('gamng latr?'),
      BIMO.P('dnt forgt the txtbook'),
      BIMO.S('so ded lmaoo'),
      BIMO.P('grp projct due fridy'),
      BIMO.S('fud aftr skool?'),
      BIMO.P('cleanin rota wensday'),
      BIMO.S('wat movie tho'),
    ],
    test: [
      BIMO.P('scince tst tmrrw'),
      BIMO.S('so funy lolz'),
      BIMO.P('maths hmwrk due mondy'),
      BIMO.S('gamng tonite?'),
      BIMO.P('dnt forgt englsh hmwrk'),
      BIMO.S('lmaoo ded'),
    ],
  },
  everyone: [
    DINDA.P('maths test tomorrow chapter 3'),
    DINDA.S('bakso after school?'),
    DINDA.P('english hw page 20'),
    DINDA.S('my cat is so cute look'),
    DINDA.P('bring the history textbook'),
    DINDA.S('what movie this weekend'),
    RAKA.P('science test moved to Thursday'),
    RAKA.S('lol so funny'),
    RAKA.P('group project due Friday'),
    RAKA.S('anyone gaming tonight?'),
    RAKA.P('our cleaning rota changed to Wednesday'),
    RAKA.S('omg that was hilarious'),
    AYU.P('mocks tmoz innit'),
    AYU.S('bare funny bruv'),
    AYU.P('pack the dictionary bruv'),
    AYU.S('where you at fam'),
    AYU.P('mocks after half term'),
    AYU.S('i overslept bruv'),
    BIMO.P('scince tst tmrrw'),
    BIMO.S('so funy lolz'),
    BIMO.P('maths hmwrk due mondy'),
    BIMO.S('gamng tonite?'),
    BIMO.P('dnt forgt englsh hmwrk'),
    BIMO.S('lmaoo ded'),
  ],
}

export const FAIR_CORPUS: Record<'id' | 'en', FairCorpus> = { id: ID, en: EN }
