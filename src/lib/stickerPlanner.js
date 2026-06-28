import { STICKERS_PER_SET } from './lineStickerSpec.js'

// Emotion/phrase templates commonly seen in best-selling LINE sticker sets.
// Each template pairs a short on-image caption with an art-direction hint
// used to build the image-generation prompt.
const EMOTION_TEMPLATES = [
  { caption: 'おはよう', mood: 'cheerful morning greeting, bright colors' },
  { caption: 'おやすみ', mood: 'sleepy, yawning, night theme with moon' },
  { caption: 'ありがとう', mood: 'grateful, warm smile, sparkles' },
  { caption: 'どういたしまして', mood: 'gentle nod, soft smile' },
  { caption: 'お疲れ様です', mood: 'tired but encouraging, gentle expression' },
  { caption: 'よろしくお願いします', mood: 'polite bow, friendly expression' },
  { caption: 'ごめんね', mood: 'apologetic, teary eyes, small bow' },
  { caption: 'ゆるして', mood: 'pleading, puppy eyes, hands clasped' },
  { caption: 'すごい！', mood: 'excited, surprised, starry eyes' },
  { caption: 'びっくり！', mood: 'wide-eyed shock, jumping back' },
  { caption: 'がんばる！', mood: 'determined, fist pump, motivated' },
  { caption: 'もうむり', mood: 'exhausted, melting onto the floor' },
  { caption: '大好き', mood: 'affectionate, heart eyes, blushing' },
  { caption: '会いたい', mood: 'longing, wistful gaze, hand reaching out' },
  { caption: 'おめでとう', mood: 'celebratory, confetti, party hat' },
  { caption: 'よっしゃー', mood: 'triumphant, arms raised, big grin' },
  { caption: 'いいね！', mood: 'thumbs up, confident wink' },
  { caption: 'OK！', mood: 'okay sign, relaxed pose' },
  { caption: 'なるほど', mood: 'thoughtful nod, hand on chin' },
  { caption: 'マジ？', mood: 'shocked disbelief, jaw dropped' },
  { caption: 'うれしい', mood: 'pure joy, bouncing, sparkling background' },
  { caption: 'かなしい', mood: 'sad, tears welling up, drooping posture' },
  { caption: 'おこ', mood: 'mildly angry, puffed cheeks, crossed arms' },
  { caption: 'いただきます', mood: 'about to eat, chopsticks raised, happy anticipation' },
  { caption: 'ごちそうさま', mood: 'satisfied after meal, content smile, patting belly' },
  { caption: 'いってきます', mood: 'heading out, waving, bag on shoulder' },
  { caption: 'ただいま', mood: 'just got home, relieved smile, taking off shoes' },
  { caption: 'おつかれ〜', mood: 'casual relaxed wave, slouched posture' },
  { caption: '了解！', mood: 'saluting, sharp confident nod' },
  { caption: 'ちょっと待って', mood: 'holding up a hand, slightly panicked' },
  { caption: '考え中…', mood: 'pondering, thought bubble, tilted head' },
  { caption: 'お祝い！', mood: 'festive, balloons, party popper' },
  { caption: '応援してる', mood: 'cheering with pom poms, supportive smile' },
  { caption: 'なきそう', mood: 'about to cry, wobbling lip, glassy eyes' },
  { caption: 'ラブ注入', mood: 'sending hearts, blowing a kiss' },
  { caption: 'ねむい', mood: 'drowsy, half-closed eyes, stretching' },
  { caption: 'おなかすいた', mood: 'hungry, growling stomach, pleading look' },
  { caption: 'がんばったね', mood: 'praising, gentle pat on the head gesture' },
  { caption: 'お先に失礼します', mood: 'polite farewell, slight bow, waving goodbye' },
  { caption: '質問です', mood: 'raising hand, curious expression' },
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
