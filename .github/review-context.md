# Reviewer project context

This repository maintains the portable AI PR reviewer and its own acceptance tests.
The installed runtime lives in `.github/aw/ai-review`; `aw.yml` defines the package.
Keep consumer installs independent of this repository's tests, fixtures and context.
Preserve approved-author filtering, immutable snapshots, duplicate/stale-output
checks and native safe-output publishing. Never execute code from a reviewed PR.
`tests/fixtures` contains isolated synthetic contracts for disposable acceptance PRs.
