---
name: "Codex-Terminal-Themes-Workflow-Guidance"
description: "GitHub Actions guidance for the Codex terminal themes repository."
applyTo: ".github/workflows/*.yml"
---

# Workflow Guidance

- Keep workflows minimal for this source-assets repository.
- Set explicit `permissions` blocks and grant write scopes only to jobs that need them.
- Add `timeout-minutes` to jobs that run external tools.
- Validate workflow syntax with `actionlint` when available after editing workflow YAML.
