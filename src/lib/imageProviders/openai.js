import sharp from 'sharp'
import { STICKER_WIDTH, STICKER_HEIGHT } from '../lineStickerSpec.js'

/**
 * Generates a sticker image via the OpenAI Images API.
 * Requires OPENAI_API_KEY. Optional OPENAI_IMAGE_MODEL (default gpt-image-1).
 */
export async function generateImage({ prompt }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      size: '1024x1024',
      background: 'transparent',
      n: 1,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI image generation failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI response did not include image data')

  return sharp(Buffer.from(b64, 'base64'))
    .resize(STICKER_WIDTH, STICKER_HEIGHT, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}
