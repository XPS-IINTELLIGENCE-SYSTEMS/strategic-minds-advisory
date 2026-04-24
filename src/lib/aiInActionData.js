import { safeSelect } from '@/lib/supabaseClient';

export const fallbackPortfolioSnapshot = {
  starting_value: 50000,
  current_value: 50000,
  cash_value: 10000,
  risk_status: 'normal',
  lesson: 'Initial synthetic paper-trading state. Live prices must be verified before active decisions.',
  source_summary: 'Synthetic fallback only. Not live market data.',
  allocation: [
    { symbol: 'CASH', allocation: 20, value: 10000 },
    { symbol: 'SPY', allocation: 18, value: 9000 },
    { symbol: 'QQQ', allocation: 14, value: 7000 },
    { symbol: 'BTC', allocation: 14, value: 7000 },
    { symbol: 'ETH', allocation: 10, value: 5000 },
    { symbol: 'NVDA', allocation: 10, value: 5000 },
    { symbol: 'GLD', allocation: 7, value: 3500 },
    { symbol: 'TACTICAL', allocation: 7, value: 3500 },
  ],
  equity_curve: [
    { label: 'Start', value: 50000 },
    { label: 'W1', value: 50000 },
    { label: 'W2', value: 50000 },
    { label: 'W3', value: 50000 },
    { label: 'W4', value: 50000 },
  ],
};

export const fallbackPriceChecks = [
  { symbol: 'SPY', asset_name: 'S&P 500 ETF', price_text: 'Fetch live', source_name: 'Verified market source required', verification_status: 'pending' },
  { symbol: 'QQQ', asset_name: 'Nasdaq 100 ETF', price_text: 'Fetch live', source_name: 'Verified market source required', verification_status: 'pending' },
  { symbol: 'BTC', asset_name: 'Bitcoin', price_text: 'Fetch live', source_name: 'Verified market source required', verification_status: 'pending' },
  { symbol: 'ETH', asset_name: 'Ethereum', price_text: 'Fetch live', source_name: 'Verified market source required', verification_status: 'pending' },
  { symbol: 'NVDA', asset_name: 'Large-Cap Momentum', price_text: 'Fetch live', source_name: 'Verified market source required', verification_status: 'pending' },
  { symbol: 'GLD', asset_name: 'Gold ETF / Hedge', price_text: 'Fetch live', source_name: 'Verified market source required', verification_status: 'pending' },
];

export const fallbackTrades = [
  {
    symbol: 'WATCH',
    setup: 'No simulated trade entered yet',
    status: 'watching',
    thesis: 'The system waits for verified live prices and a valid setup before paper trading.',
    lesson: 'No trade is a valid decision when evidence is insufficient.',
  },
];

export const fallbackContentPackages = [
  {
    package_type: 'daily-content',
    title: 'AI checked the market with a paper account',
    platform: 'YouTube Shorts / TikTok / Reels',
    hook: 'Watch AI decide whether to trade or stand down using exact-source data.',
    status: 'draft',
  },
];

export async function loadAIInActionData() {
  const [snapshots, prices, trades, content, logs] = await Promise.all([
    safeSelect('paper_portfolio_snapshots', [fallbackPortfolioSnapshot]),
    safeSelect('asset_price_checks', fallbackPriceChecks),
    safeSelect('paper_trades', fallbackTrades),
    safeSelect('content_packages', fallbackContentPackages),
    safeSelect('platform_logs', []),
  ]);

  const snapshotRows = snapshots.data || [fallbackPortfolioSnapshot];
  const latestSnapshot = snapshotRows[0] || fallbackPortfolioSnapshot;

  return {
    mode: snapshots.mode === 'live' ? 'live' : 'fallback',
    snapshot: latestSnapshot,
    priceChecks: prices.data?.length ? prices.data : fallbackPriceChecks,
    trades: trades.data?.length ? trades.data : fallbackTrades,
    contentPackages: content.data?.length ? content.data : fallbackContentPackages,
    logs: logs.data || [],
    errors: [snapshots.error, prices.error, trades.error, content.error, logs.error].filter(Boolean),
  };
}
