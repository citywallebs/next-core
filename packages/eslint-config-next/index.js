module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  env: {
    es6: true,
    browser: true,
    node: false,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/no-use-before-define": [
      "error",
      { functions: false, classes: false },
    ],
    "@typescript-eslint/no-parameter-properties": [
      "error",
      { allows: ["private"] },
    ],
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      { allowExpressions: true },
    ],
    "@typescript-eslint/no-empty-interface": [
      "error",
      {
        allowSingleExtends: true,
      },
    ],
    "prefer-const": ["error", { destructuring: "all" }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": "error",
  },
  overrides: [
    {
      files: [
        "**/__jest__/**/*.{js,ts,jsx,tsx}",
        "**/__mocks__/**/*.{js,ts,jsx,tsx}",
        "*.spec.{js,ts,jsx,tsx}",
      ],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/ban-ts-comment": [
          "warn",
          {
            "ts-ignore": "allow-with-description",
          },
        ],
      },
    },
    {
      files: [
        "webpack.*.js",
        "*.config.{ts,js}",
        "**/scripts/**/*.{ts,js}",
        "**/bin/*.js",
      ],
      extends: "@next-core/eslint-config-next/node",
    },
    {
      files: ["**/*.tsx"],
      rules: {
        "react/prop-types": "off",
      },
    },
  ],
};
