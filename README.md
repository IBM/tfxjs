# tfxjs

tfxjs is a terrafrom acceptance test framework built with [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) to allow users to quickly create acceptance tests for terraform tmplates.

---

## Table of Contents

1. [Installation](#installation)
2. [Prerequisites](#prerequisites)
3. [Usage](#usage)
4. [Example Usage](#example-usage)
5. [Methods](#methods)
5. [Contributing](#contributing)

---

## Installation

```shell
npm install tfxjs -g
```

---

## Prerequisites

Create a `.env` file for your environment and set the `API_KEY` value 

## Usage

```
tfx <path to test file>
```

---

## Example Usage

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
   * @param {Array<object>} resources Array of resources from the module to check
   */
  module(moduleName, moduleAddress, resources)
```

`tfx.module` runs a set of tests against a module inside the plan data. In order to call `tfx.module`, a `tfx.plan` command must be run first.

`tfx.module` checks for children relative to the parent. ex.

`module.my_module` has a sub module `module.sub_module` creating a composed module address of `module.my_module.module.sub_module`. tfx will dynamically add the parent module name to child modules. This allows sub modules to be accessed like this:

```js
tfx.plan("MyModule", "module.my_module", () => {
  tfx.module("SubModudle", "module.sub_module", () => {
    ...
  })
})
```


---

## Contributing

If you have any questions or issues you can create a new [issue here][issues]. See the full contribution guidelines [here](./CONTRIBUTING.md)/

Pull requests are very welcome! Make sure your patches are well tested.
Ideally create a topic branch for every separate change you make. For
example:

1. Fork the repo
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request