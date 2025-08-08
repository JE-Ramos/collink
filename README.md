## Collink

Next.js + BeerCSS (Material 3 expressive) + Convex + Clerk + Resend

- Package manager: pnpm
- Design system: [BeerCSS](https://github.com/beercss/beercss)
- DB/Realtime: Convex
- Auth: Clerk
- Email: Resend

See the full product spec in `PRD.md`.

### Getting Started

1) Copy envs
```
cp .env.example .env
```
Fill in:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL` (after convex dev deploy)
- `RESEND_API_KEY`

2) Install deps
```
pnpm install
```

3) Run dev
```
pnpm dev
```

### License
MIT — see `LICENSE`.


