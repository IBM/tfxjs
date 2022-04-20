/**
 * Helpers
 * --------
 * Functions that do not require context live here
 * Any function that creates a warning when running test coverage should be separated and
 * put here
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
    let results; // Value store for result
    if (evalParams) {
      // If params are passed, set result
      results = evalFunction(evalParams);
    } else {
      // Otherwise set to generic undefined
      results = {
        appendMessage: "to exist in module, got undefined.",
        expectedData: false,
      };
    }
    // List of result keys
    let resultKeys = Object.keys(results);
    if (
      resultKeys.length !== 2 || // if length is not 2
      !helpers.keysContains(results, "appendMessage") || // Or doesn't contain appendMessage
      !helpers.keysContains(results, "expectedData") // OR doesn't contain expected data
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
    // Return results
    return results;
  },

  /**
   * helper function to see if an object contains a key
   * @param {Object} object Any object
   * @param {string} str Name of the key to find
   * @returns true if contains, false if does not or is not an object
   */
  keysContains: function (object, str) {
    // Return opposite of indexOf === -1, in this case === -1 is the false condition
    return typeof object === "object"
      ? !(Object.keys(object).indexOf(str) === -1)
      : false;
  },

  /**
   * Check resource tests for module
   * @param resources Array of resource objects
   */
  checkResourceTests: function (resources) {
    if(!Array.isArray(resources)) {
      throw new Error("Expected resource tests to be an array got " + typeof resources + ".")
    }
    // For each resource test
    resources.forEach((test) => {
      // For each mandatory field
      ["name", "address"].forEach((field) => {
        // If the field is not contained
        if (!helpers.keysContains(test, field))
          // Throw a new error
          throw new Error(
            `Tests object requires \`name\` and \`address\` parameter. Got ${JSON.stringify(
              test,
              null,
              2
            )}`
          );
      });
      if (!helpers.keysContains(test, "values")) {
        // If no values set values to empty object
        test.values = {};
      } else {
        // If test values is an array, throw an error
        if (Array.isArray(test.values)) {
          throw new Error(
            `Values fields for test objects must be type object, got Array:\n${JSON.stringify(
              test,
              null,
              2
            )}`
          );
        } else if (typeof test.values !== "object") {
          // If test values is not an object throw an error
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
    let composedName = ""; // String to be returned
    let fields = ["type", "name"]; // Default fields

    // if resource mode is data add mode to fields
    if (resource.mode === "data") {
      fields.unshift("mode");
    }
    // If the resource has a module, add module
    if (helpers.keysContains(resource, "module")) {
      fields.unshift("module");
    }
    // For each field
    fields.forEach((field) => {
      composedName += resource[field]; // Add to string
      if (field !== "name") composedName += "."; // Add . if not name
    });
    // Return name
    return composedName;
  },

  /**
   * Find a child from a child array
   * @param {string} parentAddress Address to check
   * @param {Array} childArray array of
   * @returns Object with contains module and module data
   */
  childArraySearch: function (parentAddress, childArray) {
    // Object to be returned
    let returnData = {
      containsModule: false, // does the array contain the module
      moduleData: undefined, // module data
    };
    // For each child in the array
    childArray.forEach((child) => {
      // if the child array is the address to check
      if (child.address == parentAddress) {
        returnData.containsModule = true; // Contains module becomes true
        returnData.moduleData = child; // Module data
      } else if (child?.child_modules && !returnData.containsModule) {
        let subChildSearch = helpers.childArraySearch(parentAddress, child.child_modules);
        returnData = subChildSearch;
      }
    });
    // Return the data
    return returnData;
  },

  /**
   * It goes through a list of resources in a module and returns a list of those not found in expected resources
   * @param {Array} moduleDataResources module.resources
   * @param {string} address address to look for in resources. Send empty string to check resources in root_module
   * @param {Array<string>} expectedResourceList Array of expected resource addressess
   * @returns {Array<string>} Array of found resource not expected
   */
  getFoundResources: function (
    moduleDataResources,
    address,
    expectedResourceList
  ) {
    // List of resources found
    let foundResources = [];
    // For each resource
    moduleDataResources.forEach((resource) => {
      // Create a composed address
      // If the resource is in root module, use only the resource address
      // Otherwise join the address and resource address
      let composedAddress =
        address === "" ? resource.address : `${address}.${resource.address}`;
      // If a resource is found but not expected add to list
      if (expectedResourceList.indexOf(composedAddress) === -1)
        foundResources.push(resource.address);
    });
    // Return the array
    return foundResources;
  },

  /**
   * Returns populated object based on options
   * @param {Object} options test module options
   * @returns {moduleName: string, address: string, tfData: Object, testList: Array, isApply: boolean, callback: Function} object of composed options
   */
  parseTestModuleOptions: function (options) {
    // Initiate defaults
    let defaultOptions = {
      moduleName: "",
      address: "",
      tfData: options.tfData,
      testList: [],
      isApply: false,
      callback: false,
    };
    // for each option in default options
    helpers.eachKey(defaultOptions, (key) => {
      // If the key is not tfData (required) and the options contains that key
      if (key != "tfData" && helpers.keysContains(options, key)) {
        // change defaults to the new options
        defaultOptions[key] = options[key];
      }
    });
    // Return object
    return defaultOptions;
  },

  /**
   * Checks module test for errors and returns needed data
   * @param {string} address  Module address. Should be relative to the parent module
   * @param {Object} tfPlan Terraform plan Object
   * @returns {parentAddress: string, moduleData: Object} Data to sent module data and parent address
   */
  checkModuleTest: function (address, tfPlan) {
    let moduleData, parentAddress; // Module data and parent address to return on successful completion
    try {
      if (address === "root_module") {
        moduleData = tfPlan.root_module; // Set module data as root modue if address is root_module
        moduleData.address = "root_module"; // Set address
        parentAddress = ""; // Set parent address to empty string
      } else {
        // Get module data and set
        moduleData = tfPlan.root_module;
        delete moduleData.address 
      }
      if (
        parentAddress === "" &&
        !helpers.keysContains(moduleData, "resources") // If the root module doesn't have resources throw an error
      ) {
        throw new Error(
          "Expected root module to have resources. Check your plan configuration and try again."
        );
      } else if (parentAddress === "" && moduleData.resources.length === 0) {
        // If root module doesn't have objects
        throw new Error(
          "Expected root_modules to contain at least one resource. Check your plan configuration and try again."
        );
      } else if (
        parentAddress === undefined && // If no parent address
        tfPlan.root_module.child_modules.length < 1 // and no child modules throw an error
      ) {
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
      } else if (
        tfPlan.root_module.child_modules == undefined && // If no child modules
        parentAddress === undefined // and no parent address
      ) {
        // throw if no child_modules
        throw new Error(
          "Expected terraform plan root_module to have child_modules. Check your plan configuration and try again."
        );
      } else {
        throw err; // throw errors from first half of try
      }
    }
    return {
      moduleData: moduleData,
      parentAddress: parentAddress,
    };
  },

  /**
   * Shortcut for Object.keys(object).forEach(i=>{})
   * @param {Object} obj Object to call
   * @param {Function(key)} callback Callback function to run
   */
  eachKey: function (obj, callback) {
    if (typeof obj !== "object" || Array.isArray(obj)) {
      throw new Error(
        `eachKey expects the the first argument to be an Object got ${
          Array.isArray(obj) ? "Array" : typeof obj
        }`
      );
    } else if (!(callback instanceof Function)) {
      throw new Error(
        "eachKey expects a function for callback, got " + typeof callback
      );
    } else {
      let stringifiedFunction = callback.toString();
      let argumentString = stringifiedFunction
        .replace(/\s/g, "") // Remove all spaces
        .replace(/(?<=(function\s[A-z]*)?\s?\(?.*\)?\s?(=>)?\s?)\{.+/g, "") // Remove everything after function declaration
        .replace(/(function\w+|=>|\(|\))/g, ""); // Remove function => operator and parentheses and any function name
      if(argumentString.split(",").length > 1) {
        throw new Error(`eachKey callback function accepts only one argument got ` + JSON.stringify(argumentString.split(",")))
      }     
    }
    // Run the callback
    Object.keys(obj).forEach((i) => callback(i));
  },

  /**
   * Check to see if a module contains an address
   * @param {Object} moduleData Object of module data
   * @param {string} address Address to find
   * @returns boolean if address match or unfound, otherwise reutrns object with containsModule, moduleData, and parentAddress
   */
  containsModule: function(moduleData, address) {
    if(moduleData.address === address) {
      return true;
    } else {
      try {
        let parentAddress = moduleData.address === undefined ? address :  moduleData.address + "." + address; // Set parent address to parent.child
        let childArray = moduleData.child_modules; // get child modules
        let searchData = helpers.childArraySearch(parentAddress, childArray); // Look for the child module
        return {
          containsModule: searchData.containsModule, // get search data
          moduleData: searchData.moduleData, // get module data 
          parentAddress: parentAddress // return parent address
        }
      } catch {
        return false;
      }
    }
  },

  /**
   * Generate the string for resource expectation address
   * @param {string=} parentAddress Parent address of resources
   * @param {string} resourceAddress actual address of resource
   * @param {string} address address passed 
   * @returns string for expected address
   */
  expectedResourceAddress: function(parentAddress, resourceAddress, address) {
    if(parentAddress === "") {
      return resourceAddress
    } else if (parentAddress) {
      return `${parentAddress}.${resourceAddress}`
    } else {
      return address + "." + resourceAddress
    }
  }
};

// Export helper module
module.exports = helpers;
