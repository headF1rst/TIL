import markdownToTxt from "markdown-to-txt";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ICategoryInfo } from ".";
import { IPostData, IProfile } from "..";
import SideProfile from "../../components/side-profile";
import { getProfileData } from "../../lib/blog";
import {
  getCategoryInfoById,
  getCategoryInfos,
  getPostsByCategoryId,
} from "../../lib/category";

interface IParams {
  params: {
    cid: string;
  };
}
interface IProps {
  categoryInfo: ICategoryInfo;
  postDatas: IPostData[];
  profileData: IProfile;
}
export async function getStaticPaths() {
  const categoryInfos = getCategoryInfos();
  const paths = categoryInfos.map((categoryInfo: any) => {
    return { params: { cid: categoryInfo.id } };
  });
  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }: IParams) {
  const categoryInfo = getCategoryInfoById(params.cid);
  const postDatas = getPostsByCategoryId(params.cid);
  const profileData = getProfileData();
  if (!categoryInfo) {
    return { props: {} };
  }
  return { props: { categoryInfo, postDatas, profileData } };
}
function CategoryPosts({ categoryInfo, postDatas, profileData }: IProps) {
  return (
    <div className="m-auto flex flex-col gap-10 w-2/3 pt-10 dark:text-[#c9d1d9]">
      <div>카테고리</div>
      <div className="text-4xl font-bold">{categoryInfo?.name}</div>
      <div className="flex flex-col gap-10 pb-20">
        {postDatas?.map((postData: IPostData) => (
          <div key={postData.id}>
            <div className="flex gap-5">
              <div className="w-3/5 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <Link href={`/${postData.id}`}>
                    <h1 className="text-3xl hover:underline cursor-pointer">
                      {postData.title}
                    </h1>
                  </Link>
                  <div className="text-lg text-gray-500">
                    {markdownToTxt(postData.preview)}⋯
                  </div>
                </div>
                <div className="text-gray-500">{postData.date}</div>
              </div>
              <Image
                src={postData.thumbnail}
                alt="포스트 썸네일"
                width={250}
                height={180}
              />
            </div>
          </div>
        ))}
      </div>
      <SideProfile {...profileData} />
    </div>
  );
}

export default CategoryPosts;