# @penfold/github-actions-include

> Simple but effective partials system for GitHub Actions

Adds support for "partials" to GitHub Actions workflows. A partial can be a step, job, or any part
of a workflow's YAML configuration. Include partials using the `#!include(partial_name)` directive.

## Example

Workflow:

```yaml
# github/workflows/cleanup.yml
name: Cleanup
on: [push]
jobs:
  #!include(setup_environment)
```

Partial:

```yaml
# github/partials/setup_environment.yml
setup_env:
    name: Setup environment
    runs-on: ubuntu-latest
    steps: 
        # ...
```

Result:

```yaml
# .github/workflows/cleanup.yml
name: Cleanup
on: [push]
jobs:
  setup_env:
    name: Setup environment
    runs-on: ubuntu-latest
    steps: 
        # ...
```

## Install

NPM:

```
npm install --dev @penfold/github-actions-include
```

Yarn:

```
yarn add --dev @penfold/github-actions-include
```

## CLI Usage

```
$ github-actions-include --help
Options:
  --help                  Show help                                    [boolean]
  --version               Show version number                          [boolean]
  --partialsDir           Path to partials                              [string]
  --workflowsDir          Path to workflows (must not be .github/workflows)
                                                             [string] [required]
  --includeWarningReadme  Include warning README.md in .github/workflows
                                                       [boolean] [default: true]
```

## API Usage

```
const githubActionsInclude = require("github-actions-include");

// Options object and all fields are optional
githubActionsInclude({
  workflowsDir: "github/workflows",
  partialsDir: "github/partials",
  includeWarningReadme: true,
});
```

## Usage with Husky

(Husky: https://github.com/typicode/husky)

Add an npm script to your project:

```
"gh:actions:prepare": "gh-actions-include"
```


Add a pre-commit hook to your project:

```
$ git add .husky/pre-commit
```

Then update the hook file:

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

yarn gh:actions:prepare    # <-- add this line for yarn
npm run gh:actions:prepare # <-- add this line for npm
```

That's it! When you commit, your GH Actions workflows will be compiled with
`github-actions-include`, when any workflow files in `workflowsDir` change.

## Options

### `workflowsDir`

Default: `github/workflows`

The folder in your project where you will write your GH Actions workflows.

Cannot be `.github/workflows`.

### `partialsDir`

Default: `github/partials`

The folder in your project where you will write your GH Actions partials.

### `includeWarningReadme`

Default: `true`

Whether to include a warning README in `.github/workflows` that tells developers not to make
changes in that folder, but in the folder specified by `workflowsDir`.

## Partials

A partial file consists of part of a GitHub Actions workflow configuration. It can be anything from a step, job, single
line, whatever you like. The library is only performing an interpolation of the contents of a partial file, it enforces
no rules on what a partial can contain.

Partial files should be named like this: `partial_name.yml`

To include a partial in your workflow, use the `#!include()` directive.

The include directive accepts one argument only, the name of a partial file. You can ommit the `.yml` file extension 
from the name.

The include directive is indent-sensitive, meaning the partial contents for an include will be placed at the same level 
of indentation as the include directive.

## License

Create by [Penfold](https://getpenfold.com) and released under the MIT license.
