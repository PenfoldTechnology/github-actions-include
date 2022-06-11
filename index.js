const fs = require("fs");
const path = require("path");
const jsYaml = require("js-yaml");
const walk = require("klaw-sync");
const assert = require("assert");
const pkgDir = require("pkg-dir");

const PACKAGE_DIR = pkgDir.sync();

const DOT_GITHUB_DIR = path.resolve(PACKAGE_DIR, ".github");

const DOT_GITHUB_WORKFLOWS_DIR = path.resolve(DOT_GITHUB_DIR, "workflows");

const README_CONTENTS = (workflowsDir) => `\
DO NOT USE THIS DIRECTORY!!!
Add/edit workflows in the ${workflowsDir} folder instead.
They are copied over to here using a pre-commit hook.\n`;

// The include directive regex.
// Match example: "#!include(my_partial)"
// Group captures for above example:
// - leading_whitespace: "  "
// - partial_name: "my_partial"
const DIRECTIVE_RE =
  //                      capture whitespace at the beginning of the line
  //                      but ignore newlines and carriage returns
  //                      |
  //                      |
  //                      |-------\
  //                      v       v
  /^(?<leading_whitespace>[^\S\r\n]*)#!\s*include\((?<partial_name>[a-zA-Z0-9._-]+)\)/gm;

const DEFAULT_OPTIONS = {
  partialsDir: "github/partials",
  workflowsDir: "github/workflows",
  includeWarningReadme: true,
};

function debug(...args) {
  if (process.env.DEBUG) {
    console.log(...args);
  }
}

// Compress used loosely here. Sadly GH doesn't support highly compressed YAML
// so the best we can do is just remove all whitespace and comments from the output.
function compressYaml(yamlStr) {
  const yml = jsYaml.load(yamlStr);
  return jsYaml.dump(yml, {
    lineWidth: -1, // do not impose line width restriction
  });
}

function create(options) {
  const { partialsDir, workflowsDir, includeWarningReadme } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  assert(
    path.relative(PACKAGE_DIR, workflowsDir) !==
      path.relative(PACKAGE_DIR, ".github/workflows"),
    "workflowsDir must not be .github/workflows"
  );

  const interpolate = (contents) => {
    return contents.replace(DIRECTIVE_RE, (...args) => {
      const groups = args.pop();

      const partialName = groups.partial_name;

      debug("- including partial:", partialName);

      let partialPath = path.resolve(partialsDir, partialName);

      if (!/\.[a-z]$/i.test(partialPath)) {
        partialPath += ".yml";
      }

      if (!fs.existsSync(partialPath)) {
        throw new Error(`partial "${partialName}" does not exist`);
      }

      const partialContents = interpolate(
        fs.readFileSync(partialPath).toString()
      );

      return partialContents.replace(/^/gm, groups.leading_whitespace);
    });
  };

  console.group("Running github-actions-include...");

  fs.rmdirSync(DOT_GITHUB_WORKFLOWS_DIR, {
    recursive: true,
  });

  fs.mkdirSync(DOT_GITHUB_WORKFLOWS_DIR);

  if (includeWarningReadme) {
    // Reinstate the warning README.md under .github/workflows
    fs.writeFileSync(
      path.resolve(DOT_GITHUB_DIR, "workflows/README.md"),
      README_CONTENTS(workflowsDir)
    );
  }

  walk(workflowsDir, {
    nodir: true,
    traverseAll: true,
    filter: (item) => item.path.endsWith(".yml"),
  }).forEach(({ path: filepath }) => {
    let contents = fs.readFileSync(filepath).toString();

    console.group("Processing:", path.relative(workflowsDir, filepath));

    if (DIRECTIVE_RE.test(contents)) {
      contents = interpolate(contents);
    }

    fs.writeFileSync(
      path.resolve(DOT_GITHUB_WORKFLOWS_DIR, path.basename(filepath)),
      compressYaml(contents)
    );

    console.groupEnd();
  });

  console.log("Done");

  console.groupEnd();
}

module.exports = create;
