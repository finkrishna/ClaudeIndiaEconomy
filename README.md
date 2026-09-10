# India AI Econ-Scenarios Explorer

An interactive, India-specific adaptation of Anthropic's
[Scenarios for our Economic Future](https://www.anthropic.com/institute/econ-scenarios).
It reframes the task-based model for India's very different economic structure — where the
AI-exposed formal-tech sector is ~1% of jobs but ~7% of GDP and the largest pillar of the
services-export surplus — and lets you dial assumptions to see India in 2030: growth, formal-tech
jobs, wages, the external account, and who captures the gains.

Independent analysis. Not affiliated with, endorsed by, or produced by Anthropic.

**Repo:** `finkrishna/ClaudeIndiaEconomy` · **Stack:** Vite + React (no runtime dependencies)

## Two views
- **The explorer** (landing page) — the base model: six dials, four presets (Modest / Substantial /
  Extreme / Best case), and live findings.
- **Methodology & v2 model** (`#/v2`, linked from the landing page) — a written critique of the base
  model's flaws and an improved version that fixes them: exports coupled into GDP, a stock/flow
  split of job losses, realistic-range **sensitivity (tornado)** analysis, and **Monte-Carlo
  uncertainty bands** instead of false-precision point outputs.

## Design
Matched to Anthropic's own design system: warm cream canvas (`#faf9f5`) and ink (`#141413`),
cream/black band rhythm, serif for display and body prose (Newsreader ≈ Copernicus), a humanist
sans for UI (DM Sans ≈ Styrene), mono uppercase eyebrows (IBM Plex Mono), and the clay/coral accent
(`#cc785c`) held in reserve for full-bleed callouts.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/  (static, deployable anywhere)
npm run preview    # serve the production build
```

## Deploy

Routing is **hash-based** (`#/v2`), so the same static build works on any host with no
server rewrites.

**GitHub Pages (CI/CD, already wired).** `.github/workflows/deploy.yml` builds and publishes on
every push to `main`. One-time step: repo → **Settings → Pages → Build and deployment → Source →
GitHub Actions**. After that it's live at `https://finkrishna.github.io/ClaudeIndiaEconomy/`.
(The workflow can't create the Pages site on the very first run without this toggle; once enabled it
is fully automatic.)

**Vercel.** Import the repo — Vite is auto-detected (`vercel.json` included). Closest to how the
original is hosted; auto-deploys on push, easy custom domains.

**Netlify / any static host.** `npm run build`, then drop `dist/` on app.netlify.com/drop.

## Structure
- `src/model.js` — base model: pure `compute` / `verdict`, presets, slider + tier definitions.
- `src/modelV2.js` — improved model: coupled `computeV2`, `sensitivity` (tornado), seeded `monteCarlo`, realistic input ranges.
- `src/App.jsx` — hash router, top nav, the landing page sections, and the explorer.
- `src/ModelV2.jsx` — the critique + v2 page.
- `src/styles.css` — Anthropic design tokens and layout.

## The model in one line
Three exogenous levers (global AI capability, forced export-sector adoption, autonomy) only ever
*raise* export/employment damage; two India-controlled levers (domestic diffusion, value capture)
are the only source of large GDP upside and the only relief for youth absorption. The thesis lives
in that asymmetry.

**Honesty about status.** The coefficients are reasoned priors chosen to express that structure —
not values calibrated to data. The base model additionally lets GDP and exports move independently
(an internal inconsistency) and reports single numbers (false precision). The **v2 model** fixes the
coupling and quantifies the uncertainty, but its coefficients are still priors. Both are tools for
thinking about *direction and relative magnitude*, not forecasts. See the v2 page for the full
critique and what changed.
