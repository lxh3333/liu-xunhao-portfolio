import { spawnSync } from 'node:child_process';
import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (args, options = {}) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `git ${args[0]} failed`);
  return result.stdout.trim();
};

// Publish through an isolated index: the main branch and its staging area
// remain untouched, and gh-pages updates are ordinary fast-forward pushes.
const remote = run(['remote', 'get-url', 'origin']);
const build = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const bundle = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, DEPLOY_BASE: '/liu-xunhao-portfolio/' },
});
if (bundle.status !== 0) process.exit(bundle.status || 1);
writeFileSync(resolve(root, 'dist/.nojekyll'), '');

const index = resolve(tmpdir(), `portfolio-pages-${randomUUID()}.index`);
try {
  const published = run(['ls-remote', '--heads', 'origin', 'gh-pages']);
  let parent = '';
  if (published) {
    run(['fetch', 'origin', 'gh-pages']);
    parent = run(['rev-parse', 'FETCH_HEAD']);
  }
  const gitDir = run(['rev-parse', '--absolute-git-dir']);
  const env = { ...process.env, GIT_INDEX_FILE: index };
  const gitArgs = [`--git-dir=${gitDir}`, `--work-tree=${resolve(root, 'dist')}`];
  run([...gitArgs, 'read-tree', '--empty'], { env });
  run([...gitArgs, 'add', '--force', '--all', '.'], { cwd: resolve(root, 'dist'), env });
  const tree = run([...gitArgs, 'write-tree'], { env });
  const source = run(['rev-parse', '--short', 'HEAD']);
  const commit = run(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', `Deploy portfolio from ${source}`]);
  const push = spawnSync('git', ['push', remote, `${commit}:refs/heads/gh-pages`], { cwd: root, stdio: 'inherit' });
  if (push.status !== 0) process.exitCode = push.status || 1;
  else console.log('Published: https://lxh3333.github.io/liu-xunhao-portfolio/');
} finally {
  if (existsSync(index)) unlinkSync(index);
}
