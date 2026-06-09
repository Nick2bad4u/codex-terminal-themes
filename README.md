# Codex Terminal Themes

[![Validate](https://github.com/Nick2bad4u/codex-terminal-themes/actions/workflows/validate.yml/badge.svg)](https://github.com/Nick2bad4u/codex-terminal-themes/actions/workflows/validate.yml)

High-contrast TextMate `.tmTheme` files for Codex terminal sessions, `bat`, and other tools that can read TextMate themes.

Browse the theme gallery:

<https://nick2bad4u.github.io/codex-terminal-themes/>

## What You Get

- 203 TextMate themes in `themes/`.
- A searchable online gallery with syntax previews, theme metadata, hue filtering, and color matching.
- A generated metadata manifest at `metadata/themes.json` for scripts and theme pickers.
- Themes that can be copied directly into Codex or Bat theme folders.

## Recommended Theme

For Codex terminal use, start with:

```text
themes/converted-vscode-AmoledShinyBlack6.tmTheme
```

It is the most customized AMOLED variant in this repo and has the broadest scope coverage for terminal-heavy workflows.

## Use With Codex

Copy the `.tmTheme` file you want into your Codex themes directory, then select it from your Codex configuration.

On Windows, that folder is usually:

```powershell
$env:USERPROFILE\.codex\themes
```

Example:

```powershell
Copy-Item ".\themes\converted-vscode-AmoledShinyBlack6.tmTheme" "$env:USERPROFILE\.codex\themes\"
```

## Use With Bat

Find Bat's config directory:

```powershell
bat --config-dir
```

Create a `themes` folder there if it does not exist, copy the `.tmTheme` files into it, then rebuild Bat's cache:

```powershell
$batConfig = bat --config-dir
New-Item -ItemType Directory -Force -Path "$batConfig\themes"
Copy-Item ".\themes\converted-vscode-AmoledShinyBlack6.tmTheme" "$batConfig\themes\"
bat cache --build
```

Use a theme once:

```powershell
bat --theme "AMOLED Dark Shiny - Codex Varied v6" README.md
```

To make a Bat theme permanent, put the theme name in Bat's config file:

```text
--theme="AMOLED Dark Shiny - Codex Varied v6"
```

## Sync Everything

This repo is intended to work with a drop-in PowerShell sync script named:

```powershell
Sync-TerminalThemes.ps1
```

Dry run first:

```powershell
Sync-TerminalThemes.ps1 -WhatIf
```

Then sync:

```powershell
Sync-TerminalThemes.ps1
```

The sync script copies valid `.tmTheme` files to the Codex theme folder and Bat's theme folder, then rebuilds Bat's cache.

## Theme Metadata

Use `metadata/themes.json` when you need to inspect the collection without parsing XML plist files yourself.

It includes:

- theme id, display name, file name, path, UUID, author, semantic class, and color space
- detected dark, light, or unknown appearance
- global colors such as background, foreground, selection, caret, line highlight, and invisibles
- setting counts, color-reference counts, scoped-setting counts, and unique scope counts
- TextMate scopes used by each theme
- duplicate UUID groups for imported themes that share historical UUIDs

See [metadata/README.md](metadata/README.md) for the manifest field contract and a small consumption example.

## Troubleshooting

If Bat does not show a theme, rebuild its cache:

```powershell
bat cache --build
```

If a downloaded theme does not work, make sure it is a raw `.tmTheme` XML plist file. Saving a rendered GitHub webpage as `.tmTheme` creates an HTML file that Codex and Bat cannot consume.

If a theme looks too flat, try a newer numbered AMOLED variant. The numbered `converted-vscode-AmoledShinyBlack*.tmTheme` files are intentional iterations, and the later versions usually have more language-specific scope coverage.

## Maintainers

Development commands, validation, generated files, and release checks live in [DEVELOPMENT.md](DEVELOPMENT.md).
