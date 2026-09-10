// India AI econ-scenarios — the model, as pure functions.
// Every coefficient here is surfaced verbatim in the Assumptions section of the UI.
// The thesis lives in the STRUCTURE, not the numbers: the three exogenous levers
// (capability, exportAdoption, autonomy) only ever raise export/employment damage;
// the two India-controlled levers (domesticDiffusion, valueCapture) are the only
// source of large GDP upside and the only youth-relief term.

export const GDP_BASE = 5.44; // $tn, no-AI 2030 baseline: $4.15T (2026) compounded at the ~7% real trend
export const BASELINE_G = 0.07; // India's ~7% real steady-state growth (the no-AI counterfactual)
export const HORIZON = 4;       // 2026 → 2030
// AI-inclusive average real growth implied by an AI uplift over the no-AI path.
// This is the number to show as the headline — the uplift is NOT a growth rate.
export function impliedGrowth(upliftPct, g = BASELINE_G, years = HORIZON) {
  return Math.pow(Math.pow(1 + g, years) * (1 + upliftPct / 100), 1 / years) - 1
}

export const presets = {
  modest:      { cap: 25, adopt: 30, auto: 20, diff: 20, capture: 35, fric: 65 },
  substantial: { cap: 60, adopt: 65, auto: 55, diff: 40, capture: 40, fric: 70 },
  extreme:     { cap: 92, adopt: 85, auto: 90, diff: 55, capture: 35, fric: 75 },
  best:        { cap: 92, adopt: 85, auto: 90, diff: 90, capture: 80, fric: 45 },
};

export const sliderDefs = [
  { key: 'cap',     name: 'Global AI capability',     tag: 'exogenous',     dom: false, desc: 'Share of knowledge-work tasks AI can do at human level.' },
  { key: 'adopt',   name: 'Export-sector adoption',   tag: 'exogenous',     dom: false, desc: 'How fast Indian IT / GCC must deploy AI as global clients re-price contracts.' },
  { key: 'auto',    name: 'Autonomy',                 tag: 'exogenous',     dom: false, desc: 'Share of automatable work done with no human in the loop.' },
  { key: 'diff',    name: 'Domestic diffusion',       tag: "India's choice", dom: true,  desc: 'AI applied to the broad / informal economy via DPI — the catch-up lever.' },
  { key: 'capture', name: 'Domestic value capture',   tag: "India's choice", dom: true,  desc: 'Share of AI value kept by Indian capital vs paid to foreign models & compute.' },
  { key: 'fric',    name: 'Adjustment friction',      tag: 'structural',    dom: true,  desc: 'How hard it is for displaced / unhired workers to find comparable formal work.' },
];

export const tiers = [
  { n: 'Agriculture',                 v: 45, shown: '45%', c: 'var(--teal-soft)' },
  { n: 'Informal non-farm',           v: 40, shown: '40%', c: 'var(--gold)' },
  { n: 'Formal non-farm (non-tech)',  v: 14, shown: '14%', c: 'var(--indigo)' },
  { n: 'AI-exposed formal tech',      v: 1,  shown: '~1%', c: 'var(--clay)' },
];

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export function compute(v) {
  const cap = v.cap / 100, adopt = v.adopt / 100, auto = v.auto / 100,
        diff = v.diff / 100, capture = v.capture / 100, fric = v.fric / 100;

  const exposedGain  = 0.07 * (cap * adopt) * 1.2;   // productivity in the 7%-of-GDP export sliver
  const domesticGain = 0.93 * (diff * cap) * 0.20;   // catch-up gains across the other 93%
  const gdpUplift = (exposedGain + domesticGain) * 100;
  const gdp2030   = GDP_BASE * (1 + gdpUplift / 100);

  const empChange = -(cap * adopt * auto) * (1 - 0.10) * 0.55 * 100; // new-task offset weak (0.10)
  const jobsGone  = 5.8 * (-empChange / 100);

  const expChange = (0.40 * (capture * adopt) - 0.60 * (cap * auto)) * 100; // disintermediation vs defence
  const expLevel  = 224 * (1 + expChange / 100);

  const capitalShare    = 40 + (cap * adopt) * 20;   // from today's 60/40 labour/capital
  const laborShare      = 100 - capitalShare;
  const foreignOfCapital = (1 - capture) * 0.6;       // fraction of the capital share leaving India

  const bif   = clamp(cap * adopt * 100, 0, 100);
  const youth = clamp((cap * adopt * auto) * 55 + fric * 30 - diff * 35, 0, 100);

  return { gdpUplift, gdp2030, empChange, jobsGone, expChange, expLevel,
           capitalShare, laborShare, foreignOfCapital, bif, youth };
}

export function verdict(r) {
  if (r.expChange < -28)
    return { t: 'External-account stress', tone: 'clay',
      d: 'The export engine contracts hard enough to threaten the services surplus that funds the trade deficit. A sector shock has become a balance-of-payments and rupee question — the transmission the US model never has to price.' };
  if (r.gdpUplift > 13 && r.expChange > -26 && r.youth < 35)
    return { t: 'Catch-up transformation', tone: 'teal',
      d: "The old export jobs don't return — but India deploys cheap cognition domestically and keeps the value at home, and a far larger domestic productivity gain more than offsets the loss. The prize, and it needs both India levers held high." };
  if (r.gdpUplift < 3)
    return { t: 'Business as usual', tone: 'grey',
      d: 'AI is real but macro-invisible — roughly today\u2019s path. The hiring pyramid flattens quietly; no rupture, no leap.' };
  if (r.empChange < -8 || r.youth > 28)
    return { t: 'The bumpy handoff — lost-cohort risk', tone: 'gold',
      d: 'Growth holds up, but the hiring pyramid inverts faster than domestic jobs appear. The gap falls on educated youth. This is the central-case risk, and the window to watch is 2026\u20132031.' };
  return { t: 'Uneven lift', tone: 'grey',
    d: 'Aggregate growth improves, but the gains skew to capital and to the AI-fluent. Whether this stays benign depends entirely on how fast the two domestic levers move.' };
}
