# Contributing

Keep this repository focused on terminal syntax theme source files and local sync validation.

When adding, removing, renaming, or editing a file in `themes/`, regenerate the consumer manifest:

```powershell
npm run metadata:write
npm run pages:build
```

Before submitting changes:

```powershell
npm run metadata:check
npm run pages:check
npm run release:verify
Sync-TerminalThemes.ps1 -WhatIf
```

When importing themes from a web source, use raw file URLs. Do not save rendered GitHub HTML pages as `.tmTheme` files.
