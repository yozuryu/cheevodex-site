// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://yozuryu.github.io',
    base: '/cheevodex-site',
    trailingSlash: 'always',
    integrations: [react(), sitemap()],
});
