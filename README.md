# Cheevodex website

The website for [Cheevodex](https://github.com/yozuryu/cheevodex), a pocket companion for RetroAchievements: <https://yozuryu.github.io/cheevodex-site/>

The app itself lives in its own repo and runs at <https://yozuryu.github.io/cheevodex/>.

## Stack

[Astro](https://astro.build) with React for the parts that move or respond (the hero's dex entry, the dex record, the moved rows, the friend-colour try-out and the contents switcher), static HTML everywhere else.

The page is paced like Playdate's (one idea per full-colour band, short headings with a full stop), opens on a Backloggd-style wall of the author's real game icons and badges, and runs Analogue's ticker of the systems RetroAchievements covers; everything drawn is Cheevodex's own. The SEO head (canonical, Open Graph, Twitter card, JSON-LD) is in `src/layouts/Base.astro`; Astro writes the sitemap.

```sh
npm install
npm run dev      # http://localhost:4321/cheevodex-site/
npm run build    # astro check, then dist/
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Pictures

`src/assets/shots/` holds real screenshots of the app at 2x (Astro converts them to WebP at build). `public/icons/`, `public/wall/` and `public/badges/` are game icons and achievement badges from the author's RetroAchievements data; they belong to their owners. `public/assets/og.jpg` is the 1200 x 630 share image, taken from the hero.

## Licence

MIT, as the app.
