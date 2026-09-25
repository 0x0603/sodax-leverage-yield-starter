/**
 * Keeps the Claude Code copy of the workshop skill identical to the canonical one.
 *
 *   .agents/skills/sodax-leverage-yield/   ← canonical (Codex, `npx skills`, AGENTS.md all point here)
 *   .claude/skills/sodax-leverage-yield/   ← committed copy for Claude Code (no symlink: breaks on Windows)
 *
 * `pnpm check` verifies they match. After editing the canonical skill run `pnpm sync:skills`.
 */
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const canonical = path.join(root, '.agents/skills/sodax-leverage-yield');
const copy = path.join(root, '.claude/skills/sodax-leverage-yield');

function listFiles(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? listFiles(full, base) : [path.relative(base, full)];
  });
}

if (process.argv.includes('--write')) {
  rmSync(copy, { recursive: true, force: true });
  cpSync(canonical, copy, { recursive: true });
  console.log('sync:skills: copied .agents/skills/sodax-leverage-yield → .claude/skills/sodax-leverage-yield');
  process.exit(0);
}

const a = listFiles(canonical).sort();
const b = listFiles(copy).sort();
const drift = [
  ...a.filter(file => !b.includes(file)).map(file => `missing in .claude copy: ${file}`),
  ...b.filter(file => !a.includes(file)).map(file => `extra in .claude copy: ${file}`),
  ...a
    .filter(file => b.includes(file))
    .filter(file => !readFileSync(path.join(canonical, file)).equals(readFileSync(path.join(copy, file))))
    .map(file => `differs: ${file}`),
];

if (a.length === 0) {
  console.error('check-skills: canonical skill not found at .agents/skills/sodax-leverage-yield');
  process.exit(1);
}
if (drift.length) {
  console.error(`check-skills: .claude skill copy is out of date:\n${drift.map(d => `  - ${d}`).join('\n')}`);
  console.error('Run: pnpm sync:skills');
  process.exit(1);
}
console.log('check-skills: skill copies in sync ✓');
