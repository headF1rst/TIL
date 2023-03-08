import React from "react";
import { getCategoryInfos } from "../../lib/category";
import Image from "next/image";
import { useRouter } from "next/router";
import { IProfile } from "..";
import { getProfileData } from "../../lib/blog";
import SideProfile from "../../components/side-profile";
import Head from "next/head";
export interface ICategoryInfo {
  id: string;
  name: string;
  thumbnail: string;
  numberOfPosts: number;
  description: string;
}
interface IProps {
  categoryInfos: ICategoryInfo[];
  profileData: IProfile;
}
export async function getStaticProps() {
  const categoryInfos = getCategoryInfos();
  const profileData = getProfileData();

  return { props: { categoryInfos, profileData } };
}

function Category({ categoryInfos, profileData }: IProps) {
  const router = useRouter();
  const onCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  return (
    <>
      <Head>
        <title>카테고리: 산하개발실록</title>
        <meta name="title" content="카테고리: 산하개발실록" />
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

        <meta property="og:title" content="카테고리: 산하개발실록" />
        <meta
          property="og:url"
          content="https://headf1rst.github.io/TIL/category"
        />
        <meta property="og:type" content="blog" />
        <meta property="og:image" content="https://i.imgur.com/2nHGFTv.png" />
        <meta
          property="og:description"
          content="경험 공유를 통해 함께 성장하는 선순환 가치를 만들고자 블로그를 운영하고 있습니다."
        />
      </Head>
      <div className="flex justify-around gap-10 dark:text-[#c9d1d9] sm:gap-0 sm:flex-col-reverse">
        <div className="flex flex-col w-1/2 gap-10 pt-10 pb-20 mr-20 sm:w-full sm:px-5">
          <h1 className="text-3xl font-bold">Category</h1>
          <div className="grid grid-cols-2 gap-8 sm:flex sm:flex-col">
            {categoryInfos.map((categoryInfo) => (
              <div
                className="flex flex-col gap-1 transition duration-150 cursor-pointer hover:-translate-y-1"
                key={categoryInfo.id}
                onClick={() => onCategoryClick(categoryInfo.id)}
              >
                <Image
                  src={categoryInfo.thumbnail}
                  width={250}
                  height={250}
                  alt="카테고리 썸네일"
                  className="object-cover"
                />
                <div className="pt-3 pl-2 text-lg font-semibold">
                  {categoryInfo.name}
                </div>
                <div className="pb-4 pl-2 text-base text-gray-600 dark:text-gray-400">
                  {categoryInfo.numberOfPosts}개의 포스트
                </div>
              </div>
            ))}
          </div>
        </div>
        <SideProfile {...profileData} />
      </div>
    </>
  );
}

export default Category;
