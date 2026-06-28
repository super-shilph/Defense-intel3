import { STICKERS_PER_SET } from './lineStickerSpec.js'

// Emotion/phrase templates commonly seen in best-selling LINE sticker sets.
// Each template pairs a short on-image caption with an art-direction hint
// used to build the image-generation prompt.
const EMOTION_TEMPLATES = [
  { caption: 'おはよう', mood: 'cheerful morning greeting, bright colors' },
  { caption: 'ありがとう', mood: 'grateful, warm smile, sparkles' },
  { caption: 'お疲れ様です', mood: 'tired but encouraging, gentle expression' },
  { caption: 'ごめんね', mood: 'apologetic, teary eyes, small bow' },
  { caption: 'すごい！', mood: 'excited, surprised, starry eyes' },
  { caption: 'がんばる！', mood: 'determined, fist pump, motivated' },
  { caption: '大好き', mood: 'affectionate, heart eyes, blushing' },
  { caption: 'おやすみ', mood: 'sleepy, yawning, night theme with moon' },
]

/**
 * Ranks trending keywords by a simple recency/order-based score and turns
 * the top keyword into a themed set of sticker concepts. Each concept
 * carries the text to overlay on the sticker and a prompt for whichever
 * image-generation provider is configured.
 */
export function planStickerSet(keywords, { count = STICKERS_PER_SET } = {}) {
  if (!keywords?.length) throw new Error('planStickerSet requires at least one keyword')

  const scored = keywords.map((keyword, index) => ({
    keyword,
    score: keywords.length - index,
  }))
  scored.sort((a, b) => b.score - a.score)
  const theme = scored[0].keyword

  const templates = EMOTION_TEMPLATES.slice(0, count)
  return templates.map((template, index) => ({
    index,
    theme,
    caption: template.caption,
    prompt:
      `Cute chibi character mascot themed around "${theme}", ` +
      `${template.mood}, flat illustration sticker style, bold outlines, ` +
      `simple shading, isolated on transparent background, no text`,
  }))
}
