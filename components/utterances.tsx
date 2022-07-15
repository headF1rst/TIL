import React from "react";

const Utterances: React.FC = () => {
  return (
    <section
      ref={(elem) => {
        if (!elem) {
          return;
        }

        const scriptElem = document.createElement("script");
        scriptElem.src = "https://utteranc.es/client.js";
        scriptElem.async = true;
        scriptElem.setAttribute("repo", "chchaeun/blog");
        scriptElem.setAttribute("issue-term", "pathname");
        scriptElem.setAttribute("theme", "github-light");
        scriptElem.setAttribute("label", "blog-comment");
        scriptElem.crossOrigin = "anonymous";

        const prevScript = document.querySelector("section > script");
        if (!prevScript) {
          elem.appendChild(scriptElem);
        }
      }}
    />
  );
};

export default Utterances;
