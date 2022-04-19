const { valueFunctionTest, eachKey, keysContains } = require("./helpers");

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
    let testList = [] // List of tests to return
    eachKey(values, (key) => {
      let test = (
        type == "plan" // If type is plan return plan messages
        ? {
          name: `${attribute} should have the correct ${key} value`,
          fnMessage: `Expected ${address} resource ${key} value`,
          equalMessage: `Expected ${address} to have correct value for ${key}.`,
          undefinedMessage: `Expected ${address} to have correct value for ${key} got undefined.`
        }
        : { // Otherwise return state messages
          name: `Expected resource ${address}[${index}] to have correct value for ${attribute}[${index}].${key}`,
          fnMessage: `Expected ${address}[${index}] attribute ${attribute}[${index}].${key}`,
          equalMessage: `Expected ${address}[${index}] attribute ${attribute}[${index}].${key} to be ${values[key]}`,
          undefinedMessage: `Expected ${address}[${index}] attribute ${attribute}.${key} to exist`
        }
      )
      let testValue // Storage for test
      // If the data contains the key
      if(keysContains(data, key)) {
        if(values[key] instanceof Function) {
          testValue = builders.valueTest(
            values[key],
            data[key],
            test.name,
            test.fnMessage
          )
        } else {
          // Otherwise create a deepEqual test to assert values match
          testValue = builders.deepEqualTest(
            test.name,
            [
              data[key],
              values[key],
              test.equalMessage
            ]
          )
        }
      } else {
        // If not found, create a notfalse test
        testValue = builders.notFalseTest(
          test.name,
          [
            keysContains(data, key),
            test.undefinedMessage
          ]
        )
      }
      // Add test to list
      testList.push(testValue)
    })
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
  valueTest: function(valueFunction, testData, testName, testMessage){
    let results = valueFunctionTest(valueFunction, testData);
    return builders.isTrueTest(
      testName,
      [
        results.expectedData,
        testMessage + " " + results.appendMessage
      ]
    )
  }
};

module.exports = builders;
