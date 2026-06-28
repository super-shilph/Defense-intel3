import { fetchYahooChart } from '../src/server/yahooQuote.js'

export default async function handler(req, res) {
  const symbol = req.query.symbol || '9201.T'
  try {
    const { candles, currency, exchangeName } = await fetchYahooChart(symbol)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({ symbol, currency, exchangeName, candles })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
