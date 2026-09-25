/**
 * Guard: every @sodax/* package must be the workshop's pinned release candidate.
 *
 * `pnpm add @sodax/<pkg>` without a version installs npm's `latest` (2.1.0), which lacks parts of the
 * Leverage Yield API this repo uses. Run by `pnpm check`.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const EXPECTED = '2.2.0-rc.7';
const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

const declared: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
const problems: string[] = [];

for (const [name, spec] of Object.entries(declared)) {
  if (!name.startsWith('@sodax/')) continue;
  if (spec !== EXPECTED) problems.push(`${name}: package.json has "${spec}", expected exactly "${EXPECTED}"`);
  try {
    const installed = JSON.parse(readFileSync(path.join(root, 'node_modules', name, 'package.json'), 'utf8')).version;
    if (installed !== EXPECTED)
      problems.push(`${name}: installed ${installed}, expected ${EXPECTED} (run pnpm install)`);
  } catch {
    problems.push(`${name}: not installed (run pnpm install)`);
  }
}

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) problems.push(`Node ${process.versions.node}: need >= 22.12`);

if (problems.length) {
  console.error(`check-versions failed:\n${problems.map(p => `  - ${p}`).join('\n')}`);
  console.error(
    `\nDo not add or upgrade @sodax/* packages during the workshop. Restore "${EXPECTED}" and run pnpm install.`,
  );
  process.exit(1);
}
console.log(`check-versions: @sodax/* pinned to ${EXPECTED} ✓`);
