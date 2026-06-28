import * as mock from './mock.js'
import * as openai from './openai.js'
import * as stability from './stability.js'

const PROVIDERS = { mock, openai, stability }

/**
 * Selects the image-generation provider via IMAGE_PROVIDER env var
 * (mock | openai | stability). Defaults to the mock provider so the
 * pipeline works with zero configuration.
 */
export function getImageProvider(name = process.env.IMAGE_PROVIDER || 'mock') {
  const provider = PROVIDERS[name]
  if (!provider) throw new Error(`Unknown IMAGE_PROVIDER "${name}". Valid options: ${Object.keys(PROVIDERS).join(', ')}`)
  return provider
}
