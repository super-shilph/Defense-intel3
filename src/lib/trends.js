import googleTrends from 'google-trends-api'

const FALLBACK_KEYWORDS = ['猫', '犬', '推し活', 'お疲れ様', 'ありがとう']

/**
 * Fetches today's trending search terms for Japan via Google Trends'
 * unofficial daily-trends endpoint. Falls back to a fixed keyword list
 * if the request fails (e.g. no network access, endpoint changes).
 */
export async function fetchJpTrendingKeywords(limit = 10) {
  try {
    const raw = await googleTrends.dailyTrends({ geo: 'JP' })
    const data = JSON.parse(raw)
    const days = data?.default?.trendingSearchesDays ?? []
    const keywords = []
    for (const day of days) {
      for (const search of day.trendingSearches ?? []) {
        const title = search?.title?.query
        if (title && !keywords.includes(title)) keywords.push(title)
      }
    }
    if (keywords.length === 0) throw new Error('no trends returned')
    return keywords.slice(0, limit)
  } catch (err) {
    console.warn(`[trends] falling back to default keywords: ${err.message}`)
    return FALLBACK_KEYWORDS.slice(0, limit)
  }
}
