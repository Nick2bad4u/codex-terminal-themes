# Docs Guidance

- Treat `docs/app.ts` as the browser gallery source and `dist/pages/app.js` as generated build output.
- Keep generated Pages output in `dist/pages/`; do not commit generated `docs/app.js` or `docs/site-data.json`.
- `docs/index.html` loads `app.js` after the site is copied to `dist/pages`, so run `npm run build` after editing `docs/app.ts`.
- Run `npm run pages:check` or `npm run validate` after gallery changes.
