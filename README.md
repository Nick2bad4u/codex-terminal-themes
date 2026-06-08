# Codex Terminal Themes

Source-of-truth repository for local TextMate `.tmTheme` files used by Codex and `bat`.

## Layout

- `themes/` - flat source theme folder copied into Codex and Bat.

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

Some legacy imported themes are not valid XML/plist files. The sync script skips invalid files by default so Bat cache rebuilds are not broken. Use `-AllowInvalidTheme` only when copying to a consumer that tolerates those files.
