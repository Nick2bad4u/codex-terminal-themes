# Codex Terminal Themes

[![Validate](https://github.com/Nick2bad4u/codex-terminal-themes/actions/workflows/validate.yml/badge.svg)](https://github.com/Nick2bad4u/codex-terminal-themes/actions/workflows/validate.yml)

Source-of-truth repository for local TextMate `.tmTheme` files used by Codex and `bat`.

## Layout

- `themes/` - flat source theme folder copied into Codex and Bat.
- `tools/validate-themes.mjs` - validates `.tmTheme` XML/plist structure.

## Setup

Install the local validation toolchain:

```powershell
npm install
```

## Validation

Validate every source theme:

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
