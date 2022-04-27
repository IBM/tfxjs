const {
  valueFunctionTest,
  eachKey,
  keysContains,
  isFunction,
} = require("./helpers");

const builders = {
  /**
   * Create an object for a mocha test
   * @param {string} name Name of the test
   * @param {string} assertionType Assertion type
   * @param {Array} assertionArgs Arguments
   */
  mochaTest: function (name, assertionType, assertionArgs) {
    this.name = name || "";
    this.assertionType = assertionType || "";
    this.assertionArgs = assertionArgs || [];
    /**
     * Return the value of a test
     * @returns {{name: string, assertionType: string, assertionArgs: Array}} Object containing needed values to run test
     */
    this.send = () => {
      return {
        name: this.name,
        assertionType: this.assertionType,
        assertionArgs: this.assertionArgs,
      };
    };
    /**
     * Set assertion type of a test
     * @param {string} type assertion type for the function
     */
    this.setType = (type) => {
      if (typeof type !== "string")
        throw new Error(
          `Test ${
            this.name
          } expected type of string for setType, got ${typeof type}`
        );
      this.assertionType = type;
    };
    /**
     * Set assertion arguments
     * @param {Array} arr Array of arguments
     */
    this.setArgs = (arr) => {
      if (!Array.isArray(arr))
        throw new Error(
          `Test ${
            this.name
          } expected type of Array for setArgs, got ${typeof arr}`
        );
      this.assertionArgs = arr;
    };
  },
  /**
   * Create an object for a isNotFalse assertion mocha test and return data
   * @param {string} name Name of the test
   * @param {Array} assertionArgs Arguments
   * @returns {{name: string, assertionType: string, assertionArgs: Array}} Object containing needed values to run test
   */
  notFalseTest: (name, assertionArgs) => {
    return new builders.mochaTest(name, "isNotFalse", assertionArgs).send();
  },

  /**
   * Create an object for a isTrue assertion mocha test and return data
   * @param {string} name Name of the test
   * @param {Array} assertionArgs Arguments
   * @returns {{name: string, assertionType: string, assertionArgs: Array}} Object containing needed values to run test
   */
  isTrueTest: (name, assertionArgs) => {
    return new builders.mochaTest(name, "isTrue", assertionArgs).send();
  },

  /**
   * Create an object for a deepEqual assertion mocha test and return data
   * @param {string} name Name of the test
   * @param {Array} assertionArgs Arguments
   * @returns {{name: string, assertionType: string, assertionArgs: Array}} Object containing needed values to run test
   */
  deepEqualTest: (name, assertionArgs) => {
    return new builders.mochaTest(name, "deepEqual", assertionArgs).send();
  },

  /**
   * Test each key in an object of values against data
   * @param {string} address Resource Address
   * @param {Object} values key value pair of values to check in the data object
   * @param {Object} data data values that values is checking against
   * @param {string} type Can either be plan or state
   * @param {string} attribute Name of the attribute to check
   * @param {number} index Index of the instance, only used in state tests
   * @returns {Array} Array of tests for the value
   */
  eachKeyTest: (address, values, data, type, attribute, index) => {
    let testList = []; // List of tests to return
    eachKey(values, (key) => {
      let test =
        type == "plan" // If type is plan return plan messages
          ? {
              name: `${attribute} should have the correct ${key} value`,
              fnMessage: `Expected ${address} resource ${key} value`,
              equalMessage: `Expected ${address} to have correct value for ${key}.`,
              undefinedMessage: `Expected ${address} to have correct value for ${key} got undefined.`,
            }
          : {
              // Otherwise return state messages
              name: `Expected resource ${address}[${index}] to have correct value for ${attribute}[${index}].${key}`,
              fnMessage: `Expected ${address}[${index}] attribute ${attribute}[${index}].${key}`,
              equalMessage: `Expected ${address}[${index}] attribute ${attribute}[${index}].${key} to be ${values[key]}`,
              undefinedMessage: `Expected ${address}[${index}] attribute ${attribute}.${key} to exist`,
            };
      let testValue; // Storage for test
      // If the data contains the key
      if (keysContains(data, key)) {
        if (isFunction(values[key])) {
          testValue = builders.valueTest(
            values[key],
            data[key],
            test.name,
            test.fnMessage
          );
        } else {
          // Otherwise create a deepEqual test to assert values match
          testValue = builders.deepEqualTest(test.name, [
            data[key],
            values[key],
            test.equalMessage,
          ]);
        }
      } else {
        // If not found, create a notfalse test
        testValue = builders.notFalseTest(test.name, [
          keysContains(data, key),
          test.undefinedMessage,
        ]);
      }
      // Add test to list
      testList.push(testValue);
    });
    return testList; // Return tests
  },

  /**
   * Run a value function test and return is true test
   * @param {Function} valueFunction value evaluation function
   * @param {Object} testData data to evaluate
   * @param {string} testName Name of the test
   * @param {string} testMessage Message to send with test
   * @returns {{name: string, assertionType: string, assertionArgs: Array}} Object containing needed values to run test
   */
  valueTest: function (valueFunction, testData, testName, testMessage) {
    let results = valueFunctionTest(valueFunction, testData);
    return builders.isTrueTest(testName, [
      results.expectedData,
      testMessage + " " + results.appendMessage,
    ]);
  },

  /**
   * Create a compiled function to run against a value
   * @param {string} appendMessage Append to end of message Expected resource to ... + appendMessage
   * @param {Function} evaluationFunction Function to be used for evaluation. Must evaluate to boolean value
   * @returns Validation Function
   */
  eval: function (appendMessage, evaluationFunction) {
    if (typeof appendMessage !== "string") {
      throw new Error(
        "tfx.expect expects append message to be a string got " +
          typeof appendMessage
      );
    } else if (!isFunction(evaluationFunction)) {
      throw new Error(
        "tfx.expect expected evaluationFunction to be a function"
      );
    }
    return function (value) {
      let testValue = evaluationFunction(value);
      return {
        appendMessage: appendMessage,
        expectedData: testValue,
      };
    };
  },
  /**
   * Creates a resource object for acceptence tests. Used with `tfx.plan`.
   * @param {string} name Decorative name for module test
   * @param {string} address Address relative to the module being tested (ex. use `test.resource` for `module.example.test.resource` when testing in `module.example`)
   * @param {Object} values Arbitrary values to test that exist in Terraform Plan
   * @returns {Object{name=string address=string values=object}}
   */
  resource: function (name, address, values) {
    if (arguments.length !== 3) {
      throw new Error(
        `Resource function expected three values got ${arguments.length}`
      );
    } else {
      ["0", "1", "2"].forEach((index) => {
        let currentArg = arguments[index];
        if (
          index === "2" &&
          (typeof currentArg !== "object" || Array.isArray(currentArg))
        ) {
          throw new Error(
            `Expected type of object for values, got ${
              Array.isArray(currentArg) ? "Array" : typeof currentArg
            }`
          );
        } else if (typeof currentArg !== "string" && index !== "2") {
          throw new Error(
            `Expected type of string for ${
              index === "1" ? "address" : "name"
            } got ${typeof currentArg}`
          );
        }
      });
    }
    return {
      name: name,
      address: address,
      values: values,
    };
  },
  /**
   * Check values for a resource against terraform state after apply
   * @param {string} address Composed resource address ex "module.example_module.random_pet.random_example"
   * @param {...Object} instances instances to test
   * @returns {{address=string instances=array}} Returns the object for instance
   */
  address: function (address, ...instances) {
    if (typeof address !== "string") {
      throw new Error(
        `tfx.address expects address to be a string got ${typeof address}`
      );
    }
    if (instances.length === 0) {
      throw new Error(
        `tfx.address expects at least one instance got ${instances.length}`
      );
    }

    let instanceTypes = [];
    let allObjects = true;
    instances.forEach((instance) => {
      instanceTypes.push(Array.isArray(instance) ? "Array" : typeof instance);
      if (typeof instance !== "object" || Array.isArray(instance)) {
        allObjects = false;
      }
    });
    if (!allObjects) {
      throw new Error(
        `tfx.address expected all instances to be of type Object got ${JSON.stringify(
          instanceTypes
        )}`
      );
    }

    return {
      address: address,
      instances: instances,
    };
  },

  /**
   * Create decorative header for running tests
   * @param {string} templatePath Path of rempla
   * @param {string} command Command being run
   * @param {string?} destination Destination, added only when command is clone
   * @returns {string} Header template to print
   */
  testHead: function (templatePath, command, destination) {
    let tfCommand = `Running \`terraform ${command}\``;
    if (command === "clone") {
      tfCommand = `Creating clone template workspace`;
    }
    let headText = `

* tfxjs testing

##############################################################################
# 
#  ${tfCommand}
#  Teplate File:
#     ${templatePath}${command === "clone" ? ` => ${destination}` : ""}
# 
##############################################################################
`;
    return headText;
  },
};

module.exports = builders;
