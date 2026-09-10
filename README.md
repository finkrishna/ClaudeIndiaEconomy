# India AI Econ-Scenarios Explorer

An interactive, India-specific adaptation of Anthropic's
[Scenarios for our Economic Future](https://www.anthropic.com/institute/econ-scenarios).
Task-based model of how AI might reshape India's economy by 2030 — growth, formal-tech
jobs, wages, the external account, and who captures the gains. Built as a Vite + React app.

Independent analysis. Not affiliated with or endorsed by Anthropic.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/ (static, deployable anywhere)
npm run preview    # serve the production build
```

## Deploy — three options

**1. GitHub Pages (CI/CD, zero config).** Push to a GitHub repo. The included
workflow at `.github/workflows/deploy.yml` builds and publishes automatically.
One-time: repo → Settings → Pages → Source = **GitHub Actions**. Live at
`https://<user>.github.io/<repo>/`. `base: './'` in `vite.config.js` makes the
project-subpath work without edits.

**2. Vercel (closest to how the original is hosted).** Import the repo at
vercel.com — framework auto-detected as Vite (`vercel.json` included). Auto-deploys
on every push; gives you a real app URL and easy custom domains.

**3. Netlify / any static host.** `npm run build`, then drag the `dist/` folder
onto app.netlify.com/drop. No account gymnastics.

## Structure
- `src/model.js` — the scenario model as pure functions (compute, verdict, presets). Every coefficient is surfaced in the app's Assumptions section.
- `src/App.jsx` — all page sections; the Explorer holds the slider state.
- `src/styles.css` — design tokens + layout.

## The model in one line
Three exogenous levers (global AI capability, forced export-sector adoption, autonomy)
only ever *raise* export/employment damage; two India-controlled levers (domestic
diffusion, value capture) are the only source of large GDP upside and the only youth
relief. The thesis is in that asymmetry, not the specific coefficients. Figures are
illustrative — a tool for thinking, not a forecast.
