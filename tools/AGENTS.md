# Tooling Guidance

- Keep maintenance tools as TypeScript source under `tools/`.
- Tools run from built output in `dist/tools/`; update package scripts when adding or renaming a tool.
- Do not make generated metadata or Pages data nondeterministic.
- Run `npm run build` and the narrow script affected by the change, then `npm run release:verify` for release-facing edits.
