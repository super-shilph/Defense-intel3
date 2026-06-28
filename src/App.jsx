import { useEffect, useMemo, useState } from 'react'
import { sma, rsi, macd, lastValue } from './lib/indicators'
import { technicalSignal, fundamentalSignal, buildRecommendation, positionSizing } from './lib/scoring'

const SYMBOL = '9201.T'
const STOCK_NAME = '日本航空 (JAL)'
const LOT_SIZE = 100

const DEFAULT_FUNDAMENTALS = { per: '', pbr: '', dividendYield: '', roe: '' }

export default function App() {
  const [candles, setCandles] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [capital, setCapital] = useState(100000)
  const [fundamentals, setFundamentals] = useState(DEFAULT_FUNDAMENTALS)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/quote?symbol=${SYMBOL}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setCandles(data.candles)
        setError(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const technical = useMemo(() => {
    if (!candles || candles.length < 30) return null
    const closes = candles.map((c) => c.close)
    const sma25 = lastValue(sma(closes, 25))
    const sma75 = lastValue(sma(closes, 75))
    const rsi14 = lastValue(rsi(closes, 14))
    const { macdLine, signalLine } = macd(closes)
    const macdNow = lastValue(macdLine)
    const macdSig = lastValue(signalLine)
    const close = closes[closes.length - 1]
    const signal = technicalSignal({ close, sma25, sma75, rsi: rsi14, macdLine: macdNow, macdSignal: macdSig })
    return { close, sma25, sma75, rsi: rsi14, macdNow, macdSig, ...signal }
  }, [candles])

  const fundamental = useMemo(() => {
    const parsed = {
      per: fundamentals.per === '' ? null : Number(fundamentals.per),
      pbr: fundamentals.pbr === '' ? null : Number(fundamentals.pbr),
      dividendYield: fundamentals.dividendYield === '' ? null : Number(fundamentals.dividendYield),
      roe: fundamentals.roe === '' ? null : Number(fundamentals.roe),
    }
    return fundamentalSignal(parsed)
  }, [fundamentals])

  const recommendation = useMemo(() => {
    if (!technical) return null
    return buildRecommendation({ technical, fundamental, price: technical.close })
  }, [technical, fundamental])

  const sizing = useMemo(() => {
    if (!technical) return null
    return positionSizing({ price: technical.close, capital: Number(capital) || 0, lotSize: LOT_SIZE })
  }, [technical, capital])

  return (
    <div className="page">
      <header>
        <h1>{STOCK_NAME}（{SYMBOL}）エントリー分析</h1>
        <p className="disclaimer">
          本アプリは個人の分析を補助する参考情報を提供するものであり、投資の助言・推奨ではありません。
          最終的な投資判断はご自身の責任で行ってください。
        </p>
      </header>

      {loading && <p>株価データを取得中...</p>}
      {error && <p className="error">データ取得エラー: {error}</p>}

      {technical && (
        <>
          <section className="card">
            <h2>テクニカル分析</h2>
            <div className="grid">
              <Metric label="現在値" value={`${technical.close.toFixed(1)} 円`} />
              <Metric label="25日移動平均" value={technical.sma25 ? `${technical.sma25.toFixed(1)} 円` : '-'} />
              <Metric label="75日移動平均" value={technical.sma75 ? `${technical.sma75.toFixed(1)} 円` : '-'} />
              <Metric label="RSI(14)" value={technical.rsi ? technical.rsi.toFixed(1) : '-'} />
              <Metric label="MACD" value={technical.macdNow != null ? technical.macdNow.toFixed(2) : '-'} />
              <Metric label="シグナル" value={technical.macdSig != null ? technical.macdSig.toFixed(2) : '-'} />
            </div>
            <ul className="notes">
              {technical.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </section>

          <section className="card">
            <h2>ファンダメンタル分析（手入力）</h2>
            <p className="hint">
              楽天証券アプリ等で最新の指標を確認し、下に入力してください（空欄の項目は判定に使用されません）。
            </p>
            <div className="form-grid">
              <FundInput label="PER（倍）" field="per" fundamentals={fundamentals} setFundamentals={setFundamentals} />
              <FundInput label="PBR（倍）" field="pbr" fundamentals={fundamentals} setFundamentals={setFundamentals} />
              <FundInput label="配当利回り（%）" field="dividendYield" fundamentals={fundamentals} setFundamentals={setFundamentals} />
              <FundInput label="ROE（%）" field="roe" fundamentals={fundamentals} setFundamentals={setFundamentals} />
            </div>
            {fundamental.notes.length > 0 && (
              <ul className="notes">
                {fundamental.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            )}
          </section>

          <section className="card highlight">
            <h2>エントリー提案</h2>
            <p className="verdict">{recommendation.label}（総合スコア: {recommendation.total}）</p>
            <div className="grid">
              <Metric label="想定エントリー価格" value={`${recommendation.entry.toLocaleString()} 円`} />
              <Metric label="ストップロス目安（-5%）" value={`${recommendation.stopLoss.toLocaleString()} 円`} />
              <Metric label="目標価格目安（+8%）" value={`${recommendation.target.toLocaleString()} 円`} />
            </div>
          </section>

          <section className="card">
            <h2>資金管理（現物・単元株100株単位）</h2>
            <label className="capital-input">
              手元資金（円）
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                min="0"
                step="1000"
              />
            </label>
            {sizing && (
              <div className="grid">
                <Metric label="1単元の必要金額" value={`${sizing.lotCost.toLocaleString()} 円`} />
                <Metric label="購入可能単元数" value={`${sizing.maxLots} 単元`} />
                <Metric label="購入株数" value={`${sizing.shares} 株`} />
                <Metric label="購入金額" value={`${sizing.cost.toLocaleString()} 円`} />
                <Metric label="残資金" value={`${sizing.remaining.toLocaleString()} 円`} />
              </div>
            )}
            {sizing && !sizing.affordable && (
              <p className="error">現在の株価では、設定した資金で1単元（100株）を購入できません。</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}

function FundInput({ label, field, fundamentals, setFundamentals }) {
  return (
    <label className="fund-input">
      {label}
      <input
        type="number"
        value={fundamentals[field]}
        onChange={(e) => setFundamentals({ ...fundamentals, [field]: e.target.value })}
        step="0.01"
      />
    </label>
  )
}
