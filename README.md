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
- [jq](https://stedolan.github.io/jq/)
- Create a `.env` file for your environment and set the `API_KEY` value
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
const tfx = new tfxjs(" <path to template directory> ", "<name of terraform environment api key variable >"); // Create a new constructor for terraform teplate

tfx.plan("MyModule", () => { // Gerate a plan in the directory
  // Run tests for the module
  tfx.module("Root Module", "module.my_module", [
    // List of resources to test
    {
      name: "Activity Tracker Route", // Name of the resource (decorative)
      address: "ibm_atracker_route.atracker_route", // Expected address within module
      values: { // List of values to check in that resource
        name: "tfx-atracker-route",
        receive_global_events: true,
      },
    },
  ]);
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
tfx.plan("MyModule", "module.my_module", () => {
  tfx.module("SubModudle", "module.sub_module", [
    ...resources
  ]})
})
```

#### Module Resource Test definitions

Resources for modules are described in an object with a name, address, and values.

```js
{
  {
    name: "Activity Tracker Route",
    address: "ibm_atracker_route.atracker_route",
    values: {
      name: "ut-atracker-route",
      receive_global_events: true,
    }
  }
}
```

In addition to being any other data type, a function can also be passed in `values`.

```js
function (value) {
  // your code here
  return {
    expectedData: // Must be `true` or `false` after evaluation
    appendMessage: // String message to append to the end of a test
  }
}
```

Example resource with a function:

```js
{
  {
    name: "Activity Tracker Route",
    address: "ibm_atracker_route.atracker_route",
    values: {
      name: function(value) {
        return {
          expectedData: value.indexOf("_") === -1,
          appendMessage: "to not contain the underscore character."
        }
      },
      receive_global_events: true,
    }
  }
}
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
  tfx.state("myTests", [
    ...tests
  ])
})
```

#### State Resource Test definitions

```js
[
  {
    address: // Address for resource
    instances: [
      {
        index_key: // Optional, use only if the index of the instance is a string, otherwise index will
        // be generated automatically
        ...attributes // Any attributes that will be tested for that instance
      }
    ]
  }
]
```

In addition to being any other data type, a function can also be passed in `values`.

```js
function (value) {
  // your code here
  return {
    expectedData: // Must be `true` or `false` after evaluation
    appendMessage: // String message to append to the end of a test
  }
}
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

---

### Current Test Coverage


File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |      100|      100 |     100 |     100 | 🏆               
 lib           |     100 |      100 |     100 |     100 | 🏆                  
  helpers.js   |     100 |      100 |     100 |     100 | 🏆 
  builders.js  |     100 |      100 |     100 |     100 | 🏆                                   
  index.js     |     100 |      100 |     100 |     100 | 🏆                  
  utils.js     |     100 |      100 |     100 |     100 | 🏆                  
 unit-tests    |     100 |      100 |     100 |     100 | 🏆                  
  tfx.mocks.js |     100 |      100 |     100 |     100 | 🏆                  
