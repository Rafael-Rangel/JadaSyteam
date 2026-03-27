/**
 * JADA — Jest Config
 * Arquivo: jest.config.ts (raiz do projeto)
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",

  // Mapeamento de caminhos do TypeScript
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Padrões de teste
  testMatch: [
    "<rootDir>/tests/business/**/*.test.ts",
    "<rootDir>/tests/security/**/*.test.ts",
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/integration/**/*.test.ts",
  ],

  // Cobertura
  collectCoverageFrom: [
    "app/api/**/*.ts",
    "lib/**/*.ts",
    "!lib/prisma.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],

  // Metas de cobertura — ajuste conforme maturidade do projeto
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },

  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",

  // Setup global (mocks de Prisma, env vars)
  setupFilesAfterFramework: ["<rootDir>/tests/setup.ts"],
};

export default createJestConfig(config);
