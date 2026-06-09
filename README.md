# Codex Terminal Themes

[![Validate](https://github.com/Nick2bad4u/codex-terminal-themes/actions/workflows/validate.yml/badge.svg)](https://github.com/Nick2bad4u/codex-terminal-themes/actions/workflows/validate.yml)

Source-of-truth repository for local TextMate `.tmTheme` files used by Codex and `bat`.

## Layout

- `metadata/themes.json` - generated consumer manifest for every theme.
- `metadata/README.md` - consumer notes for the generated manifest.
- `metadata/themes.schema.json` - JSON schema for the generated manifest.
- `docs/` - generated GitHub Pages theme gallery.
- `themes/` - flat source theme folder copied into Codex and Bat.
- `tools/validate-themes.mjs` - validates `.tmTheme` XML/plist structure.
- `tools/generate-theme-metadata.mjs` - regenerates and checks metadata.
- `tools/build-pages-site.mjs` - regenerates and checks gallery preview data.

## Setup

Install the local validation toolchain:

```powershell
npm install
```

## Validation

Validate every source theme and confirm the metadata manifest is current:

```powershell
npm run validate
```

Run the full local gate:

```powershell
npm run release:verify
```

Validate themes and rebuild Bat's theme cache:

```powershell
npm run validate:bat
```

Regenerate the consumer metadata manifest:

```powershell
npm run metadata:write
```

Check that the committed manifest still matches the theme files:

```powershell
npm run metadata:check
```

Regenerate the GitHub Pages preview data:

```powershell
npm run pages:build
```

Check that the committed gallery data still matches the theme files:

```powershell
npm run pages:check
```

## Gallery

The static GitHub Pages site lives in `docs/`. It showcases every theme with searchable metadata, dark/light filtering, swatches, and syntax previews for TypeScript, PowerShell, Python, and HTML/CSS.

The browser app uses `docs/site-data.json`, which is generated from `metadata/themes.json` and the source `.tmTheme` files. The preview renderer uses representative TextMate scopes so users can compare theme behavior online without installing Bat, Codex, or a TextMate parser.

## Metadata

The generated manifest at `metadata/themes.json` is the stable consumer entry point for scripts, indexers, package consumers, and sync tools that need theme information without parsing plist XML.

Use it when you need to:

- list every available theme with a stable id and display name
- filter themes by detected dark/light appearance
- inspect global editor colors before installing a theme
- find TextMate scopes covered by a theme
- detect imported themes that still share historical UUIDs

It includes:

- theme id, display name, file name, path, UUID, author, semantic class, and color space
- detected appearance from the global background color
- global colors for background, foreground, caret, selection, line highlight, and invisibles
- setting counts, color-reference counts, scoped-setting counts, and unique scope counts
- a sorted list of TextMate scopes used by each theme
- duplicate UUID groups for imported themes that share historical UUIDs

The manifest is deterministic and validated by `npm run validate`; changing a `.tmTheme` without regenerating metadata fails the repo gate. See `metadata/README.md` for the field contract and a small consumption example.

## Sync

Use the drop-in PowerShell script:

```powershell
Sync-TerminalThemes.ps1
```

Dry run:

```powershell
Sync-TerminalThemes.ps1 -WhatIf
```

The script copies valid `.tmTheme` files to:

- `C:\Users\Nick\.codex\themes`
- `$(bat --config-dir)\themes`

After syncing Bat themes, it runs:

```powershell
bat cache --build
```

## Invalid Themes

All committed themes should parse as XML plist files. The sync script still skips invalid files by default so Bat cache rebuilds are not broken if a bad import lands locally. Use `-AllowInvalidTheme` only when copying to a consumer that tolerates those files.

When importing themes from GitHub, use raw file URLs. Saving rendered GitHub pages as `.tmTheme` files creates HTML files that Bat and Codex cannot consume.
