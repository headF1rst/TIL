module.exports = {
  siteUrl: "https://headf1rst.github.io/TIL/",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: ["/404"],
      },
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [`https://headf1rst.github.io/TIL/server-sitemap.xml`],
  },
};
