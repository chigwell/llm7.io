// Compile production imports into temporary CommonJS using the installed compiler.
// Type safety is checked separately by tsc; tests execute the actual production code.
import ts from "typescript";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const output = mkdtempSync(join(tmpdir(), "llm7-test-modules-"));
const require = createRequire(import.meta.url);
const compiled = new Map();
process.once("exit", () => rmSync(output, { recursive: true, force: true }));

function compile(path) {
  if (compiled.has(path)) return compiled.get(path);
  const destination = join(output, `${compiled.size}.cjs`);
  compiled.set(path, destination);
  function resolveImport(specifier) {
    if (!specifier.startsWith(".") && !specifier.startsWith("@/"))
      return createRequire(path).resolve(specifier);
    const base = specifier.startsWith("@/")
      ? resolve(root, specifier.slice(2))
      : resolve(dirname(path), specifier);
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`]) {
      if (!existsSync(candidate)) continue;
      return /\.(?:ts|tsx|js|jsx)$/.test(candidate)
        ? compile(candidate)
        : candidate;
    }
    throw new Error(`Cannot resolve ${specifier} from ${path}`);
  }
  const rewriteImports = (context) => (source) =>
    ts.visitNode(source, function visit(node) {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        // Type-only imports do not need runtime modules.
        if (node.importClause?.isTypeOnly) return node;
        return context.factory.updateImportDeclaration(
          node,
          node.modifiers,
          node.importClause,
          context.factory.createStringLiteral(
            resolveImport(node.moduleSpecifier.text),
          ),
          node.attributes,
        );
      }
      if (
        ts.isExportDeclaration(node) &&
        !node.isTypeOnly &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        return context.factory.updateExportDeclaration(
          node,
          node.modifiers,
          node.isTypeOnly,
          node.exportClause,
          context.factory.createStringLiteral(
            resolveImport(node.moduleSpecifier.text),
          ),
          node.attributes,
        );
      }
      return ts.visitEachChild(node, visit, context);
    });
  const result = ts.transpileModule(readFileSync(path, "utf8"), {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    transformers: { before: [rewriteImports] },
  });
  writeFileSync(destination, result.outputText.replaceAll(
    'require("react/jsx-runtime")',
    `require(${JSON.stringify(require.resolve("react/jsx-runtime"))})`,
  ));
  return destination;
}
export function loadTypeScript(filename) {
  return require(compile(resolve(root, filename)));
}
