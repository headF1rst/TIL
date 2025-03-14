import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "_posts");
const categoryNames = fs.readdirSync(postsDirectory).filter(item => !item.startsWith('.'));

// 제외할 파일 목록
const excludeFiles = ['_info.md'];

export function getSortedPostsData() {
  let allPostData = [];
  categoryNames.map((categoryName) => {
    const fileNames = fs.readdirSync(path.join(postsDirectory, categoryName))
      .filter(fileName => fileName.endsWith('.md') && !excludeFiles.includes(fileName));
    const postData = fileNames.map((fileName) => {
      const id = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, categoryName, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const matterResult = matter(fileContents);

      return {
        id,
        ...matterResult.data,
        preview: matterResult.content.slice(0, 140),
      };
    });
    allPostData = allPostData.concat(postData);
  });
  return allPostData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getPostDataById(id) {
  const allPostData = getSortedPostsData();
  const postData = allPostData.find((data) => data.id === id);
  return postData;
}

export function getPostDetailById(id) {
  let allPostsData = [];
  categoryNames.map((categoryName) => {
    const fileNames = fs.readdirSync(path.join(postsDirectory, categoryName))
      .filter(fileName => fileName.endsWith('.md') && !excludeFiles.includes(fileName));
    const postData = fileNames.map((fileName) => {
      const id = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, categoryName, fileName);

      return {
        id,
        fullPath,
      };
    });
    allPostsData = allPostsData.concat(postData);
  });
  const postDataWithPath = allPostsData.find(
    (postData) => postData.id === id
  );
  
  if (!postDataWithPath) {
    return '';
  }
  
  const fileContents = fs.readFileSync(postDataWithPath.fullPath, "utf8");
  const matterResult = matter(fileContents);
  return matterResult.content;
}

export function getAllTags() {
  const allPostData = getSortedPostsData();
  let allTag = [];
  allPostData.map((postData) => {
    const tagArr = postData.tags && postData.tags.split(", ");
    allTag = allTag.concat(tagArr);
  });
  allTag = allTag.reduce((prev, cur) => {
    prev[cur] = ++prev[cur] || 1;
    return prev;
  }, {});
  let result = [{ name: "전체", count: allPostData.length }];
  for (const [key, value] of Object.entries(allTag)) {
    result.push({ name: key, count: value });
  }

  return result.sort(({ count: a }, { count: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
}
