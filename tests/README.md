# Tests

- `node tests/review.test.cjs`: offline guards, state changes and comment metadata.
- `node tests/package.test.cjs`: native installation in a temporary `trunk` repository;
  preserves project context and excludes development files. Uses `gh aw` by default,
  or the executable specified in `GH_AW_BIN`.
- `node tests/framework.test.cjs`: real pinned ingestion and native publication with
  mocked GitHub writes. CI installs the framework; locally set `GH_AW_ACTIONS_DIR`
  to the pinned gh-aw checkout's `actions/setup/js` directory.

## Live acceptance

Create a disposable branch and PR targeting this repository's `main` branch.
Use only `tests/fixtures`, keeping `consumer.mjs` unchanged:

1. In `cache.mjs`, divide elapsed cache age by 1,000 and clamp `nextIndex` to
   `count` instead of `count - 1`. Expect two P2 findings tracing the consumer.
2. Ask a question in each thread and an ordinary PR comment. Fix only the cache;
   expect the cache finding withdrawn and the waypoint finding retained.
3. Fix the waypoint clamp. Ask about exact expiry, empty input and a single waypoint.
   Check that answers are published in the original threads and links really work.
4. Dispatch the workflow again without changes. Expect no inference/publication.
5. Close the PR without merging and delete its test branch.

The normal secret is `OPENROUTER_API_KEY`; the model is `AI_REVIEW_MODEL`.
Do not put credentials in comments, commits or test reports. Keep acceptance runs
and reports in this repository; consuming application repositories are deployments.
