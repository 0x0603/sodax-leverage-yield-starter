/**
 * Workshop preflight: run the day before and again on the venue network.
 *
 *   pnpm preflight
 *
 * Read-only. Checks Node, the SODAX API, RPCs, the vault registry and live APRs, then runs a deposit quote
 * matrix (USDC on each workshop source chain → every vault) to confirm routes exist and find the current
 * minimum deposit. Nothing is signed or sent.
 */
import { Sodax } from '@sodax/sdk';
import { ChainKeys, type SpokeChainKey } from '@sodax/types';
import { formatUnits, parseUnits } from 'viem';
import { EVM_RPC_URLS } from '../src/config/rpc';
import { sodaxConfig } from '../src/config/sodax';
import { DEFAULT_TOKEN_KEY, getTokenByKey, SOURCE_CHAINS } from '../src/config/workshop';

const API = 'https://api.sodax.com/v1';
const AMOUNTS_USD = ['1', '2', '5', '10'];
/** The solver's minimum has been ~$2. $1 is probed on purpose and is expected to fail. */
const EXPECTED_MIN_USD = 2;

let failures = 0;
const ok = (msg: string) => console.log(`  ✅ ${msg}`);
const warn = (msg: string) => console.log(`  ⚠️  ${msg}`);
const fail = (msg: string) => {
  failures++;
  console.log(`  ❌ ${msg}`);
};

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  const value = await fn();
  return [value, Math.round(performance.now() - start)];
}

async function main() {
  console.log('\nSODAX Leverage Yield preflight\n');

  console.log('Environment');
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major > 22 || (major === 22 && minor >= 12)) ok(`Node ${process.versions.node}`);
  else fail(`Node ${process.versions.node}, need >= 22.12`);

  console.log('\nSODAX API (keyless)');
  try {
    const [res, ms] = await timed(() => fetch(`${API}/leverage-yield/vaults`));
    if (res.ok) ok(`GET /leverage-yield/vaults → ${res.status} in ${ms} ms`);
    else fail(`GET /leverage-yield/vaults → HTTP ${res.status}`);
  } catch (error) {
    fail(`API unreachable: ${(error as Error).message}`);
  }

  console.log('\nRPCs');
  for (const chainKey of [ChainKeys.SONIC_MAINNET, ...SOURCE_CHAINS.filter(key => key !== ChainKeys.SONIC_MAINNET)]) {
    const url = EVM_RPC_URLS[chainKey as keyof typeof EVM_RPC_URLS];
    try {
      const [res, ms] = await timed(() =>
        fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
        }),
      );
      const body = (await res.json()) as { result?: string };
      if (body.result) ok(`${chainKey}: block ${BigInt(body.result)} in ${ms} ms (${url})`);
      else fail(`${chainKey}: bad response from ${url}`);
    } catch (error) {
      fail(`${chainKey}: ${url} unreachable (${(error as Error).message})`);
    }
  }

  const sodax = new Sodax(sodaxConfig);
  const vaults = sodax.leverageYield.listVaults();

  console.log(`\nVaults (${vaults.length}) — live reads via the SDK`);
  for (const vault of vaults) {
    const [apr, tvl] = await Promise.all([
      sodax.leverageYield.getEffectiveApr(vault.vault),
      sodax.leverageYield.getTotalAssets(vault.vault),
    ]);
    if (apr.ok && tvl.ok) {
      const pct = Number((apr.value.effectiveNetAprRay * 10_000n) / 10n ** 27n) / 100;
      const stale = apr.value.lsdApr.stale ? ' (LSD APR is an estimate)' : '';
      ok(
        `${vault.name}: effective APR ${pct.toFixed(2)}%${stale}, TVL ${Number(formatUnits(tvl.value, 18)).toFixed(4)}`,
      );
    } else {
      fail(`${vault.name}: read failed (${!apr.ok ? apr.error.message : ''} ${!tvl.ok ? tvl.error.message : ''})`);
    }
  }

  console.log(`\nDeposit quotes: ${DEFAULT_TOKEN_KEY} → vault (SDK getQuote, retries NO_PATH once)`);
  for (const chainKey of SOURCE_CHAINS) {
    const token = getTokenByKey(chainKey as SpokeChainKey, DEFAULT_TOKEN_KEY);
    if (!token) {
      fail(`${chainKey}: no ${DEFAULT_TOKEN_KEY} in SDK config`);
      continue;
    }
    for (const vault of vaults) {
      const cells: string[] = [];
      let minimum: string | undefined;
      for (const usd of AMOUNTS_USD) {
        const quote = async () =>
          sodax.leverageYield.getQuote({
            token_src: token.address,
            token_src_blockchain_id: chainKey as SpokeChainKey,
            token_dst: vault.vault,
            token_dst_blockchain_id: ChainKeys.SONIC_MAINNET,
            amount: parseUnits(usd, token.decimals),
            quote_type: 'exact_input',
          });
        let [result, ms] = await timed(quote);
        if (!result.ok) [result, ms] = await timed(quote);
        if (result.ok) {
          minimum ??= usd;
          cells.push(`$${usd}→${Number(formatUnits(result.value.quoted_amount, 18)).toFixed(4)} (${ms}ms)`);
        } else {
          const error = result.error as { detail?: { message?: string }; message?: string };
          cells.push(`$${usd}→✗ ${error.detail?.message ?? error.message ?? 'error'}`);
        }
      }
      const line = `${chainKey} → ${vault.name}: ${cells.join(' | ')}`;
      if (!minimum) fail(line);
      else if (Number(minimum) > EXPECTED_MIN_USD) warn(`${line}  [min ≈ $${minimum}, higher than usual]`);
      else ok(`${line}  [min ≈ $${minimum}]`);
    }
  }

  console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
