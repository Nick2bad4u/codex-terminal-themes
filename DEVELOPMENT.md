# Development

This document is for maintainers changing themes, metadata, tooling, or the GitHub Pages gallery.

End-user installation notes live in [README.md](README.md).

## Repository Layout

- `themes/` - flat source folder for committed `.tmTheme` files.
- `bin/codex-terminal-themes.ts` - npm CLI executable source.
- `src/cli.ts` - CLI implementation for list, show, install, doctor, picker, and config commands.
- `test/` - Node test runner coverage for the CLI behavior.
- `metadata/themes.json` - generated consumer manifest for every valid theme.
- `metadata/themes.schema.json` - JSON Schema for the generated manifest.
- `metadata/README.md` - manifest field contract and consumption example.
- `docs/` - GitHub Pages gallery source and static assets.
- `docs/app.ts` - browser gallery source.
- `tools/validate-themes.ts` - validates `.tmTheme` XML/plist structure.
- `tools/generate-theme-metadata.ts` - regenerates and checks metadata.
- `tools/build-pages-site.ts` - builds and checks the gallery output.
- `tools/serve-pages-site.ts` - serves `dist/pages/` locally for browser testing.
- `dist/` - ignored runtime, package, and Pages build output.

## Setup

Install the local validation toolchain:

```powershell
npm install
```

This repo expects Node.js `>=24` and npm `11`.

## Common Commands

Validate every source theme and confirm generated data is current:

```powershell
npm run validate
```

Run the full local gate:

```powershell
npm run release:verify
```

Run the CLI test suite:

```powershell
npm test
```

Typecheck the Node tools and browser gallery:

```powershell
npm run typecheck
```

Build the CLI, tools, and deployable Pages gallery:

```powershell
npm run build
```

Validate themes and rebuild Bat's theme cache:

```powershell
npm run validate:bat
```

Run secret scanning locally:

```powershell
npm run lint:gitleaks
```

Inspect the npm package contents before publishing:

```powershell
npm pack --dry-run --json
```

The published package includes the built CLI/tools in `dist/`, metadata, themes, docs, and public type declarations. Runtime XML parsing dependencies must remain in `dependencies` because the installed CLI uses them for validation and previews.

## Metadata

Regenerate the consumer metadata manifest:

```powershell
npm run metadata:write
```

Check that the committed manifest still matches the theme files:

```powershell
npm run metadata:check
```

The manifest is deterministic. Changing a `.tmTheme` without regenerating metadata should fail the repo gate.

## GitHub Pages Gallery

Build the deployable gallery in `dist/pages/`:

```powershell
npm run pages:build
```

Check that the built gallery output still matches the theme files:

```powershell
npm run pages:check
```

Typecheck and validate the gallery output:

```powershell
npm run pages:test
```

Serve the gallery locally:

```powershell
npm run pages:serve
```

Use a different port when needed:

```powershell
npm run pages:serve -- --port=5173
```

The browser app uses representative TextMate scopes, so users can compare theme behavior online without installing Bat, Codex, or a TextMate parser.

## Theme Import Rules

All committed themes should parse as XML plist files.
Theme source file names and top-level plist `name` values must be whitespace-free for cross-tool compatibility. Every theme should also carry top-level `author`, `semanticClass`, and `colorSpace` metadata.

When importing themes from GitHub or another website, use raw file URLs. Do not save rendered HTML pages as `.tmTheme` files.

Prefer creating a new `Nicks-Codex-Noir*.tmTheme` variant over rewriting an older Noir theme in place.

## Sync Validation

Before submitting sync-related changes, dry-run the local sync script:

```powershell
Sync-TerminalThemes.ps1 -WhatIf
```

Run the real sync only when you intend to update the local Codex and Bat theme folders:

```powershell
Sync-TerminalThemes.ps1
```

The sync script should skip invalid themes by default, so Bat cache rebuilds are not broken by a bad local import. Use any invalid-theme override only for consumers that explicitly tolerate those files.

## Pull Request Checklist

Before opening or merging a change, run the checks that match the files touched.

For theme or metadata changes:

```powershell
npm run metadata:write
npm run pages:build
npm run release:verify
Sync-TerminalThemes.ps1 -WhatIf
```

For gallery-only changes:

```powershell
npm run pages:test
npm run typecheck
npm run lint
npm run format:check
```

For workflow or repository maintenance changes:

```powershell
npm run release:verify
```

For CLI or package-publishing changes:

```powershell
npm run typecheck
npm test
npm run lint
npm run lint:package-json
npm pack --dry-run --json
```
