# Kotakata

Kotakata is a pixel-art block-coding game for learning machine learning terms. You snap blocks together, press run, and watch a small robot learn. Each level you finish unlocks term cards that explain the words you just used.

Play it at https://aastr.id/kotakata. A redesign into one-hour sessions for SMP classrooms is planned in [docs/plan](docs/plan/README.md). The game is in Indonesian and English. Technical terms like *training*, *dataset* and *accuracy* stay in English in both, because those are the words learners will meet later.

## Sessions

1. **Aturan atau Contoh? / Rules or Examples?** Kata sorts the class chat into important and chit-chat. Rules written by hand break on real messages, a word-counting classifier (naive Bayes) learning from examples does better, and on day 3 new slang shows that a model doesn't learn while it works. Terms: AI, training data, model, machine learning. *(playable, `/kotakata/main/s1`)*

2. **Filter Kamera / Camera Filter.** Raka wants a sunglasses filter. The photo is a 12×12 grid of brightness numbers. Players mark dark pixels, find the face's edges, keep only level pairs so a mole isn't taken for an eye, fix two dark-room photos with auto brightness, and add a depth sensor so a poster can't fool the filter. Terms: pixel, edge detection, object detection, sensor fusion, computer vision. *(playable, `/kotakata/main/s2`)*

3. **Data yang Adil / Fair Data.** The same learner, moved to a cousin's class that writes differently. Players inspect the data, learn that different examples beat more of the same, fix joke labels, set examples aside for an honest test, and score Kata person by person to find who it fails. Terms: bias, data quality, test data, overfitting, fairness. *(playable, `/kotakata/main/s3`)*

4. **Ekskul Apa? / Which Club?** Kata suggests a club for new students from survey answers. Players build a yes/no tree, use "explain for Dinda" to trace why she was told choir, let Kata learn a tree from 24 past members, ban the "from class A" question that last year's data taught it, and prune a tree that memorised members who followed friends. Terms: recommender system, explainability, decision tree learning, historical bias, pruning. *(playable, `/kotakata/main/s4`)*

5. **Kata demi Kata / Word by Word.** Kata becomes the class info chatbot, a word n-gram model trained on the announcement board. Players see the next-word probabilities, use temperature and memory, catch Kata confidently answering a date the board never gave, rewrite vague questions, and make Kata read a new notice. Terms: generative AI, hallucination, prompt, AI as a tool. *(playable, `/kotakata/main/s5`)*

6. **Rapat OSIS / Student Council.** A decision simulation. Players chair a meeting on four proposals: a face-scan attendance camera, an AI essay detector, Kata as the parents' info desk, and a gate camera. A school week fills meters for time, privacy, fairness, copies caught, trust and safety, and an ethics matrix shows how five characters feel. The attendance plan everyone accepts uses no AI, the essay detector needs a teacher to talk to flagged students, and the gate camera passes only without face recognition. Terms: data privacy, false positive, false negative, human in the loop, AI ethics. *(playable, `/kotakata/main/s6`)*

The plan for all six sessions is in [docs/plan](docs/plan/README.md).

## Classic levels

1. **Latih Robot / Train the Robot.** Classification: dataset, label, training, testing, accuracy. *(playable)*
2. **Taman Decision Tree / Decision Tree Garden.** Features, splits, leaves, predictions, decision trees. Unlocks after Level 1. *(playable)*
3. **Bukit Loss / Hill of Loss.** Loss, gradients, learning rates, convergence, gradient descent. *(playable)*
4. **Kedai Token / Token Tavern.** Tokens, probability, temperature, context, LLMs. *(playable)*

## Stages and badges

Each level is split into small stages, each adding one new idea, plus an optional bonus:

- **Level 1:** collect apples *and* bananas → train the robot → test on 10+ fruits at 90% → bonus: 100% on 20+.
- **Level 3:** down the gentle hill with 30 steps of energy → only 6 steps, so the learning rate must grow → a steep hill, where that learning rate bounces → bonus: one perfect jump.
- **Level 4:** write 4 tokens → raise the temperature for a different story → finish a sentence at temperature 0, which needs a two-word memory → bonus: a warm story that still finishes.
- **Level 2:** one question for bees and frogs → birds arrive, so the tree needs a second question → bonus: all 12 with at most 2 questions and no colour.

Finishing a stage opens the next one. A strong program can clear several stages in one run. Badges (5 per level) reward small wins like a balanced dataset or a first working split. Stages and badges live in each level's `stages.ts`.

In code a stage is a `Puzzle` and a level a `Session`, the names the plan uses. Each puzzle also has:

- a **beat** (introduce, develop, twist or sandbox) and a first-run success target;
- an optional **prediction**: RUN waits until the player guesses, and the first run afterwards shows the guess next to what happened;
- a **hint ladder**: after one failed run, a question about the idea; after two, a pointer at the block to change; after four, the pointer plus part of a working program. Tests check that every example really passes its puzzle.

New terms go into **Kata's notebook** (`/buku`), with the moment the player found them. They show briefly over the log and don't stop the run.

## Pages

| Path | Page |
| --- | --- |
| `/kotakata/` | Landing page: what Kotakata is, the sessions on the way, the classic levels |
| `/kotakata/main` | The school map: one room per session |
| `/kotakata/main/<id>` | The game for one level |
| `/kotakata/buku` | Kata's notebook |
| `/kotakata/sertifikat/<id>` | Certificate for a finished level, as PNG or print. The name typed on it stays in the page and is never saved. |
| `/kotakata/panduan` | Teacher and parent guides for every playable session |
| `/kotakata/panduan/<guru\|ortu>/<session>` | One guide. It prints, with an appendix of unplugged cards built from the game's own data. |
| `/kotakata/privasi` | What Kotakata sends, the player's choice, and "delete my data" |
| `/kotakata/masuk` | Sign in (Google or an email link) and sign up as an educator or a parent |
| `/kotakata/guru` | An educator's home: access status, first steps and their class requests |
| `/kotakata/guru/ajukan` | The class request form |
| `/kotakata/ortu` | A parent's home: up to six child profiles |
| `/kotakata/akun` | Name, training and newsletter choices, sign out, delete the account |
| `/kotakata/admin` | Admin dashboard: class requests to approve, then traffic, play, quiz and survey numbers. Google sign-in with the `admin` claim. |

The build copies `index.html` to `404.html`, so GitHub Pages serves the app for every path.

## How Level 1 works

The robot is a real nearest-centroid classifier (`src/levels/train/model.ts`). Each fruit has two features, colour and shape. Training moves the robot's guess for each label halfway towards the average of its examples, once per round. The robot starts with its guesses swapped, so one round of training isn't enough. That's the lesson. The plot on the right shows the data, the moving centroids, and which label the robot would pick in each region.

## How Level 2 works

Twelve critters (birds, bees and frogs) walk through the player's decision tree (`src/levels/tree/model.ts`). Each question block is a yes/no split on a feature: wings, size or colour. Each pen is a leaf. Colour is a trap on purpose: some birds are yellow like bees and one frog is brown, so only wings and size sort everyone correctly. The stage previews the tree live while the player edits it.

## How Level 3 works

The robot does real gradient descent on a hill shaped like loss = a·x² (`src/levels/hill/model.ts`). Each step it moves by learning rate × gradient, so x becomes x·(1 − 2·a·lr). On the gentle hill (a = 1), 0.1 creeps, 0.4 lands in a few steps, 0.5 lands in one, and 1.1 flies off. On the steep hill (a = 2.5), 0.4 bounces back and forth forever, so the player has to pick a smaller rate. A gradient arrow shows the slope before every jump.

## How Level 4 works

The bard is a tiny language model learned from five tavern sentences (`src/levels/tavern/model.ts`). To pick the next token it looks at its context (the last 1 or 2 tokens), counts what followed in the stories, and turns the counts into probabilities. Temperature reshapes them: 0 always takes the top token, higher values give rarer tokens a better chance. With a one-word memory at temperature 0, the bard loops ("the cat sleeps by the cat sleeps by…"); a two-word memory lets it finish the sentence. The sentences have the same shape in Indonesian and English, so the model behaves identically in both.

## Guides

Each session's guide is data in `src/guides/` (`s1.ts`, `s3.ts`, `s5.ts`). It holds both roles: the parts they share (goals, terms, exit ticket, misconceptions) are written once, and the teacher (`guru`) and parent (`ortu`) instructions differ. Every text exists in Indonesian and English, which `guides.test.ts` checks. The unplugged cards come from the game's corpora, so the paper version matches the screen.

## Adding a level

Each level lives in `src/levels/<id>/`: a model with tests, its blocks, its hints, and an `index.ts` that implements the `Session` interface in `src/levels/types.ts`. Register it in `src/levels/index.ts`. Its Phaser scene implements `SessionScene` from `src/game/types.ts`. Progress goes through the store in `src/store/`, never straight to `localStorage`.

Blocks are always read as data (each level's `read` function) and never turned into code that runs.

## Stack

- [Blockly](https://github.com/google/blockly) (Apache-2.0) for the block editor, with a theme in the aastr.id palette. Its UI images are self-hosted in `public/blockly-media`.
- [Phaser 4](https://github.com/phaserjs/phaser) (MIT) for the pixel stage. All sprites are drawn from text grids in `src/game/pixels.ts`, so there are no image assets.
- React 19, Vite 8, Tailwind CSS v4, TypeScript.

## Design system

Kotakata uses the same tokens as aastr.id: `src/styles/tokens.css` for colour, type, shadows and layers, plus `src/styles/art.css` for illustration colours. Phaser scenes and the Blockly theme read both files through `src/theme.ts`. `DESIGN.md` has the rules, and `pnpm build` runs `scripts/check-design.mjs` first, which fails on anything outside them.

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

Every push to `main` builds and deploys to GitHub Pages.

## License

MIT. See [LICENSE](LICENSE). Blockly media in `public/blockly-media` is Apache-2.0, see its `LICENSE.txt`.
