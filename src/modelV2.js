// ── v2 model ─────────────────────────────────────────────────────────────
// Fixes the base model's flaws (see ModelV2.jsx critique):
//  1. Exports are COUPLED into GDP — the exposed sector's GDP contribution tracks
//     its surviving revenue, so a services-export collapse now drags GDP instead of
//     leaving it strongly positive (the base model let them move independently).
//  2. An INR stabiliser feedback: when exports fall the rupee weakens and recovers
//     part of the competitiveness loss.
//  3. Employment is split into a STOCK (existing 5.8M, displaced) and a FLOW
//     (new entrants never hired) — the "pyramid inversion" made quantitative.
//  4. Realistic 2030 input ranges, so sensitivity reflects how far a dial can
//     actually travel — not a raw 0–100 coefficient.
//  5. Monte-Carlo over coefficient uncertainty → P10–P90 bands, not point outputs.
// The coefficients are still reasoned priors, not calibrated values.

import { presets, sliderDefs } from './model.js'
export { presets, sliderDefs }

export const GDP_BASE = 5.30      // $tn no-AI 2030 baseline
export const EXPORT_BASE = 224    // $bn services exports, FY25
export const STOCK = 5.8          // mn existing formal-tech workers
export const FRESH_POOL = 1.5     // mn potential new entrants, 2026–2030

// plausible 2030 ranges for each dial (used by the sensitivity/tornado analysis)
export const ranges = {
  cap: [40, 95], adopt: [30, 90], auto: [20, 85],
  diff: [10, 60], capture: [15, 70], fric: [50, 85],
}

export const coeffs = {
  EXPOSED_SHARE: 0.07, BROAD_SHARE: 0.93,
  DOMESTIC_UPLIFT: 0.20, INDUCED: 0.03,
  DISPLACE: 0.35, FRESHER_FREEZE: 0.70,
  INR_OFFSET: 0.35, EXPORT_SPILL: 0.50,
}
// coefficient uncertainty for the Monte-Carlo band
export const coeffRanges = {
  DOMESTIC_UPLIFT: [0.14, 0.26], DISPLACE: [0.25, 0.45],
  INR_OFFSET: [0.20, 0.50], EXPORT_SPILL: [0.35, 0.65],
}

const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

export function computeV2(v, c = coeffs) {
  const cap = v.cap / 100, adopt = v.adopt / 100, auto = v.auto / 100,
        diff = v.diff / 100, capture = v.capture / 100, fric = v.fric / 100

  // exports, with INR stabiliser
  const expShockRaw = 0.40 * (capture * adopt) - 0.60 * (cap * auto)
  const inrOffset = Math.max(0, -expShockRaw) * c.INR_OFFSET
  const expChange = (expShockRaw + inrOffset) * 100
  const expLevel = EXPORT_BASE * (1 + expChange / 100)

  // GDP — exposed sector GVA now tracks surviving revenue (half) + a productivity×capture
  // bonus (half). When exports collapse and capture is low, this goes NEGATIVE.
  const exposedGVA = c.EXPOSED_SHARE * (0.5 * (expChange / 100) + 0.5 * (cap * adopt) * capture * 0.8) * 100
  const domesticGDP = c.BROAD_SHARE * (diff * cap) * c.DOMESTIC_UPLIFT * 100
  const induced = c.BROAD_SHARE * (diff * auto) * c.INDUCED * 100
  const exportSpill = c.EXPORT_SPILL * (EXPORT_BASE * (expChange / 100) / (GDP_BASE * 1000)) * 100
  const gdpUplift = exposedGVA + domesticGDP + induced + exportSpill
  const gdp2030 = GDP_BASE * (1 + gdpUplift / 100)

  // employment: stock (displaced) + flow (never hired)
  const intensity = cap * adopt * auto
  const displaced = STOCK * intensity * c.DISPLACE
  const notHired = FRESH_POOL * intensity * c.FRESHER_FREEZE
  const jobsGap = displaced + notHired
  const empChange = -(displaced) / STOCK * 100

  const capitalShare = 40 + (cap * adopt) * 20
  const foreignOfCapital = (1 - capture) * 0.6
  const bif = clamp(cap * adopt * 100, 0, 100)
  const jobsGapNorm = clamp(jobsGap / (STOCK * 0.5 + FRESH_POOL), 0, 1)
  const youth = clamp(jobsGapNorm * 55 + fric * 30 - diff * 35, 0, 100)

  return { expChange, expLevel, exposedGVA, domesticGDP, induced, exportSpill,
           gdpUplift, gdp2030, displaced, notHired, jobsGap, empChange,
           capitalShare, foreignOfCapital, bif, youth }
}

// tornado sensitivity: swing in `target` output as each dial spans its realistic range
export function sensitivity(v, target) {
  return sliderDefs.map((def) => {
    const [mn, mx] = ranges[def.key]
    const lo = computeV2({ ...v, [def.key]: mn })[target]
    const hi = computeV2({ ...v, [def.key]: mx })[target]
    return { key: def.key, label: def.name, dom: def.dom, lo, hi, swing: Math.abs(hi - lo) }
  }).sort((a, b) => b.swing - a.swing)
}

// seeded RNG so the band is stable for a given slider setting (no flicker)
function lcg(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }

export function monteCarlo(v, N = 2000) {
  const seed = Math.round((v.cap * 7 + v.adopt * 13 + v.auto * 17 + v.diff * 19 + v.capture * 23 + v.fric * 29) * 1000) + 1
  const rnd = lcg(seed)
  const out = []
  for (let i = 0; i < N; i++) {
    const c = { ...coeffs }
    for (const k in coeffRanges) { const [a, b] = coeffRanges[k]; c[k] = a + (b - a) * rnd() }
    const vv = { ...v }
    for (const k in vv) vv[k] = clamp(vv[k] + (rnd() * 2 - 1) * 4, 0, 100) // ±4pt dial noise
    out.push(computeV2(vv, c).gdpUplift)
  }
  out.sort((a, b) => a - b)
  const q = (p) => out[Math.floor(p * (N - 1))]
  return { p10: q(0.10), p50: q(0.50), p90: q(0.90), min: out[0], max: out[out.length - 1], samples: out }
}

export function verdictV2(r) {
  if (r.expChange < -20)
    return { t: 'External-account stress', tone: 'clay',
      d: 'The export engine contracts past the point the services surplus can absorb; the drag now pulls GDP down with it. A sector shock has become a balance-of-payments one.' }
  if (r.gdpUplift > 12 && r.expChange > -18 && r.youth < 30)
    return { t: 'Catch-up transformation', tone: 'teal',
      d: 'The export jobs still don\u2019t return, but domestic diffusion and retained value more than offset the loss and absorb the youth cohort. Both India levers are held high.' }
  if (r.gdpUplift < 3 && r.expChange >= -2)
    return { t: 'Business as usual', tone: 'grey',
      d: 'AI is real but macro-invisible — roughly today\u2019s path. The hiring pyramid flattens quietly; no rupture, no leap.' }
  if (r.gdpUplift < 3)
    return { t: 'Stalled handoff', tone: 'grey',
      d: 'The export engine is fading and nothing domestic has replaced it. Growth barely moves — the coupling now shows what the base model hid.' }
  if (r.jobsGap > 1.2 || r.youth > 26)
    return { t: 'The bumpy handoff — lost-cohort risk', tone: 'gold',
      d: 'Aggregate growth holds, but the jobs gap (displaced + never-hired) outruns domestic absorption. The cost lands on educated youth, 2026\u20132031.' }
  return { t: 'Uneven lift', tone: 'grey',
    d: 'Growth improves but skews to capital and the AI-fluent. The domestic levers decide whether it stays benign.' }
}
