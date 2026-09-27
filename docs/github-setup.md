# GitHub repository setup

The repository should remain **Private** and use `main` as the default branch.

No open-source license is included in the project baseline. Add one only after an explicit licensing decision.

## Recommended ruleset for `main`

- Require a pull request before merging.
- Require at least one approval when more than one maintainer is available.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merging.
- Require status check `validate` from `.github/workflows/ci.yml`.
- Block force pushes.
- Block branch deletion.
- Prefer squash merge for focused PR history.

## Repository settings

- Enable Issues.
- Enable Dependabot alerts and security updates when available for the account/plan.
- Enable secret scanning and push protection when available.
- Disable wiki/discussions unless the project actually uses them.
- Repository description: `Configurable prompt construction toolkit with standalone UI and React integration.`

Do not push the earlier product-specific source archive or its history into this repository.
