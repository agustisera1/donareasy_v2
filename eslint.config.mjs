import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  // components/ui/** es shadcn vendorizado: no lo sometemos a reglas más estrictas que su upstream.
  {
    files: ["components/ui/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // set-state-in-effect solo mira setters de useState: esto cubre el dispatch de useReducer.
  {
    files: ["components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}", "contexts/**/*.{ts,tsx}"],
    ignores: ["components/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name='useEffect'] > :function :matches(BlockStatement > ExpressionStatement, IfStatement > ExpressionStatement, IfStatement > BlockStatement > ExpressionStatement) > CallExpression[callee.name='dispatch']:not(:function :function :function CallExpression)",
          message:
            "dispatch síncrono en un Effect: derivá en el render o ajustá el estado durante el render (react.dev, 'You Might Not Need an Effect').",
        },
      ],
    },
  },
]);

export default eslintConfig;
