import { readFile, readdir, access } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { JSDOM } from "jsdom";
import { createHash } from "node:crypto";
const traverse = traverseModule.default || traverseModule;

/** Recursively list source files beneath a project directory.
 * @param {string} directory Directory to inspect.
 * @returns {Promise<string[]>} File paths. */
async function list(directory) {
  const result = [];
  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    const path = directory + "/" + entry.name;
    if (entry.isDirectory()) {
      result.push(...(await list(path)));
    } else {
      result.push(path);
    }
  }
  return result;
}
const failures = [];
const graph = new Map();
const sources = (await list("src")).filter(
  /** Keep JavaScript files for the syntax and contract checks.
   * @param {*} file Input supplied by the enclosing API.
   * @returns {*} Operation result or undefined for a side effect. */
  (file) => file.endsWith(".js"),
);
for (const file of [
  ...sources,
  ...(await list("scripts")).filter(
    /** Keep JavaScript files for the syntax and contract checks.
     * @param {*} file Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    (file) => file.endsWith(".js"),
  ),
  "playwright.config.js",
]) {
  const source = await readFile(file, "utf8");
  const ast = parse(source, {
    sourceType: "module",
  });
  const dependencies = [];
  const imports = [];
  traverse(ast, {
    /** Visit the ConditionalExpression syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    ConditionalExpression() {
      failures.push(file + ": ternary expression");
    },
    /** Visit the MemberExpression syntax node during source validation.
     * @param {*} path Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    MemberExpression(path) {
      if (
        file.startsWith("src/") &&
        ["innerHTML", "outerHTML"].includes(path.node.property.name)
      ) {
        failures.push(file + ": HTML string rendering");
      }
    },
    /** Visit the Function syntax node during source validation.
     * @param {*} path Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    Function(path) {
      const comments = [
        ...(path.node.leadingComments || []),
        ...(path.parentPath.node.leadingComments || []),
      ]
        .map(
          /** Extract the calculated value used by the enclosing collection.
           * @param {*} comment Input supplied by the enclosing API.
           * @returns {*} Operation result or undefined for a side effect. */
          (comment) => comment.value,
        )
        .join("\n");
      if (
        !comments.includes("@returns") ||
        (path.node.params.length > 0 && !comments.includes("@param"))
      ) {
        failures.push(
          file + ": undocumented function at line " + path.node.loc.start.line,
        );
      }
    },
    /** Visit the ImportDeclaration syntax node during source validation.
     * @param {*} path Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    ImportDeclaration(path) {
      imports.push(path.node.source.value);
    },
    /** Visit the ImportExpression syntax node during source validation.
     * @param {*} path Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    ImportExpression(path) {
      if (path.node.source.type === "StringLiteral") {
        imports.push(path.node.source.value);
      }
    },
  });
  if (file.startsWith("src/")) {
    for (const specifier of imports) {
      if (!specifier.startsWith(".")) {
        failures.push(file + ": nonlocal dependency " + specifier);
        continue;
      }
      const target = resolve(dirname(file), specifier);
      try {
        await access(target);
      } catch {
        failures.push(file + ": missing module " + specifier);
      }
      if (relative(resolve("src"), target).startsWith("..")) {
        continue;
      }
      dependencies.push(target);
    }
    graph.set(resolve(file), dependencies);
  }
  if (source.includes("\uFFFD")) {
    failures.push(file + ": replacement character in UTF-8 source");
  }
}
/** Detect cycles in the static source dependency graph.
 * @param {string} file Source module path.
 * @param {string[]} stack Active dependency chain.
 * @param {Set<string>} visited Completed modules.
 * @returns {void} Appends cycle diagnostics when needed. */
function visit(file, stack, visited) {
  if (stack.includes(file)) {
    failures.push(
      "Circular dependency: " +
        [...stack, file]
          .map(
            /** Extract the calculated value used by the enclosing collection.
             * @param {*} path Input supplied by the enclosing API.
             * @returns {*} Operation result or undefined for a side effect. */
            (path) => relative(".", path),
          )
          .join(" -> "),
    );
    return;
  }
  if (visited.has(file)) {
    return;
  }
  for (const dependency of graph.get(file) || []) {
    visit(dependency, [...stack, file], visited);
  }
  visited.add(file);
}
const visited = new Set();
for (const file of graph.keys()) {
  visit(file, [], visited);
}
const html = await readFile("index.html", "utf8");
const document = new JSDOM(html).window.document;
if (document.querySelector("style,[style],script:not([src])")) {
  failures.push("index.html: inline styles or scripts");
}
if (document.querySelectorAll("template").length !== 10) {
  failures.push("index.html: expected ten rendering templates");
}
const ids = new Set();
for (const element of document.querySelectorAll("[id]")) {
  if (ids.has(element.id)) {
    failures.push("Duplicate ID " + element.id);
  }
  ids.add(element.id);
}
for (const element of document.querySelectorAll("script[src],link[href]")) {
  let path = element.getAttribute("src") || element.getAttribute("href");
  if (path.startsWith("https://")) {
    continue;
  }
  try {
    await access(path);
  } catch {
    failures.push("Missing page resource " + path);
  }
}
const manifest = JSON.parse(
  await readFile("assets/tokenizers/manifest.json", "utf8"),
);
for (const [file, expected] of Object.entries(manifest.sha256)) {
  if (
    createHash("sha256")
      .update(await readFile(file))
      .digest("hex") !== expected
  ) {
    failures.push("Asset checksum mismatch " + file);
  }
}
const technical = await readFile("TECHNISCH.md", "utf8");
const readme = await readFile("README.md", "utf8");
if (!readme.includes("[Technische Dokumentation](TECHNISCH.md)")) {
  failures.push("README.md: missing technical documentation link");
}
for (const command of [
  "npm start",
  "npm test",
  "npm run check",
  "npm run test:browser",
  "npm run build",
]) {
  if (!technical.includes(command)) {
    failures.push("TECHNISCH.md: missing documented command " + command);
  }
}
if (failures.length) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exitCode = 1;
} else {
  console.log(
    "Syntax, function documentation, branching, local imports, module graph, templates, assets and documentation: OK (" +
      sources.length +
      " source modules).",
  );
}
