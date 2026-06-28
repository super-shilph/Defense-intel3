import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchYahooChart } from './src/server/yahooQuote.js'

function devQuoteApi() {
  return {
    name: 'dev-quote-api',
    configureServer(server) {
      server.middlewares.use('/api/quote', async (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        const symbol = url.searchParams.get('symbol') || '9201.T'
        res.setHeader('Content-Type', 'application/json')
        try {
          const { candles, currency, exchangeName } = await fetchYahooChart(symbol)
          res.end(JSON.stringify({ symbol, currency, exchangeName, candles }))
        } catch (e) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devQuoteApi()],
})
