# TIL Blog - Project Overview

> 산하개발실록 (Sanha Development Chronicle)

## Quick Reference

| Item | Value |
|------|-------|
| **URL** | https://headf1rst.github.io/TIL |
| **Framework** | Next.js 13.4.1 (SSG) |
| **Language** | TypeScript + JavaScript |
| **Styling** | Tailwind CSS 3.1.5 |
| **Deployment** | GitHub Pages (gh-pages branch) |
| **Node** | Check `.nvmrc` or use latest LTS |

## Commands

```bash
npm run dev       # Development server (localhost:3000)
npm run build     # Static build (out/ folder)
npm run lint      # ESLint
npm run deploy    # Build + deploy to gh-pages
```

## Project Structure

```
TIL/
├── pages/                 # Next.js pages (routing)
│   ├── index.tsx          # Home - post list + tag filter
│   ├── [id].tsx           # Post detail page
│   ├── about.tsx          # About page
│   └── category/          # Category pages
│       ├── index.tsx      # Category list
│       └── [cid].tsx      # Category detail
├── components/            # React components
│   ├── layout/            # Layout, Header
│   ├── side-profile.tsx   # Profile sidebar
│   ├── scroll-spy.tsx     # Table of Contents (TOC)
│   └── utterances.tsx     # GitHub comments
├── lib/                   # Data logic (JavaScript)
│   ├── posts.js           # Post parsing
│   ├── category.js        # Category data
│   └── blog.js            # Profile data
├── util/                  # Utilities
│   └── class-name.ts      # classNames helper
├── _posts/                # Blog content (Markdown)
│   ├── {category}/        # Category folders
│   │   ├── _info.md       # Category metadata
│   │   └── *.md           # Post files
│   └── _temp/             # Temp storage (excluded from build)
├── _blog/                 # Site-wide content
│   ├── profile.md         # Author profile
│   └── about.md           # About page content
└── public/                # Static files
```

## Content Structure

### Post Format (`_posts/{category}/{slug}.md`)

```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
category: "Category Name"
tags: "tag1, tag2, tag3"
thumbnail: "https://image-url"
description: "SEO description"
searchKeywords: "search keywords"
---

Markdown content...
```

### Category Info (`_posts/{category}/_info.md`)

```yaml
---
name: "Category Name"
thumbnail: "https://image-url"
description: "Category description"
---
```

### Profile (`_blog/profile.md`)

```yaml
---
name: "Name"
description: "Bio"
email: "email@example.com"
github: "github-username"
image: "https://profile-image-url"
---
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `react-markdown` | Markdown rendering |
| `react-syntax-highlighter` | Code block highlighting |
| `gray-matter` | Frontmatter parsing |
| `github-markdown-css` | GitHub-style markdown CSS |
| `utterances` | GitHub-based comments |
| `next-sitemap` | Sitemap generation |
| `react-icons` | Icon library |

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Base path (`/TIL`), image domains, webpack config |
| `tailwind.config.js` | Custom breakpoints (sm: 300-1000px) |
| `tsconfig.json` | Strict mode TypeScript |
| `.eslintrc.json` | next/core-web-vitals preset |
| `next-sitemap.config.js` | Sitemap generation config |

## Important Notes

1. **basePath**: Production uses `/TIL` prefix
2. **Image Loader**: Uses Akamai loader for GitHub Pages compatibility
3. **Dark Mode**: System preference detection + Tailwind `dark:` classes
4. **Comments**: Utterances connected to GitHub Discussions
