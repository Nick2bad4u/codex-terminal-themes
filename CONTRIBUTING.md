# Contributing

Keep this repository focused on terminal syntax theme source files and local sync validation.

Before submitting changes:

```powershell
npm run release:verify
Sync-TerminalThemes.ps1 -WhatIf
```

When importing themes from a web source, use raw file URLs. Do not save rendered GitHub HTML pages as `.tmTheme` files.
