# Development

## Branches

Use short-lived branches and Pull Requests. Do not commit directly to protected `main`.

## Required checks

`npm run check` performs syntax checks, a neutralization scan, unit tests and a standalone build.

## Definition of done

- no provider or customer-specific data in reusable source;
- no credentials or `.env` files;
- prompt logic tests pass;
- standalone build succeeds;
- integration contract changes are documented;
- behavior-changing changes are added to `CHANGELOG.md`.
