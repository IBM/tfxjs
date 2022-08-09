/**
 * Terraform Test Utils
 */

const { assert } = require("chai");
const {
  // Builders for test data
  isTrueTest, // isTrue assertion
  notFalseTest, // isNotFalse assertion
  deepEqualTest, // deepEqual assertion
  eachKeyTest, // run a test for each key in an array
  valueTest, // eval function and return data
} = require("./builders");

const {
  // Helpers
  containsKeys,
  checkModuleTest,
  expectedResourceAddress,
  getFoundResources,
  parseTestModuleOptions,
  composeName,
  isFunction,
} = require("./helpers");
const helpers = require("./helpers");
const { eachKey, keyCheck } = require("./utils");
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const connect = require("./connect");

/**
 * tfxjs utilities constructor
 * @param {string} templatePath Path to template
 * @param {string} apiKeyVariableName Name of the variable to be used
 * @param {Object?} options Optional values for testing
 * @param {Function} options.overrideAssert Override Mocha assert
 * @param {Function} options.overrideDescribe Override Mocha describe
 * @param {Function} options.overrideIt Override Mocha it
 */

const utils = function (options) {
  // Initialize it, describe, override defaults for testing
  this.it = containsKeys(options, "overrideIt") ? options.overrideIt : it;
  this.describe = containsKeys(options, "overrideDescribe")
    ? options.overrideDescribe
    : describe;
  this.assert = containsKeys(options, "overrideAssert")
    ? options.overrideAssert
    : assert;
  this.exec = containsKeys(options, "overrideExec")
    ? options.overrideExec
    : exec;


  this.connect = {
    connectionTest: function(callback) {
      function addressTest(address) {
        callback(address);
      }
      return addressTest;
    },
    udp: {
      doesConnect: ( host, port, timeout) => {
        return new connect({ exec: this.exec }).udpTest(host, port, false, timeout);
      },
      doesNotConnect: ( host, port, timeout) => {
        return new connect({ exec: this.exec }).udpTest(host, port, true, timeout);
      }
    }
  };

  /**
   * Create a set of unit tests for a single resource in a plan this is called by `testModule`
   * @param {string} resourceName The plain text name of the resource to test
   * @param {Object} moduleData Terraform plan data
   * @param {string} address Address of the resource within the module
   * @param {Object} planValues An object containing values found in the values object of resource object within the plan
   * @returns {{describe = string, tests = Array}} JSON test data
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

    let containsKeysModule = false; // object containsKeys module
    let containsKeysModuleData = helpers.containsKeysModule(
      moduleData,
      address
    ); // Get module data if possible

    if (typeof containsKeysModuleData === "boolean") {
      containsKeysModule = containsKeysModuleData; // If containsKeys module data is boolean set to containsKeys module
    } else {
      // Otherwise set these from data
      (containsKeysModule = containsKeysModuleData.containsKeysModule),
        (parentAddress = containsKeysModuleData.parentAddress),
        (moduleData = containsKeysModuleData.moduleData);
    }
    // Push test to test data
    testData.tests.push(
      isTrueTest(`Plan should contain the module ${address}`, [
        containsKeysModule,
        `The module ${address} should exist in the terraform plan.`,
      ])
    );
    // list of expected resources
    let expectedResources = [];
    // If module is there and resources
    if (containsKeysModule && resources.length > 0) {
      // For each resource
      resources.forEach((resource) => {
        // Add resource to expected resources
        let expResourceAddress = expectedResourceAddress(
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
    if (containsKeysModule && moduleData !== undefined) {
      if (moduleData.resources) {
        // For each resource in the module
        foundResources = getFoundResources(
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
    keyCheck("options must be passed with key", options, ["tfData"]);

    // Parse data
    let buildOptions = parseTestModuleOptions(options);

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
        if (containsKeys(test, "connectionTests")) {
          // another describe
          // run all connection tests
          this.describe(test.describe + " connection tests", () => {
            test.connectionTests.forEach((connectionTest) => {
              this.it(connectionTest.name, () => {
                return connectionTest.fn(connectionTest.arg);
              })
            })
          })
        }
        if (containsKeys(test, "describe")) {
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
      let fullName = composeName(resource); // Full composed name of resource
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

    // Connection tests
    let connectionTests = [];

    if (
      resourceData !== false &&
      instanceValues &&
      containsKeys(resourceData, "instances")
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
              // Add test for key containsKeys
              nestedTests.push(
                notFalseTest(
                  `Expected resource ${address}[${index}] to have value for ${attribute}`,
                  [
                    containsKeys(instanceData, attribute),
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
              if (isFunction(testValue)) {

                if (testValue.name === "addressTest") {
                  console.log(instanceData[attribute]);
                  connectionTests.push({
                    name: testValue.name,
                    arg: instanceData[attribute],
                    fn: testValue,
                  });
                }
                else {
                  // If test is function evaluate function and return isTrueTest
                  tests.push(
                    valueTest(
                      testValue,
                      instanceData[attribute],
                      testName,
                      `Expected ${address}[${index}] ${attribute}`
                    )
                  );
                }
          
                
              } else {
                console.log(typeof testValue);
                if (typeof testValue === "object" && isFunction(testValue.then)) {
                  tests.push(testValue);

                }
                else {// Otherwise add deepEqual test
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
    // console.log(JSON.stringify(tests, null, 2));
    return {
      describe: address,
      tests: tests,
      connectionTests: connectionTests
    }
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
