/**
 * Helpers
 * --------
 * Functions that do not require context live here
 */

const helpers = {
  /**
   * Test to ensure evaluation as a function is possible. Evaluataion functions must return
   * two params `appendMessage` and `expectedData`. `expectedData` must evaluate to a boolean
   * and `appendMessage` must be a string
   * @param {Function} evalFunction Function being passed as a test
   * @param {} evalParams Any parameter to use the function to evaluate
   * @returns results of function with eval params
   */
  valueFunctionTest: function (evalFunction, evalParams) {
    let results;
    if (evalParams) {
      results = evalFunction(evalParams);
    } else {
      results = {
        appendMessage: "to exist in module, got undefined.",
        expectedData: false,
      };
    }
    let resultKeys = Object.keys(results);
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
    return results;
  },

  /**
   * helper function to see if an object contains a key
   * @param {Object} object Any object
   * @param {string} str Name of the key to find
   * @returns true if contains, false if does not
   */
  keysContains: function (object, str) {
    // Return opposite of indexOf === -1, in this case === -1 is the false condition
    return !(Object.keys(object).indexOf(str) === -1);
  },

  /**
   * Check resource tests for module
   * @param resources Array of resource objects
   */
  checkResourceTests: function (resources) {
    resources.forEach((test) => {
      ["name", "address"].forEach((field) => {
        if (!helpers.keysContains(test, field))
          throw new Error(
            `Tests object requires \`name\` and \`test\` parameter. Got ${JSON.stringify(
              test,
              null,
              2
            )}`
          );
      });
      if (!helpers.keysContains(test, "values")) {
        test.values = {};
      } else {
        if (Array.isArray(test.values)) {
          throw new Error(
            `Values fields for test objects must be type object, got Array:\n${JSON.stringify(
              test,
              null,
              2
            )}`
          );
        } else if (typeof test.values !== "object") {
          throw new Error(
            `Values fields for test objects must be type object, got ${typeof test.values}:\n${JSON.stringify(
              test,
              null,
              2
            )}`
          );
        }
      }
    });
  },

  /**
   * Helper function that takes in a resource from the tfstate and returns a name based on module type and name
   * @param {Object} resource terraform state object
   * @returns A string of the composed name
   */
  composeName: function (resource) {
    let composedName = "";
    // Add mode, but only if mode === data
    ["module", "mode", "type", "name"].forEach((field) => {
      if (
        field !== "mode" ||
        (field === "mode" && resource[field] === "data")
      ) {
        composedName += resource[field]; // Add to string
        if (field !== "name") composedName += "."; // Add . if not name
      }
    });
    return composedName;
  },

  /**
   * Find a child from a child array
   * @param {string} parentAddress Address to check
   * @param {Array} childArray array of
   * @returns Object with contains module and module data
   */
  childArraySearch: function(parentAddress, childArray) {
    let returnData = {
      containsModule: false,
      moduleData: undefined
    }
    childArray.forEach(child => {
      if(child.address == parentAddress) {
        returnData.containsModule = true
        returnData.moduleData = child
      }
    })
    return returnData;
  },

  /**
   * It goes through a list of resources in a module and returns a list of those not found in expected resources
   * @param {Array} moduleDataResources module.resources
   * @param {string} address address to look for in resources
   * @param {Array<string>} expectedResourceList Array of expected resource addressess
   * @returns Array of found resource not expcted
   */
  getFoundResources: function(moduleDataResources, address, expectedResourceList) {
    let foundResources = [];
    moduleDataResources.forEach(resource => {
      let composedAddress = address === "" ? resource.address : `${address}.${resource.address}`;
      if(expectedResourceList.indexOf(composedAddress) === -1)
        foundResources.push(resource.address)
    })
    return foundResources;
  },

  /**
   * Returns populated object based on options
   * @param {Object} options test module options
   * @returns object of composed options
   */
  parseTestModuleOptions: function(options) {
    let defaultOptions = {
      moduleName: "",
      address: "",
      tfData: options.tfData,
      testList: [],
      isApply: false,
      callback: function () {}
    }
    Object.keys(defaultOptions).forEach(key => {
      if(key != "tfData" && helpers.keysContains(options, key)) {
        defaultOptions[key] = options[key]
      }
    }) 
    return defaultOptions;
  }
};

module.exports = helpers;
