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
    // Turning this on means behaviour-affecting dependency-array fixes; deferred to 3b.
    "react-hooks/exhaustive-deps": "off",
  },
};
