# Theme Metadata

`themes.json` is the generated consumer manifest for the TextMate themes in this repository. Use it when a tool needs to list, filter, install, or inspect themes without parsing `.tmTheme` plist XML.

The manifest is deterministic. Regenerate it after changing files in `themes/`:

```powershell
npm run metadata:write
```

Validate it before publishing or syncing:

```powershell
npm run metadata:check
npm run validate
```

## Files

- `themes.json` - generated manifest for all committed `.tmTheme` files.
- `themes.schema.json` - JSON Schema for `themes.json`.

## Manifest Fields

Top-level fields:

- `$schema` - relative schema path for editors and validators.
- `consumers` - intended consumers for the theme set.
- `description` - short human-readable manifest description.
- `duplicateUuidGroups` - map of duplicated UUIDs to theme paths that share them.
- `generatedBy` - command that regenerates the manifest.
- `name` - package/repository name.
- `schemaVersion` - metadata contract version.
- `themeCount` - number of themes represented in `themes`.
- `themeDirectory` - source directory for theme files.
- `themes` - sorted theme metadata entries.

Each entry in `themes` includes:

- `id` - generated kebab-case identifier derived from the file name.
- `name` - whitespace-free compatibility name from the `.tmTheme` plist.
- `fileName` - whitespace-free theme file name.
- `path` - whitespace-free repository-relative path to the theme file.
- `uuid` - UUID from the `.tmTheme` plist.
- `author` - optional author from the plist.
- `semanticClass` - optional semantic class from the plist.
- `colorSpace` - optional color space from the plist.
- `appearance` - `dark`, `light`, or `unknown`, derived from the global background color.
- `colors` - global background, foreground, caret, selection, line highlight, and invisibles colors.
- `statistics` - counts for settings, scoped settings, unique scopes, and color references.
- `scopes` - sorted unique TextMate scopes used by the theme.

## Consumption Example

```js
import metadata from "./metadata/themes.json" with { type: "json" };

const darkThemes = metadata.themes.filter(
 (theme) => theme.appearance === "dark"
);

for (const theme of darkThemes) {
 console.log(`${theme.name}: ${theme.path}`);
}
```

TypeScript consumers can use the exported types from `types/index.d.ts`, especially `ThemeMetadataManifest` and `ThemeMetadata`.

## Stability

`schemaVersion` changes only when the manifest contract changes. Existing field values can still change when source themes change. Treat `id`, `path`, and `name` as the best compatibility-safe lookup fields; treat duplicate UUIDs as imported upstream history, not as a validation failure.
