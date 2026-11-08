# DSQUARE OFFICIAL WEAR — a Synkani product

React + Vite single-page app. Entry: `index.html` → `src/main.tsx` → `src/App.tsx` (React Router).

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
npm test
```

Pages live in `src/pages/`, shared UI in `src/components/`. The host must rewrite all paths to `index.html` (SPA fallback).

Supabase (images, enquiries, admin login): see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
