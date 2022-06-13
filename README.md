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


## Requirements

- Husky: https://github.com/typicode/husky

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

## License

Create by [Penfold](https://getpenfold.com) and released under the MIT license.
