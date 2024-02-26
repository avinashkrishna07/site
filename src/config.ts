import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import footnote from 'markdown-it-footnote';
import emoji from 'markdown-it-emoji';

import {sync} from 'fast-glob';

// TODO: Make it statically generated by index-generator.org instead
import gen_blog_list from './scripts/gen_blog_list.js';
import gen_rss_feed from './scripts/gen_rss_feed.js';


gen_blog_list('content/blogs', 'src/theme/cache');

/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  title: 'Avinash Krishna',
  description: 'I write about wide-variety of untouched topics in a simplified way.',

  lang: 'en-IN',
  base: '/site/',
  outDir: '../dist',

  lastUpdated: true,
  appearance: true,
  ignoreDeadLinks: true,

  markdown: {
    theme: 'material-theme-palenight',
    lineNumbers: true,

    config: (md) => {
      const wordCount = str => str.length && str.split(/\s+\b/).length || 0;

      md.use(footnote);
      md.use(emoji);

      md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
        let htmlResult = slf.renderToken(tokens, idx, options);
        let wc = wordCount(env.content);
        if (env.relativePath.includes('blogs/') && !env.relativePath.includes('index') && tokens[idx].tag === 'h1') {
          htmlResult += `\n<ClientOnly><BlogMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :frontmatter="$frontmatter" :wordCount="${wc}" /></ClientOnly>`;
        }
        return htmlResult;
      }
    },
  },

  buildEnd: (cfg) => {
    return gen_rss_feed(cfg, "https://animeshz.github.io", cfg.outDir);
  },

  head: [
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Klee+One:wght@600&display=swap%22' }],
    ['link', { rel: "alternate", type: "application/rss+xml", href: "/site/rss.xml", title: "Avinash Krishna | Sitewide RSS Feed" }],
    ['link', { rel: "alternate", type: "application/atom+xml", href: "/site/atom.xml", title: "Avinash Krishna | Sitewide Atom Feed" }],
  ],

  themeConfig: {
    siteTitle: 'Avinash Krishna / Home',
    search: {
      provider: 'local'
    },
    outline: [2, 6],
    outlineTitle: 'Table of Contents',
    socialLinks: [
      { icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-rss" viewBox="0 0 16 16"><path d="M5.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-3-8.5a1 1 0 0 1 1-1c5.523 0 10 4.477 10 10a1 1 0 1 1-2 0 8 8 0 0 0-8-8 1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1 6 6 0 0 1 6 6 1 1 0 1 1-2 0 4 4 0 0 0-4-4 1 1 0 0 1-1-1z"/></svg>' }, link: '/site/atom.xml' },
      { icon: 'github', link: 'https://github.com/avinashkrishna07/site' },
    ],
    editLink: { pattern: 'https://github.com/avinashkrishna07/site/edit/main/content/:path', },
    nav: nav(),
    sidebar: sidebar(),
  }
};

function nav() {
  return [
    { text: '🏠 Home', link: '/', },
    { text: '📝 Blogs', link: '/blogs/', },
    { text: '📔 Notes', link: '/notes/', },
    { text: '🚀 Projects', link: '/projects/', },
    { text: '✍🏻 Journal', link: '/journal/', },
  ];
}

function sidebar() {
  // const debug = (val) => { console.log(JSON.stringify(val)); return val; };

  return {
    // Johnny.Decimal format
    '/notes/': sync(`content/notes/*`, { onlyDirectories: true, objectMode: true, })
      .map(bucket => ({
        text: bucket.name,
        items: sync(`${bucket.path}/*`, { onlyDirectories: true, objectMode: true, })
          .map(category => ({
            text: `<span style="font-weight: 700;">${category.name}</span>`,
            items: sync(`${category.path}/*`, { onlyFiles: true, objectMode: true, })
              .filter(id => id.name.includes('.md'))
              .map(id => ({
                text: id.name.replace('.md', ''),
                link: `/notes/${bucket.name}/${category.name}/${id.name.replace('.md', '')}`
              }))
          }))
      })),
  };
}

export default config;
