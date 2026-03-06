import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";

const eslintConfig = [
  ...nextConfig,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
    },
  },
];

export default eslintConfig;
