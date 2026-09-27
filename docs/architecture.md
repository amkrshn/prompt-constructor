# Architecture

## Components

```text
packages/core       Pure prompt construction and validation logic
packages/embed      Generic browser host bridge (iframe/modal + postMessage)
packages/react      React lifecycle wrapper around packages/embed
apps/standalone     Standalone UI and test environment
```

The core does not know about any host product or model provider. The embed layer knows only how to exchange a generated prompt with a browser host. React adds lifecycle management, not business logic.

## Protocol

Version 1 uses these message types:

- `prompt-constructor.prompt.configure`
- `prompt-constructor.prompt.insert`
- `prompt-constructor.prompt.ack`
- `prompt-constructor.prompt.close`

The receiving host validates exact origin and source window before accepting a prompt.
