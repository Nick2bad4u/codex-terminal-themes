# Codex Terminal Themes Guidance

This repository is the source of truth for TextMate `.tmTheme` files synced into Codex and `bat`.

## Scope

- Keep source themes in `themes/` as flat `.tmTheme` files.
- Do not commit Bat cache output; Bat compiles that under `AppData\Local\bat`.
- Keep generated or imported third-party themes as source assets only when they parse as valid XML/plist.
- Prefer creating a new numbered `converted-vscode-AmoledShinyBlack*.tmTheme` file over modifying an older numbered theme in place.

## Validation

Run the narrowest useful checks after edits:

```powershell
npm run validate
Sync-TerminalThemes.ps1 -WhatIf
```

Run the full local gate before larger changes:

```powershell
npm run release:verify
Sync-TerminalThemes.ps1
```

## Style

- `.tmTheme` files are legacy XML plist files; rule order matters, and late overrides can intentionally win.
- Keep Codex-specific high-contrast overrides explicit and named.
- Avoid broad late scopes that flatten useful highlighting.
