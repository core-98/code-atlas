# CodeAtlas

A mobile-friendly LeetCode company browser built with Next.js 15 (App Router), Tailwind CSS, and shadcn/ui. It loads the curated CSV data from [`liquidslr/leetcode-company-wise-problems`](https://github.com/liquidslr/leetcode-company-wise-problems) and exposes rich filtering for company, category, difficulty, and topic.

## Getting Started

Requires Node.js ≥ 18.18. Install dependencies and start the dev server with your preferred package manager:

```bash
# npm
npm install
npm run dev

# yarn
yarn install
yarn dev
```

Open <http://localhost:3000> in your browser to view the app.

## Deploying to Vercel

This project is ready for one-click deployment:

1. Push the `company-explorer` folder to a Git repository.
2. Import the repository into Vercel.
3. Use the default build command (`npm run build`) and output (`.next`).

## Refreshing the dataset

The static JSON data lives at `public/data/companies.json`. Regenerate it by running the helper script from the repository root:

```bash
node ../scripts/generate-data.js
```

Copy the updated file into `public/data/companies.json` before committing.
