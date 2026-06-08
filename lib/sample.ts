/**
 * 配列から k 個を一様ランダムに選ぶ（部分 Fisher-Yates）。
 * crypto.getRandomValues を使用し、Server Component（react-hooks/purity ルール）にも適合する。
 * Uint32Array のサイズは選択数 k に固定されるため、Web Crypto の 65,536 バイト上限を超えない。
 */
export function sample<T>(arr: readonly T[], k: number): T[] {
  const n = Math.min(k, arr.length);
  if (n <= 0) return [];
  const pool = [...arr];
  const rnd = crypto.getRandomValues(new Uint32Array(n));
  for (let i = 0; i < n; i++) {
    // pool.length - i >= 1 が常に成立するため剰余の分母は 0 にならない
    const j = i + (rnd[i] % (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
