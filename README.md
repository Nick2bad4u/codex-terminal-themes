# Codex Terminal Themes

[![NPM license.](https://flat.badgen.net/npm/license/codex-terminal-themes?color=purple)](https://github.com/Nick2bad4u/codex-terminal-themes/blob/main/LICENSE) [![NPM total downloads.](https://flat.badgen.net/npm/dt/codex-terminal-themes?color=pink)](https://www.npmjs.com/package/codex-terminal-themes) [![Latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/codex-terminal-themes?color=cyan)](https://github.com/Nick2bad4u/codex-terminal-themes/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/codex-terminal-themes?color=yellow)](https://github.com/Nick2bad4u/codex-terminal-themes/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/codex-terminal-themes?color=orange)](https://github.com/Nick2bad4u/codex-terminal-themes/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/codex-terminal-themes?color=red)](https://github.com/Nick2bad4u/codex-terminal-themes/issues) [![Repo Checks.](https://flat.badgen.net/github/checks/nick2bad4u/codex-terminal-themes?color=green)](https://github.com/Nick2bad4u/codex-terminal-themes/actions)

High-contrast TextMate `.tmTheme` files for Codex terminal sessions, `bat`, and other tools that can read TextMate themes.

Browse the theme gallery:

<https://nick2bad4u.github.io/codex-terminal-themes/>

## What You Get

- 204 TextMate themes in `themes/`.
- Glow/Glamour JSON styles for the custom Codex Noir variants in `glow/styles/`.
- A searchable online gallery with syntax previews, theme metadata, hue filtering, and color matching.
- A generated metadata manifest at `metadata/themes.json` for scripts and theme pickers.
- A dependency-light npm CLI for listing, previewing, installing, and diagnosing themes.
- Themes that can still be copied directly into Codex or Bat theme folders.

## Recommended Theme

For Codex terminal use, start with:

```text
themes/Nicks-Codex-Noir.tmTheme
```

It is the most customized AMOLED variant in this repo and has the broadest scope coverage for terminal-heavy workflows.

Use the v2 variant when testing the newer JSON, Markdown, TOML, PowerShell, JavaScript, TypeScript, and config-file readability overrides:

```text
themes/Nicks-Codex-Noir-v2.tmTheme
```

## Install With npm

Use the CLI without a global install:

```powershell
npx codex-terminal-themes list --search noir
npx codex-terminal-themes show nicks-codex-noir
npx codex-terminal-themes install nicks-codex-noir --target both
```

Open the interactive picker with an ANSI terminal preview:

```powershell
npx codex-terminal-themes pick
```

Install directly from the picker:

```powershell
npx codex-terminal-themes pick --install --target codex
```

Run environment checks before installing:

```powershell
npx codex-terminal-themes doctor
```

CLI config is optional and only stores CLI defaults. It does not edit theme files or mutate Codex configuration:

```powershell
npx codex-terminal-themes config set defaultTheme nicks-codex-noir
npx codex-terminal-themes config set defaultTarget both
npx codex-terminal-themes install
```

Useful install overrides:

```powershell
npx codex-terminal-themes install nicks-codex-noir --target codex --codex-dir "$env:USERPROFILE\.codex\themes"
npx codex-terminal-themes install nicks-codex-noir --target bat --bat-dir "$((bat --config-dir).Trim())\themes"
npx codex-terminal-themes install nicks-codex-noir --dry-run --json
```

## Use With Codex Manually

Copy the `.tmTheme` file you want into your Codex themes directory, then select it from your Codex configuration.

On Windows, that folder is usually:

```powershell
$env:USERPROFILE\.codex\themes
```

Example:

```powershell
Copy-Item ".\themes\Nicks-Codex-Noir.tmTheme" "$env:USERPROFILE\.codex\themes\"
```

## Use With Bat Manually

Find Bat's config directory:

```powershell
bat --config-dir
```

Create a `themes` folder there if it does not exist, copy the `.tmTheme` files into it, then rebuild Bat's cache:

```powershell
$batConfig = bat --config-dir
New-Item -ItemType Directory -Force -Path "$batConfig\themes"
Copy-Item ".\themes\Nicks-Codex-Noir.tmTheme" "$batConfig\themes\"
bat cache --build
```

Use a theme once:

```powershell
bat --theme "Nicks-Codex-Noir" README.md
```

To make a Bat theme permanent, put the theme name in Bat's config file:

```text
--theme="Nicks-Codex-Noir"
```

## Use With Glow

Glow uses Glamour JSON styles, not TextMate `.tmTheme` files. The translated custom Noir styles live in:

```text
glow/styles/
```

Use the v2 style once:

```powershell
glow --style ".\glow\styles\nicks-codex-noir-v2.json" README.md
```

Install the generated styles into Glow's local config directory:

```powershell
$glowStyles = "$env:LOCALAPPDATA\glow\Config\styles"
New-Item -ItemType Directory -Force -Path $glowStyles
Copy-Item ".\glow\styles\*.json" $glowStyles -Force
```

Then point `style` in `$env:LOCALAPPDATA\glow\Config\glow.yml` at the JSON file you want:

```yaml
style: "C:/Users/Nick/AppData/Local/glow/Config/styles/nicks-codex-noir-v2.json"
```

These styles map the TextMate palette into Markdown element styles and Chroma token classes, so syntax colors are intentionally close but not a one-to-one scope conversion.

## Sync Everything Locally

For local source checkout workflows, this repo also works with a drop-in PowerShell sync script named:

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

If a theme looks too flat, try another `Nicks-Codex-Noir*.tmTheme` variant. `Nicks-Codex-Noir.tmTheme` is the flagship Codex terminal theme, while the suffixed variants preserve earlier AMOLED experiments with different contrast and color balance.

## Maintainers

Development commands, validation, generated files, and release checks live in [DEVELOPMENT.md](DEVELOPMENT.md).
