import React, { useState, useMemo, useEffect } from 'react'
import { presets, sliderDefs, tiers, compute, verdict, GDP_BASE } from './model.js'
import ModelV2 from './ModelV2.jsx'

const fmtPct = (x) => (x >= 0 ? '+' : '') + x.toFixed(1) + '%'
const fmtPct0 = (x) => (x >= 0 ? '+' : '') + x.toFixed(0) + '%'

function Hero() {
  return (
    <header className="hero">
      <div className="wrap">
        <div className="kicker">
          A scenario explorer for India, 2030 — adapted from Anthropic&rsquo;s Economics team framework,{' '}
          <a href="https://www.anthropic.com/institute/econ-scenarios" style={{ color: '#cfcbbe', borderColor: '#4a4b52' }}>
            Scenarios for our Economic Future
          </a>. Independent analysis; not affiliated with Anthropic.
        </div>
        <h1>India&rsquo;s exposure to AI is <em>narrow</em> in jobs and <em>load-bearing</em> in value.</h1>
        <p style={{ color: '#cfcbbe', maxWidth: '56ch', fontSize: '19px' }}>
          The US model asks what happens when AI automates the work of the majority. In India the automatable
          formal-knowledge sector is roughly one percent of the workforce — but it earns the export surplus that
          finances the trade deficit and forms the urban middle class. That asymmetry rewrites every finding.
        </p>
        <div className="heroStats">
          <div className="heroStat"><span className="n clay num">~1%</span><span className="l">of India&rsquo;s ~590M workers are in the AI-exposed formal tech sector (IT / ITeS / BPM / GCC)</span></div>
          <div className="heroStat"><span className="n num">~7%</span><span className="l">of GDP produced by that same sliver — a ~7&times; value-to-headcount inversion</span></div>
          <div className="heroStat"><span className="n num">~$224B</span><span className="l">of exports from it — the largest single pillar of the services surplus that funds the current account</span></div>
          <div className="heroStat"><span className="n teal num">~45%</span><span className="l">of workers still in agriculture — the &ldquo;safe harbour,&rdquo; but informal and low-wage, not the US&rsquo;s rising-wage trades</span></div>
        </div>
        <p className="heroNote">
          Figures: NASSCOM Strategic Review (FY25, ~5.8M sector employees, ~$283B revenue, ~$224B exports);
          PLFS 2023–24 (~45% agriculture); IMF (~$4.15T GDP, 2026). Scenario outputs below are an illustrative,
          fully-specified model — reasoning made transparent, not a forecast.
        </p>
      </div>
    </header>
  )
}

function Tasks() {
  return (
    <section>
      <div className="wrap">
        <div className="eyebrow">The unit of the model</div>
        <h2>An economy is a bundle of tasks</h2>
        <div className="two narrowgap">
          <div className="read">
            <p>
              Following the Anthropic framework, we treat every job as a bundle of tasks. AI can leave a task
              untouched, <span style={{ color: 'var(--indigo)' }}>augment</span> it (a human does it better or faster),{' '}
              <span style={{ color: 'var(--clay)' }}>automate</span> it, or create a new task. The economy in 2030
              depends on which of these dominates, and how fast adoption spreads.
            </p>
            <p>
              But <em>which</em> tasks sit in the crosshairs is where India diverges. The Anthropic report uses a nurse —
              mostly physical, mostly safe. India&rsquo;s exposed archetype is the entry-level services associate the
              country has hired by the million: a task bundle that is unusually automatable, unusually tradable, and
              unusually concentrated in the formal, tax-paying economy.
            </p>
            <div className="legend">
              <span><b style={{ background: 'var(--clay)' }} />Automatable</span>
              <span><b style={{ background: 'var(--indigo)' }} />Augmented</span>
              <span><b style={{ background: 'var(--teal)' }} />Human-anchored</span>
            </div>
          </div>
          <div className="tasks">
            <div className="taskcol">
              <h4>A junior IT-services / BPO associate</h4>
              <span className="chip auto">Write &amp; test boilerplate code<small>augment &rarr; automate</small></span>
              <span className="chip auto">Triage &amp; resolve L1 support tickets<small>automatable</small></span>
              <span className="chip auto">Reconcile invoices, process back-office forms<small>automatable</small></span>
              <span className="chip auto">Draft reports, transcribe, translate<small>automatable</small></span>
              <span className="chip aug">Manage client relationship &amp; escalations<small>augmented</small></span>
            </div>
            <div className="taskcol">
              <h4>A nurse / electrician (the &ldquo;safe harbour&rdquo;)</h4>
              <span className="chip safe">Bathe, move, physically assess a patient<small>human-anchored</small></span>
              <span className="chip safe">Wire a panel on-site, in a cramped space<small>human-anchored</small></span>
              <span className="chip aug">Chart vitals, plan the shift<small>augmented</small></span>
              <span className="chip safe" style={{ borderLeftColor: 'var(--gold)' }}>&hellip;but in India, largely <b>informal</b> &amp; low-wage<small>the crossover valve the US model relies on is mostly closed</small></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TierChart() {
  const max = 45
  return (
    <div>
      {tiers.map((d) => (
        <div className="barrow" key={d.n}>
          <div className="lab">{d.n}</div>
          <div className="bartrack">
            <div className="barfill" style={{ width: (d.v / max * 100).toFixed(1) + '%', background: d.c }} />
          </div>
          <div className="val num">{d.shown}</div>
        </div>
      ))}
    </div>
  )
}

function Structure() {
  return (
    <section className="tint">
      <div className="wrap">
        <div className="eyebrow">Why the US template can&rsquo;t be rescaled</div>
        <h2>The exposed group is a rounding error in headcount — and the safe harbour isn&rsquo;t safe</h2>
        <div className="two">
          <div className="read">
            <p>
              In the US model the exposed class — knowledge workers — is roughly 60% of employment, and displaced
              workers <em>cross over</em> into physical trades where wages rise. Two things break that story in India.
            </p>
            <p>
              First, the exposed sector is ~1% of jobs. The shock to the <em>labour market</em> is narrow; the shock to{' '}
              <em>GDP, the external account, formal tax and urban consumption</em> is wide. Second, the &ldquo;everyone
              else&rdquo; that absorbs displacement is ~45% agriculture and ~40% informal non-farm — ~82% of the
              workforce is informal, demand-constrained and already carrying disguised underemployment. A displaced
              Bengaluru engineer does not become a well-paid tradesman. The valve is mostly closed.
            </p>
            <p className="colnote">
              This is the single most important reason the benign US result — unemployment stays in range, wages rise
              outside knowledge work — does not automatically travel to India.
            </p>
          </div>
          <div className="chartcard">
            <figure>
              <TierChart />
              <figcaption>
                India&rsquo;s workforce by AI-exposure tier, share of ~590M workers. The US model&rsquo;s exposed
                majority is inverted: here the exposed group is ~1%, and the &ldquo;safe&rdquo; majority is largely
                informal. Source: PLFS 2023–24; NASSCOM FY25; SBI Research on PLFS (formal firms &gt;20 workers &asymp; 14.5%).
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}

const inversions = [
  { idx: 'Inversion 01', title: 'The crown jewel is the exposed sector',
    body: <>India&rsquo;s comparative advantage <em>is</em> remotely-delivered English knowledge work — the most automatable thing in the model. The US takes ~53% of India&rsquo;s software-services exports, so the demand shock is set abroad, by US-lab capability and Western-client adoption India doesn&rsquo;t control.</> },
  { idx: 'Inversion 02', title: 'The safe harbour can&rsquo;t absorb',
    body: <>The US cushion — cross into rising-wage trades — is mostly closed. India&rsquo;s physical economy is informal and demand-constrained, so displaced or never-hired workers fall <em>down</em> into informality, not across into better jobs.</>,
    foot: <div className="usvin"><span className="us">US: coder &rarr; well-paid electrician.</span> <span className="in">India: coder &rarr; informal, or unhired.</span></div> },
  { idx: 'Inversion 03', title: 'The capital gains leak abroad',
    body: <>The US owns the frontier; its rising capital share stays home. India is a technology <em>taker</em> — R&amp;D ~0.6% of GDP vs 3.5% in the US; ~$4.1B private AI investment vs ~$285B in 2025. When AI automates Indian work, part of &ldquo;capital&rsquo;s rising share&rdquo; is a transfer to foreign model and compute owners.</> },
  { idx: 'Inversion 04', title: 'Demographics flip the sign of the risk',
    body: <>The US reallocates a stable workforce. India adds ~8–12M entrants a year. The services-export ladder was the escalator turning the demographic dividend into formal jobs. Remove the bottom rungs — freshers, testing, BPO — and the dividend curdles into an educated, underemployed youth cohort.</> },
  { idx: 'Inversion 05 — the offsetting one', title: 'The domestic-diffusion upside is larger, but later',
    body: <>India&rsquo;s economy sits far below the productivity frontier. Cheap cognition routed through digital public infrastructure — into credit, health, agri-extension, state capacity, small-firm productivity — is a <em>catch-up</em> gain that could dwarf the export loss. It is slower, policy-contingent, and the only lever India actually controls.</> },
]

function Divergence() {
  return (
    <section>
      <div className="wrap">
        <div className="eyebrow">Divergence from the US model</div>
        <h2>Five inversions</h2>
        <p className="lede" style={{ marginBottom: '6px' }}>
          Each is a mechanic that runs in a different direction — or a new one the US model never has to price.
        </p>
        <div className="invgrid">
          {inversions.map((it) => (
            <div className="inv" key={it.idx}>
              <div className="idx">{it.idx}</div>
              <h3 dangerouslySetInnerHTML={{ __html: it.title }} />
              <p>{it.body}</p>
              {it.foot}
            </div>
          ))}
          <div className="inv" style={{ borderTopColor: 'var(--teal)' }}>
            <div className="idx" style={{ color: 'var(--teal)' }}>The shape of the problem</div>
            <h3>A handoff, not a hit</h3>
            <p>The near-term shock (export sector) is largely exogenous and arrives first. The offset (domestic
              diffusion) is larger but arrives later and only if deployed. India&rsquo;s outcome hinges on the gap
              between the two — and on whether it climbs the value chain fast enough to keep the capital at home.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Slider({ def, value, onChange }) {
  return (
    <div className="slider">
      <div className="top">
        <span className="name">
          {def.name} <span className={'tag' + (def.dom ? ' dom' : '')}>{def.tag}</span>
        </span>
        <span className="out">{value}%</span>
      </div>
      <input type="range" min="0" max="100" value={value}
        onChange={(e) => onChange(def.key, +e.target.value)} />
      <div className="desc">{def.desc}</div>
    </div>
  )
}

function ResultCard({ label, value, cls, sub, full }) {
  return (
    <div className={'rcard' + (full ? ' full' : '')}>
      <div className="rl">{label}</div>
      <div className={'rn ' + (cls || '')}>{value}</div>
      <div className="rsub">{sub}</div>
    </div>
  )
}

function Explorer() {
  const [vals, setVals] = useState(presets.substantial)
  const [active, setActive] = useState('substantial')

  const setOne = (key, v) => { setVals((p) => ({ ...p, [key]: v })); setActive(null) }
  const setPreset = (name) => { setVals(presets[name]); setActive(name) }

  const r = useMemo(() => compute(vals), [vals])
  const vd = useMemo(() => verdict(r), [r])

  const abroadPct = Math.round(r.foreignOfCapital * 100)
  const homePct = 100 - abroadPct

  const bifSub = r.bif > 66 ? 'Severe — a small AI-fluent elite pulls away; routine white-collar wages fall.'
    : r.bif > 33 ? 'Widening — the graduate premium splits.' : 'Mild — pay largely intact.'
  const youthSub = r.youth > 65 ? 'Acute — the escalator\u2019s bottom rungs are gone and diffusion hasn\u2019t replaced them.'
    : r.youth > 40 ? 'Elevated — absorption of new graduates is the binding constraint.'
    : 'Contained — domestic demand is soaking up entrants.'

  const presetBtns = [
    ['modest', 'Modest', ''], ['substantial', 'Substantial', ''],
    ['extreme', 'Extreme', ''], ['best', 'Best case', 'best'],
  ]

  return (
    <section id="explorer">
      <div className="wrap">
        <div className="eyebrow" style={{ color: '#8fb0d6' }}>The scenario explorer</div>
        <h2>Set your assumptions. See India in 2030.</h2>
        <p className="lede">
          Two levers are set abroad — global AI capability and how fast India&rsquo;s export sector must adopt. Two
          are India&rsquo;s own choices — how far AI diffuses into the domestic economy, and how much of the value
          it keeps. Move them, or pick a scenario.
        </p>

        <div className="exgrid">
          <div className="panel">
            <div className="presets">
              {presetBtns.map(([key, label, extra]) => (
                <button key={key}
                  className={'preset ' + extra + (active === key ? ' on' : '')}
                  onClick={() => setPreset(key)}>{label}</button>
              ))}
            </div>
            {sliderDefs.map((def) => (
              <Slider key={def.key} def={def} value={vals[def.key]} onChange={setOne} />
            ))}
          </div>

          <div>
            <div className="results">
              <ResultCard label="GDP in 2030 vs a no-AI path"
                value={fmtPct(r.gdpUplift)} cls={r.gdpUplift >= 0 ? 'up' : 'down'}
                sub={`\u2248 $${r.gdp2030.toFixed(2)}T in 2030 (base $${GDP_BASE.toFixed(2)}T). Most of any large gain is domestic, not export.`} />
              <ResultCard label="Formal tech employment (5.8M base)"
                value={fmtPct(r.empChange)} cls={r.empChange >= 0 ? 'up' : 'down'}
                sub={`\u2248 ${r.jobsGone.toFixed(1)}M fewer formal-tech roles vs today — displaced or, mostly, never hired.`} />
              <ResultCard label="Services exports — the BoP pillar"
                value={fmtPct(r.expChange)} cls={r.expChange >= 0 ? 'up' : 'down'}
                sub={`\u2248 $${Math.round(r.expLevel)}B (from $224B). This is the current-account / rupee transmission belt.`} />
              <ResultCard label="Capital&rsquo;s share of income"
                value={r.capitalShare.toFixed(0) + '%'} cls={r.capitalShare > 50 ? 'down' : ''}
                sub={`labour ${r.laborShare.toFixed(0)}% / capital ${r.capitalShare.toFixed(0)}% (from 60/40).`} />

              <div className="rcard full">
                <div className="rl">Wage bifurcation — AI-fluent top vs routine white-collar</div>
                <div className="meter"><div className="meterfill" style={{ width: r.bif.toFixed(0) + '%', background: 'linear-gradient(90deg,var(--indigo),var(--clay))' }} /></div>
                <div className="rsub">{bifSub}</div>
              </div>

              <div className="rcard full">
                <div className="rl">Youth &amp; graduate absorption pressure</div>
                <div className="meter"><div className="meterfill" style={{ width: r.youth.toFixed(0) + '%', background: 'linear-gradient(90deg,var(--teal),var(--clay))' }} /></div>
                <div className="rsub">{youthSub}</div>
              </div>

              <div className="rcard full">
                <div className="rl">Of each &#8377; that goes to capital, where does it land?</div>
                <div className="leakbar">
                  <span style={{ width: homePct + '%', background: 'var(--indigo)' }}>{homePct > 14 ? homePct + '% stays in India' : ''}</span>
                  <span style={{ width: abroadPct + '%', background: 'var(--clay)' }}>{abroadPct > 14 ? abroadPct + '% to foreign owners' : ''}</span>
                </div>
                <div className="rsub">Of the rising capital share, ~{abroadPct}% accrues to foreign model &amp; compute owners at this value-capture setting.</div>
              </div>

              <div className={'verdict tone-' + vd.tone}>
                <div className="vt">{vd.t}</div>
                <div className="vd">{vd.d}</div>
              </div>
            </div>
          </div>
        </div>
        <p className="srcnote" style={{ color: '#8a877c', marginTop: '22px' }}>
          The model is deliberately simple and fully specified — every coefficient is listed under{' '}
          <a href="#assumptions" style={{ color: '#b7b3a6' }}>Assumptions</a>. It encodes one thesis: export-sector
          damage rises almost entirely with the two exogenous levers, while the only large offset and the only
          youth-relief comes from the two India controls. Try holding capability high and moving only the domestic levers.
        </p>
      </div>
    </section>
  )
}

const findings = [
  { n: 'Finding 1 — Growth', h: 'GDP rises in every scenario, but the source of the gain moves',
    p: <>In the modest case AI adds ~1–1.5 points to the growth path — India stays a ~6.5–7.5% economy, roughly today&rsquo;s trajectory. In stronger cases the uplift is real but its <em>source</em> shifts decisively from the export sector to domestic diffusion: at high capability, the 7%-of-GDP export sliver contributes a bounded productivity gain, while AI applied across the other 93% is where the large numbers live. Growth and jobs de-link.</> },
  { n: 'Finding 2 — Jobs', h: 'The IT hiring pyramid inverts before the workforce shrinks',
    p: <>The first, visible symptom is not layoffs but a <em>hiring freeze at the bottom</em> — fewer freshers per senior. NITI Aayog&rsquo;s own scenario has the IT-services workforce falling from ~7.5–8M toward 6M by 2031. The graduate-absorption engine of the last decade simply stops. In India that lands on the most politically salient group: connected, educated, urban youth.</> },
  { n: 'Finding 3 — Wages', h: 'A thin graduate premium splits in two',
    p: <>AI-fluent roles already command a ~28% wage premium; routine white-collar work — junior dev, testing, support, back-office finance and legal — stagnates or declines. The US model&rsquo;s consolation (manual wages rise) is muted here because the manual economy is informal and demand-constrained. The average can rise while the median white-collar worker is worse off.</> },
  { n: 'Finding 4 — The pie, and who owns it', h: 'Capital&rsquo;s share rises — and part of it leaves the country',
    p: <>As in the US, automation lifts capital&rsquo;s share above today&rsquo;s ~60/40 labour split. India&rsquo;s twist: because it rents the frontier rather than owning it, a slice of that rising capital share flows to foreign model and compute owners. The distributional question is not only labour-vs-capital but <em>domestic-vs-foreign</em> capital — the one the value-capture lever targets.</> },
]

function Findings() {
  return (
    <section>
      <div className="wrap">
        <div className="eyebrow">Findings</div>
        <h2>What the scenarios say</h2>
        <div className="invgrid" style={{ gap: '44px' }}>
          {findings.map((f) => (
            <div className="finding" key={f.n}>
              <div className="fnum">{f.n}</div>
              <h3 dangerouslySetInnerHTML={{ __html: f.h }} />
              <p>{f.p}</p>
            </div>
          ))}
          <div className="finding" style={{ gridColumn: '1/-1', borderTop: '2px solid var(--clay)', paddingTop: '16px' }}>
            <div className="fnum" style={{ color: 'var(--clay)' }}>Finding 5 — The India-specific one</div>
            <h3>The external account is the transmission belt from an IT problem to a macro problem</h3>
            <p style={{ maxWidth: '70ch' }}>
              This is what the US framework never has to model. India&rsquo;s services surplus (~$224B of IT exports
              inside a larger invisibles account) is what finances its chronic goods trade deficit. If AI lets Western
              clients in-source what they used to offshore, that surplus is the thing at risk — and with it the current
              account and the rupee. A shock that looks sector-specific becomes a balance-of-payments and currency
              question. For an investor this is the most under-priced link in the chain: services-export deceleration
              &rarr; weaker invisibles &rarr; INR pressure, well before it shows in headline GDP.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Conclusion() {
  return (
    <section id="conclusion">
      <div className="wrap">
        <div className="eyebrow" style={{ color: '#8fb0d6' }}>The considered view</div>
        <h2>A bumpy handoff between two growth models</h2>
        <div className="read">
          <p>
            Reasoning it through to a conclusion, rather than leaving it balanced: AI is not simply bullish or bearish
            for India. It is a <strong>near-term structural headwind to the specific growth model India actually
            runs</strong> — services-export-led formalisation — and a <strong>long-term option on a different,
            potentially larger model</strong> — DPI-mediated domestic productivity catch-up. The two do not arrive together.
          </p>
          <p>
            The export shock is the higher-conviction leg. It is largely exogenous — driven by frontier capability and
            Western-client adoption India cannot set — it arrives first, and it is already visible in flattening fresher
            hiring and a de-linking of revenue from headcount. It threatens the balance of payments and the urban
            middle-class formation story at the same time. This is the leg markets are slowest to price, because it
            transmits through the external account, not the P&amp;L.
          </p>
          <p>
            The offsetting domestic-diffusion upside is genuinely larger in magnitude — a low-productivity economy has
            more frontier to close — but it is <strong>later, slower, and policy-contingent</strong>. It depends on
            state capacity to deploy, which is India&rsquo;s chronic constraint, and on climbing the value chain fast
            enough to keep the capital share at home rather than renting cognition from abroad.
          </p>
          <div className="callout">
            So the base case is neither dividend nor collapse. It is a handoff with a gap in the middle — a real risk
            of a &ldquo;lost cohort&rdquo; of educated youth across roughly 2026–2031, before domestic diffusion scales
            — with both tails wider than in the US.
          </div>
          <p>
            The single variable that decides which India emerges is not AI capability, which is given. It is whether
            India moves up the AI value chain and into domestic deployment fast enough. In every scenario capital&rsquo;s
            share rises; the only things India controls are <strong>whose</strong> capital, and <strong>where</strong>
            the cognition is applied.
          </p>
          <p style={{ color: '#a9a599', fontSize: '15px' }}>
            For the investor&rsquo;s translation: the tradeable near-term view is the erosion of the export-arbitrage
            model — IT majors&rsquo; headcount economics, the services-surplus / INR channel, and urban discretionary
            consumption — as the higher-conviction bear leg. The domestic-diffusion beneficiaries — DPI rails, applied
            AI in BFSI / health / agri, and the power &amp; data-centre capex cycle — are the longer-dated, larger-payoff,
            lower-conviction bull leg. Position the certainty first.
          </p>
        </div>

        <div className="trig">
          <div className="tbox bear">
            <h4>The bear thesis is invalidated if&hellip;</h4>
            <ul>
              <li>Net IT headcount keeps rising with revenue</li>
              <li>Fresher intake recovers to prior run-rates</li>
              <li>Services exports keep compounding double-digit</li>
              <li>GCCs keep adding heads, not just GVA</li>
            </ul>
          </div>
          <div className="tbox bull">
            <h4>The bull thesis is invalidated if&hellip;</h4>
            <ul>
              <li>Services-export growth runs below GDP growth for years</li>
              <li>Entry-level formal white-collar hiring structurally falls</li>
              <li>Youth / graduate unemployment rises as informalisation deepens</li>
              <li>The services BoP surplus shrinks</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Assumptions() {
  return (
    <section className="tint" id="assumptions">
      <div className="wrap">
        <div className="eyebrow">Full transparency</div>
        <h2>Assumptions &amp; method</h2>
        <p className="read colnote" style={{ fontSize: '15px' }}>
          This is an illustrative model built to make reasoning explicit, in the spirit of the Anthropic explorer —
          not a calibrated forecast. Its job is to show the <em>direction</em> and <em>relative size</em> of each
          mechanic under India&rsquo;s structure. Every input, constant and formula is below; the app runs exactly this arithmetic.
        </p>

        <details className="assume" open>
          <summary>Baseline &amp; anchor facts (2025–26)</summary>
          <div className="inner">
            <table><tbody>
              <tr><td>GDP (2026, nominal)</td><td>~$4.15T; ~6.5% real growth → no-AI 2030 baseline &asymp; $5.30T (2026 prices). <span className="srcnote">IMF / NSO.</span></td></tr>
              <tr><td>Exposed formal-tech sector</td><td>~5.8M direct employees; ~$283B revenue; ~$224B exports (FY25). &asymp;1% of workforce, &asymp;7% of GDP. <span className="srcnote">NASSCOM Strategic Review 2025.</span></td></tr>
              <tr><td>Workforce structure</td><td>~590M workers; agriculture ~45%; informal ~82% of workers; firms &gt;20 staff ~14.5%. <span className="srcnote">PLFS 2023–24; SBI Research.</span></td></tr>
              <tr><td>Export destination</td><td>US &asymp; 53% of software-services exports. <span className="srcnote">MeitY / NASSCOM.</span></td></tr>
              <tr><td>Tech-taker position</td><td>R&amp;D ~0.6% of GDP (US 3.5%); private AI investment ~$4.1B vs ~$285B US (2025). <span className="srcnote">Stanford AI Index; industry.</span></td></tr>
              <tr><td>Labour income share</td><td>~60% labour / ~40% capital today. GCCs ~2.36M direct, ~$68B GVA (~2% GDP).</td></tr>
            </tbody></table>
          </div>
        </details>

        <details className="assume">
          <summary>The six inputs</summary>
          <div className="inner">
            <table><tbody>
              <tr><td>capability <code>0–100</code></td><td>Global share of knowledge-work tasks AI performs at human level. <b>Exogenous</b> to India.</td></tr>
              <tr><td>exportAdoption</td><td>Deployment speed forced on Indian IT/GCC by client re-pricing. <b>Exogenous.</b></td></tr>
              <tr><td>autonomy</td><td>Share of automatable work done with no human in loop. <b>Exogenous.</b></td></tr>
              <tr><td>domesticDiffusion</td><td>AI augmentation of the broad/informal economy via DPI. <b>India&rsquo;s choice.</b></td></tr>
              <tr><td>valueCapture</td><td>Share of AI value retained by domestic capital. <b>India&rsquo;s choice.</b></td></tr>
              <tr><td>adjustmentFriction</td><td>Difficulty of re-absorbing displaced/unhired workers (India default high, 70).</td></tr>
            </tbody></table>
          </div>
        </details>

        <details className="assume">
          <summary>The formulas (exactly what the app computes)</summary>
          <div className="inner">
            <p style={{ margin: '4px 0 10px' }}>
              Let each input be a fraction 0–1. Constants: exposed GVA share <code>0.07</code>, broad share <code>0.93</code>,
              max exposed productivity <code>2.2&times;</code>, max domestic uplift <code>0.20</code>, new-task offset{' '}
              <code>0.10</code> (weak — India creates few domestic knowledge tasks), max exposed displacement <code>0.55</code>.
            </p>
            <table><tbody>
              <tr><td>GDP uplift</td><td><code>0.07&middot;(cap&middot;adopt)&middot;1.2 + 0.93&middot;(diff&middot;cap)&middot;0.20</code> → applied to $5.30T baseline. Domestic diffusion dominates the upside.</td></tr>
              <tr><td>Tech employment &Delta;</td><td><code>&minus;(cap&middot;adopt&middot;auto)&middot;(1&minus;0.10)&middot;0.55</code> of 5.8M.</td></tr>
              <tr><td>Services exports &Delta;</td><td><code>0.40&middot;(capture&middot;adopt) &minus; 0.60&middot;(cap&middot;auto)</code>. Disintermediation by capable, autonomous AI at the client; partial defence via domestic value capture. Structurally hard to keep positive.</td></tr>
              <tr><td>Capital share</td><td><code>40% + (cap&middot;adopt)&middot;20</code>. Foreign slice <code>= (1&minus;capture)&middot;0.6</code> of the capital share.</td></tr>
              <tr><td>Wage bifurcation</td><td><code>cap&middot;adopt</code>, 0–100.</td></tr>
              <tr><td>Youth pressure</td><td><code>clamp( (cap&middot;adopt&middot;auto)&middot;55 + friction&middot;30 &minus; diff&middot;35 , 0, 100 )</code>. Diffusion is the only relief term.</td></tr>
            </tbody></table>
            <p style={{ marginTop: '12px' }} className="srcnote">
              The thesis is in the structure: the three exogenous levers only ever <em>raise</em> export/employment
              damage; the two domestic levers are the only source of large GDP upside and the only youth-relief. That
              asymmetry — not the specific coefficients — is the claim.
            </p>
          </div>
        </details>

        <details className="assume">
          <summary>What this model deliberately omits</summary>
          <div className="inner">
            <p style={{ margin: '4px 0' }}>
              Like the Anthropic v1 explorer: no business cycles, no aggregate-demand or financial-market feedback, no
              explicit policy response, no robotics/physical-automation wave (which would finally expose the manual
              &ldquo;safe harbour&rdquo;), no distribution <em>within</em> cohorts, and no second-order effect of a
              cheaper rupee lifting export competitiveness. It does not follow individual workers, so it understates
              transition pain. Treat outputs as directional arithmetic for thinking, not point predictions. Tail
              outcomes — both the crisis and the transformation — are wider than any central number here suggests.
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <p style={{ color: '#b7b3a6', maxWidth: '62ch' }}>
          An independent adaptation of Anthropic&rsquo;s{' '}
          <a href="https://www.anthropic.com/institute/econ-scenarios">Scenarios for our Economic Future</a>{' '}
          (Korinek et al., 2026) to Indian economic structure. Not affiliated with, endorsed by, or produced by
          Anthropic. The US framework is theirs; the India reframing, model, and conclusions here are the author&rsquo;s.
        </p>
        <p className="srcnote">
          Data: NASSCOM Strategic Review 2025 · PLFS 2023–24 (MoSPI) · IMF WEO · NITI Aayog · Stanford AI Index 2025 ·
          SBI Research. Built with Vite + React · figures are illustrative. v1.0.
        </p>
      </div>
    </footer>
  )
}

function TopNav({ page }) {
  return (
    <nav className="topnav">
      <div className="wrap navwrap">
        <a href="#/" className="brand">India&nbsp;&amp;&nbsp;AI · 2030</a>
        <div className="navlinks">
          <a href="#/" className={page === 'home' ? 'on' : ''}>Explorer</a>
          <a href="#/v2" className={page === 'v2' ? 'on' : ''}>Methodology &amp; v2</a>
        </div>
      </div>
    </nav>
  )
}

function CTAtoV2() {
  return (
    <section className="tint ctaband">
      <div className="wrap">
        <div className="eyebrow">Keep going</div>
        <h2 style={{ maxWidth: '26ch' }}>Is the model any good? Read the critique — and the improved version.</h2>
        <p className="read">Every model this simple has faults. The next page sets out six of them plainly, then rebuilds
          the model to fix what can be fixed: exports coupled into GDP, job losses split into displaced vs never-hired,
          a realistic-range sensitivity analysis that answers &ldquo;which dial matters most,&rdquo; and Monte-Carlo
          uncertainty bands instead of false-precision numbers.</p>
        <p style={{ marginTop: '18px' }}><a href="#/v2" style={{ fontSize: '17px' }}>Methodology critique &amp; the v2 model →</a></p>
      </div>
    </section>
  )
}

function Landing() {
  return (
    <>
      <Hero />
      <Tasks />
      <hr className="divider" />
      <Structure />
      <hr className="divider" />
      <Divergence />
      <Explorer />
      <Findings />
      <Conclusion />
      <CTAtoV2 />
      <Assumptions />
      <SiteFooter />
    </>
  )
}

function useHashRoute() {
  const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash : '')
  useEffect(() => {
    const onChange = () => { setHash(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()
  const page = hash.startsWith('#/v2') ? 'v2' : 'home'
  return (
    <>
      <TopNav page={page} />
      {page === 'v2' ? <ModelV2 /> : <Landing />}
    </>
  )
}
