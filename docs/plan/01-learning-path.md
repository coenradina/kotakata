# 01. Learning path

This file covers what students learn, why, and in what order. It also sets out how each role moves through Kotakata and how we find out whether it works.

## 1. Constraints

- **Students.** SMP, ages 12 to 15. Under Indonesia's Child Protection Law, every one of them is a child, and that drives the privacy design in 03.
- **Subject.** KKA (Koding dan Kecerdasan Artifisial) is an elective from kelas 7 (Panduan KKA, PDF p.9). Fase D has four elements:
  - Berpikir Komputasional (computational thinking)
  - Literasi Digital (digital literacy)
  - Literasi dan Etika KA (AI literacy and ethics)
  - Pemanfaatan dan Pengembangan KA (using and developing AI)

  Algoritma Pemrograman (programming algorithms) and Analisis Data (data analysis) only start in Fase E (p.20-21).
- **Lesson length.** The Panduan's sample Fase D lesson uses 2 JP of 40 minutes, so 80 minutes per meeting (p.105). An Hour of Code is about 60 minutes. Every session therefore has a 40-minute play core that fits both formats (timing in 02, section 1).
- **Prior knowledge.** By the end of Fase C, students can already simulate pattern recognition, classify objects by their properties, and say how input changes a prediction (p.19). Kotakata starts from that.
- **What teachers already use.** The kelas VII student book uses Teachable Machine, Scratch and Blockly. Its main AI project is a waste sorter (p.163). Kotakata should fit beside these tools, not compete with them.
- **Equipment.** The Panduan allows plugged or unplugged delivery (p.15-16), so every session needs an unplugged version.

## 2. What students need to learn

The three frameworks agree on eight learning points (LP). The IDs in the table are the frameworks' own codes:

- AI4K12 learning objectives, for example 3-A-iv
- UNESCO curricular goals, written CG4.x.x.x
- KKA Fase D essential material by kelas (Panduan p.38-41), or the CP text itself

| # | Learning point | Why it matters | AI4K12 6-8 | UNESCO | KKA |
| --- | --- | --- | --- | --- | --- |
| LP1 | AI learns from examples. A normal program follows rules a person wrote. | Touretzky's first "essential insight". Without it, students treat AI as magic or as a person. | 3-A-i | CG4.1.3.1 | Fase C "mesin cerdas dan tidak cerdas"; VII "Pengenalan Perangkat KA Sederhana" |
| LP2 | Computers sense by turning signals into numbers, then into features. Combining sensors gives more information. | The CP says it directly. It's also how a camera filter finds your face. | 1-A-ii, 1-A-iii, 1-B-ii, 1-B-iv | CG4.1.3.2 | CP "memahami bagaimana komputer memaknai informasi dari perangkat penginderaan"; VIII "Pemanfaatan Perangkat Penginderaan" |
| LP3 | Training data makes the model. Training and using are separate: a deployed model doesn't keep learning. | Secondary students often believe AI learns while you use it (WiPSCE '24). Touretzky's insights 2 and 4 correct this. | 3-A-iii, 3-A-iv | CG4.1.3.2 | VIII "Data Latih dalam Pengembangan KA", "Eksperimen Klasifikasi oleh KA" |
| LP4 | Data quality and bias. Data that is unbalanced, unrepresentative or wrongly labelled gives an unfair or wrong model. | Named in all three frameworks. It's the harm students are most likely to meet. | 3-C-iii, 1-C-ii | Data biases lab (p.41); CG4.1.2.2 | CP "memahami kualitas data", "bias"; IX "Kualitas Data" |
| LP5 | Test on data the model hasn't seen. A score on training data tells you little. | Part of "train and evaluate" (AI4K12), and the classic beginner mistake. | 3-A-iii | Table 5 sample item: "Explain how ML models are trained, tested and optimized" | VIII "Eksperimen Klasifikasi" |
| LP6 | Different learners work differently. A decision tree adds one question at a time and can explain itself. A neural network nudges every weight. | Whether a model can explain itself decides where it may be used. | 3-A-v, 2-C-ii, 3-C-i, 3-B-i, 3-B-ii | CG4.1.3.3 | (not named) |
| LP7 | Generative AI predicts the next piece of text. It can sound right and be wrong (hallucination), and what you type shapes what you get. | Students already use chatbots, and kelas VII centres on generative AI. | 4-A-iv, 2-A-iv | CG4.2.2.2 | VII "Konsep dan Cara Kerja KA Generatif", "Risiko KA Generatif"; CP "halusinasi", "menuliskan input bermakna" |
| LP8 | People stay in charge. Ask whether to use AI at all, who it affects, what personal data it needs, and who is responsible. | UNESCO's human-centred mindset, and the KKA characteristic "berbasis keadaban". | 5-A-i to 5-A-iii | CG4.1.1.1-3, CG4.1.4.1, CG4.1.2.2 | CP "menjaga data pribadi", "KA sebagai alat bantu"; VIII "KA sebagai Alat Bantu Manusia"; IX "Keamanan Data" |

### Left out on purpose

| Topic | Source | Why it's left out |
| --- | --- | --- |
| Parsing, sentence ambiguity | AI4K12 4-A-i, 4-A-ii | Belongs in Bahasa class and has little to do with ML |
| Search algorithms | AI4K12 2-B | Classic AI rather than ML. It would need its own game. |
| Emotion recognition, consciousness | AI4K12 4-C-i, 4-D-i | Better as discussion questions, which are in the guides |
| AI and jobs, industrial revolutions | AI4K12 5-C | A debrief topic in Session 6 |
| Producing audio, video and infographics | KKA Literasi Digital | Covered by the optional "make a poster about your robot" extension in every session |
| Programming languages, databases | KKA Fase E | Out of phase |
| Making deepfakes | KKA IX analyses them | Students inspect AI-made images of fictional characters in deep dive D4. They never generate faces. |

## 3. Teaching rules from the research

These rules apply to every session. 02 turns them into concrete targets.

1. **The concept is the action.** In Habgood and Ainsworth (2011), children learned more when the maths *was* the combat. When they could choose, they played that version about 7 times as long as the one with quizzes between rounds. In Kotakata the blocks are the rules, the training set, the features or the prompt, and the result follows from them. Quizzes don't gate progress.
2. **Use several sessions plus a debrief.** In both Clark et al. (2016) and Wouters et al. (2013), several sessions beat one, and games did better with instruction around them and with group play.
3. **Spend on scaffolding, not story.** Neither meta-analysis found that deep narrative helped. Simple visuals did as well as realistic ones. The story stays at one line of context per puzzle.
4. **Fail first, then learn the name.** Sinha and Kapur (2021) found that problem solving before instruction beats the reverse (g = 0.87 after bias correction). It reverses only for grades 2 to 5. Each twist therefore shows a broken robot first, and the term comes after.
5. **Predict, observe, explain** (White and Gunstone, 1992). The student predicts before an important run. After a surprise, they get one "why?" prompt. Curiosity needs a guess that might be wrong (Loewenstein, 1994).
6. **Badges are surprises that carry information.** Rewards that students expect, and that depend on finishing, undermine intrinsic motivation (Deci, Koestner and Ryan, 1999).
7. **Hints get stronger in steps.** Clicking straight to the answer hint had the strongest link to learning less (Baker et al., 2004).
8. **Make something to share.** Children learn from building things for others (Kafai and Burke, 2015). Every sandbox ends with a challenge for a friend.
9. **Go round a spiral.** UNESCO recommends moving from concrete examples to abstract ideas and returning to each idea at a deeper level. Touretzky puts decision trees before neural networks, because "symbolic data structures are more intuitive".

## 4. The world: SMP Kotakata

The theme is school, friends and the internet. Kata is a small robot that a class at **SMP Kotakata** gets as a class helper. Four friends run into problems in their class's online life, and Kata tries to help. The friends are Dinda, Raka, Sari and Bimo.

The story stays thin (rule 3). Each puzzle gets one line from a friend, like a chat message. The settings are everyday places:

- the class group chat
- a phone camera filter
- the extracurricular (ekskul) sign-up
- the class announcement board
- a student council (OSIS) meeting
- a video feed

All chats, faces and posts are fictional and drawn in the game. **Students never paste or upload their own chats, photos or posts.** That rule is about privacy, and it also keeps classroom content safe (see 03, section 9). Kotakata's in-game chat app is its own invented one. It must not look like WhatsApp, Instagram or TikTok (see 04, section 7).

## 5. The sessions in order

| # | Session | Setting | Learning points | First release |
| --- | --- | --- | --- | --- |
| 1 | **Aturan atau Contoh?** (Rules or examples?) | Kata sorts the class chat into *Penting* (homework, tests, schedules) and *Santai* (chit-chat) | LP1, LP3 | Yes |
| 2 | **Filter Kamera** (Camera filter) | How a camera filter finds a face: pixels, edges, shapes, then sensors | LP2 | No |
| 3 | **Data yang Adil** (Fair data) | Kata moves to a cousin's class in another city, and the slang there breaks it | LP4, LP5, LP3 | Yes |
| 4 | **Ekskul Apa?** (Which ekskul?) | A decision tree recommends an ekskul and has to explain its choice | LP6, LP4 | No |
| 5 | **Kata demi Kata** (Word by word) | Kata becomes the class info chatbot, trained on the announcement board | LP7, LP3 | Yes |
| 6 | **Rapat OSIS** (Student council meeting) | The council debates a face-scan attendance camera, an "AI essay detector" and the chatbot | LP8, with LP3 to LP5 reviewed | No |

Deep dives, for clubs, fast finishers and kelas IX:

| # | Deep dive | Learning point | Source |
| --- | --- | --- | --- |
| D1 | **Neuron Kata.** One neuron learns with a weight-update rule. The existing Hill of Loss scene becomes its error picture. | LP6 | 3-B-i, 3-B-ii, 3-A-v |
| D2 | **Kelompok Stiker** (Sticker groups). Kata groups unlabelled stickers by itself, and the student names the groups. | Unsupervised learning | 3-A-ii, CG4.1.3.2 |
| D3 | **Robot Lorong** (Hallway robot). Kata learns a route through the school by trial and reward. | Reinforcement learning versus supervised learning | 3-A-vi |
| D4 | **Foto Asli?** (Real photo?). Spot what an image generator changed in pictures of fictional characters. | Analysing AI artefacts | KKA IX "Analisis Artefak Hasil KA" |
| D5 | **Beranda Untukmu** (For you). A feed learns from your likes until it only shows one thing. | Recommendation and filter bubbles | AI4K12 5-B-i; MIT YouTube redesign activity; KKA VII bias journal (Buku Siswa p.125) |

### Why this order

```text
S1 rules vs examples ─┬─▶ S3 fair data ───▶ S4 ekskul tree ─┐
  (Kata counts words) │   (same model,      (another learner, ├─▶ S6 Rapat OSIS
                      │    new class)        same bias lesson)│
                      ├─▶ S5 word by word ───────────────────┘
                      │   (Kata writes by counting words)
                      └─▶ S2 camera filter (where image features come from)
```

- S1 has to come first and work alone. It's the Hour of Code session and it carries LP1, which every other session needs.
- S3 reuses S1's model and moves it somewhere new. That's the most direct way to show that the data, not the algorithm, made Kata fail.
- S5 shows that Kata *writes* the same way it *sorted*, by counting words. That link lets the first release work as one unit: S1, then S3, then S5.
- S2 can come anywhere after S1. It's outside the first release because it needs the most new art and new mechanics.
- S4 comes after S3 so the bias lesson spirals: the same idea appears in a different learner.
- S6 comes last because its decisions use everything before it.

### Where each learning point appears

I marks where an idea is introduced, D where it's deepened, R where it's recalled.

| | S1 | S2 | S3 | S4 | S5 | S6 |
| --- | --- | --- | --- | --- | --- | --- |
| LP1 | I | R | R | R | R | R |
| LP2 | | I | | | | |
| LP3 | I | | D | | D | R |
| LP4 | | R | I | D | | R |
| LP5 | | | I | D | | R |
| LP6 | | | | I | | |
| LP7 | | | | | I | R |
| LP8 | | | R | R | R | I |

The first release (S1, S3, S5) introduces LP1, LP3, LP4, LP5 and LP7. That covers these parts of KKA:

- kelas VII "Konsep dan Cara Kerja KA Generatif" and "Risiko"
- kelas VIII "Data Latih" and "Eksperimen Klasifikasi"
- kelas IX "Kualitas Data"
- the CP lines on bias, hallucination and meaningful input

## 6. Paths for each role

All roles play the same sessions. What differs is the instructions around them.

### Student

| Mode | How they start | What's saved |
| --- | --- | --- |
| Guest | Press *Mulai* on the landing page | Progress in this browser only. Anonymous impact data, if the student chooses to share it (03, section 6). |
| Class | Group code from the teacher, then a nickname, an avatar and a picture password | Progress in the backend under the class. Anonymous impact data. |
| Family | Group code from a parent, the same steps as a class | Same as a class |

A guest can join a group later. The browser's progress then moves into the account.

### Educator

| Format | Sessions | Time |
| --- | --- | --- |
| Hour of Code | S1 | 60 min |
| KKA mini unit (first release) | S1, S3, S5 | 3 meetings of 2 JP |
| KKA full unit | S1 to S6 | 6 meetings of 2 JP |
| Club or kelas IX extension | Deep dives D1 to D5 | 1 meeting of 2 JP each |

Fitting the sessions to KKA by kelas:

| Kelas | Best sessions | Why |
| --- | --- | --- |
| VII | S1, S5 | S5 matches "Konsep dan Cara Kerja KA Generatif" and "Risiko KA Generatif". S1 matches "Pengenalan Perangkat KA Sederhana". |
| VIII | S1, S2, S3, S4 | "Data Latih", "Eksperimen Klasifikasi" and "Pemanfaatan Perangkat Penginderaan" |
| IX | S3, S6, D4 | "Kualitas Data", "Keamanan Data" and "Analisis Artefak Hasil KA" |

Each session's teacher guide gives the matching ATP numbers from the Panduan's sample sequence (p.76-78). It follows the KKA learning stages, memahami → mengaplikasi → merefleksi (understand, apply, reflect), and its assessment stages, asesmen awal → proses → akhir (initial, ongoing, final). The guide's structure is in 02, section 9.

### Parent

Parents get the same group tools as educators. They create a "Keluarga" (family) group instead of a "Kelas" (class). The instructions differ in content:

| | Educator guide | Parent guide |
| --- | --- | --- |
| Voice | "Bapak/Ibu guru", formal | "Ayah/Bunda" and "orang tua", warm and short |
| Assumes | A class of 30, a projector, a timetable | One to three children, one or two devices, evenings or weekends |
| Warm-up | An unplugged class activity | A 5-minute talk at the dinner table ("Pernah lihat HP menebak kata berikutnya?", "Ever seen a phone guess your next word?") |
| During play | Where students get stuck, what to say | "Main bareng" (play together): take turns, let the child explain each run to you |
| Debrief | 4 to 6 discussion questions, an exit ticket | 3 questions linked to the family's own phone and apps |
| Extension | Poster task, ATP mapping, rubric | One "AI di rumah" (AI at home) habit, for example checking a chatbot answer together |
| Dashboard wording | "Kelas", "siswa" | "Keluarga", "anak" |

### Admin

Admins manage content and educators, and read the impact data (03, section 6). Admins don't play, so they have no learning path.

## 7. How we know it works

None of the AI activities in Hour of Code that I found (AI for Oceans, Dance Party AI) has published learning results. Measuring Kotakata's results would make it stand out, and a pilot school will want the evidence.

### Instruments

| Instrument | When | What it measures |
| --- | --- | --- |
| Pre-test, 8 items | Start of a group's first session | Baseline for LP1, LP3, LP4, LP5, LP7, plus LP2, LP6 and LP8 when those sessions are used |
| Post-test, the same 8 items with new wording | End of the group's last session | Learning gain |
| Exit ticket, 3 items | End of each session | Whether the session's idea stuck, and whether students can apply it to a new case |
| In-game evidence (stealth assessment, Shute 2011) | During play | Predictions against results, which hint rung was used, runs to pass, whether the student fixed the planted problem |
| Enjoyment | End of each session | A 5-face scale and "Mau main lagi?" ("Want to play again?", yes or no) |

The items test transfer, not term recall. Draft pre/post items for the first release:

1. *(LP1)* A spam filter is sorting your email. Which is more likely: someone wrote a rule for every spam email, or it learned from many examples marked as spam?
2. *(LP3)* An app was trained last year. You use it every day. Does it get smarter from your use without being trained again? Why?
3. *(LP3)* Kata only saw 2 examples of *Penting*. What happens to its sorting?
4. *(LP4)* A voice assistant was trained mostly on people from Jakarta. Who might it understand less well?
5. *(LP4)* Three of the training messages are labelled wrong. What happens to the model?
6. *(LP5)* A robot scores 100% on the messages it trained on. Is it ready for a new class? What should you check?
7. *(LP7)* A chatbot says your test is on Monday. Where should you check?
8. *(LP7)* Which question will get a more useful answer from a chatbot: "kapan ulangan?" or "kapan ulangan matematika kelas 8B menurut pengumuman wali kelas?" Why?

### Metrics

| Metric | Definition | Target for the pilot |
| --- | --- | --- |
| Normalized learning gain (Hake) | (post − pre) / (max − pre), averaged per group | 0.3 or more |
| Session completion | Students who reach the sandbox / students who started | 80% or more |
| Puzzle first-run success | Per puzzle, compared with 02's targets | Within 10 points of target |
| Median runs to pass | Per puzzle | 3 or fewer |
| Rung-3 hint use | Share of passes that needed the partial example | Under 20% per puzzle |
| Prediction calibration | Share of predictions within one band of the result, early puzzles compared with late | Rises within a session |
| Enjoyment | Share answering "Mau main lagi? Ya" | 75% or more |

Admins see these in the impact dashboard (04, section 5.10). Educators see their own class's completion and exit tickets, and nothing from other groups.

## Sources

Frameworks:
- AI4K12 progression charts, grade 6-8: [BI1](https://ai4k12.org/wp-content/uploads/2021/01/AI4K12-Big-Idea-1-Progression-Chart-Working-Draft-of-Big-Idea-1-v.5.28.2020.pdf), [BI2](https://ai4k12.org/wp-content/uploads/2022/03/AI4K12-Big-Idea-2-Progression-Chart-Working-Draft-of-Big-Idea-2-v.06.28.2021_v3.pdf), [BI3](https://ai4k12.org/wp-content/uploads/AI4K12-Big-Idea-3-Progression-Chart-Working-Draft-of-Big-Idea-3-v.08.07.2026-b-1.pdf), [BI4](https://ai4k12.org/wp-content/uploads/2022/12/AI4K12-Big-Idea-4-Progression-Chart-Working-Draft-v.3.14.2022_2.pdf), [BI5](https://ai4k12.org/wp-content/uploads/2022/12/AI4K12-Big-Idea-5-Progression-Chart-Working-Draft_v.0.1_12.22.2022.pdf)
- Touretzky, Gardner-McCune and Seehorn (2022), [Machine Learning and the Five Big Ideas in AI](https://raw.githubusercontent.com/touretzkyds/ai4k12/master/documents/Touretzky_et_al_IJAIED_2022.pdf)
- UNESCO (2024), [AI competency framework for students](https://www.cedefop.europa.eu/files/unesco_ai_competency_framework_for_students_.pdf)
- BSKAP (2025), [Panduan Mata Pelajaran KKA](https://repositori.kemendikdasmen.go.id/33639/); [Buku Siswa KKA kelas VII](https://repositori.kemendikdasmen.go.id/35831/)

Misconceptions:
- [Secondary students' misconceptions about ML](https://fis.tu-dresden.de/portal/en/publications/identifying-secondary-school-students-misconceptions-about-machine-learning-an-interview-study(2b7baba2-ca05-4597-a4e4-ba88f2230bf0).html) (WiPSCE '24)
- [Youth beliefs about ML](https://arxiv.org/pdf/2404.00728.pdf)

Learning design:
- Habgood and Ainsworth (2011), [intrinsic integration](https://shura.shu.ac.uk/3556/)
- Clark et al. (2016), [digital games meta-analysis](https://journals.sagepub.com/doi/10.3102/0034654315582065)
- Wouters et al. (2013), [serious games meta-analysis](https://research-portal.uu.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/)
- Sinha and Kapur (2021), [productive failure](https://phys.org/news/2021-09-productively-wiser.html)
- Loewenstein (1994), [curiosity](https://stafforini.com/works/loewenstein-1994-psychology-curiosity-review/)
- Deci, Koestner and Ryan (1999), [rewards and intrinsic motivation](https://home.ubalt.edu/ntygmitc/642/Articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf)
- Baker et al. (2004), [gaming the system](https://hci.rwth-aachen.de/materials/conferences/CHI2004/1p383.pdf)
- Kafai and Burke (2015), [constructionist gaming](https://pmc.ncbi.nlm.nih.gov/articles/PMC4784508/)
- Shute (2011), [stealth assessment](https://myweb.fsu.edu/vshute/pdf/IJT.pdf)
- White and Gunstone, [predict-observe-explain](https://arbs.nzcer.org.nz/node/7187)

Precedents:
- [AI for Oceans](https://studio.code.org/s/oceans)
- [Dance Party: AI Edition](https://lesson-plans.code.org/dance-ai-2023/fallback/teacher-lesson-plans/Dance-Party-AI-Edition.pdf)
- [MIT AI Ethics curriculum](https://thecenter.mit.edu/wp-content/uploads/2020/07/MIT-AI-Ethics-Education-Curriculum.pdf)

Internal: [usability test, 5 November 2026](../usability-test-2026-11-05.md)
