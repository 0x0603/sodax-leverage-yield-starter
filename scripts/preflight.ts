/**
 * Workshop preflight: run the day before and again on the venue network.
 *
 *   pnpm preflight
 *
 * Read-only. Checks Node, the SODAX API, the app's RPCs (including VITE_*_RPC_URL overrides from .env files),
 * the vault registry and live APRs, then runs a deposit quote matrix (USDC on each workshop source chain →
 * every vault) to confirm routes exist and find the current minimum deposit. Nothing is signed or sent.
 */
import { isNoRouteRefusal, Sodax } from '@sodax/sdk';
import { ChainKeys, type LeverageYieldVault, type SpokeChainKey, type XToken } from '@sodax/types';
import { formatUnits, parseUnits } from 'viem';
import { loadEnv } from 'vite';
import { evmRpcUrls } from '../src/config/rpc';
import { createSodaxConfig } from '../src/config/sodax';
import { DEFAULT_TOKEN_KEY, getTokenByKey, SOURCE_CHAINS } from '../src/config/workshop';
import { formatRayPercent } from '../src/lib/format';

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

async function checkRpc(chainKey: string, url: string): Promise<string> {
  try {
    const [res, ms] = await timed(() =>
      fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
      }),
    );
    const body = (await res.json()) as { result?: string };
    return body.result
      ? `✅ ${chainKey}: block ${BigInt(body.result)} in ${ms} ms (${url})`
      : `❌ ${chainKey}: bad response from ${url}`;
  } catch (error) {
    return `❌ ${chainKey}: ${url} unreachable (${(error as Error).message})`;
  }
}

/** One chain/vault row of the quote matrix. Amounts run in order; only no-route refusals are retried. */
async function quoteRow(sodax: Sodax, chainKey: SpokeChainKey, token: XToken, vault: LeverageYieldVault) {
  const cells: string[] = [];
  let minimum: string | undefined;
  for (const usd of AMOUNTS_USD) {
    const quote = () =>
      sodax.leverageYield.getQuote({
        token_src: token.address,
        token_src_blockchain_id: chainKey,
        token_dst: vault.vault,
        token_dst_blockchain_id: ChainKeys.SONIC_MAINNET,
        amount: parseUnits(usd, token.decimals),
        quote_type: 'exact_input',
      });
    let [result, ms] = await timed(quote);
    if (!result.ok && isNoRouteRefusal(result.error)) [result, ms] = await timed(quote);
    if (result.ok) {
      minimum ??= usd;
      cells.push(`$${usd}→${Number(formatUnits(result.value.quoted_amount, 18)).toFixed(4)} (${ms}ms)`);
    } else {
      const error = result.error as { detail?: { message?: string }; message?: string };
      cells.push(`$${usd}→✗ ${error.detail?.message ?? error.message ?? 'error'}`);
    }
  }
  return { line: `${chainKey} → ${vault.name}: ${cells.join(' | ')}`, minimum };
}

async function main() {
  console.log('\nSODAX Leverage Yield preflight\n');

  console.log('Environment');
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major > 22 || (major === 22 && minor >= 12)) ok(`Node ${process.versions.node}`);
  else fail(`Node ${process.versions.node}, need >= 22.12`);

  // Same RPCs the app uses, including VITE_*_RPC_URL overrides from .env / .env.local.
  const rpcUrls = evmRpcUrls(loadEnv('development', process.cwd(), 'VITE_'));
  const sodax = new Sodax(createSodaxConfig(rpcUrls));
  const vaults = sodax.leverageYield.listVaults();
  const rpcChains = [ChainKeys.SONIC_MAINNET, ...SOURCE_CHAINS.filter(key => key !== ChainKeys.SONIC_MAINNET)];

  // Independent checks run concurrently; output is printed in a stable order afterwards.
  const [api, rpcs, vaultReads, rows] = await Promise.all([
    timed(() => fetch(`${API}/leverage-yield/vaults`)).then(
      ([res, ms]) =>
        res.ok
          ? `✅ GET /leverage-yield/vaults → ${res.status} in ${ms} ms`
          : `❌ GET /leverage-yield/vaults → HTTP ${res.status}`,
      error => `❌ API unreachable: ${(error as Error).message}`,
    ),
    Promise.all(rpcChains.map(chainKey => checkRpc(chainKey, rpcUrls[chainKey as keyof typeof rpcUrls]))),
    Promise.all(
      vaults.map(async vault => {
        const [apr, tvl] = await Promise.all([
          sodax.leverageYield.getEffectiveApr(vault.vault),
          sodax.leverageYield.getTotalAssets(vault.vault),
        ]);
        if (!apr.ok || !tvl.ok) {
          return `❌ ${vault.name}: read failed (${!apr.ok ? apr.error.message : ''} ${!tvl.ok ? tvl.error.message : ''})`;
        }
        const stale = apr.value.lsdApr.stale ? ' (LSD APR is an estimate)' : '';
        const tvlText = Number(formatUnits(tvl.value, 18)).toFixed(4);
        return `✅ ${vault.name}: effective APR ${formatRayPercent(apr.value.effectiveNetAprRay)}${stale}, TVL ${tvlText}`;
      }),
    ),
    Promise.all(
      SOURCE_CHAINS.flatMap(chainKey => {
        const token = getTokenByKey(chainKey, DEFAULT_TOKEN_KEY);
        if (!token)
          return [Promise.resolve({ line: `${chainKey}: no ${DEFAULT_TOKEN_KEY} in SDK config`, minimum: undefined })];
        return vaults.map(vault => quoteRow(sodax, chainKey, token, vault));
      }),
    ),
  ]);

  const report = (line: string) => (line.startsWith('❌') ? fail(line.slice(2)) : ok(line.slice(2)));
  console.log('\nSODAX API (keyless)');
  report(api);
  console.log('\nRPCs');
  rpcs.forEach(report);
  console.log(`\nVaults (${vaults.length}): live reads via the SDK`);
  vaultReads.forEach(report);
  console.log(`\nDeposit quotes: ${DEFAULT_TOKEN_KEY} → vault (SDK getQuote, retries no-route once)`);
  for (const { line, minimum } of rows) {
    if (!minimum) fail(line);
    else if (Number(minimum) > EXPECTED_MIN_USD) warn(`${line}  [min ≈ $${minimum}, higher than usual]`);
    else ok(`${line}  [min ≈ $${minimum}]`);
  }

  console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
