const { valueFunctionTest, containsKeys, isFunction } = require("./helpers");
const { eachKey, typeCheck, emptyCheck, arrTypeCheck } = require("./utils");
const chalk = require("chalk");
const { RegexButWithWords } = require("regex-but-with-words");
const connect = require("./connect");
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
      // If the data containsKeys the key
      if (containsKeys(data, key)) {
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
          containsKeys(data, key),
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
    typeCheck(
      "tfx.expect expects append message to be a",
      "string",
      appendMessage
    );
    typeCheck(
      "tfx.expect expected evaluationFunction to be a",
      "Function",
      evaluationFunction
    );
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
    typeCheck(
      `Expected name in \`tfx.resource\` to be type of`,
      "string",
      name
    );
    typeCheck(
      `Expected address in \`tfx.resource\` to be type of`,
      "string",
      address
    );
    typeCheck(
      `Expected address in \`tfx.resource\` to be type of`,
      "object",
      values
    );
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
    typeCheck(`tfx.address expects address to be a`, "string", address);
    emptyCheck(`tfx.address expects at least one instance`, instances);
    arrTypeCheck(
      `tfx.address expected all instances to be of`,
      "object",
      instances
    );
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
    let headText =
      chalk.white(`

* tfxjs testing

`) +
      chalk.bold(`##############################################################################
# 
#`) +
      chalk.blue(`  ${tfCommand}
`) +
      chalk.bold(`#`) +
      chalk.white(`  Teplate File:
`) +
      chalk.bold(`#`) +
      chalk.blue(`     ${templatePath}${
        command === "clone" ? ` => ${destination}` : ""
      }
`) +
      chalk.bold(`# 
##############################################################################
`);
    return headText;
  },

  /**
   * Constructor to allow for easier and more readable text templates
   * @param {string} str template string
   */
  textTemplate: function (str) {
    this.template = str;
    this.str = str;
    this.templateArgs = [];
    let beforeDollarSignRegex = new RegexButWithWords()
      .negatedSet("$A-Z_")
      .done("g");
    let capsOnlyRegex = new RegexButWithWords().look
      .behind((exp) => {
        exp.literal("$").set("A-Z_").oneOrMore();
      })
      .negatedSet("A-Z_")
      .oneOrMore()
      .done("g");
    let templateVarRegex = new RegexButWithWords()
      .literal("$")
      .set("A-Z_")
      .done("g");
    // Split at chatacter before dollar sign
    str.split(beforeDollarSignRegex).forEach((substr) => {
      let capsOnly = substr.replace(capsOnlyRegex, "");
      // Push if matches valid template value
      if (capsOnly.match(templateVarRegex)) this.templateArgs.push(capsOnly);
    });

    /**
     * Fill all values in order
     * @param  {...string} values List of string values
     */
    this.fill = function (...values) {
      for (let i = 0; i < values.length; i++) {
        this.str = this.str.replace(this.templateArgs[i], values[i]);
      }
      return this.str;
    };

    /**
     * Set a value and return the text
     * @param {string} key Template key
     * @param {string} value String value to set
     * @returns {string}
     */
    this.set = function (key, value) {
      this.str = this.str.replace(key, value);
      return this.str;
    };

    /**
     * Create a clone of the text template
     * @returns {textTemplate} Text teplate object
     */
    this.clone = function () {
      return new builders.textTemplate(this.template);
    };
  },

  connect : {
    udp: {
      doesConnect: (package, host, port, timeout) => {
        return new connect({ exec: package }).udpTest(host, port, false, timeout);
      },
      doesNotConnect: (package, host, port, timeout) => {
        return new connect({ exec: package }).udpTest(host, port, true, timeout);
      }
    }
  }
};



module.exports = builders;
