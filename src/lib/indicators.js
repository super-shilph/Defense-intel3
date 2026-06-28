export function sma(values, period) {
  const out = new Array(values.length).fill(null)
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += values[j]
    out[i] = sum / period
  }
  return out
}

export function ema(values, period) {
  const out = new Array(values.length).fill(null)
  const k = 2 / (period + 1)
  let count = 0
  let sum = 0
  let prev = null
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v == null) continue
    count++
    if (prev == null) {
      sum += v
      if (count === period) {
        prev = sum / period
        out[i] = prev
      }
    } else {
      prev = v * k + prev * (1 - k)
      out[i] = prev
    }
  }
  return out
}

export function rsi(values, period = 14) {
  const out = new Array(values.length).fill(null)
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1]
    const gain = Math.max(change, 0)
    const loss = Math.max(-change, 0)
    if (i <= period) {
      avgGain += gain / period
      avgLoss += loss / period
      if (i === period) {
        out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
      }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
      out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
    }
  }
  return out
}

export function macd(values, fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(values, fast)
  const emaSlow = ema(values, slow)
  const macdLine = values.map((_, i) =>
    emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null
  )
  const signalLine = ema(macdLine, signalPeriod)
  const histogram = macdLine.map((v, i) =>
    v != null && signalLine[i] != null ? v - signalLine[i] : null
  )
  return { macdLine, signalLine, histogram }
}

export function bollinger(values, period = 20, mult = 2) {
  const middle = sma(values, period)
  const upper = new Array(values.length).fill(null)
  const lower = new Array(values.length).fill(null)
  for (let i = period - 1; i < values.length; i++) {
    let sumSq = 0
    for (let j = i - period + 1; j <= i; j++) sumSq += (values[j] - middle[i]) ** 2
    const sd = Math.sqrt(sumSq / period)
    upper[i] = middle[i] + mult * sd
    lower[i] = middle[i] - mult * sd
  }
  return { middle, upper, lower }
}

export function lastValue(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null) return arr[i]
  }
  return null
}
