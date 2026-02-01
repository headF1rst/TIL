# Code Style Guide

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `side-profile.tsx`, `scroll-spy.tsx` |
| Pages | kebab-case or [param] | `about.tsx`, `[id].tsx` |
| Lib files | kebab-case | `posts.js`, `category.js` |
| Utilities | kebab-case | `class-name.ts` |

## Language Usage

| Directory | Language | Reason |
|-----------|----------|--------|
| `pages/` | TypeScript (.tsx) | Type safety for props |
| `components/` | TypeScript (.tsx) | Type safety for props |
| `lib/` | JavaScript (.js) | Node.js file system operations |
| `util/` | TypeScript (.ts) | Utility functions |

## TypeScript Conventions

### Interface Naming

Use `I` prefix for interfaces:

```typescript
interface IPostData {
  id: string;
  title: string;
  // ...
}

interface IProfile {
  name: string;
  description: string;
  // ...
}

interface IProps {
  allPostsData: IPostData[];
  profileData: IProfile;
}
```

### Interface Location

Define interfaces in the page file where they're primarily used:

```typescript
// pages/index.tsx
export interface IPostData { ... }
export interface IProfile { ... }
interface IProps { ... }  // Not exported if page-specific
```

Import from other files when needed:

```typescript
// components/side-profile.tsx
import { IProfile } from "../pages";
```

## Component Patterns

### Function Declaration (Preferred)

```typescript
function SideProfile(props: IProfile) {
  const { name, description } = props;
  return (
    <div>...</div>
  );
}

export default SideProfile;
```

### Arrow Function (For page components)

```typescript
const Home = ({ allPostsData, profileData }: IProps) => {
  return (
    <>...</>
  );
};

export default Home;
```

## Styling with Tailwind

### Responsive Design

Custom breakpoints defined in `tailwind.config.js`:

| Breakpoint | Range | Usage |
|------------|-------|-------|
| `sm:` | 300px - 1000px | Mobile styles |
| `lg:` | 1000px+ | Desktop styles |
| (default) | All sizes | Base styles |

```tsx
// Mobile-first with desktop override
<div className="w-full sm:w-2/3 lg:w-1/2">

// Common pattern: reverse column on mobile
<div className="flex gap-10 sm:flex-col-reverse">
```

### Dark Mode

Use Tailwind's `dark:` prefix with system preference detection:

```tsx
// Common dark mode pattern
<div className="bg-white dark:bg-[#0d1117] text-black dark:text-[#c9d1d9]">
```

Dark mode colors used:
- Background: `#0d1117` (GitHub dark)
- Text: `#c9d1d9` (GitHub dark text)

### Dynamic Classes

Use `classNames` utility for conditional classes:

```typescript
import { classNames } from "../util/class-name";

<span className={classNames(
  isActive ? "bg-indigo-200 font-medium" : "bg-indigo-50 font-light",
  "p-1 rounded-md cursor-pointer"
)}>
```

## Data Fetching (SSG)

### getStaticProps

```typescript
export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const profileData = getProfileData();
  return {
    props: {
      allPostsData,
      profileData,
    },
  };
}
```

### getStaticPaths (Dynamic Routes)

```typescript
export async function getStaticPaths() {
  const allPostData = getSortedPostsData();
  const paths = allPostData.map((postData) => ({
    params: { id: postData.id }
  }));
  return {
    paths,
    fallback: true,  // Enable fallback for new pages
  };
}
```

## Import Order

1. React/Next.js imports
2. Third-party libraries
3. Local components
4. Local utilities/lib
5. Styles (CSS imports)

```typescript
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";

import SideProfile from "../components/side-profile";
import ScrollSpy from "../components/scroll-spy";

import { getSortedPostsData } from "../lib/posts";
import { classNames } from "../util/class-name";

import "github-markdown-css";
```

## SEO Pattern

Each page should include proper meta tags:

```tsx
<Head>
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content={title} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content="blog" />
  <meta property="og:image" content={thumbnail} />
  <meta property="og:description" content={description} />
</Head>
```

## Code Highlighting

Use `react-syntax-highlighter` with theme switching:

```tsx
import { atomOneLight, atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

<SyntaxHighlighter
  language={match[1]}
  PreTag="div"
  style={isDark ? atomOneDark : atomOneLight}
>
  {code}
</SyntaxHighlighter>
```
