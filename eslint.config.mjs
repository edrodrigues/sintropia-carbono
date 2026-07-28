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
      "@typescript-eslint/no-explicit-any": "off",
      "indent": ["warn", 2, { "SwitchCase": 1, "ignoredNodes": ["ConditionalExpression"] }],
      "no-mixed-spaces-and-tabs": "error",
    },
  },
];

export default eslintConfig;
