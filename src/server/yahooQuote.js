export async function fetchYahooChart(symbol, range = '6mo', interval = '1d') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=${range}&interval=${interval}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; stock-analysis-app)' },
  })
  if (!res.ok) {
    throw new Error(`Yahoo Finance request failed: ${res.status}`)
  }
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) {
    const reason = data?.chart?.error?.description || 'no data returned'
    throw new Error(`No chart data for ${symbol}: ${reason}`)
  }
  const timestamps = result.timestamp || []
  const quote = result.indicators?.quote?.[0] || {}
  const candles = timestamps
    .map((t, i) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      open: quote.open?.[i] ?? null,
      high: quote.high?.[i] ?? null,
      low: quote.low?.[i] ?? null,
      close: quote.close?.[i] ?? null,
      volume: quote.volume?.[i] ?? null,
    }))
    .filter((c) => c.close != null)
  const meta = result.meta || {}
  return { candles, currency: meta.currency, exchangeName: meta.exchangeName }
}
