# Kotakata

Kotakata is a pixel-art block-coding game for learning machine learning terms. You snap blocks together, press run, and watch a small robot learn. Each level you finish unlocks term cards that explain the words you just used.

Play it at https://aastr.id/kotakata. The game is in Indonesian and English. Technical terms like *training*, *dataset* and *accuracy* stay in English in both, because those are the words learners will meet later.

## Levels

1. **Latih Robot / Train the Robot.** Classification: dataset, label, training, testing, accuracy. *(playable)*
2. **Taman Decision Tree / Decision Tree Garden.** *(planned)*
3. **Bukit Loss / Hill of Loss.** Gradient descent. *(planned)*
4. **Kedai Token / Token Tavern.** How LLMs pick the next token. *(planned)*

## How Level 1 works

The robot is a real nearest-centroid classifier (`src/levels/train/model.ts`). Each fruit has two features, colour and shape. Training moves the robot's guess for each label halfway towards the average of its examples, once per round. The robot starts with its guesses swapped, so one round of training isn't enough. That's the lesson. The plot on the right shows the data, the moving centroids, and which label the robot would pick in each region.

Blocks are read as data (`readProgram` in `src/blocks/blockly.ts`) and never turned into code that runs.

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
