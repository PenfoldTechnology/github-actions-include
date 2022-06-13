#!/usr/bin/env node
const stagedGitFiles = require("staged-git-files");
const yargs = require("yargs/yargs");
const githubActionsInclude = require(".");

const flags = yargs(process.argv).options({
  partialsDir: {
    description: "Path to partials",
    type: "string",
    default: "github/partials",
  },
  workflowsDir: {
    description: "Path to workflows (must not be .github/workflows)",
    type: "string",
    default: "github/workflows",
  },
  includeWarningReadme: {
    description: "Include warning README.md in .github/workflows",
    type: "boolean",
    default: true,
  },
}).argv;

// Check if any files under workflowsDir have changed
// If yes, run the processing script
// If no, skip the processing script and exit immediately
void stagedGitFiles(function (err, results) {
  const shouldRun = results.some(({ filename }) =>
    // If any github files have changed
    filename.startsWith(flags.workflowsDir)
  );

  if (process.env.DEBUG || shouldRun) {
    githubActionsInclude(flags);
  } else {
    console.log("Skipping github-actions-include");
    process.exit(0);
  }
});
