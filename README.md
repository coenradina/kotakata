# Kotakata

Kotakata is a pixel-art block-coding game for learning machine learning terms. You snap blocks together, press run, and watch a small robot learn. Each level you finish unlocks term cards that explain the words you just used.

Play it at https://aastr.id/kotakata. The game is in Indonesian and English. Technical terms like *training*, *dataset* and *accuracy* stay in English in both, because those are the words learners will meet later.

## Levels

1. **Latih Robot / Train the Robot.** Classification: dataset, label, training, testing, accuracy. *(playable)*
2. **Taman Decision Tree / Decision Tree Garden.** Features, splits, leaves, predictions, decision trees. Unlocks after Level 1. *(playable)*
3. **Bukit Loss / Hill of Loss.** Gradient descent. *(planned)*
4. **Kedai Token / Token Tavern.** How LLMs pick the next token. *(planned)*

## Stages and badges

Each level is split into small stages, each adding one new idea, plus an optional bonus:

- **Level 1:** collect apples *and* bananas → train the robot → test on 10+ fruits at 90% → bonus: 100% on 20+.
- **Level 2:** one question for bees and frogs → birds arrive, so the tree needs a second question → bonus: all 12 with at most 2 questions and no colour.

Finishing a stage opens the next one. A strong program can clear several stages in one run. Badges (5 per level) reward small wins like a balanced dataset or a first working split. Stages and badges live in each level's `stages.ts`.

## How Level 1 works

The robot is a real nearest-centroid classifier (`src/levels/train/model.ts`). Each fruit has two features, colour and shape. Training moves the robot's guess for each label halfway towards the average of its examples, once per round. The robot starts with its guesses swapped, so one round of training isn't enough. That's the lesson. The plot on the right shows the data, the moving centroids, and which label the robot would pick in each region.

## How Level 2 works

Twelve critters (birds, bees and frogs) walk through the player's decision tree (`src/levels/tree/model.ts`). Each question block is a yes/no split on a feature: wings, size or colour. Each pen is a leaf. Colour is a trap on purpose: some birds are yellow like bees and one frog is brown, so only wings and size sort everyone correctly. The stage previews the tree live while the player edits it.

## Adding a level

Each level lives in `src/levels/<id>/`: a model with tests, its blocks, its hints, and an `index.ts` that implements the `Level` interface in `src/levels/types.ts`. Register it in `src/levels/index.ts`. Its Phaser scene implements `LevelScene` from `src/game/types.ts`.

Blocks are always read as data (each level's `read` function) and never turned into code that runs.

## Stack

- [Blockly](https://github.com/google/blockly) (Apache-2.0) for the block editor, with a theme in the aastr.id palette. Its UI images are self-hosted in `public/blockly-media`.
- [Phaser 4](https://github.com/phaserjs/phaser) (MIT) for the pixel stage. All sprites are drawn from text grids in `src/game/pixels.ts`, so there are no image assets.
- React 19, Vite 8, Tailwind CSS v4, TypeScript.

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
