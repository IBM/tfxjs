const { valueFunctionTest } = require("./helpers");

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
  }
};

module.exports = builders;
