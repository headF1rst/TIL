import React, { useEffect, useState } from "react";
import { IPostData } from ".";
import {
  getPostDataById,
  getPostDetailById,
  getSortedPostsData,
} from "../lib/posts";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  atomOneLight,
  atomOneDark,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { useRouter } from "next/router";
import "github-markdown-css";
import Utterances from "../components/utterances";
import ScrollSpy from "../components/scroll-spy";
import Head from "next/head";
import Image from "next/image";

interface IParams {
  params: {
    id: string;
  };
}
interface IProps {
  postData: IPostData;
  detail: string;
}
export async function getStaticPaths() {
  const allPostData = getSortedPostsData();
  const paths = allPostData.map((postData) => {
    return { params: { id: postData.id } };
  });
  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }: IParams) {
  const postData = getPostDataById(params.id);
  const detail = getPostDetailById(params.id);

  if (!postData) {
    return { notFound: true };
  }
  return { props: { postData, detail } };
}

function PostDetail({ postData, detail }: IProps) {
  const router = useRouter();

  const [isDark, setIsDark] = useState<boolean>();

  useEffect(() => {
    const dark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: Dark)").matches;
    setIsDark(dark);
  }, []);

  const onTagClick = (tag: string) => {
    router.push(`/?tag=${tag}`);
  };

  const ImageRenderer = ({ src, alt, ...props }: any) => {
    if (!src) return null;
    
    if (src.startsWith('http')) {
      return (
        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '450px', margin: '0 auto' }}>
          <Image 
            src={src} 
            alt={alt || "블로그 이미지"} 
            layout="responsive"
            width={700}
            height={400}
            objectFit="contain"
            {...props}
          />
        </div>
      );
    }
    
    return (
      <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '450px', margin: '0 auto' }}>
        <img 
          src={src} 
          alt={alt || "블로그 이미지"} 
          style={{ maxHeight: "450px", maxWidth: "100%" }}
          {...props}
        />
      </div>
    );
  };

  // 구조화된 데이터(JSON-LD) 생성
  const generateJsonLd = () => {
    if (!postData) return null;
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": postData.title,
      "datePublished": postData.date,
      "dateModified": postData.date,
      "author": {
        "@type": "Person",
        "name": "Sanha Ko"
      },
      "description": postData.description || "",
      "image": postData.thumbnail || "",
      "url": `https://headf1rst.github.io/TIL/${postData.id}`,
      "keywords": postData.tags ? postData.tags.split(", ").join(",") : "",
      "publisher": {
        "@type": "Organization",
        "name": "headF1rst",
        "logo": {
          "@type": "ImageObject",
          "url": "https://headf1rst.github.io/TIL/favicon.ico"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://headf1rst.github.io/TIL/${postData.id}`
      }
    };
    
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!postData) {
    return <div>존재하지 않는 게시글입니다.</div>;
  }

  const tags = postData.tags ? postData.tags.split(", ") : [];

  return (
    <>
      <Head>
        <title>{postData.title}</title>
        <meta name="title" content={postData.title} />
        <meta name="description" content={postData.description || ""} />
        <meta name="keywords" content={postData.searchKeywords || ""} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="Korean" />
        <meta name="author" content="Sanha Ko" />
        <meta property="og:title" content={postData.title} />
        <meta
          property="og:url"
          content={`https://headf1rst.github.io/TIL/${postData.id}`}
        />
        <meta property="og:type" content="blog" />
        <meta property="og:image" content={postData.thumbnail} />
        <meta property="og:description" content={postData.description} />
        {generateJsonLd()}
      </Head>
      <div className="flex flex-col w-3/5 sm:w-5/6 m-auto pt-20 pb-20 gap-10 dark:bg-[#0d1117] dark:text-[#c9d1d9]">
        <ScrollSpy />
        <div className="text-5xl font-bold">{postData.title}</div>
        <div className="flex flex-col gap-2">
          <div className="text-base text-gray-600 dark:text-gray-300">
            {postData.date}
          </div>
          <div className="flex flex-wrap gap-2 dark:text-black sm:m-0">
            {tags.map((tag: string) => (
              <span
                className={
                  "p-1 pl-3 pr-3 rounded-md bg-indigo-100 hover:bg-indigo-200 cursor-pointer transition ease-in-out duration-200 text-sm"
                }
                key={tag}
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="markdown-body" style={{ fontSize: "17px" }}>
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    PreTag="div"
                    {...props}
                    style={isDark ? atomOneDark : atomOneLight}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              img: ImageRenderer,
            }}
          >
            {detail}
          </ReactMarkdown>
        </div>
        <Utterances />
      </div>
    </>
  );
}

export default PostDetail;
