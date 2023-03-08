import { getServerSideSitemap, ISitemapField } from "next-sitemap";
import { getCategoryInfos } from "../lib/category";
import { getSortedPostsData } from "../lib/posts";

export const getServerSideProps = async (ctx: ISitemapField[]) => {
  const allPostsData = getSortedPostsData();
  const categoryInfos = getCategoryInfos();
  const lastmod = new Date().toISOString();

  const categoryFields = categoryInfos.map((category) => ({
    loc: `https://headf1rst.github.io/TIL/category/${category.id}`,
    changefreq: "daily",
    priority: "0.9",
    lastmod,
  }));

  const postFields = allPostsData.map((post) => ({
    loc: `https://headf1rst.github.io/TIL/${post.id}`,
    changefreq: "daily",
    priority: "1.0",
    lastmod,
  }));

  const fields = [...categoryFields, ...postFields];

  return getServerSideSitemap(ctx, fields);
};

export default function Site() {}
