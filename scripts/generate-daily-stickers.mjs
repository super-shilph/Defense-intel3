import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fetchJpTrendingKeywords } from '../src/lib/trends.js'
import { planStickerSet } from '../src/lib/stickerPlanner.js'
import { getImageProvider } from '../src/lib/imageProviders/index.js'

const OUTPUT_ROOT = path.join(process.cwd(), 'public', 'output')

function todayDateString() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

async function generateDailySet() {
  const date = todayDateString()
  const outDir = path.join(OUTPUT_ROOT, date)
  await mkdir(outDir, { recursive: true })

  console.log('[1/3] Fetching JP trending keywords...')
  const keywords = await fetchJpTrendingKeywords()
  console.log(`  -> ${keywords.join(', ')}`)

  console.log('[2/3] Planning sticker concepts...')
  const concepts = planStickerSet(keywords)

  console.log(`[3/3] Generating ${concepts.length} images via "${process.env.IMAGE_PROVIDER || 'mock'}" provider...`)
  const provider = getImageProvider()
  const stickers = []
  for (const concept of concepts) {
    const fileName = `sticker-${String(concept.index + 1).padStart(2, '0')}.png`
    const buffer = await provider.generateImage(concept)
    await writeFile(path.join(outDir, fileName), buffer)
    stickers.push({ ...concept, file: fileName })
    console.log(`  -> ${fileName} (${concept.caption})`)
  }

  const manifest = {
    date,
    theme: concepts[0]?.theme,
    keywords,
    provider: process.env.IMAGE_PROVIDER || 'mock',
    stickers,
  }
  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  await updateIndex(date)

  console.log(`Done. Output written to ${path.relative(process.cwd(), outDir)}`)
}

async function updateIndex(date) {
  const indexPath = path.join(OUTPUT_ROOT, 'index.json')
  let dates = []
  try {
    dates = JSON.parse(await readFile(indexPath, 'utf-8'))
  } catch {
    dates = []
  }
  if (!dates.includes(date)) dates.push(date)
  dates.sort().reverse()
  await writeFile(indexPath, JSON.stringify(dates, null, 2))
}

generateDailySet().catch((err) => {
  console.error('Daily sticker generation failed:', err)
  process.exit(1)
})
