export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: {
        proseWrap: "always",
        printWidth: 80,
      },
    },
  ],
};
