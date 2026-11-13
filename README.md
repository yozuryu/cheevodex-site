# Cheevodex website

The website for [Cheevodex](https://github.com/yozuryu/cheevodex), a pocket companion for RetroAchievements: <https://yozuryu.github.io/cheevodex-site/>

The app itself lives in its own repo and runs at <https://yozuryu.github.io/cheevodex/>.

## Stack

[Astro](https://astro.build) with React for the parts that move or respond (the hero's working dex, the record tour, the recap rows, the friend-colour try-out and the contents tour), static HTML everywhere else.

The page is paced like Playdate's (one idea per full-colour band, short headings with a full stop), opens on a small working dex in an app frame, and runs Analogue's ticker of the systems RetroAchievements covers; everything drawn is Cheevodex's own. The SEO head (canonical, Open Graph, Twitter card, JSON-LD) is in `src/layouts/Base.astro`; Astro writes the sitemap.

```sh
npm install
npm run dev      # http://localhost:4321/cheevodex-site/
npm run build    # astro check, then dist/
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Pictures

Game icons, achievement badges and the author's avatar appear only inside previews of the app: real screenshots (`src/assets/shots/`, captured at 2x, converted to WebP at build), and the app pieces built on the page (`public/app-icons/`), showing what Cheevodex does. Badges and icons on RetroAchievements are made by its community and the games' publishers, so they are not used as decoration. `public/assets/og.jpg` is the 1200 x 630 share image, taken from the hero.

## Licence

MIT, as the app.
