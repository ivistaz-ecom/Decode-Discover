import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "..");

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "scripts"]);

const DELETE_PATHS = ["types", "next-env.d.ts", "tsconfig.json", "next.config.ts"];

const compilerOptions = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2020,
  jsx: ts.JsxEmit.Preserve,
  removeComments: false,
  esModuleInterop: true,
};

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const isTsx = filePath.endsWith(".tsx");

  const output = ts.transpileModule(code, {
    compilerOptions,
    fileName: filePath,
  }).outputText;

  const outPath = filePath.replace(/\.tsx?$/, isTsx ? ".jsx" : ".js");
  fs.writeFileSync(outPath, output, "utf8");
  fs.unlinkSync(filePath);
  return outPath;
}

function deletePath(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return;
  fs.rmSync(fullPath, { recursive: true, force: true });
}

const files = walk(ROOT);
for (const file of files) {
  stripFile(file);
}

for (const relativePath of DELETE_PATHS) {
  deletePath(relativePath);
}

console.log(`Converted ${files.length} files to JavaScript.`);
