# Docs Guidance

- Treat `docs/app.ts` as the browser gallery source and `docs/app.js` as generated build output.
- Keep `docs/site-data.json` deterministic and regenerated through `npm run pages:build`.
- `docs/index.html` loads `app.js`, so run `npm run build` after editing `docs/app.ts`.
- Run `npm run pages:check` or `npm run validate` after gallery changes.
