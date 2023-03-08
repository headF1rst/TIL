import { getAllTags, getSortedPostsData } from "../lib/posts";
import { getProfileData } from "../lib/blog";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import SideProfile from "../components/side-profile";
import { classNames } from "../util/class-name";
import markdownToTxt from "markdown-to-txt";
import { useRouter } from "next/router";
import Head from "next/head";
export interface IPostData {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  tags: string;
  date: string;
  preview: string;
  description: string;
  searchKeywords: string;
}

interface ITag {
  name: string;
  count: number;
}
export interface IProfile {
  name: string;
  description: string;
  email: string;
  instagram: string;
  image: string;
  github: string;
}
interface IProps {
  allPostsData: IPostData[];
  allTags: ITag[];
  profileData: IProfile;
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const allTags = getAllTags();
  const profileData = getProfileData();
  return {
    props: {
      allPostsData,
      allTags,
      profileData,
    },
  };
}
const Home = ({ allPostsData, allTags, profileData }: IProps) => {
  const router = useRouter();
  const {
    query: { tag },
  } = router;
  const tagName = !tag ? "전체" : tag;
  const getFilteredPosts = (allPostsData: IPostData[]) => {
    const tagSelect = tag && typeof tag === "string" ? tag : "전체";
    if (tagSelect === "전체") {
      return allPostsData;
    } else {
      return allPostsData.filter(
        (postData) => postData.tags.split(", ").indexOf(tagSelect) > -1
      );
    }
  };
  const onTagClick = (tagName: string) => {
    router.push(`/?tag=${tagName}`);
  };
  return (
    <>
      <Head>
        <title>산하개발실록</title>
        <meta name="title" content="산하개발실록" />
        <meta
          name="description"
          content="경험 공유를 통해 함께 성장하는 선순환 가치를 만들고자 블로그를 운영하고 있습니다."
        />
        <meta
          name="keywords"
          content="고산하, 개발, Spring, Spring Boot, 스프링, 스프링부트, 백엔드"
        />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="Korean" />
        <meta name="author" content="Sanha Ko" />

        <meta property="og:title" content="산하개발실록" />
        <meta property="og:url" content="https://headf1rst.github.io/TIL" />
        <meta property="og:type" content="blog" />
        <meta property="og:image" content="https://i.imgur.com/2nHGFTv.png" />
        <meta
          property="og:description"
          content="경험 공유를 통해 함께 성장하는 선순환 가치를 만들고자 블로그를 운영하고 있습니다."
        />
      </Head>
      <div className="flex justify-around gap-10 sm:gap-0 sm:flex-col-reverse dark:bg-[#0d1117] dark:text-[#c9d1d9] lg:h-full">
        <>
          <div className="flex flex-col w-2/3 gap-10 px-5 pt-10 sm:w-full">
            <div className="flex flex-wrap gap-2 mr-20 sm:m-0">
              {allTags.map((tag: ITag) => (
                <span
                  className={classNames(
                    tagName === tag.name
                      ? "bg-indigo-200 font-medium"
                      : "bg-indigo-50 font-light",
                    "p-1 pl-3 pr-3 rounded-md hover:bg-indigo-200 cursor-pointer transition ease-in-out duration-200 dark:text-black text-sm"
                  )}
                  key={tag.name}
                  onClick={() => onTagClick(tag.name)}
                >
                  {tag.name}({tag.count})
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-10 pb-20">
              {getFilteredPosts(allPostsData).map((postData: IPostData) => (
                <div key={postData.id}>
                  <div className="flex gap-5 sm:flex-col-reverse">
                    <div className="flex flex-col justify-between w-3/5 sm:w-full">
                      <div className="flex flex-col gap-2">
                        <Link href={`/${postData.id}`}>
                          <h1 className="text-2xl cursor-pointer hover:underline">
                            {postData.title}
                          </h1>
                        </Link>
                        <div className="text-base text-gray-500">
                          {markdownToTxt(postData.preview)}⋯
                        </div>
                      </div>
                      <div className="text-gray-500">{postData.date}</div>
                    </div>
                    <Link href={`/${postData.id}`}>
                      <Image
                        src={postData.thumbnail}
                        alt="포스트 썸네일"
                        width={250}
                        height={180}
                        className="object-cover cursor-pointer"
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>

        <SideProfile {...profileData} />
      </div>
    </>
  );
};

export default Home;
