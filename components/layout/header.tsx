import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { classNames } from "../../util/class-name";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdClose } from "react-icons/md";
import { BiLinkExternal } from "react-icons/bi";
const headerData = {
  icon: "https://i.imgur.com/2nHGFTv.png",
  blog_name: "산하개발실록",
};

function Header() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const onMenuClick = (menu: string) => {
    setShowMenu(false);
    router.push(menu);
  };
  return (
    <nav className="flex bg-white sticky top-0 left-0 z-50 justify-between items-center border-b-2 border-gray-100 py-3 md:justify-start md:space-x-10 px-10 sm:px-5 dark:bg-[#0d1117] dark:text-[#c9d1d9] dark:border-gray-600">
      <div className="flex justify-start">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src={headerData.icon}
              width={40}
              height={40}
              alt="블로그 아이콘"
            />
            <h1 className="text-lg ">{headerData.blog_name}</h1>
          </div>
        </Link>
      </div>
      <div className="flex justify-between gap-10 sm:hidden">
        <Link href="/">
          <button
            className={classNames(
              router.pathname === "/" ? "font-bold " : "font-light",
              "hover:text-indigo-300 text-base"
            )}
          >
            Home
          </button>
        </Link>
        <Link href="/category">
          <button
            className={classNames(
              router.pathname === "/category" ||
                router.pathname === "/category/[cid]"
                ? "font-bold "
                : "font-light",
              "hover:text-indigo-300 text-base"
            )}
          >
            Category
          </button>
        </Link>
        <a
          href={
            "https://plain-composer-c65.notion.site/29c7640fdf054059b6ea28ed61189bfb"
          }
          target={"_blank"}
          rel="noreferrer"
          className={"hover:text-indigo-300 text-base font-light flex gap-1"}
        >
          About
          <span
            className={"flex justify-center"}
            style={{ alignItems: "center" }}
          >
            <BiLinkExternal />
          </span>
        </a>
      </div>
      {showMenu ? (
        <div className="flex flex-col fixed left-0 top-0 bg-white w-full h-screen dark:bg-[#0d1117] dark:bg-opacity-90 p-4 gap-5">
          <MdClose
            onClick={() => setShowMenu(false)}
            className="lg:hidden"
            size={25}
          />

          <button
            onClick={() => onMenuClick("/")}
            className={classNames(
              router.pathname === "/" ? "font-bold " : "font-light",
              "hover:text-indigo-300 text-base"
            )}
          >
            Home
          </button>
          <button
            onClick={() => onMenuClick("/category")}
            className={classNames(
              router.pathname === "/category" ||
                router.pathname === "/category/[cid]"
                ? "font-bold "
                : "font-light",
              "hover:text-indigo-300 text-base"
            )}
          >
            Category
          </button>
          <a
            href={
              "https://plain-composer-c65.notion.site/29c7640fdf054059b6ea28ed61189bfb"
            }
            target={"_blank"}
            rel="noreferrer"
            className={
              "hover:text-indigo-300 text-base font-light flex gap-1 align-center justify-center"
            }
          >
            About
            <span
              className={"flex justify-center"}
              style={{ alignItems: "center" }}
            >
              <BiLinkExternal />
            </span>
          </a>
        </div>
      ) : (
        <GiHamburgerMenu
          onClick={() => setShowMenu((prev) => !prev)}
          className="lg:hidden"
          size={25}
        />
      )}
    </nav>
  );
}

export default Header;
