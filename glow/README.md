# Glow Themes

This folder contains Glamour JSON styles translated from the custom `Nicks-Codex-Noir*.tmTheme` files.

Glow accepts these files through `--style` or the `style` value in `glow.yml`:

```powershell
glow --style ".\glow\styles\nicks-codex-noir-v2.json" README.md
```

On this Windows machine, local Glow styles are installed under:

```powershell
$env:LOCALAPPDATA\glow\Config\styles
```

Use the v2 style as the newest Codex Noir Markdown/Glamour test theme:

```powershell
glow --style "$env:LOCALAPPDATA\glow\Config\styles\nicks-codex-noir-v2.json" README.md
```

Glamour uses Markdown element rules plus Chroma token classes for fenced code blocks, so this is an approximation of the TextMate scopes rather than a lossless conversion.
