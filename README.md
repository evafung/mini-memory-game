# Mini Memory Game

A responsive, mobile-first memory game built with React, TypeScript, and Vite. Watch the shapes, repeat the sequence in order, and earn bonus points for finishing quickly.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

```sh
npm install
npm run dev
```

Vite prints the local URL when the development server is ready.

## Gameplay

- Select **Start** to begin a new game.
- Watch the 3-2-1 countdown, then memorize the sequence of colored shapes.
- Repeat the sequence by selecting the four shape buttons in order before the timer runs out.
- Earn a time bonus for each successful round. Sequences get longer and shapes display faster as you progress.
- Choose **Play Again** to restart or **Back to Home** to return to the title screen.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest test suite |
| `npm run lint` | Run Oxlint |

## Project structure

- `src/App.tsx` — game screens, state, and round/timer transitions
- `src/game/engine.ts` — shape definitions, sequence generation, scoring, and difficulty progression
- `src/components/ShapeIcons.tsx` — reusable SVG shapes and interface icons
- `src/App.css` and `src/index.css` — responsive game layout and global styles
- `public/favicon.svg` — four-shape browser favicon

The game runs entirely in the browser and does not require a backend.
