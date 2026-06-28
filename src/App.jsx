import { useEffect, useState } from 'react'

function StickerGrid({ manifest }) {
  if (!manifest) return null
  return (
    <div>
      <h2>
        {manifest.date} - 「{manifest.theme}」
      </h2>
      <p>Keywords: {manifest.keywords?.join(', ')}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {manifest.stickers?.map((sticker) => (
          <figure key={sticker.file} style={{ width: 140, textAlign: 'center' }}>
            <img
              src={`/output/${manifest.date}/${sticker.file}`}
              alt={sticker.caption}
              style={{ width: '100%', background: '#f2f2f2', borderRadius: 8 }}
            />
            <figcaption>{sticker.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [manifest, setManifest] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/output/index.json')
      .then((res) => {
        if (!res.ok) throw new Error('No generated sets yet')
        return res.json()
      })
      .then((list) => {
        setDates(list)
        setSelectedDate(list[0] ?? null)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    fetch(`/output/${selectedDate}/manifest.json`)
      .then((res) => res.json())
      .then(setManifest)
      .catch((err) => setError(err.message))
  }, [selectedDate])

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>LINE スタンプ デイリージェネレーター</h1>
      <p>トレンドから自動生成されたスタンプセットのプレビューです。</p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {dates.length > 0 && (
        <select value={selectedDate ?? ''} onChange={(e) => setSelectedDate(e.target.value)}>
          {dates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      )}

      <StickerGrid manifest={manifest} />
    </main>
  )
}
