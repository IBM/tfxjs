/**
 * Terraform Test Utils
 */

const { assert } = require("chai");
const path = require("path");
const helpers = require("./helpers");
const { // Builders for test data
  isTrueTest, // isTrue assertion
  notFalseTest, // isNotFalse assertion
  deepEqualTest, // deepEqual assertion
  eachKeyTest, // run a test for each key in an array
  valueTest, // eval function and return data
} = require("./builders");
// More helpers
const { eachKey, keysContains, checkModuleTest } = require("./helpers");
// Apply terraform path
const applyPath = path.join(__dirname + "/bash-scripts/apply.sh");
// Plan terraform path
const planPath = path.join(__dirname + "/bash-scripts/plan.sh");

/**
 * tfxjs utilities constructor
 * @param {string} templatePath Path to template
 * @param {string} apiKeyVariableName Name of the variable to be used
 * @param {Object?} options Optional values for testing
 */
const utils = function (templatePath, apiKeyVariableName, options) {
  // Override mocha variables for unit testing
  try {
    this.it = options.overrideIt;
  } catch {
    this.it = it; // default to chai
  }
  // Override mocha variables for unit testing
  try {
    this.describe = options.overrideDescribe;
  } catch {
    this.describe = describe; // default to chai
  }
  // Override mocha variables for unit testing
  try {
    this.assert = options.overrideAssert;
  } catch {
    this.assert = assert; // default to chai
  }

  /**
   * Run bash command in a directory and get data
   * @param {Function} exec js util exec function
   * @param {string} type type of action to run. can be plan or apply
   * @returns {Object} Terraform data object
   */
  this.runBash = async function (exec, type) {
    // Set script to run
    const command = type === "plan" ? planPath : applyPath;
    // Run bash commans
    const bash = await exec(
      `sh ${command} ${apiKeyVariableName} ${process.env.API_KEY} ${templatePath}`
    );
    try {
      // Try to parse the stdout
      let outputJson = JSON.parse(bash.stdout);
      if (type === "plan") {
        return outputJson.planned_values; // If plan return planned values
      } else {
        return outputJson; // Otherwise return the whole thing
      }
    } catch (err) {
      // Catch an error if can't parse
      console.log(bash.stdout);
      throw new Error(
        err + ". Ensure your template file is correct and try again."
      );
    }
  };

  /**
   * Get plan json directly from tempalte file
   * @param {} exec js util exec function
   */
  this.getPlanJson = (exec) => {
    return this.runBash(exec, "plan");
  };

  /**
   * Get tfstate json directly from tempalte file and store as part of object
   * @param {} exec js util exec function
   */
  this.getApplyJson = (exec) => {
    return this.runBash(exec, "apply");
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
        // root module use address otherwise create otherwise create composed name
        let addressToCheck =
          moduleData.address === "root_module"
            ? address
            : `${moduleData.address}.${address}`;
        // If the address equals resource, add resource data
        if (resource.address == addressToCheck) {
          resourceData = resource;
        }
      });
    } catch {
      // set to false otherwise
      resourceData = false;
    }

    // Return object with describe and tests
    return {
      describe: resourceName,
      tests: [
        // Test that module exists
        notFalseTest(
          `Module ${moduleData.address} should contain resource ${address}`,
          [
            resourceData !== false, // checks if module exists
            `Expected ${moduleData.address} contain the ${resourceName} resource.`,
          ]
        ),
      ].concat(
        // Add each key test to array
        eachKeyTest(
          address,
          planValues,
          resourceData.values,
          "plan",
          resourceName
        )
      ),
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
    // Check data and throw errors if any
    let checkData = checkModuleTest(address, tfPlan);
    let moduleData = checkData.moduleData, // Set module data
      parentAddress = checkData.parentAddress; // Set parent address

    let containsModule = false; // object contains module
    let containsModuleData = helpers.containsModule(moduleData, address); // Get module data if possible

    if (typeof containsModuleData === "boolean") {
      containsModule = containsModuleData; // If contains module data is boolean set to contains module
    } else {
      // Otherwise set these from data
      (containsModule = containsModuleData.containsModule),
        (parentAddress = containsModuleData.parentAddress),
        (moduleData = containsModuleData.moduleData);
    }
    // Push test to test data
    testData.tests.push(
      isTrueTest(`Plan should contain the module ${address}`, [
        containsModule,
        `The module ${address} should exist in the terraform plan.`,
      ])
    );
    // list of expected resources
    let expectedResources = [];
    // If module is there and resources
    if (containsModule && resources.length > 0) {
      // For each resource
      resources.forEach((resource) => {
        // Add resource to expected resources
        let expResourceAddress = helpers.expectedResourceAddress(
          parentAddress,
          resource.address,
          address
        );
        expectedResources.push(expResourceAddress);
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
    if (containsModule && moduleData !== undefined) {
      if (moduleData.resources) {
        // For each resource in the module
        foundResources = helpers.getFoundResources(
          moduleData.resources,
          address,
          expectedResources
        );
        // Add test to ensure no additional resources
        testData.tests.push(
          deepEqualTest(`${address} should not contain additional resources`, [
            foundResources,
            expectedResources,
            `The module ${address} should not contain any resources in addition to ones passed`,
          ])
        );
      } else {
        testData.tests.push(
          deepEqualTest(`${address} should contain specified resources`, [
            foundResources,
            expectedResources,
            `The module ${address} should contain all resources expected`,
          ])
        );
      }
    }
    // Return test data
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
    if (!keysContains(options, "tfData")) {
      throw new Error(
        "tfData must be passed as an option got " +
          JSON.stringify(Object.keys(options))
      );
    }
    // Parse data
    let buildOptions = helpers.parseTestModuleOptions(options);

    // Build module level test data
    let moduleName = buildOptions.moduleName,
      address = buildOptions.address,
      tfData = buildOptions.tfData,
      testList = buildOptions.testList,
      isApply = buildOptions.isApply,
      callback = buildOptions.callback;

    let moduleData;
    if (isApply) {
      moduleData = this.buildStateTest(moduleName, tfData, testList); // Args for apply
    } else {
      moduleData = this.buildModuleTest(moduleName, address, tfData, testList); // Args for plan
    }
    // Recursive function to run all tests
    let runTest = (tests, callback) => {
      tests.forEach((test) => {
        // For each test
        let completedTests = 0; // Number of tests completed used to callback
        if (keysContains(test, "describe")) {
          // If describe is one of the keys
          this.describe(test.describe, () => {
            runTest(test.tests, () => {
              // Run all the tests inside that describe
              completedTests++; // Add one to completed tests
              if (completedTests === test.tests.length) callback(); // If all tests done run callback
            });
          });
        } else {
          // Otherwise run it
          this.it(test.name, () => {
            // Run it function
            this.assert[test.assertionType](...test.assertionArgs); // run assertion with correct assertion type and all args
            callback(); // Run callback
          });
        }
      });
    };
    let completeModuleTests = 0;
    // Describe the module and then run the tests;
    this.describe(moduleData.describe, () => {
      runTest(moduleData.tests, () => {
        completeModuleTests++;
        // If all the modules are tested, run callback;
        if (completeModuleTests === moduleData.tests.length && callback)
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
      let fullName = helpers.composeName(resource); // Full composed name of resource
      if (fullName == address) {
        resourceData = resource; // add resource data if found
      }
    });

    // Instance tests
    let tests = [
      notFalseTest(`Resource ${address} should be in tfstate`, [
        resourceData !== false,
        `Expected ${address} resource to be included in tfstate`,
      ]),
    ];

    if (
      resourceData !== false &&
      instanceValues &&
      keysContains(resourceData, "instances")
    ) {
      // If resource data and instance values
      // For each key in instance values
      eachKey(instanceValues, (instance) => {
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
            instanceData = resourceData.instances[parseInt(index)].attributes; // try to get an index of number
          } catch {
            instanceData = undefined;
          }
        }
        // List of attributes
        attributeList = Object.keys(instanceValues[index]);

        let nestedTests = [
          // Tests that will be compiled after attribute loop is complete
          isTrueTest(
            // Create test for instance
            `Expected instance with key ${index} to exist at ${address}`,
            [
              !(instanceData === undefined),
              `Expected instance with key ${index} to exist at ${address}.instances`,
            ]
          ),
        ];

        if (instanceData) {
          // For each attribute in the list
          attributeList.forEach((attribute) => {
            let testValue = instanceValues[index][attribute]; // Reference to instance value data
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
              nestedTests.push(
                notFalseTest(
                  `Expected resource ${address}[${index}] to have value for ${attribute}`,
                  [
                    keysContains(instanceData, attribute),
                    `Expected ${address}[${index}] attribute ${attribute} to exist`,
                  ]
                )
              );
              let arr0data = instanceData[attribute][0]; // data reference
              let subTests = eachKeyTest(
                address,
                testValue,
                arr0data,
                "state",
                attribute,
                index
              ); // test all values
              nestedTests = nestedTests.concat(subTests); // Add to nested tests
            } else {
              // Test name for either test
              let testName = `Expected resource ${address}[${index}] to have correct value for ${attribute}.`;
              if (testValue instanceof Function) {
                // If test is function evaluate function and return isTrueTest
                tests.push(
                  valueTest(
                    testValue,
                    instanceData[attribute],
                    testName,
                    `Expected ${address}[${index}] ${attribute}`
                  )
                );
              } else {
                // Otherwise add deepEqual test
                tests.push(
                  deepEqualTest(testName, [
                    instanceData[attribute],
                    testValue,
                    `Expected ${address}[${index}] ${attribute} to have value ${
                      typeof testValue === "object"
                        ? JSON.stringify(testValue) // print stringified json if object
                        : testValue // otherwise just value
                    }`,
                  ])
                );
              }
            }
          });
        }
        // Add all nested tests back to test
        tests = tests.concat(nestedTests);
      });
    } else {
      tests.push(
        isTrueTest(
          `Expected ${address} to contain instance data got ${undefined}`,
          [undefined, `Expected instances to be present.`]
        )
      );
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
          delete testObj[index_key].index_key;
        } else {
          // Otherwise use index of instance
          testObj[test.instances.indexOf(instance)] = instance;
        }
      });
      // build tests and add to tests
      let testData = this.buildInstanceTest(test.address, tfstate, testObj);
      instanceObject.tests.push(testData); // Push to tests
    });

    // Return instance object
    return instanceObject;
  };
};

module.exports = utils;
