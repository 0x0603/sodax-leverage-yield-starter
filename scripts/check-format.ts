/**
 * Guards the display helpers in src/lib/format.ts against rounding regressions, so the app shows the same numbers
 * as other SODAX apps (APR rounds: 6.1666% → 6.17%) and small amounts stay readable (0.000375, not 0.0003).
 */
import assert from 'node:assert/strict';
import { formatRayPercent, formatTokenAmount } from '../src/lib/format';

const cases: [string, string][] = [
  // APR (RAY, 1e27 = 100%): nearest, half away from zero.
  [formatRayPercent(61_666_333_642_096_969_044_059_423n), '6.17%'],
  [formatRayPercent(77_775_600_000_000_000_000_000_000n), '7.78%'],
  [formatRayPercent(59_308_900_000_000_000_000_000_000n), '5.93%'],
  [formatRayPercent(-69_135_333_024_569_697_609_527_076n), '-6.91%'],
  [formatRayPercent(-1_000_000_000_000_000_000_000n), '0.00%'],
  [formatRayPercent(550_000_000_000_000_000_000_000n), '0.06%'],
  // Token amounts: round down; below 1, keep significant digits.
  [formatTokenAmount(375_000_000_000_000n, 18), '0.000375'],
  [formatTokenAmount(345_123_456_789_000n, 18), '0.0003451'],
  [formatTokenAmount(920_636_728_009_700_489n, 18), '0.9206'],
  [formatTokenAmount(793_601_982_464_541_021n, 18, 2), '0.79'],
  [formatTokenAmount(1_234_567_890n, 6), '1,234.5678'],
  [formatTokenAmount(4_999_999n, 6), '4.9999'],
  [formatTokenAmount(0n, 18), '0'],
  [formatTokenAmount(1n, 18), '0.000000000000000001'],
];

for (const [actual, expected] of cases) assert.equal(actual, expected);
console.log(`check-format: ${cases.length} display cases ✓`);
