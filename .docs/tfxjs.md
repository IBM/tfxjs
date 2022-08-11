# tfxjs

List of methods and use for `tfxjs` constructor.

---

## Table of Contents

1. [Initializtion](#initialization)
2. [Constructor](#constructor)
    - [tfvars](#tfvars)
3. [plan](#plan)
    - [module](#module)
    - [resource](#resource)
4. [apply](#apply)
    - [state](#state)
    - [address](#address)
    - [connectionTest](#connectionTest)
5. [expect](#expect)
6. [clone](#clone)

---

## Initialization

To initialize `tfxjs`, first the constructor needs to be added:

```js
const tfxjs = require("tfxjs"); // Initialize tfxjs
```

---

## Constructor

The tfxjs constructor accepts three arguments, `templatePath`, `tfvars`, and `options`

```js
const tfxjs = require("tfxjs"); // Initialize tfxjs

/**
 * Create a new tfx instance
 * @param {string} templatePath File path to terraform template
 * @param {Object} tfvars key value pair of tfvars
 * @param {Object} options options for testing
 * @param {boolean} options.quiet Set to true to disable template outputs
 */
const tfx = new tfxjs(templatePath, tfvars, options)
```

### tfvars

This parameter takes any number of values and injects them into the template data at runtime for `plan` and `apply` commands. Currently only `string`, `number`, and `boolean` types are supported.

```js
{
  value_1: "test",
  value_2: 3
}
```

Doing this results in the following bash commands being run before any terraform commands:

```shell
export TF_VAR_value_1="test"
export TF_VAR_value_2=3
```

*Note: This **will not** override values in `terraform.tfvars`.*

---

## plan

```js
  /**
   * Plan Terraform template from directory and return data
   * @param {string} templateName Decorative name of the template that is being tested
   * @param {Function} callback Callback function
   */
  tfx.plan(templateName, callback)
```

`tfx.plan` runs a `terraform plan` command in the directory where `tfx` is initialized and adds the plan data to the `tfx` object. After the plan has been completed, the callback function will be executed.

Terraform planned values JSON data can be referenced directly from `tfx.tfplan` once a plan as successfully completed. 

### Example

```js
const tfxjs = require("tfxjs");
const tfx = new tfxjs("../", {
  trigger_value: "example-acceptance-tests",
  shuffle_count: 3,
});
tfx.plan(
    "myTemplate",
    () => {
        ...tests
    }
)
```

---

## module

The `module` method runs tests against `tfx.plan` module data.

```js
  /**
   * Run tests for a module in terraform plan
   * @param {string} moduleName decorative string for module name
   * @param {string} moduleAddress relative module address from root
   * @param {...{name: string, address: string, values:{Object}}} resources Array of resources from the module to check
   */
  tfx.module(moduleName, moduleAddress, ...resources)
```

- `tfx.module` runs a set of tests against a module inside the plan data. In order to call `tfx.module`, a `tfx.plan` command must be run first.
- `tfx.module` checks for children relative to the parent.
- `tfx.module` checks to ensure that only resources passed in as a resource parameter exist within the module

### Example

`module.my_module` has a sub module `module.sub_module` creating a composed module address of `module.my_module.module.sub_module`. tfx will dynamically add the parent module name to child modules. This allows sub modules to be accessed like this:

```js
tfx.plan("myTemplate", () => {
  tfx.module(
    "SubModudle", 
    "module.sub_module", 
    ...resources, 
  )
})
```

---

## resource

`tfx.resource` creates a test for a single resource inside `tfx.module`.

```js
  /**
   * Creates a resource object for acceptence tests. Used with `tfx.plan`.
   * @param {string} name Decorative name for module test
   * @param {string} address Address relative to the module being tested (ex. use `test.resource` for `module.example.test.resource` when testing in `module.example`)
   * @param {Object} values Arbitrary values to test that exist in Terraform Plan
   * @returns {Object{name=string address=string values=object}} Object used to dynamically create mocha tests 
   */
  tfx.resource(name, address, values)
```

#### Example

```js
tfx.plan("myTemplate", () => {
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

---

## apply

```js
  /**
   * Apply Terraform template from directory and return tfstate data using mocha
   * @param {string} templateName Decorative name of the template that is being tested
   * @param {Function} callback Callback function
   */
  tfx.apply(templateName, callback)
```

`tfx.apply` runs a `terraform apply` command in the directory where `tfx` is initialized and adds the terraform.tfstate data to the `tfx` object. After the plan has been completed, the callback function will be executed.

The terraform state JSON data can be directly referenced from `tfx.tfstate` after a successful apply.


### Example

```js
const tfxjs = require("tfxjs");
const tfx = new tfxjs("../", {
  trigger_value: "example-acceptance-tests",
  shuffle_count: 3,
});
tfx.apply(
    "myTemplate",
    () => {
        ...tests
    }
)

```

---

## state

```js
  /**
   * Run tests for a module
   * @param {string} moduleName decorative string for module name
   * @param {...{address: string, instances: Array<Object>}} resources Object of resources from the module to check
   */
  tfx.state(moduleName, ...resources)
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

---

## address

`tfx.address` creates tests to run against instances at an address in a terraform state.

```js
  /**
   * Check values for a resource against terraform state after apply
   * @param {string} address Composed resource address ex "module.example_module.random_pet.random_example"
   * @param {...Object} instances instances to test
   * @returns {{address=string instances=array}} Returns the object for instance
   */
 tfx.address(address, ...instances)
```

### Example

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

## connectionTest

Users can run end-to-end connection tests against insance values using `tfx.connectionTest` function.

```js
/**
 * Connection Test constructor. This constructor takes in a callback with one parameter `address`, the 
 * address to run `tfx.connect` tests against.
 * @param {connectionCallback} callback tfx callback
 */
  tfx.connectionTest = function (callback) 
```

### connect methods

- `tfx.connect.tcp.doesConnect(host, port)`
- `tfx.connect.tcp.doesNotConnect(host, port)`
- `tfx.connect.udp.doesConnect(host, port, timeout)`
- `tfx.connect.udp.doesNotConnect(host, port, timeout)`

### Example

```js
  tfx.state(
    "Ping Test",
    tfx.address("module.ping_module.random_shuffle.ping_test", {
      keepers: {
        shuffle_count: "1",
      },
      result_count: 1,
      input: ["8.8.8.8"],
      result: tfx.connectionTest((address) => {
        return tfx.connect.ping.doesConnect("ping test", address);
      })
    })
  )
```

---

## expect

In addition to being any other data type, a function can also be passed using `tfx.expect`. This can be used 

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

---

## clone

The `clone` method allows users to create a copy of a template from the directory and run tests against the copied template. This allows for running tests in parallel against the same codebase.

```js
  /**
   * Create a clone of an existing template in a filepath specified
   * @param {string} clonePath Path where the clone template will be created
   * @param {cloneCallback} callback Callback function
   */
  tfx.clone(clonePath, (tfxClone, done) => {
    ...
  })

  /**
   * Callback descriptor
   * @callback cloneCallback
   * @param {tfx} tfxClone Clone tfx object
   * @param {Function} done Function to delete clone directory
   */
```

### Example

```js
const tfxjs = require("tfxjs");
const template = new tfxjs("../", {
  trigger_value: "example-acceptance",
});
template.clone("../../clone-path", (tfx, done) => {
  tfx.plan("Hashicorp Provider Example Tests", () => {
    tfx.module(
      "Root Module",
      "root_module",
      tfx.resource("Count Example 0", "null_resource.count_example[0]", {
        triggers: {
          trigger_value: "example-acceptance",
        },
      }),
      ...
    )
    ...
    done();
  })
})

```