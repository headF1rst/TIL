# Architecture Overview

## Static Site Generation (SSG)

This blog uses Next.js Static Site Generation. All pages are pre-rendered at build time.

```
Build Process:
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│  _posts/    │───>│  lib/posts   │───>│  pages/*.tsx  │
│  Markdown   │    │  (parsing)   │    │  (rendering)  │
└─────────────┘    └──────────────┘    └───────────────┘
                                              │
                                              v
                                       ┌───────────────┐
                                       │    out/       │
                                       │  (static)     │
                                       └───────────────┘
```

## Data Flow

### Content Pipeline

```
1. Markdown Files (_posts/{category}/{slug}.md)
       │
       v
2. gray-matter (frontmatter extraction)
       │
       v
3. lib/posts.js (data aggregation & sorting)
       │
       v
4. getStaticProps (page-level data fetching)
       │
       v
5. React Components (rendering)
```

### Post Data Structure

```typescript
// After parsing by lib/posts.js
{
  id: "post-slug",           // From filename
  title: "Post Title",       // From frontmatter
  date: "2024-01-01",        // From frontmatter
  category: "Spring",        // From frontmatter
  tags: "tag1, tag2",        // From frontmatter (comma-separated)
  thumbnail: "https://...",  // From frontmatter
  description: "...",        // From frontmatter (SEO)
  searchKeywords: "...",     // From frontmatter (SEO)
  preview: "First 140..."    // Generated (content slice)
}
```

## Page Routes

| Route | Page | Data Source |
|-------|------|-------------|
| `/` | `pages/index.tsx` | All posts + tags + profile |
| `/{id}` | `pages/[id].tsx` | Single post detail |
| `/about` | `pages/about.tsx` | `_blog/about.md` |
| `/category` | `pages/category/index.tsx` | All categories |
| `/category/{cid}` | `pages/category/[cid].tsx` | Category posts |

## Component Hierarchy

```
_app.tsx (global wrapper)
    │
    └── Layout
        ├── Header
        │   └── Navigation
        └── <Page>
            ├── index.tsx
            │   ├── Tag filters
            │   ├── Post list
            │   └── SideProfile
            │
            └── [id].tsx
                ├── ScrollSpy (TOC)
                ├── Post content (ReactMarkdown)
                └── Utterances (comments)
```

## Key Files

### lib/posts.js

Core data layer for post management:

```javascript
// Main functions
getSortedPostsData()    // Returns all posts, sorted by date desc
getPostDataById(id)     // Returns single post metadata
getPostDetailById(id)   // Returns post content (markdown)
getAllTags()            // Returns tag counts for filtering
```

### lib/category.js

Category management:

```javascript
getCategoriesData()     // Returns all categories with metadata
getCategoryPosts(id)    // Returns posts for a specific category
```

### lib/blog.js

Profile and site-wide content:

```javascript
getProfileData()        // Returns author profile from _blog/profile.md
getAboutData()          // Returns about page content
```

## Styling Architecture

### Tailwind Configuration

Custom breakpoints for two-tier responsive design:

```javascript
// tailwind.config.js
screens: {
  sm: { min: "300px", max: "1000px" },  // Mobile
  lg: { min: "1000px" },                 // Desktop
}
```

### Dark Mode Strategy

1. System preference detection via `window.matchMedia`
2. Tailwind `dark:` variants for styling
3. No manual toggle (follows system)

```tsx
// Detection in component
useEffect(() => {
  const dark = window.matchMedia("(prefers-color-scheme: Dark)").matches;
  setIsDark(dark);
}, []);
```

## Third-Party Integrations

### Utterances (Comments)

GitHub-based comment system using GitHub Discussions:

```tsx
// components/utterances.tsx
<script
  src="https://utteranc.es/client.js"
  repo="headF1rst/TIL"
  issue-term="pathname"
  theme="github-light"
/>
```

### Sitemap Generation

Automated via `next-sitemap` post-build:

```javascript
// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://headf1rst.github.io/TIL',
  generateRobotsTxt: true,
}
```

## Deployment

### GitHub Pages Workflow

```bash
npm run deploy
```

1. Clean cache: `rm -rf node_modules/.cache`
2. Build: `next build`
3. Export: `next export` → `out/`
4. Create `.nojekyll` (bypass Jekyll processing)
5. Push to `gh-pages` branch

### basePath Handling

Production uses `/TIL` prefix:

```javascript
// next.config.js
basePath: isProd ? "/TIL" : ""
```

All internal links and assets automatically use this prefix in production.

## Performance Considerations

1. **Static Generation**: All pages pre-rendered
2. **Code Splitting**: Automatic per-page bundles
3. **Image Optimization**: External images via Akamai loader
4. **Minimal JavaScript**: React hydration only where needed
