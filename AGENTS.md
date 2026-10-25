# Working on the reviewer

This is the canonical implementation and test repository. Change consuming
repositories only when the user explicitly requests their deployment or update.

- Configure tools and edit review instructions in `.github/workflows/ai-review.md`.
- Keep custom JavaScript in `.github/aw/ai-review/review.cjs`; prefer native gh-aw features.
- Recompile with pinned gh-aw v0.93.4; never edit `.lock.yml` manually.
- Run the regression and package tests in `tests/`; CI also runs the framework test.
- Use temporary PRs in this repository for live acceptance. Never merge deliberately
  broken fixtures. Preserve author filtering, state guards and separate publishing.
- Never commit or log credentials. Maintain the package and its tests together.
