import { mkdtemp, mkdir, copyFile, rm, readFile, cp as copyDir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Generates the standalone package in a temporary copy of the sources, so tests exercise the real
// packaged output on a fresh clone and never write generated files into the working tree.
export async function buildPackage() {
  const temp = await mkdtemp(path.join(tmpdir(), 'c-and-c-package-'));
  try {
    const copy = path.join(temp, 'repo');
    await mkdir(copy, { recursive: true });
    await copyDir(path.join(root, 'dist'), path.join(copy, 'dist'), { recursive: true });
    await copyFile(path.join(root, 'scripts-package.py'), path.join(copy, 'scripts-package.py'));
    await copyFile(path.join(root, 'package.json'), path.join(copy, 'package.json'));
    const py = process.platform === 'win32' ? 'python' : 'python3';
    const run = spawnSync(py, ['-X', 'utf8', 'scripts-package.py'], { cwd: copy, encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
    if (run.status !== 0) throw new Error(run.stderr || run.stdout);
    const { version } = JSON.parse(await readFile(path.join(copy, 'package.json'), 'utf8'));
    return {
      dir: copy,
      version,
      html: await readFile(path.join(copy, 'Crown-and-Calamity.html'), 'utf8'),
      cleanup: () => rm(temp, { recursive: true, force: true }),
    };
  } catch (error) {
    await rm(temp, { recursive: true, force: true });
    throw error;
  }
}
