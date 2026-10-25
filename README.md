# AI PR Reviewer

Pi reads and searches the complete PR checkout using an OpenRouter model.
GitHub Agentic Workflows publishes verified inline findings, thread replies and a
short review summary. This repository owns the implementation, tests and releases.

## Install in a GitHub repository

Run from the target checkout (GitHub CLI and Node.js required):

```sh
gh extension install github/gh-aw --pin v0.93.4
gh aw add pcace/Ai_Reviewer@v0.1.0
gh secret set OPENROUTER_API_KEY
gh variable set AI_REVIEW_MODEL --body openai/gpt-5.3-codex
```

Commit the generated files and merge into the default branch. Repository and base
branch are detected automatically. Optionally add `.github/review-context.md` for
project-specific conventions; installation does not overwrite it. Ignore generated
`*.lock.yml` files in your formatter. No application dependencies or database.

To update the **whole package**, including its JavaScript helpers:

```sh
gh aw update https://github.com/pcace/Ai_Reviewer
```

Review and commit the resulting changes. Installed copies are versioned deployment
artifacts; maintain the source and tests here. Do not maintain separate forks of
the reviewer in each application repository.

## Maintain here

| File | Responsibility |
| --- | --- |
| `.github/workflows/ai-review.md` | Configuration above `---`; review instructions below |
| `.github/aw/ai-review/review.cjs` | Authorization, snapshots, guards and discussion reads |
| `aw.yml` | Installable files; excludes tests and this project's context |
| `tests/` | Regression, framework, installation and live acceptance tests |

```sh
node tests/review.test.cjs
gh aw compile ai-review --no-check-update --no-logo
node tests/package.test.cjs
```

CI also tests the adapter against the pinned framework's actual ingestion and
publisher. For live tests use disposable PRs in **this repository**, following
[tests/README.md](tests/README.md). Never merge intentionally broken fixtures.

## Behavior and boundaries

Reviews run on PR changes and human discussion. Only repository writers and open,
non-draft, same-repository PRs targeting the default branch are admitted. GitHub.com
is supported; fork PRs are skipped. Pi can read/search but cannot execute or edit
project code. A separate job checks the captured state and publishes through native
safe-output handlers. GitHub discussion is the memory; unchanged states are skipped.

Approved-author filtering also trusts our own bot. Node IDs and explicit, encoded
comment links avoid collisions with OpenRouter's phone filter; comment bodies stay
unchanged. Thread replies share one batch because custom safe-output scripts accept
one call. Budgets are estimates; unknown models use $3 input / $15 output per million
tokens for accounting, not billing. A push can race the final publication API call;
reviews always identify the captured commit. See Actions logs/artifacts for failures.

Extracted from RoadbookNavi's reviewer at `d57d090`; its existing [GPLv3 license](LICENSE)
is preserved. No RoadbookNavi application code is included.
