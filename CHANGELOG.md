# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2022-08-11

- When attempting to run tfx commands in a directory that causes an error, the correct terraform error will be shown in the terminal instead of a NodeJS error.
- Users can now pass an optional quiet flag to CLI commands (`--quiet` or `-q`) to tfx commands supress terraform CLI logs.
- Users can now pass a shallow flag to CLI commands (`--shallow` or `-s`) to allow users to track null values inside terraform json objects. This is helpful when using terraform `timeouts` blocks where null values may be required.
- Users will now get the text of a terraform error resulting from an unset required variable instead of a NodeJS error.
- Unit tests have been added for [/lib/cli.js](./lib/cli.js).
- CLI commands now have colorful outputs
- README.md now properly reflects the dependency of using [jq](https://stedolan.github.io/jq/download/).
- Unit tests have been updated to use [sinon](https://sinonjs.org/) spies.
- For increased readability, [regex-but-with-words](https://www.npmjs.com/package/regex-but-with-words) is now used to handle regular expressions.
- `tfx.clone` function now exludes `.tfvars` and `.tfstate` files.
- Using the tfx CLI, users can now use the `tfx init` command to create a test directory with a `package.json`. The command will also run a build command to install needed npm packages.
- tfxjs tests now create a temporary environment variable store `tfxjs.tfvars` insted of exporting values into the development environment. This allows users to provide complex variable types in test files using JSON.. `terraform plan` and `terraform apply` commands will use the `--var-file` tag to point to `tfxjs.tvars` when provided.
- When writing end-to-end tests, users can now run connection tests against provisioned resources passing `tfx.connectionTest` as the expected value for the property of an instance and a callback function. The callback function returns a single parameter `address`. The following are valid `tfx` functions for use inside `tfx.connectionTest`
    - `tfx.connect.tcp.doesConnect`
    - `tfx.connect.tcp.doesNotConnect`
    - `tfx.connect.udp.doesConnect`
    - `tfx.connect.udp.doesNotConnect`
    - `tfx.connect.ping.doesConnect`
    - `tfx.connect.ping.doesNotConnect`
    - `tfx.connect.ssh.doesConnect`
    - `tfx.connect.ssh.doesNotConnect`

## [0.6.3] - 2022-05-17

- Fixed issue preventing `tfx plan` command from correctly interpreting data resources when creating tests.

## [0.6.2] - 2022-05-17

- Fixed issue preventing `tfx plan` command from correctly interpreting string variables that contain numbers.

## [0.6.1] - 2022-05-17

- Fixed issue preventing `tfx <file path>` command from running

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
- Removed `jq` dependency from terraform commands (`jq` is still needed to run the example tests)
- The ability to run `terraform destroy` has been added as part of the CLI commands but is not yet implemented in the [main tfx module](./lib/index.js)
- `tfxjs` when initialized now has more methods to allow for easier creation of tests
    - `tfx.module` can now take mulitple resources as arfs
    - `tfx.resource` now creates a test object for a resource
    - `tfx.expect` allows for streamlined writing of function tests
    - `tfx address` allows for easy creation of state resources and accepts multiple instances as args
    - None of the above changes will break existing code patterns
- All `exec` commands have been reworked to better use promises
- More robust error handling
