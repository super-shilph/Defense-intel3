export function technicalSignal({ close, sma25, sma75, rsi, macdLine, macdSignal }) {
  let score = 0
  const notes = []

  if (sma25 != null && sma75 != null) {
    if (sma25 > sma75) {
      score += 1
      notes.push('25日線が75日線より上 → 中期は上昇トレンド')
    } else {
      score -= 1
      notes.push('25日線が75日線より下 → 中期は下降トレンド')
    }
  }

  if (close != null && sma25 != null) {
    if (close > sma25) {
      score += 1
      notes.push('現在値が25日移動平均線より上')
    } else {
      score -= 1
      notes.push('現在値が25日移動平均線より下')
    }
  }

  if (rsi != null) {
    if (rsi < 30) {
      score += 1
      notes.push(`RSI ${rsi.toFixed(1)}：売られすぎ圏（反発の可能性）`)
    } else if (rsi > 70) {
      score -= 1
      notes.push(`RSI ${rsi.toFixed(1)}：買われすぎ圏（過熱に注意）`)
    } else {
      notes.push(`RSI ${rsi.toFixed(1)}：中立圏`)
    }
  }

  if (macdLine != null && macdSignal != null) {
    if (macdLine > macdSignal) {
      score += 1
      notes.push('MACDがシグナルより上 → 買いシグナル')
    } else {
      score -= 1
      notes.push('MACDがシグナルより下 → 売りシグナル')
    }
  }

  return { score, notes }
}

export function fundamentalSignal({ per, pbr, dividendYield, roe }) {
  let score = 0
  const notes = []

  if (per != null) {
    if (per < 15) {
      score += 1
      notes.push(`PER ${per}倍：割安水準`)
    } else if (per > 25) {
      score -= 1
      notes.push(`PER ${per}倍：割高水準`)
    } else {
      notes.push(`PER ${per}倍：中立水準`)
    }
  }

  if (pbr != null) {
    if (pbr < 1) {
      score += 1
      notes.push(`PBR ${pbr}倍：解散価値以下（割安）`)
    } else if (pbr > 2) {
      score -= 1
      notes.push(`PBR ${pbr}倍：割高水準`)
    }
  }

  if (dividendYield != null) {
    if (dividendYield > 3) {
      score += 1
      notes.push(`配当利回り ${dividendYield}%：高水準`)
    }
  }

  if (roe != null) {
    if (roe > 10) {
      score += 1
      notes.push(`ROE ${roe}%：収益性良好`)
    } else if (roe < 5) {
      score -= 1
      notes.push(`ROE ${roe}%：収益性が低い`)
    }
  }

  return { score, notes }
}

export function buildRecommendation({ technical, fundamental, price }) {
  const total = technical.score + fundamental.score
  let verdict = 'HOLD'
  if (total >= 3) verdict = 'STRONG_BUY'
  else if (total >= 1) verdict = 'BUY'
  else if (total <= -3) verdict = 'AVOID'
  else if (total <= -1) verdict = 'CAUTION'

  const VERDICT_LABELS = {
    STRONG_BUY: '買い候補（強）',
    BUY: '買い候補',
    HOLD: '中立・様子見',
    CAUTION: '注意（弱い売りシグナル）',
    AVOID: '見送り推奨',
  }

  return {
    total,
    verdict,
    label: VERDICT_LABELS[verdict],
    entry: Math.round(price),
    stopLoss: Math.round(price * 0.95),
    target: Math.round(price * 1.08),
  }
}

export function positionSizing({ price, capital, lotSize = 100 }) {
  const lotCost = Math.round(price * lotSize)
  const maxLots = Math.floor(capital / lotCost)
  const shares = maxLots * lotSize
  const cost = Math.round(shares * price)
  const remaining = capital - cost
  return { lotCost, maxLots, shares, cost, remaining, affordable: maxLots >= 1 }
}
