// eslint.config.js

import globals from "globals";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    // Ignorar la carpeta de distribución globalmente
    ignores: ["dist/"],
  },
  
  // ======================================================
  // REGLAS PARA EL FRONTEND (Carpeta 'src')
  // ======================================================
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser, // Define globales de navegador como 'window'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      sourceType: "module", // Usa la sintaxis 'import'
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
    },
  },

  // ======================================================
  // REGLAS PARA EL BACKEND (Carpeta 'functions')
  // ======================================================
  {
    files: ["functions/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // ¡CLAVE! Define globales de Node.js como 'require', 'exports', 'process'
      },
      sourceType: "commonjs", // Usa la sintaxis 'require'
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "quotes": ["error", "double"],
    },
  },
];