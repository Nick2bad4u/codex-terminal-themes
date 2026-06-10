# Source Guidance

- Keep CLI behavior in TypeScript source under `src/`.
- Use explicit exported and cross-function types for CLI contracts instead of relying on generated metadata shape assumptions.
- The published CLI imports the built `dist/src/cli.js`; keep source imports compatible with `moduleResolution: NodeNext`.
- Run `npm run build`, `npm run typecheck`, and `npm test` after CLI changes.
