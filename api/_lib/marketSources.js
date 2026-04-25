const WATCHLIST = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'equity' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'equity' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', coinGeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', coinGeckoId: 'ethereum' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'equity' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'equity' },
];

function unavailable(asset, reason, sourceName = 'none', sourceUrl = null) {
  return {
    symbol: asset.symbol,
    asset_name: asset.name,
    exact_price: null,
    price_text: 'Price unavailable from verified source.',
    source_name: sourceName,
    source_url: sourceUrl,
    verification_status: 'unavailable',
    notes: reason,
  };
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'AI-in-Action-Labs/1.0 educational-source-check',
      ...headers,
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: response.ok, status: response.status, json, text };
}

async function fetchCrypto(asset) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${asset.coinGeckoId}&vs_currencies=usd&include_last_updated_at=true`;
  try {
    const result = await fetchJson(url);
    const price = result.json?.[asset.coinGeckoId]?.usd;
    const updatedAt = result.json?.[asset.coinGeckoId]?.last_updated_at;
    if (typeof price !== 'number') return unavailable(asset, `CoinGecko did not return a numeric USD price. HTTP ${result.status}.`, 'CoinGecko', url);
    return {
      symbol: asset.symbol,
      asset_name: asset.name,
      exact_price: price,
      price_text: String(price),
      source_name: 'CoinGecko',
      source_url: url,
      verification_status: 'verified',
      notes: updatedAt ? `CoinGecko last_updated_at unix=${updatedAt}.` : 'CoinGecko simple price response did not include last_updated_at.',
    };
  } catch (error) {
    return unavailable(asset, error.message, 'CoinGecko', url);
  }
}

async function fetchEquity(asset) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return unavailable(asset, 'FINNHUB_API_KEY is not configured. Equity/ETF active quotes require a verified market-data API key.', 'Finnhub', 'https://finnhub.io/');
  }

  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(asset.symbol)}&token=${apiKey}`;
  try {
    const result = await fetchJson(url);
    const price = result.json?.c;
    const timestamp = result.json?.t;
    if (typeof price !== 'number' || price <= 0) {
      return unavailable(asset, `Finnhub did not return a positive current price. HTTP ${result.status}.`, 'Finnhub', 'https://finnhub.io/');
    }
    return {
      symbol: asset.symbol,
      asset_name: asset.name,
      exact_price: price,
      price_text: String(price),
      source_name: 'Finnhub',
      source_url: 'https://finnhub.io/',
      verification_status: 'verified',
      notes: timestamp ? `Finnhub quote timestamp unix=${timestamp}.` : 'Finnhub quote did not include timestamp.',
    };
  } catch (error) {
    return unavailable(asset, error.message, 'Finnhub', 'https://finnhub.io/');
  }
}

export async function fetchWatchlistPrices() {
  const results = [];
  for (const asset of WATCHLIST) {
    if (asset.type === 'crypto') {
      results.push(await fetchCrypto(asset));
    } else {
      results.push(await fetchEquity(asset));
    }
  }
  return results;
}

export { WATCHLIST };
