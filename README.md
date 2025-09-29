# CodeAtlas

A polished Next.js 15 single-page app that lets you explore LeetCode-style interview problems by company, category, difficulty, and topic. The experience stays snappy on mobile, persists your filter choices, and ships with a built-in modern C++ refresher so you can context switch between data structures and language practice.

## Highlights
- Interactive company explorer with global search, topic chips, difficulty toggles, and range sliders for frequency and acceptance rate
- Rich problem cards with quick links, tag badges, and optional solution resources when they are available in the dataset
- Local-first UX: filter state and sort preferences persist in `localStorage`, and the entire dataset is bundled as static JSON for instant loads
- Multi-tab layout featuring the explorer, a Markdown-powered C++ & STL crash course stored in `c_stl_crash_course.md`, and a Career Prep Guide
- Dark/light theme toggle backed by `next-themes` plus smooth Tailwind-driven visuals built on shadcn/ui primitives
- Career Prep Guide tab with gated access, curated resume playbooks, interview drills, and outreach workflows for front-end, back-end, and AI-focused roles

## Tech Stack
- Next.js 15 App Router with React 18 and TypeScript
- Tailwind CSS with shadcn/ui component compositions and Radix UI primitives
- Lucide icons, next-themes for theming, and custom utilities such as the lightweight Markdown renderer in `src/components/markdown-renderer.tsx`

## Quick Start
1. Install Node.js 18.18 or newer.
2. Install dependencies and start the dev server with your preferred package manager:
   ```bash
   npm install
   npm run dev
   # or
   yarn install
   yarn dev
   ```
3. Visit `http://localhost:3000` to explore the app. Hot reloading is enabled out of the box.

### Available scripts
- `npm run dev` — start the Next.js development server
- `npm run build` — create a production build in `.next`
- `npm run start` — serve the production build
- `npm run lint` — run ESLint using `next lint`

## Project layout
- `src/app` — App Router entry points (`layout.tsx`, `page.tsx`, metadata, and global styles)
- `src/components` — Feature modules (`company-explorer`, `home-tabs`, `job-prep-guide`, UI primitives, theme toggle, Markdown renderer)
- `src/lib` — Shared utilities such as the Tailwind `cn` helper
- `public/data/companies.json` — Static dataset powering the explorer
- `c_stl_crash_course.md` — Markdown content rendered inside the C++ refresher tab
- `src/app/api/career-auth/route.ts` — Validates Career Prep Guide unlock codes against `CAREER_SECRET`

## Configuration
- `CAREER_SECRET` — Optional. Set in `.env.local` to require an access code before the Career Prep Guide unlocks. Leave undefined to keep the guide open.
- Restart the dev server after changing environment variables so Next.js picks up the updates.

## Data refresh workflow
The explorer ships with a prebuilt `public/data/companies.json` file containing:
```json
{
  "generatedAt": "ISO timestamp",
  "totalCompanies": 470,
  "companies": [
    {
      "name": "...",
      "slug": "...",
      "totals": { "categories": 0, "problems": 0 },
      "categories": [
        {
          "name": "...",
          "slug": "...",
          "count": 0,
          "problems": [
            {
              "title": "...",
              "difficulty": "EASY|MEDIUM|HARD",
              "frequency": 0,
              "acceptanceRate": 0,
              "link": "https://...",
              "topics": ["..."],
              "solutions": [{ "language": "...", "url": "https://..." }]
            }
          ]
        }
      ]
    }
  ]
}
```
To regenerate the file:
- Pull the latest CSV exports from [liquidslr/leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems).
- Convert the CSVs into the JSON shape above (the original repository provides scripts you can adapt, or you can write your own transform).
- Place the resulting file at `public/data/companies.json` and redeploy.

## C++ refresher tab
- `page.tsx` loads the Markdown stored in `c_stl_crash_course.md` and renders it through the custom parser in `MarkdownRenderer`. Update the Markdown file to tweak the curriculum or swap in an entirely different study guide. No additional build steps are required.

## Career Prep Guide tab
- `JobPrepGuide` is the client-side component powering the third tab inside `home-tabs`.
- The unlock form posts to `/api/career-auth`. When `CAREER_SECRET` is defined, only matching submissions unlock the session; without it, requests default to `valid: true`.
- Successful unlocks persist in `sessionStorage` under `career-guide-access`, so reopening the tab in the same session keeps the content visible until the browser tab is closed.
- Tailor the guidance by editing the data structures in `src/components/job-prep-guide.tsx` (resume variants, DSA schedules, outreach tooling, timelines, etc.).

## Deployment
- Production builds are static-friendly; deploy on Vercel (recommended) or any platform that runs `next start`.
- Use the default build command (`npm run build`) and output directory (`.next`). Environment variables are not required for the default setup.

## Acknowledgements
- Dataset sourced from [liquidslr/leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems).
- UI foundations inspired by the shadcn/ui component library.
