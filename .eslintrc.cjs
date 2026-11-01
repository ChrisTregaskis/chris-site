module.exports = {
  extends: "kentcdodds",
  parserOptions: {
    project: "./tsconfig.json",
  },
  ignorePatterns: [
    "sst.config.ts",
    "vite.config.ts",
    "tailwind.config.ts",
    "sst-env.d.ts",
    "src/sst-env.d.ts",
    "dist/",
    "coverage/",
    ".sst/",
  ],
  plugins: ["react-hooks"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
  },
};
