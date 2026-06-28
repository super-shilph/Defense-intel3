import sharp from 'sharp'
import { STICKER_WIDTH, STICKER_HEIGHT } from '../lineStickerSpec.js'

/**
 * Generates a sticker image via the Stability AI image generation API.
 * Requires STABILITY_API_KEY. Optional STABILITY_MODEL
 * (default stable-image-core).
 */
export async function generateImage({ prompt }) {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('STABILITY_API_KEY is not set')
  const model = process.env.STABILITY_MODEL || 'core'

  const form = new FormData()
  form.append('prompt', prompt)
  form.append('output_format', 'png')

  const res = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/*',
    },
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Stability image generation failed (${res.status}): ${text}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return sharp(Buffer.from(arrayBuffer))
    .resize(STICKER_WIDTH, STICKER_HEIGHT, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}
