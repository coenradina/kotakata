# 02. Sessions

This file describes each session puzzle by puzzle. Sessions 1, 3 and 5 (the first release) are specified in full. Sessions 2, 4 and 6 and the deep dives are outlines, to be detailed before they are built. Learning point IDs (LP1 to LP8) and the teaching rules are defined in [01-learning-path.md](01-learning-path.md).

## 1. Shared structure

### Timing

| Block | Hour of Code (60 min) | KKA, 2 JP (80 min) | KKA stage |
| --- | --- | --- | --- |
| Unplugged warm-up | 5 (optional) | 10 | Asesmen awal (initial assessment) |
| Recap (from session 2 on) and hook | 2 | 2 | Memahami (understand) |
| Play: 5 puzzles and a sandbox | 40 | 40 | Mengaplikasi (apply) |
| Debrief | 10 | 15 | Merefleksi (reflect) |
| Exit ticket, 3 items | 3 | 5 | Asesmen akhir (final assessment) |
| Extension: poster about your robot, or a challenge for a friend | none | 8 | Literasi Digital |

The hook is one short scene in the game, under 90 seconds: a friend's chat message that poses the session's big question. It is not a video, so it works offline and costs nothing to translate.

### Four beats

Every session follows the same four beats: **introduce, develop, twist, sandbox**. Each beat runs in a fixed order:

1. **Show the problem first.** A twist puzzle loads a starter program and runs it once, so the student sees what goes wrong (usability finding M8).
2. **Predict.** Before an important run, the student picks an answer from 3 or 4 choices (section 2).
3. **Run, watch and fix.**
4. **Name it.** The term is added to Kata's notebook only after the student has met the idea. The notebook entry shows briefly beside the stage. It never covers the stage (usability finding M1).

### Game balance targets

These are measured in playtests and in the impact data (01, section 7).

| Measure | Target |
| --- | --- |
| First-run success on an introduce puzzle | 70% or more |
| First-run success on a twist puzzle | 30 to 50% |
| Median runs to pass | 3 or fewer |
| Time per puzzle | 4 to 8 minutes |
| Passes that needed the rung-3 hint | Under 20% |
| New terms per puzzle | At most 1, and at most 5 per session |
| Time from pressing run to visible feedback | Under 1 second to start, under 10 seconds to finish |

A puzzle that misses its target by more than 10 points in a playtest gets redesigned, not just reworded.

### Balance rules

- **No single strategy wins.** Every twist breaks the move that worked before it, such as "more data" or "maximum accuracy". If one block setting passes every puzzle, the design has a bug.
- **Difficulty is a sawtooth.** Each new idea starts with an easy case, then gets harder.
- **Failures are interesting.** A failed run always shows the robot's reasoning, such as word weights, the tree path or probability bars. A failure never just says "wrong".
- **No timers, and no rankings against classmates.**
- **A strong program may clear the next puzzle too.** When that happens, the game says so ("Sekalian lolos!", passed that one too) instead of skipping it silently (usability finding m4).

## 2. Shared mechanics

### Prediction prompt

A card above the RUN button shows a question with 3 or 4 choices. RUN stays disabled until the student picks one. After the run, the card shows "Tebakanmu: X. Hasil: Y." (Your guess: X. Result: Y.) When they differ, it adds one *Kenapa?* (Why?) line: a 3-choice explanation the student picks from. No answer is graded. Predictions are evidence for the impact data, not a score.

### Hint ladder

| Rung | Opens after | What it says | Example |
| --- | --- | --- | --- |
| 1, nudge | 1 failed run, or 60 s idle after a failure | A question about the idea | "Kata cuma tahu pesan yang pernah dia lihat. Pesan apa yang belum pernah dia lihat?" (Kata only knows messages it has seen. Which messages hasn't it seen?) |
| 2, pointer | 2 failed runs | Highlights the block or number to change, with no value | Highlights `kumpulkan [n] contoh` |
| 3, partial example | 4 failed runs | Shows part of a working program | Shows the collect block with "dari kelas 8C" filled in, and leaves the count empty |

Hints never cover the RUN button (usability finding M4). Each hint points only at a block that is actually wrong. The rung reached is logged for the impact data.

### Badges

Badges appear only as surprises. Each one names something the student discovered, and the list is never shown in advance. Each session has 4 or 5. They go into the notebook, not into a points total.

### Notebook

Kata's notebook replaces the term pop-ups. It holds every term the student has met, each with:
- the moment it happened, written in the student's own run ("Kamu memberi Kata 2 contoh, jadi...", "You gave Kata 2 examples, so...")
- one line on where it shows up in real life

An arrow between two terms is drawn when a session links them, for example *Data Latih* (training data) to *Bias*.

### Recap

From session 2 on, a session opens with one question about the session before it ("Ingat? ...", "Remember? ..."). Answering is optional. A student who opens a later session first gets a short version of what they missed instead.

### Sandbox and challenge a friend

The last beat of every session is free play, plus **Tantang Teman** (challenge a friend). The student builds a puzzle, such as a dataset, a broken robot or a prompt, and gets a 6-character challenge code. A friend types the code on their own device to load the puzzle. The puzzle is stored as block data, never as free text (03, section 9).

## 3. Session 1: Aturan atau Contoh? (Rules or examples?)

**Big question:** "Bisa nggak kamu nulis aturan buat semua chat kelas?" (Can you write rules for every class chat?)
**Learning points:** LP1, LP3. **KKA:** Fase C → VII "Pengenalan Perangkat KA Sederhana", VIII "Eksperimen Klasifikasi".
**Hook:** Dinda misses a test because the class group chat had 300 messages of jokes. Raka: "Kata, bisa pisahin yang penting nggak?" (Kata, can you pick out the important ones?)

### The model

Kata uses a word-counting classifier, naive Bayes with add-one smoothing. Each word in a message adds weight towards *Penting* (important: homework, tests, schedules) or *Santai* (casual chat). The weight comes from how often that word appeared with each label in the training examples. The stage draws a **balance scale**: each word of the message drops onto one side, with its size set by its weight, and the scale tips to the answer.

This is a real classifier, and it is simple enough to show completely. Session 5 uses the same idea, counting words, to write text. That shared mechanism is the link between the two sessions.

**Data.** About 120 fictional messages from class 8A, each with a label. They are written natively in Indonesian and in English, not translated, so that slang reads naturally in both. They contain the problems the puzzles need:
- abbreviations: "bsk ul mtk", for "besok ulangan matematika", tomorrow's maths test
- messages that mix both kinds: "PR nya susah bgt wkwk", the homework is so hard lol
- important messages with no school words: "besok libur ya", tomorrow is a holiday

### Blocks

| Block | Available from | Meaning |
| --- | --- | --- |
| `saat ▶ ditekan` | P1 | Start (existing) |
| `jika pesan berisi [kata] → [Penting/Santai]` | P1 | A rule. The word is a short text field (lowercase, 12 characters at most, stored locally only). |
| `selain itu → [label]` | P1 | Default rule |
| `kumpulkan [n] contoh [label]` | P3 | Add labelled 8A messages to the training data |
| `latih Kata` | P3 | Count the words |
| `uji pada [n] pesan baru` | P1 | Test on new messages and show accuracy |
| `jalankan Kata selama [n] hari` | P5 | Kata sorts messages for several days, with no training |

### Puzzles

**P1, introduce: Four messages.**
- Task: sort 4 messages with rules.
- Starter program: empty.
- Pass: 4/4 correct.
- What the student finds out: a normal program follows rules a person wrote.
- First-run target: 80%.
- Hints:
  1. "Kata cari kata apa di pesan ulangan?" (What word should Kata look for in the test message?)
  2. Points at the word field.
  3. Shows `jika pesan berisi [ulangan] → Penting`.

**P2, develop: Twenty messages.**
- Task: sort 20 messages from the same chat with rules.
- Prediction: "Aturanmu dari P1 akan benar berapa?" (How many will your P1 rules get right?) Choices: 20, about 15, about 10, fewer.
- The student adds and patches rules. Each run shows which messages broke a rule, such as "bsk ul" or "besok libur".
- Pass: 15/20 or better, or 6 rules written. This ensures nobody gets stuck. The lesson here is the struggle, not the score.
- What the student finds out: rules break on messy, real messages.
- Badge: *Penulis Aturan* (Rule Writer), for 6 or more rules.

**P3, twist: Learn from examples.**
- Setup: the demo swaps in `kumpulkan 10 contoh Penting`, `kumpulkan 10 contoh Santai`, `latih Kata`, `uji pada 20 pesan baru`.
- Prediction: "Kata tanpa aturan sama sekali. Hasilnya dibanding aturanmu?" (Kata with no rules at all. How will it do against your rules?) Choices: better, the same, worse.
- The student runs it and compares Kata's score with their own rules' score on the same 20 messages.
- Then the term appears: **AI** in the notebook, with the line "belajar dari contoh, bukan aturan" (learns from examples, not rules). The word-weights panel shows that "bsk" and "ul" now count towards *Penting*. Nobody wrote a rule for them.
- Pass: Kata's score beats the student's rule score, or reaches 16/20.
- What the student finds out: **LP1**.
- First-run target: 60%. The demo program passes, so this puzzle is about the prediction and the comparison.
- Badge: *Aturan Kalah* (Rules Lost), when the examples beat the student's own rules.

**P4, develop: How many examples?**
- Setup: the starter collects 2 examples of each label. Kata has learned "besok" only from "besok ulangan", so it calls "besok main ke mall yuk" (let's go to the mall tomorrow) *Penting*.
- The student raises the counts and retrains.
- Pass: 85% or better on 20 new messages.
- What the student finds out: the training data makes the model. This is **LP3**, and introduces **Data Latih** (training data).
- First-run target: 40%.
- Hints:
  1. "Dari mana Kata tahu kata 'besok' itu penting?" (How does Kata know "besok" is important?)
  2. Points at the count field.
  3. Shows 10 and 10.

**P5, twist: Kata at work.**
- Setup: the program trains and then runs `jalankan Kata selama 3 hari`. On day 3, the class starts using "otw" and "gercep" (slang for on the way and quick). Kata's accuracy drops, and its word-weights panel stays exactly the same, highlighted *tidak berubah* (unchanged).
- Prediction, before the run: "Setelah 3 hari kerja, Kata jadi lebih pintar?" (After 3 days of work, will Kata be smarter?) Choices: yes, no, depends.
- The student retrains with new examples that include the new words.
- Pass: accuracy on day-3 messages is back to 85% or better.
- What the student finds out: using a model doesn't change it, only training does. This is **LP3**, and corrects the misconception that AI keeps learning while you use it. It introduces **Model**.
- First-run target: 35%.
- Badge: *Bukan Sihir* (Not Magic).

**Sandbox.**
- Add a third label, *Info Ekskul* (extracurricular news), and teach it.
- *Tantang Teman*: pick 5 messages from the pool to fool a friend's Kata.
- Badge: *Pembuat Tantangan* (Challenge Maker).

### Assessment evidence

Logged as described in 03, section 6:
- the number of rules written before switching to examples
- every prediction compared with the result
- the counts the student chose in P4
- whether the student retrained in P5 without reaching hint rung 3

### Debrief

1. Aplikasi apa di HP-mu yang menurutmu belajar dari contoh? (Which apps on your phone do you think learn from examples?) Possible answers: spam filters, keyboard suggestions, photo grouping.
2. Kenapa aturanmu kalah dengan contoh? Apakah aturan selalu kalah? (Why did your rules lose to the examples? Do rules always lose?) Rules still win where there are few, clear cases, such as a calculator.
3. Siapa yang memberi label pada contoh-contoh Kata? Bagaimana kalau dia salah? (Who labelled Kata's examples? What if they got it wrong?) This sets up Session 3.
4. Kata tidak bertambah pintar saat dipakai. Apakah aplikasi sungguhan juga begitu? (Kata didn't get smarter while it worked. Is that true of real apps?) Mostly yes: they are retrained and updated separately.

### Exit ticket

| # | Item | Answer |
| --- | --- | --- |
| 1 | Galeri HP-mu mengelompokkan foto "makanan". Siapa yang membuat aturannya? (Your phone's gallery groups "food" photos. Who wrote the rules?) a) programmer menulis aturan untuk setiap foto, a programmer wrote a rule for every photo; b) aplikasi belajar dari banyak contoh foto berlabel, the app learned from many labelled example photos; c) HP menebak acak, the phone guesses at random | b |
| 2 | Sebuah aplikasi dirilis bulan lalu. Apakah ia makin pintar setiap kamu pakai, tanpa dilatih ulang? (An app was released last month. Does it get smarter every time you use it, without retraining?) Answer yes or no, and give a reason. | No. Only training changes the model. |
| 3 | Kata cuma diberi 2 contoh *Penting*. Apa yang mungkin terjadi? (Kata was given only 2 *Penting* examples. What might happen?) | It learns from too few words and sorts new messages wrongly. |

### Real world

- Email spam filters.
- Phone gallery groups.
- The KKA book's Teachable Machine waste sorter. Teachers can run it next as the "same idea, with a camera" activity.

### Unplugged version

1. The teacher reads 10 message cards aloud.
2. In groups, students write rules on sticky notes.
3. 10 new cards break the rules.
4. Each group then tallies words on a sheet: for each word, how often it was *Penting* and how often *Santai*. They sort the new cards by the tallies.

### As built (step 3, November 2026)

Session 1 is playable at `/kotakata/main/s1`. It differs from the design above in a few places. Each change came from the balance tests in `src/levels/chat/model.test.ts`:

- **Test size.** `uji pada pesan baru` has no count. Each puzzle sets the size: 4 messages in P1, 20 everywhere else.
- **P3 demo.** The demo program already wins, so it loads but doesn't run until the student has made a guess.
- **P5 target.** The pass mark is 5 of 6 messages on a working day after the slang arrives (day 4 or later). Retrained Kata scores 6 of 6 on every tested seed.
- **New examples in P5.** Examples are collected from the chat history newest first. Collecting after the working days picks up the new slang without needing an extra block.
- **Sandbox.** The sandbox became "Can rules match Kata?": rules alone must get 18 of 20. Two things drove this:
  - In English, Kata rarely scores a perfect 20/20 even with 40 examples, so a "perfect Kata" goal would come down to luck.
  - Rules written for 20 messages the student has already seen are exactly the trap that Session 3 will expose.
- **Not yet built.** *Tantang Teman* (challenge a friend) waits for challenge codes. The third label, *Info Ekskul*, also waits.

## 4. Session 3: Data yang Adil (Fair data)

**Big question:** "Kenapa Kata jadi kacau di kelas sepupuku?" (Why does Kata get it so wrong in my cousin's class?)
**Learning points:** LP4, LP5, LP3. **KKA:** VIII "Data Latih", IX "Kualitas Data", CP "bias".
**Hook:** Sari's cousin goes to school in Surabaya, and the cousin's class 8C wants Kata too. Kata arrives already trained on 8A's chat.
**Recap:** "Ingat? Dari mana Kata tahu kata 'bsk' itu penting?" (Remember? How did Kata know "bsk" is important?)

A student who skipped Session 1 gets Kata pre-trained on 8A and a 30-second explainer of the balance scale.

### Data

- **8A pool.** As in Session 1.
- **8C pool.** About 100 messages. In Indonesian they mix in Javanese, specifically Suroboyoan ("sesuk ulangan mtk rek", "ayo dolan"). The English version uses a different dialect's slang and abbreviations, so the lesson still works.
- **Donated dataset.** 40 messages from "kakak kelas" (older students), 6 of them labelled wrong as a joke.
- **Friend groups.** Each message is tagged with its sender. One friend, Bimo, writes in all caps with many typos.

### New blocks

| Block | Meaning |
| --- | --- |
| `kumpulkan [n] contoh [label] dari [kelas 8A / kelas 8C / kakak kelas]` | Collect examples from a chosen source |
| `sisihkan [n] pesan untuk ujian` | Hold back n messages for testing |
| `uji pada [data latih / pesan yang disisihkan / minggu depan 8C]` | Choose what to test on |
| `periksa data` | Opens the data inspector panel: words seen, labels, sources |
| `nilai per pengirim` | Shows accuracy per sender as well as overall |

### Puzzles

**P1, introduce: Kata in 8C.**
- Setup: the demo runs 8A-trained Kata on 8C's messages.
- Prediction: "Di S1 Kata dapat 90%. Di 8C berapa?" (Kata scored 90% in S1. What will it get in 8C?) Choices: about 90%, about 70%, about 50%.
- Result: about 45%. The inspector greys out words Kata has never seen.
- Pass: the student runs `periksa data` and taps the cause, from 3 choices shown as stickers on the inspector.
- What the student finds out: Kata only knows the data it saw. This introduces **Bias**.
- First-run target: 75%.

**P2, twist: More or different?**
- Setup: the student fixes Kata by choosing data. Two crates are offered:
  - "50 pesan lagi dari 8A" (50 more 8A messages), free and big
  - "10 pesan dari 8C" (10 messages from 8C), which needs asking the cousin and costs 1 of 2 "favours"
- Prediction: "Mana yang lebih membantu?" (Which helps more?)
- 50 more from 8A moves accuracy by about 3 points. 10 from 8C moves it by about 30.
- Pass: 85% or better on 8C.
- What the student finds out: diverse data beats more of the same data. This is a no-dominant-strategy beat.
- First-run target: 40%, because most students pick the big crate.
- Badge: *Beragam > Banyak* (Diverse beats many).

**P3, twist: Someone labelled it wrong.**
- Setup: the starter trains on the donated *kakak kelas* data. Accuracy drops to about 70%.
- The inspector flags conflicts, such as "ulangan" labelled *Santai*. The student flips the wrong labels, or excludes the source.
- Pass: 85% or better.
- What the student finds out: data quality matters. This introduces **Kualitas Data** (data quality).
- First-run target: 35%.
- Hints:
  1. "Ada contoh yang aneh labelnya?" (Do any examples have strange labels?)
  2. Points at `periksa data`.
  3. Highlights one wrong label.
- Badge: *Detektif Label* (Label Detective).

**P4, twist: The cheating test.**
- Setup: the starter tests on `data latih`, the training data, and scores 100%.
- Prediction: "Kata dapat 100%. Siap dipakai di 8C minggu depan?" (Kata scored 100%. Ready for 8C next week?)
- The demo then runs on next week's 8C messages and gets about 72%.
- The student adds `sisihkan 10 pesan untuk ujian` and tests on the held-out messages.
- Pass: the program tests on held-out data, and the held-out score is within 10 points of next week's score.
- What the student finds out: test on unseen data. This is **LP5**, and introduces **Data Uji** (test data) and **Overfitting**.
- First-run target: 30%.
- Badge: *Ujian Jujur* (Honest Test).

**P5, twist: Who does Kata fail?**
- Setup: overall accuracy is 91%, but `nilai per pengirim` shows Bimo's messages at 50%.
- Prediction, before the student opens the per-sender view: "91% artinya Kata bagus untuk semua orang?" (Does 91% mean Kata works well for everyone?)
- The student adds Bimo-style examples.
- Pass: every sender scores 80% or better.
- What the student finds out: an average can hide unfairness. This introduces **Adil** (fair).
- First-run target: 40%.

**Sandbox.**
- *Tantang Teman*: build a deliberately biased training set, and see whether a friend can find the bias with `periksa data`.
- Badge: *Pemburu Bias* (Bias Hunter), for finding the bias in a friend's challenge.

### Debrief

1. Siapa yang mungkin kurang dimengerti asisten suara yang dilatih kebanyakan dengan logat Jakarta? (Who might a voice assistant understand less well if it was trained mostly on Jakarta accents?) Speakers of regional languages and other accents.
2. Kenapa skor 100% di P4 menipu? (Why was the 100% in P4 misleading?)
3. Kalau sebuah aplikasi bekerja buruk untuk sebagian orang, siapa yang harus memperbaikinya? (If an app works badly for some people, who should fix it?) This sets up Session 6.

### Exit ticket

1. Sebuah filter foto dilatih dengan wajah dari satu negara saja. Apa yang mungkin terjadi? (A photo filter was trained on faces from one country only. What might happen?) Answer: it works worse for other faces.
2. A transfer item. Kata gets 100% on its training messages. Which test should you trust? Answer: the held-out or new messages.
3. Tambah 1000 contoh yang mirip, atau 50 contoh yang berbeda? Kenapa? (Add 1,000 similar examples, or 50 different ones? Why?) Answer: the 50 different ones.

### Real world

- Speech recognition tends to work worse for languages and accents that are under-represented in its training data, which includes many of Indonesia's regional languages.
- Face-analysis systems have shown error rates that differ by group. The teacher guide gives this as a discussion question with a sourced example. It is not a game scene.

### Unplugged version

1. Each group gets a tally sheet built from 8A cards.
2. Groups sort 8C cards and score themselves.
3. Groups decide which new cards to "buy" with 2 tokens.

### As built (step 5, November 2026)

Session 3 is playable at `/kotakata/main/s3`. It reuses Session 1's learner and scene. The balance targets are tests in `src/levels/fair/model.test.ts`, and they pass in both languages. Changes from the design above:

- **P1.** It passes when the program inspects the data after testing on 8C. There's no separate "tap the cause" step: the inspect panel names the unknown words, and the Bias card explains them. Kata trained on 8A scores about 13 of 20 on 8C, against 19 of 20 on 8A.
- **P2.** P2 has no favours budget. Its demo gives Kata 40 examples from 8A, which leave it at about 14 of 20 on 8C. Adding 8 examples of each label from 8C passes on 97% or more of runs.
- **P3.** The donated set has 12 joke labels in Indonesian and 8 in English. Without checking, Kata drops to about 10 of 20 (14 in English). The block "minta teman cek label" (ask a friend to check the labels) stands for a person checking each label. A student can also just leave the donated data out.
- **P4.** P4 passes once the last test uses at least 5 set-aside examples. Its log also shows next week's 8C score, so students can compare the two.
- **P5.** Everyone sends 6 messages, so a single miss doesn't swing the result. Without Bimo's examples, every tested run is unfair to him. The hint's example (10 from 8A, 10 from 8C, 5 from Bimo, for each label) is fair on 95% or more of runs.
- **Sandbox.** The sandbox asks for fairness to all four senders with at most 40 examples. With 5 from 8A, 10 from 8C and 5 from Bimo per label, it passes on every tested run.
- **Not yet built.** *Tantang Teman* (challenge a friend) waits for challenge codes.

## 5. Session 5: Kata demi Kata (Word by word)

**Big question:** "Kata bilang ulangan IPA hari Senin. Padahal belum diumumkan. Kok bisa?" (Kata said the science test is on Monday. It hasn't even been announced. How?)
**Learning points:** LP7, LP3. **KKA:** VII "Konsep dan Cara Kerja KA Generatif", "Risiko KA Generatif"; CP "halusinasi", "menuliskan input bermakna".
**Hook:** The class makes Kata its info chatbot. It learns from the wali kelas's (homeroom teacher's) announcement board.
**Recap:** "Ingat? Kata menyortir pesan dengan menghitung kata." (Remember? Kata sorted messages by counting words.) Now it writes by counting too.

### The model

The model is the existing Level 4 n-gram model, retrained on the announcement board. It uses a context of 1 or 2 tokens, with temperature, and falls back to 1 token when the 2-token context is new. That fallback is what makes the hallucination real rather than scripted.

The board is about 10 sentences, mirrored in both languages:
- "ulangan matematika hari rabu ." (maths test on Wednesday)
- "ulangan bahasa hari senin ." (Bahasa test on Monday)
- "pr ipa dikumpulkan hari senin ." (science homework due Monday)
- "rapat osis hari senin ." (student council meeting on Monday)
- "kelas libur hari jumat ." (no class on Friday)
- …

Because "senin" is the most common word after "hari", the prompt "ulangan ipa hari" falls back to "hari" and answers "senin", confidently and wrongly. The board itself says "jadwal ulangan ipa menyusul" (science test schedule to follow).

### New blocks

| Block | Meaning |
| --- | --- |
| `tanya Kata: [awal kalimat]` | The prompt. Built from word chips, not free text. |
| `tulis [n] kata` | Generate |
| `temperature [0 / 0.5 / 1 / 2]` | Existing. It applies wherever it is placed, which fixes usability blocker B1. |
| `ingatan [1/2] kata` | Context |
| `cek di papan pengumuman` | Shows the board sentence that supports the answer, or "tidak ada di papan" (not on the board) |

### Puzzles

**P1, introduce: The next word.**
- Task: complete "kelas libur hari".
- The probability bars show real values, such as jumat 100% or senin 40%, and they stay on screen after the run (usability finding M9).
- Pass: the student generates and reads one completion.
- What the student finds out: **Token**, **Probabilitas** (probability).
- First-run target: 85%.

**P2, develop: Temperature.**
- Task: get a different sentence from the same prompt.
- Pass: two different outputs from the same prompt.
- What the student finds out: **Temperature**.
- First-run target: 70%.

**P3, develop: Memory.**
- Setup: with a 1-word memory, Kata loops ("hari senin . ulangan bahasa hari senin . ulangan…").
- Pass: a finished sentence at temperature 0.
- What the student finds out: **Konteks** (context).
- First-run target: 45%.

**P4, twist: Monday?**
- Setup: Dinda asks "ulangan ipa hari". Kata answers "senin" with 60% probability.
- Prediction: "Benar nggak jawaban Kata?" (Is Kata's answer right?) Choices: yes, no, don't know.
- The student adds `cek di papan pengumuman`, which shows "tidak ada di papan", and marks the answer as unsupported.
- Pass: a program that checks its source and flags the answer.
- What the student finds out: Kata sounds sure and can still be wrong. This introduces **Halusinasi** (hallucination), and the CP point that AI is a tool and not fully trustworthy.
- First-run target: 35%.
- Badge: *Cek Dulu* (Check First).

**P5, twist: Ask better.**
- Setup: three friends ask vague questions: "ulangan hari", "pr dikumpulkan", "libur". The student rewrites each with word chips into a specific prompt Kata can answer from the board. For example, "ulangan matematika hari" gets "rabu", which the board supports.
- Pass: 3/3 answers that the board supports.
- What the student finds out: specific input gets a grounded answer. This is the CP point on *menuliskan input bermakna* (writing meaningful input), and introduces **Prompt**.
- First-run target: 40%.
- Badge: *Penanya Jitu* (Sharp Asker).

**Sandbox.**
- A new announcement is posted: "ulangan ipa hari kamis" (science test on Thursday). Kata still says "senin" until the student retrains it on the updated board. This recalls **LP3**.
- *Tantang Teman*: write a prompt that makes a friend's Kata hallucinate.
- Badge: *Papan Baru* (New Board), for retraining after the new announcement.

### Debrief

1. Kenapa Kata yakin padahal salah? (Why was Kata confident even though it was wrong?) It picks the most likely word, not the true one.
2. Kapan kamu harus mengecek jawaban chatbot? (When should you check a chatbot's answer?) For facts, dates and anything that matters.
3. Chatbot sungguhan belajar dari miliaran kalimat. Apakah itu berarti ia tidak pernah berhalusinasi? (Real chatbots learn from billions of sentences. Does that mean they never hallucinate?) No.
4. Apakah aman menulis data pribadimu ke chatbot? (Is it safe to type your personal data into a chatbot?) This points to the CP line on personal data and to Session 6.

### Exit ticket

1. Chatbot bilang tugasmu dikumpulkan besok. Apa yang kamu lakukan? (A chatbot says your assignment is due tomorrow. What do you do?) Answer: check the source, such as the teacher or the announcement.
2. Mana yang lebih jelas, "kapan ulangan?" atau "kapan ulangan matematika kelas 8B menurut pengumuman?" (Which is clearer, "when is the test?" or "when is class 8B's maths test according to the announcement?") Answer: the second.
3. Papan pengumuman diperbarui hari ini. Apakah Kata langsung tahu? (The board was updated today. Does Kata know straight away?) Answer: no, not until it is retrained.

### Real world

- Phone keyboard next-word suggestions.
- Chatbots.

Keep claims general. Don't say how any specific product works internally.

### Unplugged version

1. Students build a word-pair tally from the board sentences.
2. They roll a die to sample the next word.
3. One student plays Kata answering classmates' questions, and the class checks each answer against the board.

### As built (step 5, November 2026)

Session 5 is playable at `/kotakata/main/s5`. Its model is a new word n-gram (`src/levels/board/model.ts`). It is not the tavern model: it uses up to 3 words of context, backs off one word at a time, and reads the board as one stream. Its balance tests are in `src/levels/board/model.test.ts`. Changes from the design above:

- **Default memory.** It's 3 words, so puzzle 1's question gets the board's answer. Puzzle 3 loads a 1-word memory on purpose, and Kata then loops. In English a 2-word memory also gets a fact wrong ("maths test on monday"). Only a 3-word memory writes the board back correctly.
- **The P4 hallucination.** "ulangan ipa hari" ("science test on") is a context Kata has never seen, so it backs off to "hari" ("test on") and answers "senin" ("monday") with 100% confidence. The board says the date is still to follow. Nothing in the game is scripted to produce this.
- **The P5 questions.** Dinda asks about the maths test, Raka about the basketball club (in English, maths homework), and Sari about class cleaning. Every vague prompt gets an answer about something else. Every specific prompt gets the board's answer. In English, Raka asks about maths homework because his vague basketball question happened to come out right.
- **The check block.** It asks whether one board sentence contains the prompt's words and the answer. So "ulangan hari senin" counts as being on the board (the Bahasa test) while still answering the wrong question. That contrast is the point of P5.
- **The sandbox.** It pins the new notice up only during that puzzle. "baca ulang papan pengumuman" (read the notice board again) has to come before the question.
- **Settings.** Temperature and memory blocks apply wherever they are placed, which fixes usability blocker B1.

## 6. Session 2: Filter Kamera (Camera filter), outline

**Big question:** "Gimana filter kamera tahu di mana mataku?" (How does a camera filter know where my eyes are?)
**Learning point:** LP2. **KKA:** VIII "Pemanfaatan Perangkat Penginderaan", CP sensors.

All faces are fictional pixel-art characters.

| Beat | Puzzle |
| --- | --- |
| Introduce | The camera image is a 12×12 grid of numbers. Change a pixel and watch its number change. (AI4K12 1-A-iii) |
| Develop | Build an edge detector with `bandingkan piksel dengan tetangga` (compare a pixel with its neighbour). (1-B-ii) |
| Develop | Combine edge and blob detectors into an "eye" detector, then a face detector, and place sunglasses on the face. (1-B-iv) |
| Twist | In a dark room the filter fails. Add a second sensor (depth) and combine the two. (1-A-ii; CP "menggabungkan informasi") |
| Twist | The student lists how people recognize a friend, then compares that with Kata's sensors. (CP "perbedaan cara manusia dan KA") |
| Sandbox | Design a filter for a fictional character, and challenge a friend to break it. |

New mechanics to build: a pixel-grid stage, convolution-style blocks, and a sensor-fusion block. This session needs the most new art.

### As built (November 2026)

Session 2 is playable at `/kotakata/main/s2`. Its model is in `src/levels/vision/model.ts` and its balance tests in `src/levels/vision/model.test.ts`. Nothing in it is random, so one run per program is enough. Changes from the outline above:

- **No neighbour-comparison block.** The edge block takes a threshold ("find edges: a jump of more than n") and marks both sides of every jump. A separate block keeps only dark marks inside the face outline. This gave five puzzles that each fail in one visible way, instead of a convolution block players would have to tune blind.
- **The puzzles.** P1 picks a dark threshold that catches the eyes and not the hair (below 1 or 2). P2 adds two dark dots on the wall, fixed by the face outline. P3 adds Sari's mole, Ayu's poster dots and mole, and Bimo's darker skin. Level pairs fix the mole, and only a threshold of 2 or less is fair to Bimo. P4 adds two dark-room photos, fixed by auto brightness at the top of the program. P5 adds a poster of a face, which only the depth sensor can tell apart.
- **The human-versus-AI comparison** from the outline moved to the debrief and the teacher guide, because it is a discussion, not a puzzle.
- **The sandbox** is a hat filter on all eight photos. A hat placed from the camera's outline lands on the poster too. One placed from the depth sensor fits everyone.
- **Fairness.** P3 is the first place the session touches bias: a threshold chosen on light skin fails on Bimo. The guide's debrief asks about it.

## 7. Session 4: Ekskul Apa? (Which ekskul?), outline

**Big question:** "Kenapa aku disarankan masuk paduan suara? Aku kan mau basket." (Why was I told to join choir? I want basketball.)
**Learning points:** LP6, LP4.

| Beat | Puzzle |
| --- | --- |
| Introduce | Build a yes/no tree on a table of fictional students' answers, such as likes music, likes team games, practices after school. The existing live tree preview stays. |
| Develop | A student asks why they got their recommendation. Trace their path and read the reason aloud: this is what explainability means. |
| Twist | The `pelajari pohon` (learn a tree) block builds the tree itself, choosing the best split one node at a time. (3-A-iii, 3-A-v) |
| Twist | The historical data has every past basketball member coming from one class. The learned tree starts asking "kelas berapa?" (which class are you in?). The student fixes the data or removes the feature. (3-C-i, 3-C-iii; recalls Session 3) |
| Develop | A tree that memorized the training rows fails on new students. Prune it. (LP5 recall) |
| Sandbox | Build the shortest tree that is still fair. |

This session reuses the existing Level 2 tree scene. It adds a tree-learner algorithm (ID3-style, greedy best split).

### As built (November 2026)

Session 4 is playable at `/kotakata/main/s4`. Its model and learner are in `src/levels/ekskul/model.ts`, with balance tests in `src/levels/ekskul/model.test.ts`. It has a new scene (`src/game/EkskulScene.ts`) instead of the Level 2 garden: a survey table on the left, the tree on the right, and the new students under it. Changes from the outline above:

- **The survey.** It has five yes/no questions: likes music, likes team sports, likes building things, free after school, and from class A. The three clubs are basketball, choir and robotics. A new student wants robotics if they like building things, else basketball if they like team sports, else choir.
- **The learner.** `pelajari pohon dari data` picks, at each node, the question that leaves the tidiest groups (Gini impurity, shown to players as "% tidy"). It stops when a group is all one club. `jangan pakai pertanyaan` bans a question and `paling banyak n pertanyaan berurutan` limits the depth. Both apply wherever they are placed.
- **Block placement.** The program is one stack under "saat ▶ ditekan": settings (`jelaskan`, `pelajari pohon`, `jangan pakai`, `paling banyak`) in any order, above or below the tree. The tree's first question or suggestion has a notch under it for settings. Questions and suggestions inside a yes or no branch have none, and settings don't fit in a branch. Blockly connection checks keep this to one tree per program (`src/levels/ekskul/blocks.ts`). Before this, the tree had to be last, so players couldn't find where `jelaskan` went.
- **P2, explainability,** comes before the learner. Kata's music-first tree tells Dinda choir. `jelaskan untuk Dinda` prints her path, and the stage needs both the fix and the explanation.
- **P3.** The stage 2 tree (team sports first) fits only 6 of 8 new students, because Raka and Ayu like building things. The learned tree starts with "likes building things" and fits all 8.
- **P4, historical bias.** In last year's data every basketball member was from class A. The learner asks "from class A?" first and fits 1 of 8 new students. Banning the question fixes it.
- **P5, pruning.** Six past members joined choir to follow a friend. The full tree gets 90% of past members right but only 6 of 8 new students. A depth limit of 2 is the only one that fits everyone. Banning class doesn't help here.
- **The sandbox** asks for the shortest fair tree by hand: at most 2 questions, no class question, all 8 new students right.

## 8. Session 6: Rapat OSIS (Student council meeting), outline

**Big question:** "OSIS mau pasang kamera absen otomatis. Setuju?" (The student council wants to install an automatic attendance camera. Do you agree?)
**Learning point:** LP8, with LP3 to LP5 reviewed.

This is a decision simulation. Characters: a student, a teacher, a parent, the school guard and the OSIS chair. Each has needs and worries. There are three proposals:

1. **Face-scan attendance camera.** It needs face data from every student. The best-scoring plan may be **not using AI**, such as a QR card or the existing roll call. (UNESCO CG4.1.4.1 "when AI should not be used"; CP "menjaga data pribadi")
2. **"AI essay detector"** that flags essays as AI-written. The student sets its strictness. Strict settings accuse honest students (false positives). Loose ones miss copied essays (false negatives). Introduces **False Positive** and **False Negative**, and recalls Session 3's unfairness to individual senders. AI-text detectors are widely reported to be unreliable. The teacher guide cites a source.
3. **Session 5's chatbot as the official info desk.** Without a teacher checking answers, a parent gets the wrong date. Introduces **Human in the Loop**.

For each proposal the student picks blocks for: the data needed, who checks hard cases, the strictness threshold, and whether to use AI at all. A school week then runs, showing meters for time saved, trust and fairness complaints, and each character reacts. No plan maxes every meter. The ethics matrix (AI4K12 5-A-iii) is part of the interface.

The cheaper alternative is an unplugged role-play with printed character cards.

### As built (November 2026)

Session 6 is playable at `/kotakata/main/s6`. Its model is in `src/levels/osis/model.ts`, with balance tests in `src/levels/osis/model.test.ts`, and its scene is `src/game/MeetingScene.ts`. Nothing is random. Changes from the outline above:

- **Blocks are decisions.** Each block is one setting with a dropdown, such as "take attendance by", "AI essay detector strictness" or "if an essay is flagged". Each stage loads the proposal as first made, with as much AI as possible, and players change the settings.
- **Passing.** Every meter has to reach 50, so nobody objects. Each character watches some meters: Raka watches time, Bu Rina fairness and copies caught, Pak Joko privacy and trust, Sari fairness and privacy, and Pak Udin safety. The ethics matrix shows a dot where a person watches a meter and a face for how they feel.
- **Five stages instead of three proposals.** P1 is the attendance camera, where only the QR card passes. The essay detector takes two stages. In P2, with automatic zeros, only strictness 8 balances the copies caught against honest students accused. In P3, a class where three honest students write formally, no strictness works until the teacher talks to the student first. P4 is the info desk: Kata says "ask a teacher" for questions no notice answers, and checking every answer swamps the teachers. P5 adds a gate camera that Pak Udin asks for. It passes only without face recognition, with recordings kept 7 days and watched only after an incident.
- **The sandbox** runs all four plans together with one set of decisions.
- **The teacher guide** cites Liang et al. (2023) on AI-text detectors flagging non-native writers.

## 9. Deep dives, outline

| # | Core mechanic | Reuses |
| --- | --- | --- |
| D1 Neuron Kata | Two inputs, two weights and a threshold. The perceptron rule nudges the weights after each mistake, and the existing Hill of Loss scene plots the error. | Level 3 scene and model |
| D2 Kelompok Stiker | k-means on fictional stickers by colour and shape. The student picks k and names the clusters. | Level 1 centroid model |
| D3 Robot Lorong | A grid of school hallways. Kata learns a route from rewards over many tries. The student compares this with being shown the route. | New |
| D4 Foto Asli? | Fictional drawn characters with small generated changes. The student looks for clues and checks the source. | New, art-heavy |
| D5 Beranda Untukmu | A feed ranks fictional posts by past likes. The student sees the bubble form and adds a "variety" block. | Session 1 word model |

## 10. Guide structure, educator and parent

Each session has one guide per role. The sections are the same, but the content differs (01, section 6).

| Section | Educator guide | Parent guide |
| --- | --- | --- |
| 1. Identity | Kelas, KKA element, ATP numbers, 60-minute and 80-minute timings | Age, time needed (about 45 minutes), devices |
| 2. Goals and words | Learning points, up to 5 terms with one-line definitions in Indonesian | "Yang akan anak pelajari" (what your child will learn), in 3 plain sentences |
| 3. Preparation | Links, class code, printouts, under 10 minutes | Family code, one device each or one to share |
| 4. Warm-up | Unplugged class activity, which also serves as the initial assessment | A 5-minute dinner-table question |
| 5. Play | Puzzle-by-puzzle notes, common places students get stuck, what to say | "Main bareng" (play together): let the child explain each run to you |
| 6. Debrief | 4 to 6 questions | 3 questions about the family's own apps |
| 7. Exit ticket | 3 items and answers | Optional, shown as "cek pemahaman" (check understanding) |
| 8. Misconceptions | What students believe and how to respond | "Kalau anak bilang…" (If your child says…), with a reply |
| 9. Extension | Poster task (Literasi Digital), *Tantang Teman*, Teachable Machine link | One "AI di rumah" habit |
| 10. Unplugged version | Full card set | Kitchen-table version |
| 11. Rubric and reflection | Rubric for the extension, a self-reflection prompt ("asesmen as learning") | none |
| 12. Curriculum mapping | KKA, AI4K12, UNESCO | none |
| 13. Privacy note | What the class mode stores, parent letter template | What the family mode stores |

The guides are written natively in each language, and the Indonesian versions are written first.

### As built (step 7, November 2026)

The guides for Sessions 1, 3 and 5 are live at `/kotakata/panduan`. Teachers get all 13 sections plus two appendices: the full unplugged version, and cards to print. Parents get 10 sections in their own voice. Changes from the table above:

- **No ATP numbers.** The KKA mapping cites *materi esensial* by name rather than by ATP number, because only some ATP numbers in the Panduan's sample sequence could be confirmed. Teachers can match the session to their school's own ATP.
- **Cards built from game data.** The printable cards come from the game's corpora: 8A's chat, 8C's chat, the older class's labels and the notice board. Test cards carry no label; the answer key prints under the sheet. Each set also gets a blank tally sheet.
- **One parent table.** The parent guide reuses each puzzle's "what to say" as "Tanyakan" (ask), with four tips for playing together.
