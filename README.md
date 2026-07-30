# M360 — Data Layer

## Quick Links

The app is served under the `/m360_data_layer` basePath, in dev as well as in
production — `http://localhost:3000/` alone returns a 404.

| | Local | Production |
|---|---|---|
| **Data Layer** (the module) | [/m360_data_layer](http://localhost:3000/m360_data_layer) | [chife-mod.github.io/m360_data_layer](https://chife-mod.github.io/m360_data_layer) |
| **V1** (frozen reference) | [/m360_data_layer/v1](http://localhost:3000/m360_data_layer/v1) | [chife-mod.github.io/m360_data_layer/v1](https://chife-mod.github.io/m360_data_layer/v1) |
| **Dashboard** | [/m360_data_layer/dashboard](http://localhost:3000/m360_data_layer/dashboard) | [chife-mod.github.io/m360_data_layer/dashboard](https://chife-mod.github.io/m360_data_layer/dashboard) |

`/v2` still resolves — it redirects to the root, so links shared before the
swap keep working.

**Picking this up after a break?** Read *WHERE THINGS STAND* at the top of
[history/HISTORY.md](history/HISTORY.md) — current state, content status and the
next step — then [BACKLOG.md](BACKLOG.md) for what is agreed but unbuilt.

Design basis and tokens: [DESIGN.md](DESIGN.md) · change log: [history/HISTORY.md](history/HISTORY.md)

**Deploy** is manual — GitHub Pages serves the `gh-pages` branch:

```bash
npm run build          # -> out/
# then publish out/ to the gh-pages branch
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
