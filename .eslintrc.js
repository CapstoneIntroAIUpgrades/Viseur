// @ts-check
/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { resolve } = require("path");

process.env.ESLINT_PATH_TSCONFIG = resolve("./tsconfig.eslint.json");

/** @type {import("eslint").Linter.Config} */
const baseEslintConfig = {
    extends: ["jacobfischer/node"],
    ignorePatterns: ["dist/*", "docs/*", "src/games/*"],
    rules: {
        "@typescript-eslint/restrict-template-expressions": [
            "error",
            {
                allowNumber: true,
                allowBoolean: true,
                allowNullish: true,
            },
        ],
    },
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
module.exports = baseEslintConfig;
