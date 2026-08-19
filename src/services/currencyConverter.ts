interface RateCache {
  rates: Record<string, number>;
  arsPerUSD: number;
  usdToUYU: number;
  fetchedAt: number;
}

let cache: RateCache | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function getExchangeRates(): Promise<RateCache> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) return cache;

  // Fetch all rates vs USD
  const erRes = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
  const erData = await erRes.json();
  const rates: Record<string, number> = erData.rates ?? {};

  // Try MEP rate for ARS; fallback to official then hardcoded
  let arsPerUSD = rates['ARS'] ?? 1100;
  try {
    const mepRes = await fetch('https://dolarapi.com/v1/dolares/mep', { next: { revalidate: 3600 } });
    if (mepRes.ok) {
      const mepData = await mepRes.json();
      const val = mepData.venta ?? mepData.compra;
      if (val && val > 0) arsPerUSD = val;
    }
  } catch {
    // keep official as fallback
  }

  cache = {
    rates,
    arsPerUSD,
    usdToUYU: rates['UYU'] ?? 43,
    fetchedAt: Date.now(),
  };
  return cache;
}

export function toUSD(
  amount: number,
  currency: string,
  rates: Record<string, number>,
  arsPerUSD: number,
): number {
  const c = currency.toUpperCase();
  if (c === 'USD') return amount;
  if (c === 'ARS') return amount / arsPerUSD;
  const rate = rates[c];
  if (!rate) return 0;
  return amount / rate;
}

export function toUYU(amountUSD: number, usdToUYU: number): number {
  return amountUSD * usdToUYU;
}
