import React, { useState, useMemo } from 'react'
import { computeV2, sensitivity, monteCarlo, verdictV2, presets, sliderDefs, ranges, STOCK } from './modelV2.js'

const f = (x, d = 1) => (x >= 0 ? '+' : '') + x.toFixed(d)

const problems = [
  { h: 'Exports and GDP moved independently', p: <>The base model let services exports collapse ~38% while GDP still rose +16%. That\u2019s internally impossible — the export sector <em>is</em> ~7% of GDP. GDP never reflected the very shock the model was built to highlight.</> },
  { h: 'Coefficients encode the conclusion', p: <>The multipliers (1.2, 0.20, 0.55) were chosen to produce the three scenarios. The model then &ldquo;finds&rdquo; what was assumed. That makes the <em>direction</em> of each mechanic a claim, but the <em>magnitudes</em> aren\u2019t evidence.</> },
  { h: 'Sensitivity was read off raw coefficients', p: <>Dials ran 0–100 uniformly, so comparing their influence ignored how far each can actually travel by 2030. Capability plausibly moves 40→95; diffusion maybe 10→60. Equal-range comparison is misleading.</> },
  { h: 'False precision', p: <>Single point outputs (&ldquo;+8.3%&rdquo;) imply a confidence the guessed coefficients don\u2019t support. The honest output of an uncertain model is a <em>range</em>, not a number.</> },
  { h: 'Employment was one homogeneous block', p: <>The 5.8M was scaled up or down uniformly. But the real dynamic is a <em>pyramid inversion</em> — a hiring freeze at the bottom (never-hired freshers) distinct from displacement of existing staff. The narrative wasn\u2019t in the maths.</> },
  { h: 'No stabilising feedback', p: <>No INR channel (an export fall weakens the rupee, restoring some competitiveness), no induced demand from cheaper services. Automation was treated as pure, one-way displacement.</> },
]

const fixes = [
  { h: 'Exports coupled into GDP', p: <>The exposed sector\u2019s GDP contribution now tracks its <em>surviving revenue</em>: half moves with exports, half is a productivity×capture bonus. When exports collapse and capture is low, exposed GDP goes <em>negative</em>. A services-export collapse now drags growth — the stress case falls from a rosy +3.6% to roughly flat.</> },
  { h: 'INR stabiliser', p: <>An export shock partly self-corrects: a weaker rupee recovers ~35% of the competitiveness loss. Bad scenarios are still bad, but no longer free-fall.</> },
  { h: 'Stock + flow employment', p: <>Job loss splits into <em>displaced</em> (existing 5.8M) and <em>never-hired</em> (new entrants, 2026–2030). The pyramid inversion is now explicit — and mostly shows up as freshers not hired, matching what\u2019s visible today.</> },
  { h: 'Realistic-range sensitivity', p: <>A tornado analysis swings each dial across its <em>plausible 2030 range</em>, not 0–100 — so &ldquo;which dial matters most&rdquo; is answered honestly, and you can see it change by objective.</> },
  { h: 'Monte-Carlo uncertainty', p: <>Coefficients are drawn from ranges over ~2,000 runs; outputs report a P10–P90 band. Precision is shown for what it is.</> },
]

function Slider({ def, value, onChange }) {
  const [mn, mx] = ranges[def.key]
  return (
    <div className="slider">
      <div className="top">
        <span className="name">{def.name} <span className={'tag' + (def.dom ? ' dom' : '')}>{def.tag}</span></span>
        <span className="out">{value}%</span>
      </div>
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(def.key, +e.target.value)} />
      <div className="desc">{def.desc} <span style={{ color: '#6f6b62' }}>· 2030 range {mn}–{mx}</span></div>
    </div>
  )
}

function Tornado({ vals }) {
  const targets = [
    { k: 'gdpUplift', label: 'GDP uplift', unit: 'pp' },
    { k: 'expChange', label: 'Services exports', unit: 'pp' },
    { k: 'youth', label: 'Youth pressure', unit: 'pts' },
    { k: 'foreignOfCapital', label: 'Capital leakage', unit: 'pp', scale: 100 },
  ]
  const [t, setT] = useState(targets[0])
  const rows = useMemo(() => {
    const s = sensitivity(vals, t.k)
    const sc = t.scale || 1
    return s.map((r) => ({ ...r, swing: r.swing * sc }))
  }, [vals, t])
  const max = Math.max(...rows.map((r) => r.swing), 0.001)
  return (
    <div>
      <div className="ttabs">
        {targets.map((x) => (
          <button key={x.k} className={'ttab' + (x.k === t.k ? ' on' : '')} onClick={() => setT(x)}>{x.label}</button>
        ))}
      </div>
      <div className="tornado">
        {rows.map((r) => (
          <div className="trow" key={r.key}>
            <div className="tlab">{r.label}{r.dom ? <span className="tdom"> India</span> : <span className="texo"> exogenous</span>}</div>
            <div className="ttrack"><div className="tfill" style={{ width: (r.swing / max * 100).toFixed(1) + '%', background: r.dom ? 'var(--teal)' : 'var(--clay)' }} /></div>
            <div className="tval">{r.swing.toFixed(r.swing < 1 ? 2 : 1)}{t.unit}</div>
          </div>
        ))}
      </div>
      <p className="colnote" style={{ marginTop: '14px' }}>
        Swing in <strong>{t.label.toLowerCase()}</strong> as each dial moves across its full 2030 range,
        holding the others at the current setting. <span style={{ color: 'var(--teal)' }}>Green = India controls it</span>;
        <span style={{ color: 'var(--clay)' }}> clay = exogenous</span>. The ranking changes with the objective — the point v1 couldn\u2019t show.
      </p>
    </div>
  )
}

function Band({ vals }) {
  const mc = useMemo(() => monteCarlo(vals), [vals])
  const lo = -6, hi = 26 // display scale in %
  const pos = (x) => ((x - lo) / (hi - lo) * 100)
  const clampPos = (x) => Math.max(0, Math.min(100, pos(x)))
  return (
    <div className="rcard full">
      <div className="rl">GDP uplift — central estimate with P10–P90 uncertainty band</div>
      <div className="rn" style={{ marginBottom: '10px' }}>{f(mc.p50)}<small style={{ fontSize: '15px', color: '#a5a196' }}> central</small></div>
      <div className="bandtrack">
        <div className="bandspan" style={{ left: clampPos(mc.p10) + '%', width: (clampPos(mc.p90) - clampPos(mc.p10)) + '%' }} />
        <div className="bandtick" style={{ left: clampPos(mc.p50) + '%' }} />
        <div className="bandzero" style={{ left: clampPos(0) + '%' }} />
      </div>
      <div className="rsub">P10 {f(mc.p10)}% · P50 {f(mc.p50)}% · P90 {f(mc.p90)}% — over ~2,000 draws of the uncertain coefficients. The width <em>is</em> the honesty.</div>
    </div>
  )
}

function ExplorerV2() {
  const [vals, setVals] = useState(presets.substantial)
  const [active, setActive] = useState('substantial')
  const setOne = (k, v) => { setVals((p) => ({ ...p, [k]: v })); setActive(null) }
  const setPreset = (n) => { setVals(presets[n]); setActive(n) }
  const r = useMemo(() => computeV2(vals), [vals])
  const vd = useMemo(() => verdictV2(r), [r])
  const abroad = Math.round(r.foreignOfCapital * 100)
  const dispPct = r.jobsGap > 0 ? Math.round(r.displaced / r.jobsGap * 100) : 0

  const presetBtns = [['modest', 'Modest'], ['substantial', 'Substantial'], ['extreme', 'Extreme'], ['best', 'Best case', 'best']]
  return (
    <section id="explorer">
      <div className="wrap">
        <div className="eyebrow">The improved explorer</div>
        <h2>Same dials. Coupled consequences.</h2>
        <p className="lede">Exports now feed GDP, job losses split into displaced and never-hired, and the headline
          number carries its uncertainty band. Move a dial and watch the coupling.</p>
        <div className="exgrid">
          <div className="panel">
            <div className="presets">
              {presetBtns.map(([k, l, e]) => (
                <button key={k} className={'preset ' + (e || '') + (active === k ? ' on' : '')} onClick={() => setPreset(k)}>{l}</button>
              ))}
            </div>
            {sliderDefs.map((d) => <Slider key={d.key} def={d} value={vals[d.key]} onChange={setOne} />)}
          </div>
          <div>
            <div className="results">
              <Band vals={vals} />
              <div className="rcard">
                <div className="rl">Services exports</div>
                <div className={'rn ' + (r.expChange >= 0 ? 'up' : 'down')}>{f(r.expChange)}%</div>
                <div className="rsub">≈ ${Math.round(r.expLevel)}B, INR-stabilised (from $224B). Now drags GDP directly.</div>
              </div>
              <div className="rcard">
                <div className="rl">Capital share / leakage</div>
                <div className={'rn ' + (r.capitalShare > 50 ? 'down' : '')}>{r.capitalShare.toFixed(0)}%</div>
                <div className="rsub">~{abroad}% of the capital share accrues to foreign owners.</div>
              </div>
              <div className="rcard full">
                <div className="rl">The jobs gap — displaced vs never-hired ({r.jobsGap.toFixed(2)}M total)</div>
                <div className="leakbar">
                  <span style={{ width: dispPct + '%', background: 'var(--clay)' }}>{dispPct > 16 ? r.displaced.toFixed(2) + 'M displaced' : ''}</span>
                  <span style={{ width: (100 - dispPct) + '%', background: 'var(--gold)' }}>{(100 - dispPct) > 16 ? r.notHired.toFixed(2) + 'M never hired' : ''}</span>
                </div>
                <div className="rsub">The pyramid inverts mostly as freshers <em>not hired</em>, not staff fired — which is what the data shows first.</div>
              </div>
              <div className="rcard full">
                <div className="rl">Youth &amp; graduate absorption pressure</div>
                <div className="meter"><div className="meterfill" style={{ width: r.youth.toFixed(0) + '%', background: 'linear-gradient(90deg,var(--teal),var(--clay))' }} /></div>
                <div className="rsub">{r.youth > 55 ? 'Acute — the jobs gap outruns domestic absorption.' : r.youth > 30 ? 'Elevated — absorption is the binding constraint.' : 'Contained — domestic demand soaks up entrants.'}</div>
              </div>
              <div className={'verdict tone-' + vd.tone}>
                <div className="vt">{vd.t}</div>
                <div className="vd">{vd.d}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ModelV2() {
  const [vals] = useState(presets.substantial)
  return (
    <>
      <header className="hero" style={{ paddingBottom: '54px' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ color: '#9bb8d6' }}>Methodology review &amp; v2</div>
          <h1 style={{ maxWidth: '20ch' }}>Where the base model is wrong — and a better one.</h1>
          <p style={{ color: '#d7d3c8', maxWidth: '58ch' }}>
            The base explorer is a useful device for showing the shape of India\u2019s exposure, but as a model it has
            real faults. Here they are, plainly — followed by a version that fixes the ones that can be fixed in a
            transparent, client-side model, and quantifies the uncertainty it can\u2019t remove.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="eyebrow">The criticism</div>
          <h2>Six problems with the base model</h2>
          <div className="invgrid">
            {problems.map((p, i) => (
              <div className="inv" key={i}>
                <div className="idx">Problem {String(i + 1).padStart(2, '0')}</div>
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tint">
        <div className="wrap">
          <div className="eyebrow">The response</div>
          <h2>What v2 changes</h2>
          <div className="invgrid">
            {fixes.map((p, i) => (
              <div className="inv" key={i} style={{ borderTopColor: 'var(--teal)' }}>
                <div className="idx" style={{ color: 'var(--teal)' }}>Fix {String(i + 1).padStart(2, '0')}</div>
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ExplorerV2 />

      <section>
        <div className="wrap">
          <div className="eyebrow">The answer to &ldquo;which dial matters most&rdquo;</div>
          <h2>Sensitivity, across each dial\u2019s realistic range</h2>
          <div className="two">
            <div className="read">
              <p>The most-asked question of a model like this is which lever moves the outcome most. The base model
                couldn\u2019t answer it honestly, because it compared dials over identical 0–100 ranges. Here each dial is
                swung across its <em>plausible 2030 range</em>.</p>
              <p>For GDP, the answer is <strong>domestic diffusion</strong> — the lever India controls — with global
                capability close behind. But switch the objective to services exports and the ranking inverts:
                <strong> autonomy and capability</strong> dominate, and those are exogenous. That divergence is the
                thesis made measurable: the dial India most wants to move (diffusion) is not the dial that most moves
                the thing India most fears (the external account).</p>
              <p className="colnote">Toggle the target to see it change.</p>
            </div>
            <div className="chartcard">
              <Tornado vals={vals} />
            </div>
          </div>
        </div>
      </section>

      <section className="tint">
        <div className="wrap">
          <div className="eyebrow">Still on the table</div>
          <h2>What v2 still doesn\u2019t do</h2>
          <p className="read">
            The coefficients are better-disciplined but still priors, not calibrated estimates. There is no genuine
            time path (it remains a 2030 snapshot, not a year-by-year simulation), no aggregate-demand or
            financial-market feedback, no robotics wave to finally expose the manual &ldquo;safe harbour,&rdquo; and no
            behavioural response of firms or the state beyond the dials you set. The value-capture and diffusion levers
            are still treated as independent, though in reality they share a common constraint — state and institutional
            capacity. The right next step is calibration against observed elasticities (IT revenue-per-employee,
            fresher-hiring series, the services BoP) and a proper dynamic model. Until then: a sharper instrument for
            thinking, not a forecast.
          </p>
          <p style={{ marginTop: '18px' }}><a href="#/" style={{ fontSize: '16px' }}>← Back to the base explorer</a></p>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <p style={{ color: '#b0aea5', maxWidth: '62ch' }}>
            Independent adaptation of Anthropic\u2019s <a href="https://www.anthropic.com/institute/econ-scenarios">Scenarios for our Economic Future</a>.
            Not affiliated with Anthropic. Model, critique and conclusions are the author\u2019s. v2.0.
          </p>
        </div>
      </footer>
    </>
  )
}
