# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2022-05-16

- Created generalized functions to make error handling easier
- Moved `/lib/utils` to `/lib/tf-utils`
- Created new `/lib/utils/` for additional utilities
- Removed excess unit tests
- Changed CLI to be expandable
- Added CLI methods to dynamically generate a plan test in either js or yaml
- Added CLI method to convert yaml to js for testing
- Better string templating

## [0.5.0] - 2022-04-27

- Added `clone` method to `tfxjs`. This allows users to run tests against a copy of the template for silmultanious tests.
- Moved method docs from README.md to [./.docs/tfxjs.md](./.docs/tfxjs.md)
- Improved jsdocs
- Refactoring
- Rename builder from `check` to `address` for consistancy
- Rename `tfx.js` to `tfx-cli.js` for clarity

## [0.4.0] - 2022-04-22

- Bash commands are no longer run from a script and are now handled in [./lib/terraform-cli.js](./lib/terraform-cli.js).
    - This allows for more robust error handling; the complete output for terraform commands will now be shown as commands run before testing.
    - Bash script commands have been removed from [./lib](./lib)
- Additional terraform environment variables can be export from the `tfxjs` constructor.
    - Now excepts `tfvars` as an optional second parameter an object with any number of keys and values
    - These values will be exported into the bash shell at runtime of any terraform functions
    - Currently only number, string, and boolean types are supported
- The `tfxjs` constructor can take `quiet` as a boolean in the `options` when initializing the constructor. 
    - This option will prevent terraform commands from outputting during test runtime.
- [End to end tests](./e2e-tests/) have been added to ensure CLI commands run return correct results
- Removed `jq` dependency
- The ability to run `terraform destroy` has been added as part of the CLI commands but is not yet implemented in the [main tfx module](./lib/index.js)
- `tfxjs` when initialized now has more methods to allow for easier creation of tests
    - `tfx.module` can now take mulitple resources as arfs
    - `tfx.resource` now creates a test object for a resource
    - `tfx.expect` allows for streamlined writing of function tests
    - `tfx address` allows for easy creation of state resources and accepts multiple instances as args
    - None of the above changes will break existing code patterns
- All `exec` commands have been reworked to better use promises
- More robust error handling