# Prompt Constructor

Configurable prompt construction toolkit with a standalone test environment and React integration.

The project is intentionally **vendor-neutral and host-neutral**. It does not call an LLM by itself and does not depend on a specific AI workspace, API gateway, model provider, corporate brand, or design system.

## What is included

- `packages/core` — prompt-building logic for text, image and presentation tasks.
- `packages/embed` — framework-neutral iframe/modal bridge for a host application.
- `packages/react` — React hook over the generic embed layer.
- `apps/standalone` — independent UI for development, demonstration and manual testing.
- `examples/react-basic` — minimal example showing how a host application can receive a generated prompt.

## Quick start

No production dependency is required to validate the current standalone baseline.

```bash
npm run check
```

Build the portable standalone directory:

```bash
npm run build:standalone
```

Then serve the repository root or `dist/standalone` over HTTP. ES modules are not intended to be opened via `file://`.

## Integration boundary

Prompt Constructor ends its responsibility after it returns a generated prompt and metadata to the host application. The host decides whether to put that prompt into a host draft, send it to an API, store it, or use another workflow.

```text
User → Prompt Constructor → generated prompt → host callback → host application
```

It contains no provider-specific functions such as `sendToOpenAI()` or `sendToClaude()`.

See `docs/integration.md` and `examples/react-basic/ChatComposer.jsx`.

## Neutral built-in presets

The bundled presets are generic examples: business blue, natural green, graphite/amber and monochrome, plus neutral font combinations. They are not derived from a third-party brand guide. A host application may supply its own branding requirements as user input/configuration.

## Security and privacy

- No API keys are included.
- No analytics calls are included.
- The embed protocol validates origin, source window, protocol version, request ID, supported mode/target and prompt length.
- Browser storage is used only for UI theme and locally saved presentation style presets.
- Production embedding should use HTTPS and an explicit CSP.

## Repository workflow

`main` is intended to be protected. Changes should use a short-lived branch and Pull Request, with CI passing before merge. Recommended branch prefixes: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`.

This baseline is version `4.0.0`, aligned with prompt-helper release `v4`.
