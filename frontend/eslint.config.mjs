import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "docs/**",
  ]),
  ...nextVitals,
  ...nextTs,
  // UI layer only: block domain BookingStatus/PaymentStatus so UI uses dashboardConstants
  {
    files: [
      "src/app/**/*.ts",
      "src/app/**/*.tsx",
      "src/components/**/*.ts",
      "src/components/**/*.tsx",
      "src/interfaces/**/*.ts",
      "src/interfaces/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/core/domain/booking"],
              importNames: ["BookingStatus", "PaymentStatus"],
              message:
                "Use BOOKING_STATUS / PAYMENT_STATUS from @/utils/dashboardConstants in UI files.",
            },
          ],
        },
      ],
    },
  },
  // Architectural boundaries: keep marketing and dashboard isolated.
  {
    files: ["src/marketing/**/*.ts", "src/marketing/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/dashboard/**", "@/components/dashboard/**"],
              message:
                "Marketing layer must not import dashboard modules. Use marketing-owned modules or neutral shared utilities.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/dashboard/**/*.ts", "src/app/dashboard/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/marketing/**"],
              message:
                "Dashboard layer must not import marketing modules. Share through neutral domain/shared layers when needed.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/(public)/**/*.ts", "src/app/(public)/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/dashboard/**", "@/components/dashboard/**"],
              message:
                "Public/marketing routes must not depend on dashboard modules.",
            },
          ],
        },
      ],
    },
  },
]);
