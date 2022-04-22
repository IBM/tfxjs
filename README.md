# tfxjs

tfxjs is a terrafrom acceptance test framework built with [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) to allow users to quickly create acceptance tests for terraform templates.

---

## Table of Contents

1. [Installation](#installation)
2. [Prerequisites](#prerequisites)
3. [Usage](#usage)
4. [Example Usage](#example-usage)
5. [Methods](#methods)
5. [Contributing](#contributing)
6. [Code Test Coverage](#code-test-coverage)

---

## Installation

```shell
npm install tfxjs -g
```

---

## Prerequisites

- [Terraform CLI](https://www.terraform.io/cli/commands)
- If [mocha](https://mochajs.org/) is not installed globally run:
```shell
npm install mocha -g
```

## Usage

```
tfx <path to test file>
```

---

## Example Usage

For a detailed example of using this framework, see [example tests](./example-tests/)

### Example File

```js

const tfxjs = require("tfxjs"); // Initialize tfxjs
const tfx = new tfxjs(" <path to template directory> ", {
  my_tf_value_1 : "<data>", // export variable data to template directory
  my_tf_value_2 : "<data>"
}); // Create a new constructor for terraform teplate

tfx.plan("MyModule", () => { // Gerate a plan in the directory
  // Run tests for the module
  tfx.module(
    "Root Module", // decorative module name
    "module.my_module", // module address
    tfx.resource(
      "Activity Tracker Route", // Name of the resource (decorative)
      "ibm_atracker_route.atracker_route", // Expected address within module
      // values to check in that resource
      { 
        name: "tfx-atracker-route",
        receive_global_events: true,
      },
    ),
    ...
  );
});
```

### Example Output

```
* tfxjs testing

##############################################################################
# 
#  Running `terraform plan`
#  Teplate File:
#     < your file path >
# 
##############################################################################



  MyModule

    ✔ Successfully generates a terraform plan file
    ✔ module.my_module should not contain additional resources

  Module Root Module
    ✔ Plan should contain the module module.my_module
    Activity Tracker Route
      ✔ Module module.my_module should contain resource ibm_atracker_route.atracker_route
      ✔ Activity Tracker Route should have the correct name value
      ✔ Activity Tracker Route should have the correct receive_global_events value


  5 passing (7s)
```

---

## Methods

### constructor

```js
/**
 * Create a new tfx instance
 * @param {string} templatePath File path to terraform template to test
 * @param {Object} tfvars key value pair of tfvars
 * @param {boolean} options List of options
 * @param {boolean} options.quiet // Set to true to limit cli outpit
 */

const tfx = new tfxjs(templatePath, tfvars, options)
```

#### tfvars

This parameter takes any number of values and injects them into the template data at runtime. Currently only `string`, `number`, and `boolean` types are supported.

```js
{
  value_1: "test",
  value_2: 3
}
```

Doing this results in the following bash commands:

```shell
export TF_VAR_value_1="test"
export TF_VAR_value_2=3
```

**Note** These values may conflict with `terraform.tfvars`

### plan

```js
  /**
   * Plan Terraform module from directory and return data using mocha
   * @param {string} moduleName Name of the module that is being tested
   * @param {Function} callback Callback function
   */
  tfx.plan(moduleName, callback)
```

`tfx.plan` runs a `terraform plan` command in the directory where `tfx` is initialized and adds the plan data to the `tfx` object. After the plan has been completed, the callback function will be executed. 

### module


```js
  /**
   * Run tests for a module
   * @param {string} moduleName decorative string for module name
   * @param {string} moduleAddress relative module address from root
   * @param {Array<{name: string, address: string, values:{Object}}>} resources Array of resources from the module to check
   */
  tfx.module(moduleName, moduleAddress, resources)
```

`tfx.module` runs a set of tests against a module inside the plan data. In order to call `tfx.module`, a `tfx.plan` command must be run first.

`tfx.module` checks for children relative to the parent.

#### Example

`module.my_module` has a sub module `module.sub_module` creating a composed module address of `module.my_module.module.sub_module`. tfx will dynamically add the parent module name to child modules. This allows sub modules to be accessed like this:

```js
tfx.plan("MyModule", () => {
  tfx.module(
    "SubModudle", 
    "module.sub_module", 
    ...resources
  )
})
```

### resource

`tfx.resource` creates a resource for a single resource inside a module.

```js
  /**
   * Creates a resource object for acceptence tests. Used with `tfx.plan`.
   * @param {string} name Decorative name for module test
   * @param {string} address Address relative to the module being tested (ex. use `test.resource` for `module.example.test.resource` when testing in `module.example`)
   * @param {Object} values Arbitrary values to test that exist in Terraform Plan
   * @returns {Object{name=string address=string values=object}}
   */
  tfx.resource(name, address, values)
```

#### Example

```js
tfx.plan("MyModule", () => {
  tfx.module(
    "SubModudle", 
    "module.sub_module", 
    tfx.resource(
      "myResource",
      "resource.address",
      {
        testValue: true
      }
    ),
    tfx.resource(
      "myResource2",
      "resource.address2",
      {
        testValue: true
      }
    )
  )
})
```

### expect

In addition to being any other data type, a function can also be passed using `tfx.expect`

```js
  /**
   * Create a compiled function to run against a value
   * @param {string} appendMessage Append to end of message Expected resource to ... + appendMessage
   * @param {Function} evaluationFunction Function to be used for evaluation. Must evaluate to boolean value. Takes a single paraneter
   * @returns Validation Function
   */
  tfx.expect(appendMessage, evaluationFunction) 
```

Example resource with a function:

```js
tfx.resource(
  "Activity Tracker Route",
  "ibm_atracker_route.atracker_route",
  {
    name: tfx.expect("to not contain the underscore character.",  (value) => {
      return value.indexOf("_") === -1
    })
    receive_global_events: true,
  }
)
```

### apply

```js
  /**
   * Apply Terraform module from directory and return tfstate data using mocha
   * @param {string} moduleName Name of the module that is being tested
   * @param {Function} callback Callback function
   */
  tfx.plan(moduleName, callback)
```

`tfx.apply` runs a `terraform apply` command in the directory where `tfx` is initialized and adds the terraform.tfstate data to the `tfx` object. After the plan has been completed, the callback function will be executed. 

### state


```js
  /**
   * Run tests for terraform state
   * @param {string} moduleName decorative string for module name
   * @param {Array.<{address: string, instances: Array<Object>}>} resources Array of resources from the module to check
   */
  tfx.state(moduleName, moduleAddress, resources)
```

`tfx.state` runs a set of tests against a module inside the tf.state data. In order to call `tfx.module`, a `tfx.apply` command must be run first.

`tfx.state` runs commands only against specific resources. Ex:

```js
tfx.apply("myModule", () => {
  tfx.state(
    "myTests", 
    ...tests
  )
})
```

### address

`tfx.address` creates tests to run against instances at an address in a terraform state.

```js
  /**
   * Check values for a resource against terraform state after apply
   * @param {string} address Composed resource address ex "module.example_module.random_pet.random_example"
   * @param {Array} instances Array of instances to test
   * @returns {{address=string instances=array}} Returns the object for instance
   */
 tfx.address(address, ...instances)
```

#### Example Address

```js
tfx.apply("Hashicorp Provider Example Tests", () => {
  tfx.state(
    "Local Files",
    tfx.address(
      "data.local_file.lists",
      {
        index_key: "list_1",
        content: "ponder,consider,opt,preordain,brainstorm,portent",
        content_base64:
          "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
        filename: "./local-files/shuffle_list_1.txt",
      },
      {
        index_key: "list_2",
        content: "scout,slinger,warrior,builder,settler",
        content_base64: "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
        filename: "./local-files/shuffle_list_2.txt",
      }
    )
  );
});
```


---

## Contributing

If you have any questions or issues you can create a new [issue here][issues]. See the full contribution guidelines [here](./CONTRIBUTING.md).

Pull requests are very welcome! Make sure your patches are well tested.
Ideally create a topic branch for every separate change you make. For
example:

1. Fork the repo
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

--- 

## Code Test Coverage

This module uses [nyc](https://www.npmjs.com/package/nyc) for unit test coverage.

To get test coverage, run the command 
```shell
npm run coverage
```

## End to End Tests

To run end-to-end tests, use the following command
```shell
tfx e2e-tests/
```

---

### Current Test Coverage


File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 | 🏆
 lib               |     100 |      100 |     100 |     100 | 🏆
  builders.js      |     100 |      100 |     100 |     100 | 🏆
  helpers.js       |     100 |      100 |     100 |     100 | 🏆
  index.js         |     100 |      100 |     100 |     100 | 🏆
  terraform-cli.js |     100 |      100 |     100 |     100 | 🏆
  utils.js         |     100 |      100 |     100 |     100 | 🏆
 unit-tests        |     100 |      100 |     100 |     100 | 🏆
  tfx.mocks.js     |     100 |      100 |     100 |     100 | 🏆