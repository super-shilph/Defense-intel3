import sharp from 'sharp'
import { STICKER_WIDTH, STICKER_HEIGHT } from '../lineStickerSpec.js'

const BODY_COLORS = ['#FFD23F', '#FFE8A3', '#F4B942', '#FFCB69', '#FFDD78']

const EXPRESSIONS = [
  { keys: ['大好き', 'ラブ注入', '会いたい'], type: 'heart' },
  { keys: ['すごい', 'うれしい', 'よっしゃー', 'おめでとう', 'お祝い', '応援'], type: 'star' },
  { keys: ['おやすみ', 'ねむい'], type: 'sleepy' },
  { keys: ['ごめん', 'ゆるして', 'なきそう', 'かなしい', 'もうむり'], type: 'teary' },
  { keys: ['おこ'], type: 'angry' },
  { keys: ['びっくり', 'マジ'], type: 'surprised' },
  { keys: ['いいね', 'OK', '了解'], type: 'wink' },
]

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}

function pickExpression(caption) {
  const match = EXPRESSIONS.find(({ keys }) => keys.some((key) => caption.includes(key)))
  return match?.type ?? 'normal'
}

// Eyes are centered on the head at roughly (leftX, eyeY) and (rightX, eyeY).
function eyesAndMouthSvg(type, leftX, rightX, eyeY) {
  switch (type) {
    case 'heart':
      return `
        <path d="M${leftX},${eyeY} c-6,-8 -18,-8 -18,2 c0,8 18,16 18,16 c0,0 18,-8 18,-16 c0,-10 -12,-10 -18,-2 Z" fill="#FF5C8A" />
        <path d="M${rightX},${eyeY} c-6,-8 -18,-8 -18,2 c0,8 18,16 18,16 c0,0 18,-8 18,-16 c0,-10 -12,-10 -18,-2 Z" fill="#FF5C8A" />
        <path d="M${leftX + 5},${eyeY + 38} q15,12 30,0" stroke="#A8650F" stroke-width="3" fill="none" stroke-linecap="round" />
      `
    case 'star':
      return `
        <path d="${starPath(leftX, eyeY + 6, 14)}" fill="#222" />
        <path d="${starPath(rightX, eyeY + 6, 14)}" fill="#222" />
        <ellipse cx="${(leftX + rightX) / 2}" cy="${eyeY + 40}" rx="14" ry="9" fill="#A8650F" />
      `
    case 'sleepy':
      return `
        <path d="M${leftX - 12},${eyeY} q12,10 24,0" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M${rightX - 12},${eyeY} q12,10 24,0" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round" />
        <text x="${rightX + 45}" y="${eyeY - 25}" font-size="22" font-family="sans-serif" fill="#7A9CC6">Zzz</text>
        <ellipse cx="${(leftX + rightX) / 2}" cy="${eyeY + 35}" rx="10" ry="6" fill="#A8650F" />
      `
    case 'teary':
      return `
        <circle cx="${leftX}" cy="${eyeY}" r="9" fill="#222" />
        <circle cx="${rightX}" cy="${eyeY}" r="9" fill="#222" />
        <path d="M${leftX - 4},${eyeY + 10} q-6,14 0,20 q6,-6 0,-20" fill="#6CC3FF" />
        <path d="M${rightX - 4},${eyeY + 10} q-6,14 0,20 q6,-6 0,-20" fill="#6CC3FF" />
        <path d="M${leftX + 8},${eyeY + 42} q15,-8 30,0" stroke="#A8650F" stroke-width="3" fill="none" stroke-linecap="round" />
      `
    case 'angry':
      return `
        <line x1="${leftX - 14}" y1="${eyeY - 10}" x2="${leftX + 10}" y2="${eyeY}" stroke="#222" stroke-width="4" stroke-linecap="round" />
        <line x1="${rightX + 14}" y1="${eyeY - 10}" x2="${rightX - 10}" y2="${eyeY}" stroke="#222" stroke-width="4" stroke-linecap="round" />
        <circle cx="${leftX}" cy="${eyeY + 4}" r="6" fill="#222" />
        <circle cx="${rightX}" cy="${eyeY + 4}" r="6" fill="#222" />
        <path d="M${leftX + 6},${eyeY + 38} q15,-6 30,0" stroke="#A8650F" stroke-width="3" fill="none" stroke-linecap="round" />
      `
    case 'surprised':
      return `
        <circle cx="${leftX}" cy="${eyeY}" r="11" fill="#222" />
        <circle cx="${rightX}" cy="${eyeY}" r="11" fill="#222" />
        <circle cx="${leftX - 3}" cy="${eyeY - 3}" r="3" fill="#fff" />
        <circle cx="${rightX - 3}" cy="${eyeY - 3}" r="3" fill="#fff" />
        <ellipse cx="${(leftX + rightX) / 2}" cy="${eyeY + 40}" rx="12" ry="14" fill="#A8650F" />
      `
    case 'wink':
      return `
        <path d="M${leftX - 12},${eyeY} q12,10 24,0" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="${rightX}" cy="${eyeY}" r="9" fill="#222" />
        <circle cx="${rightX - 3}" cy="${eyeY - 3}" r="2.5" fill="#fff" />
        <path d="M${leftX + 8},${eyeY + 38} q15,10 30,0" stroke="#A8650F" stroke-width="3" fill="none" stroke-linecap="round" />
      `
    default:
      return `
        <circle cx="${leftX}" cy="${eyeY}" r="9" fill="#222" />
        <circle cx="${rightX}" cy="${eyeY}" r="9" fill="#222" />
        <circle cx="${leftX - 3}" cy="${eyeY - 3}" r="2.5" fill="#fff" />
        <circle cx="${rightX - 3}" cy="${eyeY - 3}" r="2.5" fill="#fff" />
        <path d="M${leftX + 8},${eyeY + 38} q15,10 30,0" stroke="#A8650F" stroke-width="3" fill="none" stroke-linecap="round" />
      `
  }
}

function starPath(cx, cy, r) {
  const points = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r / 2.4
    const angle = (Math.PI / 5) * i - Math.PI / 2
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`)
  }
  return `M${points.join(' L')} Z`
}

/**
 * Placeholder image provider with no external dependencies or API keys.
 * Renders a cute vector duck mascot with a caption-driven expression so
 * the rest of the pipeline (resizing, manifest, gallery) can be
 * exercised end-to-end without paying for real image generation.
 */
export async function generateImage({ caption, index = 0 }) {
  const w = STICKER_WIDTH
  const h = STICKER_HEIGHT
  const bodyColor = BODY_COLORS[index % BODY_COLORS.length]
  const expression = pickExpression(caption)

  const cx = w / 2
  const headCy = h * 0.36
  const headR = 78
  const bodyCy = h * 0.72
  const bodyRx = 98
  const bodyRy = 78
  const leftEyeX = cx - 24
  const rightEyeX = cx + 24
  const eyeY = headCy - 4

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <ellipse cx="${cx + 35}" cy="${bodyCy + 10}" rx="38" ry="26" fill="${bodyColor}" opacity="0.85" />
      <ellipse cx="${cx}" cy="${bodyCy}" rx="${bodyRx}" ry="${bodyRy}" fill="${bodyColor}" />
      <ellipse cx="${cx - 15}" cy="${bodyCy + 6}" rx="40" ry="50" fill="#FFF3D0" opacity="0.6" />
      <circle cx="${cx}" cy="${headCy}" r="${headR}" fill="${bodyColor}" />
      <polygon points="${cx - 26},${headCy + 14} ${cx + 26},${headCy + 14} ${cx},${headCy + 38}" fill="#FF9F40" />
      ${eyesAndMouthSvg(expression, leftEyeX, rightEyeX, eyeY)}
      <ellipse cx="${cx - 70}" cy="${bodyCy + 25}" rx="14" ry="8" fill="#FF9F40" />
      <ellipse cx="${cx + 70}" cy="${bodyCy + 25}" rx="14" ry="8" fill="#FF9F40" />
      <text x="${cx}" y="${h - 14}" font-size="28" font-family="sans-serif" font-weight="bold"
        text-anchor="middle" fill="#5C3A1E">${escapeXml(caption)}</text>
    </svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}
