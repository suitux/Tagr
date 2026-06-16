import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Enforce the repository boundary: only the repository layer (and the prisma
  // infrastructure itself) may import the Prisma client directly. Everything else
  // must go through a feature repository.
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/infrastructure/prisma/dbClient",
              importNames: ["prisma"],
              message:
                "Import a feature repository (src/features/**/*.repository.ts) instead of using prisma directly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.repository.ts", "src/infrastructure/prisma/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
