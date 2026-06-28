import sharp from 'sharp'
import { STICKER_WIDTH, STICKER_HEIGHT } from '../lineStickerSpec.js'

const PALETTE = ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#7B61FF', '#FFA69E', '#84DCC6', '#5C946E']

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}

/**
 * Placeholder image provider with no external dependencies or API keys.
 * Renders the sticker caption over a colored circle so the rest of the
 * pipeline (resizing, manifest, gallery) can be exercised end-to-end
 * without paying for real image generation.
 */
export async function generateImage({ caption, index = 0 }) {
  const color = PALETTE[index % PALETTE.length]
  const w = STICKER_WIDTH
  const h = STICKER_HEIGHT
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2 - 10}" fill="${color}" />
      <text x="50%" y="50%" font-size="36" font-family="sans-serif" font-weight="bold"
        text-anchor="middle" dominant-baseline="middle" fill="#222222">${escapeXml(caption)}</text>
    </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}
