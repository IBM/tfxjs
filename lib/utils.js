const { assert } = require("chai");
const exp = require("constants");

/**
 * tfxjs utilities constructor
 * @param {string} scriptPath Path to script to use
 * @param {string} templatePath Path to template
 * @param {string} apiKeyVariableName Name of the variable to be used
 * @param {Object?} options Optional values for testing
 */
const utils = function (scriptPath, templatePath, apiKeyVariableName, options) {
  // Override mocha variables for unit testing
  try {
    this.it = options.overrideIt;
  } catch {
    this.it = it;
  }
  // Override mocha variables for unit testing
  try {
    this.describe = options.overrideDescribe;
  } catch {
    this.describe = describe;
  }
  // Override mocha variables for unit testing
  try {
    this.assert = options.overrideAssert;
  } catch {
    this.assert = assert;
  }

  /**
   * Get plan json directly from tempalte file
   * @param {} exec js util exec function
   * @returns Terraform planned value JSON
   */
  this.getPlanJson = async function (exec) {
    const bash = await exec(
      `sh ${scriptPath} ${apiKeyVariableName} ${process.env.API_KEY} ${templatePath}`
    );
    try {
      // Try to parse json and throw error on failure
      let tfplan = JSON.parse(bash.stdout).planned_values;
      return tfplan;
    } catch (err) {
      throw new Error(
        err + ". Ensure your template file is correct and try again."
      );
    }
  };
  /**
   * Create a set of unit tests for a single resource in a plan this is called by `testModule`
   * @param {string} resourceName The plain text name of the resource to test
   * @param {Object} moduleData Terraform plan data
   * @param {string} address Address of the resource within the module
   * @param {Object} planValues An object containing values found in the values object of resource object within the plan
   * @returns JSON test data
   */

  this.buildResourceTest = function (
    resourceName,
    moduleData,
    address,
    planValues
  ) {
    let resourceData = false;
    try {
      // Try to get data from module resources
      moduleData.resources.forEach((resource) => {
        if (resource.address == `${moduleData.address}.${address}`) {
          resourceData = resource;
        }
      });
    } catch {
      // set to false otherwise
      resourceData = false;
    }
    // Init list of tests
    let tests = [
      {
        name: `Module ${moduleData.address} should contain resource ${address}`,
        assertionType: "isNotFalse",
        assertionArgs: [
          resourceData !== false, // checks if module exists
          `Expected ${moduleData.address} contain the ${resourceName} resource.`,
        ],
      },
    ];
    // For each key in the plan
    Object.keys(planValues).forEach((key) => {
      // Create test object
      let valueTest = {
        name: `${resourceName} should have the correct ${key} value`,
      };
      // If the key is a function that needs to be evaluated
      if (planValues[key] instanceof Function) {
        let results; // Initialize results
        try {
          // Try to run the function and set as results
          results = planValues[key](resourceData.values[key]);
        } catch {
          // Otherwise set results to failure message
          results = {
            appendMessage: "to exist in module, got undefined.",
            expectedData: false,
          };
        }
        let resultKeys = Object.keys(results); // Keys from results function
        if (
          resultKeys.length !== 2 ||
          resultKeys.indexOf("appendMessage") === -1 ||
          resultKeys.indexOf("expectedData") === -1
        ) {
          // Throw an error if keys are not exactly appendMessage and expectedData
          throw new Error(
            "Value functions must have only two keys, `appendMessage` and `expectedData` got " +
              resultKeys
          );
        } else if (typeof results.expectedData !== "boolean") {
          // Throw if expected data not boolean result
          throw new Error(
            "Value functions must evaluate to either true or false got " +
              results.expectedData
          );
        } else if (typeof results.appendMessage !== "string") {
          // if append message not string throw
          throw new Error(
            "Value functions appendMessage must be string got " +
              typeof results.appendMessage
          );
        }
        valueTest.assertionType = "isTrue"; // add boolean evaluation
        // create args
        valueTest.assertionArgs = [
          results.expectedData,
          `Expected ${address} resource ${key} value ${results.appendMessage}`,
        ];
      } else {
        // check deep equal to plan
        valueTest.assertionType = "deepEqual";
        valueTest.assertionArgs = [
          planValues[key],
          `Expected ${address} to have correct value for ${key}.`,
        ];
        try {
          // try and get the key
          valueTest.assertionArgs.unshift(resourceData.values[key]);
        } catch {
          // otherwise add undefined
          valueTest.assertionArgs.unshift(undefined);
        }
      }
      // Add to tests
      tests.push(valueTest);
    });
    // Return object with describe and tests
    return {
      describe: resourceName,
      tests: tests,
    };
  };

  /**
   * Test a module and all of it's components
   * @param {string} moduleName Plain text name for the module
   * @param {string} address Module address. Should be relative to the parent module
   * @param {Object} tfPlan Object containing terraform plan data
   * @param {Array<Object>} resources Array of resources with name, address, and values
   * @returns Test Object for each test in the array
   */
  this.buildModuleTest = (moduleName, address, tfPlan, resources) => {
    // Initialize module test
    let testData = {
      describe: `Module ${moduleName}`,
      tests: [],
    };
    // Module data
    let moduleData;
    try {
      // Get module data and set
      moduleData = tfPlan.root_module.child_modules[0];
      // Throw error if no child modules
      if (tfPlan.root_module.child_modules.length < 1) {
        throw new Error(
          "Expected child_modules to be created. Check your plan configuration and try again."
        );
      }
    } catch (err) {
      // Handle errors for plan
      if (tfPlan.root_module == undefined) {
        // If no root module throw error
        throw new Error(
          "Expected terraform plan to have root_module at top level. Check your plan configuration and try again."
        );
      } else if (tfPlan.root_module.child_modules == undefined) {
        // throw if no child_modules
        throw new Error(
          "Expected terraform plan root_module to have child_modules. Check your plan configuration and try again."
        );
      } else {
        throw err;
      }
    }
    let containsModule = false;
    if (moduleData.address === address) {
      containsModule = true;
    } else {
      try {
        let parentAddress = moduleData.address
        let childArray = moduleData.child_modules; // get child modules
        // For each child array check if the address
        childArray.forEach((child) => {
          if (child.address == parentAddress + "." + address) {
            containsModule = true;
            moduleData = child;
          }
        });
      } catch {
        // Catch set to false
        containsModule = false;
      }
    }
    // Push test to test data
    testData.tests.push({
      name: `Plan should contain the module ${address}`,
      assertionType: "isTrue",
      assertionArgs: [
        containsModule,
        `The module ${address} should exist in the terraform plan.`,
      ],
    });
    // list of expected resources
    let expectedResources = [];
    // If module is there and resources
    if (containsModule && resources.length > 0) {
      // For each resource
      resources.forEach((resource) => {
        // Add resource to expected resources
        expectedResources.push(address + "." + resource.address);
        // Add resource tests
        testData.tests.push(
          this.buildResourceTest(
            resource.name,
            moduleData,
            resource.address,
            resource.values
          )
        );
      });
    }
    // list of found resources
    let foundResources = [];
    if (containsModule && moduleData.resources) {
      // For each resource in the module
      moduleData.resources.forEach((resource) => {
        // create composed address and add to found list of resources if found
        let composedAddress = address + "." + resource.address;
        if (expectedResources.indexOf(composedAddress) === -1)
          foundResources.push(resource.address);
      });
      // Add test to ensure no additional resources
      testData.tests.push({
        name: `${address} should not contain additional resources`,
        assertionType: "deepEqual",
        assertionArgs: [
          foundResources,
          expectedResources,
          "The module module.test.test should not contain any resources in addition to ones passed",
        ],
      });
    }
    // shhh
    //console.log(JSON.stringify(testData, null, 2))
    return testData;
  };
  /**
   * Create and run module tests
   * @param {string} moduleName Decorative module name
   * @param {string} address Relative module address to top level parent
   * @param {Object} tfplan terraform plan data
   * @param {Array} resources list of resources to check
   */
  this.testModule = (moduleName, address, tfplan, resources) => {
    // Build module level test data
    let moduleData = this.buildModuleTest(
      moduleName,
      address,
      tfplan,
      resources
    );
    // Recursive function to run all tests
    let runTest = (tests) => {
      // For each test
      tests.forEach((test) => {
        // If describe is not one of the keys
        if (Object.keys(test).indexOf("describe") === -1) {
          // Run it function
          this.it(test.name, () => {
            // run assertion with correct assertion type and all args
            this.assert[test.assertionType](...test.assertionArgs);
          });
        } else {
          // Otherwise run describe
          this.describe(test.describe, () => {
            // Run all the tests inside that describe
            runTest(test.tests);
          });
        }
      });
    };
    // Describe the module and then run the tests;
    this.describe(moduleData.describe, () => {
      runTest(moduleData.tests, () => {});
    });
  };
};

module.exports = utils;
