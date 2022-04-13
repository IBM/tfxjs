/**
 * Terraform Test Utils
 */

const { assert } = require("chai");
const path = require("path");
const helpers = require("./helpers");
const applyPath = path.join(__dirname + "/apply.sh");

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
   * Get tfstate json directly from tempalte file and store as part of object
   * @param {} exec js util exec function
   */
  this.getApplyJson = async function (exec) {
    const bash = await exec(
      `sh ${applyPath} ${apiKeyVariableName} ${process.env.API_KEY} ${templatePath}`
    );
    try {
      let tfstate = JSON.parse(bash.stdout);
      return tfstate;
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
        let keyData;
        try {
          keyData = resourceData.values[key];
        } catch {
          keyData = undefined;
        }
        let results = helpers.valueFunctionTest(planValues[key], keyData);
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
    let parentAddress;
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
        parentAddress = moduleData.address + "." + address;
        let childArray = moduleData.child_modules; // get child modules
        // For each child array check if the address
        childArray.forEach((child) => {
          if (child.address == parentAddress) {
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
        expectedResources.push(parentAddress ? `${parentAddress}.${resource.address}` : address + "." + resource.address);
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
        let composedAddress =  + address + "." + resource.address;
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
          `The module ${address} should not contain any resources in addition to ones passed`,
        ],
      });
    }
    // shhh
    //console.log(JSON.stringify(testData, null, 2))
    return testData;
  };
  /**
   * Create and run module tests
   * @param {Object} options List of options
   * @param {string=} options.address options.address Address of module
   * @param {string=} options.moduleName Module name
   * @param {Object} options.tfData Terraform data
   * @param {Array} options.testList List of tests to run
   * @param {boolean=} options.isApply Is a terraform state check rather than plan
   * @param {Function} options.callback Optional callback function
   */
  this.testModule = (options) => {
    // Throw error if no tfplan
    if (!helpers.keysContains(options, "tfData")) {
      throw new Error("tfData must be passed as an option got " + JSON.stringify(Object.keys(options)))
    }
    // Build module level test data
    let moduleName = options.moduleName || "",
        address = options.address || "",
        tfData = options.tfData,
        testList = options.testList || [],
        isApply = options.isApply || false,
        callback = options.callback || function(){};

    let moduleData;
    if (isApply) {
      moduleData = this.buildStateTest(moduleName, tfData, testList);
    } else {
      moduleData = this.buildModuleTest(moduleName, address, tfData, testList);
    }
    // Recursive function to run all tests
    let runTest = (tests, callback) => {
      // For each test
      tests.forEach((test) => {
        let completedTests = 0;
        // If describe is not one of the keys
        if (Object.keys(test).indexOf("describe") === -1) {
          // Run it function
          this.it(test.name, () => {
            // run assertion with correct assertion type and all args
            this.assert[test.assertionType](...test.assertionArgs);
          });
          callback()
        } else {
          // Otherwise run describe
          this.describe(test.describe, () => {
            // Run all the tests inside that describe
            runTest(test.tests, () => {
              completedTests ++;
              if (completedTests === test.tests.length) callback();
            });
          });
        }
      });
    };
    let completeModuleTests = 0
    // Describe the module and then run the tests;
    this.describe(moduleData.describe, () => {
      runTest(moduleData.tests, () => {
        completeModuleTests ++;
        if (completeModuleTests === moduleData.tests.length)
          callback();
      });
    });
  };

  /**
   * Create a set of unit tests for a single resource in a plan this is called by `testModule`
   * @param {Object} tfstate Terraform state
   * @param {string} address Address of the resource within the module
   * @param {Array<Object>} instanceValues Array of instance objects for a single resource
   * @returns JSON test data
   */
  this.buildInstanceTest = (address, tfstate, instanceValues) => {
    let resourceData = false;
    // For each resource in the state
    tfstate.resources.forEach((resource) => {
      let fullName = helpers.composeName(resource);
      if (fullName == address) {
        resourceData = resource;
      }
    });

    let tests = [
      {
        name: `Resource ${address} should be in tfstate`,
        assertionType: "isNotFalse",
        assertionArgs: [
          resourceData !== false,
          `Expected ${address} resource to be included in tfstate`,
        ],
      },
    ];

    if (resourceData !== false && instanceValues) {
      // For each key in instance values
      Object.keys(instanceValues).forEach((instance) => {
        let index, instanceData, attributeList;
        index = instance;
        // For each resource instance try and see if the index_key value is equal to instance
        resourceData.instances.forEach((value) => {
          if (value.index_key === index) {
            instanceData = value.attributes;
          }
        });
        // If no instance data is found use number
        if (!instanceData) {
          try {
            instanceData = resourceData.instances[parseInt(index)].attributes;
          } catch {
            instanceData = undefined;
          }
        }
        // List of attributes
        attributeList = Object.keys(instanceValues[index]);

        let nestedTests = []; // Tests that will be compiled after attribute loop is complete
        nestedTests.push({
          name: `Expected instance with key ${index} to exist at ${address}`,
          assertionType: "isFalse",
          assertionArgs: [
            instanceData === undefined,
            `Expected instance with key ${index} to exist at ${address}.instances`,
          ],
        });
        if (instanceData) {
          // For each attribute in the list
          attributeList.forEach((attribute) => {
            let testValue = instanceValues[index][attribute]; // Reference to instance value data
            let testData; // Storage for test data
            let dataIsArray = Array.isArray(instanceData[attribute]); // Is data an array

            // Terraform often on the user side does not differentiate between a map or
            // a list containing a map. To allow users to more accurately get these values
            // from a state, this function allows object mapping to lists containing a
            // single map
            if (
              dataIsArray && // If data is array
              instanceData[attribute].length === 1 && // And length is one
              typeof instanceData[attribute][0] === "object" // And that type is object
            ) {
              // Add test for key contains
              nestedTests.push({
                name: `Expected resource ${address}[${index}] to have value for ${attribute}`,
                assertionType: "isNotFalse",
                assertionArgs: [
                  helpers.keysContains(instanceData, attribute),
                  `Expected ${address}[${index}] attribute ${attribute} to exist`,
                ],
              });
              let arr0data = instanceData[attribute][0]; // data reference
              // For each key in test value
              Object.keys(testValue).forEach((testValueKey) => {
                if (helpers.keysContains(arr0data, testValueKey)) {
                  // if the key exists init test
                  let foundTest = {
                    name: `Expected resource ${address}[${index}] to have correct value for ${attribute}[0].${testValueKey}`,
                    assertionType: "deepEqual",
                    assertionArgs: [],
                  };
                  if (testValue[testValueKey] instanceof Function) {
                    // Get result from helpers
                    let results = helpers.valueFunctionTest(
                      testValue[testValueKey],
                      arr0data[testValueKey]
                    );
                    foundTest.assertionType = "isTrue"; // Set type to isTrue
                    // Change args
                    foundTest.assertionArgs = [
                      results.expectedData,
                      `Expected ${address}[${index}] attribute ${attribute}[0].${testValueKey} ${results.appendMessage}`,
                    ];
                  } else {
                    // Default args
                    foundTest.assertionArgs = [
                      arr0data[testValueKey],
                      testValue[testValueKey],
                      `Expected ${address}[${index}] attribute ${attribute}[0].${testValueKey} to be ${testValue[testValueKey]}`,
                    ];
                  }
                  // If it contains the key add nested test
                  nestedTests.push(foundTest);
                } else {
                  // otherwise add test for bad attribute
                  nestedTests.push({
                    name: `Expected resource ${address}[${index}] to have value for ${attribute}.${testValueKey}`,
                    assertionType: "isNotFalse",
                    assertionArgs: [
                      helpers.keysContains(instanceData, attribute),
                      `Expected ${address}[${index}] attribute ${attribute}.${testValueKey} to exist`,
                    ],
                  });
                }
              });
            } else {
              // Otherwise just run deepEqual
              testData = {
                name: `Expected resource ${address}[${index}] to have correct value for ${attribute}.`,
                assertionType: "deepEqual",
                assertionArgs: [
                  instanceData[attribute],
                  testValue,
                  `Expected ${address}[${index}] ${attribute} to have value ${
                    typeof testValue === "object"
                      ? JSON.stringify(testValue) // print stringified json if object
                      : testValue // otherwise just value
                  }`,
                ],
              };
              // Unless the value is a function
              if (testValue instanceof Function) {
                // Get function results
                let results = helpers.valueFunctionTest(
                  testValue,
                  instanceData[attribute]
                );
                // Overwrite assertion and args
                testData.assertionType = "isTrue";
                testData.assertionArgs = [
                  results.expectedData,
                  `Expected ${address}[${index}] ${attribute} ${results.appendMessage}`,
                ];
              }
              // Push test to list of tests
              tests.push(testData);
            }
          });
        }
        // Add all nested tests back to test
        nestedTests.forEach((test) => tests.push(test));
      });
    }
    //console.log(JSON.stringify(tests, null, 2));
    return {
      describe: address,
      tests: tests,
    };
  };
  /**
   * Build an object for testing each item in a tfstate
   * @param {string} moduleName Descriptive module name
   * @param {Object} tfstate Terraform tfstate
   * @param {array} instanceTests List of instance tests. each object must have a name, address, and attributes
   * @returns An object containing each of the tests for eah resource
   */
  this.buildStateTest = (moduleName, tfstate, instanceTests) => {
    let instanceObject = {
      describe: moduleName,
      tests: [],
    };
    // For each instance
    instanceTests.forEach((test) => {
      // Object describing tests
      let testObj = {};
      // For each instance inside of each test block
      test.instances.forEach((instance) => {
        if (instance.index_key) {
          // If instance has instance key set to instance
          let index_key = instance.index_key;
          testObj[index_key] = instance;
          delete testObj[index_key].index_key
        } else {
          // Otherwise use index of instance
          testObj[test.instances.indexOf(instance)] = instance;
        }
      });
      // build tests and add to tests
      let testData = this.buildInstanceTest(test.address, tfstate, testObj);
      instanceObject.tests.push(testData); // Push to tests
    });

    // console.log(JSON.stringify(instanceObject, null, 2))
    // Return instance object
    return instanceObject;
  };
};

module.exports = utils;
