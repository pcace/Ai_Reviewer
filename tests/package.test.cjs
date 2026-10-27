// Install the real package in a clean consumer; no application repository is touched.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const target = fs.mkdtempSync(
  path.join(require('node:os').tmpdir(), 'reviewer-install-')
);
const run = (command, args) =>
  execFileSync(command, args, { cwd: target, encoding: 'utf8' });
const aw = (args) =>
  process.env.GH_AW_BIN
    ? run(process.env.GH_AW_BIN, args)
    : run('gh', ['aw', ...args]);
try {
  run('git', ['init', '-b', 'trunk']);
  run('git', [
    'remote',
    'add',
    'origin',
    'https://github.com/example/consumer.git',
  ]);
  fs.mkdirSync(path.join(target, '.github'));
  const context = 'Consumer-specific rules must survive installation.\n';
  fs.writeFileSync(path.join(target, '.github/review-context.md'), context);
  run('git', ['add', '.']);
  run('git', [
    '-c',
    'user.name=Package test',
    '-c',
    'user.email=test@example.com',
    'commit',
    '-m',
    'Create independent consumer',
  ]);
  const packageRef = process.env.REVIEW_PACKAGE || root;
  process.stdout.write(aw(['add', packageRef]));
  for (const file of ['review.cjs']) {
    const relative = path.join('.github/aw/ai-review', file);
    assert.equal(
      fs.readFileSync(path.join(target, relative), 'utf8'),
      fs.readFileSync(path.join(root, relative), 'utf8')
    );
  }
  assert.equal(
    fs.readFileSync(path.join(target, '.github/aw/ai-review/LICENSE'), 'utf8'),
    fs.readFileSync(path.join(root, 'LICENSE'), 'utf8')
  );
  assert.equal(
    fs.readFileSync(path.join(target, '.github/review-context.md'), 'utf8'),
    context
  );
  assert.ok(!fs.existsSync(path.join(target, 'tests')));
  assert.ok(!fs.existsSync(path.join(target, '.github/workflows/checks.yml')));
  const helper = path.join(target, '.github/aw/ai-review/review.cjs');
  fs.writeFileSync(helper, '// obsolete installed helper\n');
  process.stdout.write(aw(['add', packageRef, '--force']));
  assert.equal(
    fs.readFileSync(helper, 'utf8'),
    fs.readFileSync(path.join(root, '.github/aw/ai-review/review.cjs'), 'utf8')
  );
  assert.equal(
    fs.readFileSync(path.join(target, '.github/review-context.md'), 'utf8'),
    context
  );
  const lock = path.join(target, '.github/workflows/ai-review.lock.yml');
  const installed = fs.readFileSync(lock, 'utf8');
  assert.ok(installed.includes('.github/aw/ai-review/review.cjs'));
  assert.ok(!installed.includes('/home/johannes'));
  assert.ok(!installed.includes('RoadbookNavi'));
  // Public checkouts can hide missing token scopes; private repositories cannot.
  const preparation =
    installed.match(/^  context:\n(?: {4}.*\n|\n)*/m)?.[0] || '';
  for (const scope of ['contents', 'pull-requests']) {
    assert.match(
      preparation,
      new RegExp(`^      ${scope}: read$`, 'm'),
      `Preparation needs explicit ${scope}: read for private repositories.`
    );
  }
  process.stdout.write(
    aw(['compile', 'ai-review', '--no-check-update', '--no-logo'])
  );
  const metadata = (text) =>
    text
      .split('\n')
      .slice(0, 2)
      .map((line) => JSON.parse(line.slice(line.indexOf('{'))));
  assert.deepEqual(
    metadata(fs.readFileSync(lock, 'utf8')),
    metadata(installed)
  );
  // A fresh consumer must select both models without any repository settings.
  const [workflow] = metadata(installed);
  const model = preparation.match(/^      model: ([^\s${}]+)$/m)?.[1];
  assert.ok(model, 'The preparation job must supply a literal model ID.');
  assert.match(model, /^[a-z0-9-]+\/[a-zA-Z0-9._:-]+$/);
  assert.equal(workflow.agent_model, 'openrouter/' + workflow.detection_agent_model);
  assert.equal(workflow.detection_agent_model, '${{ needs.context.outputs.model }}');
  assert.ok(installed.includes('aw-gateway/${{ needs.context.outputs.model }}'));
  assert.match(
    installed,
    /^          GH_AW_MODEL_DETECTION_CODEX: \$\{\{ needs.context.outputs.model \}\}$/m,
    'Codex must receive the full OpenRouter ID without stripping openai/.'
  );
  assert.match(
    installed,
    /^  detection:\n(?: {4}.*\n|\n)*      - context$/m,
    'Threat detection must depend on the job that supplies its model.'
  );
  assert.doesNotMatch(installed, /(?:vars|secrets)\.AI_REVIEW_MODEL/);
  console.log(
    'PASS: native install/upgrade replaces runtime, preserves source hashes, project context and license; excludes development files.'
  );
} finally {
  fs.rmSync(target, { recursive: true, force: true });
}
