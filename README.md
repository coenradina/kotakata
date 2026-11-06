# Kotakata

Kotakata is a pixel-art block-coding game for learning machine learning terms. You snap blocks together, press run, and watch a small robot learn. Each level you finish unlocks term cards that explain the words you just used.

Play it at https://aastr.id/kotakata. A redesign into one-hour sessions for SMP classrooms is planned in [docs/plan](docs/plan/README.md). The game is in Indonesian and English. Technical terms like *training*, *dataset* and *accuracy* stay in English in both, because those are the words learners will meet later.

## Levels

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

## How Level 1 works

The robot is a real nearest-centroid classifier (`src/levels/train/model.ts`). Each fruit has two features, colour and shape. Training moves the robot's guess for each label halfway towards the average of its examples, once per round. The robot starts with its guesses swapped, so one round of training isn't enough. That's the lesson. The plot on the right shows the data, the moving centroids, and which label the robot would pick in each region.

## How Level 2 works

Twelve critters (birds, bees and frogs) walk through the player's decision tree (`src/levels/tree/model.ts`). Each question block is a yes/no split on a feature: wings, size or colour. Each pen is a leaf. Colour is a trap on purpose: some birds are yellow like bees and one frog is brown, so only wings and size sort everyone correctly. The stage previews the tree live while the player edits it.

## How Level 3 works

The robot does real gradient descent on a hill shaped like loss = a·x² (`src/levels/hill/model.ts`). Each step it moves by learning rate × gradient, so x becomes x·(1 − 2·a·lr). On the gentle hill (a = 1), 0.1 creeps, 0.4 lands in a few steps, 0.5 lands in one, and 1.1 flies off. On the steep hill (a = 2.5), 0.4 bounces back and forth forever, so the player has to pick a smaller rate. A gradient arrow shows the slope before every jump.

## How Level 4 works

The bard is a tiny language model learned from five tavern sentences (`src/levels/tavern/model.ts`). To pick the next token it looks at its context (the last 1 or 2 tokens), counts what followed in the stories, and turns the counts into probabilities. Temperature reshapes them: 0 always takes the top token, higher values give rarer tokens a better chance. With a one-word memory at temperature 0, the bard loops ("the cat sleeps by the cat sleeps by…"); a two-word memory lets it finish the sentence. The sentences have the same shape in Indonesian and English, so the model behaves identically in both.

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
