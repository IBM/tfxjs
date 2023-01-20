/**
 * Helpers
 * --------
 * Functions that do not require context live here
 * Any function that creates a warning when running test coverage should be separated and
 * put here
 *
 */

const {
  containsKeys,
  typeCheck,
  keyCheck,
  getType,
  contains,
  keys,
  eachKey,
  deepEqual,
  azsort,
} = require("lazy-z");
const chalk = require("chalk");
const { RegexButWithWords } = require("regex-but-with-words");
const constants = require("./constants");

/**
 * throw error with chalk.red
 * @param {string} str error message
 * @throws error with red text
 */
function throwRedText(str) {
  throw new Error(chalk.red(str));
}

/**
 * Test to ensure evaluation as a function is possible. Evaluataion functions must return
 * two params `appendMessage` and `expectedData`. `expectedData` must evaluate to a boolean
 * and `appendMessage` must be a string
 * @param {Function} evalFunction Function being passed as a test
 * @param {} evalParams Any parameter to use the function to evaluate
 * @returns results of function with eval params
 */
function valueFunctionTest(evalFunction, evalParams) {
  let results = {
    appendMessage: "to exist in module, got undefined.",
    expectedData: false,
  };

  if (evalParams) {
    // If params are passed, set result
    results = evalFunction(evalParams);
    keyCheck(
      "Value functions require",
      results,
      ["expectedData", "appendMessage"],
      true
    );
    typeCheck(
      "Value functions must evaluate to",
      "boolean",
      results.expectedData
    );
    typeCheck(
      "Value functions appendMessage must be",
      "string",
      results.appendMessage
    );
  }
  // Return results
  return results;
}

/**
 * Check resource tests for module
 * @param resources Array of resource objects
 */
function checkResourceTests(resources) {
  typeCheck("Expected resource tests to be", "Array", resources);
  resources.forEach((test) => {
    keyCheck("Test objects require", test, ["name", "address"]);
    if (!containsKeys(test, "values")) test.values = {};
    typeCheck(
      `Value fields for test objects must be type`,
      "object",
      test.values
    );
  });
}

/**
 * Helper function that takes in a resource from the tfstate and returns a name based on module type and name
 * @param {Object} resource terraform state object
 * @returns {string} A string of the composed name
 */
function composeName(resource) {
  let composedName = ""; // String to be returned
  let fields = ["type", "name"]; // Default fields

  // if resource mode is data add mode to fields
  if (resource.mode === "data") {
    fields.unshift("mode");
  }
  // If the resource has a module, add module
  if (containsKeys(resource, "module")) {
    fields.unshift("module");
  }
  // For each field
  fields.forEach((field) => {
    composedName += resource[field]; // Add to string
    if (field !== "name") composedName += "."; // Add . if not name
  });
  // Return name
  return composedName;
}

/**
 * Find a child from a child array
 * @param {string} parentAddress Address to check
 * @param {Array} childArray array of
 * @returns Object with containsKeys module and module data
 */
function childArraySearch(parentAddress, childArray) {
  // Object to be returned
  let returnData = {
    containsKeysModule: false, // does the array contain the module
    moduleData: undefined, // module data
  };
  // For each child in the array
  childArray.forEach((child) => {
    // if the child array is the address to check
    if (child.address == parentAddress) {
      returnData.containsKeysModule = true; // containsKeys module becomes true
      returnData.moduleData = child; // Module data
    } else if (child?.child_modules && !returnData.containsKeysModule) {
      let subChildSearch = childArraySearch(parentAddress, child.child_modules);
      returnData = subChildSearch;
    }
  });
  return returnData;
}

/**
 * It goes through a list of resources in a module and returns a list of those not found in expected resources
 * @param {Array} moduleDataResources module.resources
 * @param {string} address address to look for in resources. Send empty string to check resources in root_module
 * @param {Array<string>} expectedResourceList Array of expected resource addressess
 * @returns {Array<string>} Array of found resource not expected
 */
function getFoundResources(moduleDataResources, address, expectedResourceList) {
  // List of resources found
  let foundResources = [];
  expectedResourceList = expectedResourceList.sort(azsort);
  // For each resource
  moduleDataResources.forEach((resource) => {
    // If the resource is in root module, use only the resource address
    // Otherwise join the address and resource address
    let composedAddress =
      address === "" ? resource.address : `${address}.${resource.address}`;
    // If a resource is found but not expected add to list
    if (expectedResourceList.indexOf(composedAddress) === -1)
      foundResources.push(resource.address);
  });
  // Return the array
  return foundResources.sort(azsort);
}

/**
 * Returns populated object based on options
 * @param {Object} options test module options
 * @returns {moduleName: string, address: string, tfData: Object, testList: Array, isApply: boolean, callback: Function} object of composed options
 */
function parseTestModuleOptions(options) {
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
  eachKey(defaultOptions, (key) => {
    // If the key is not tfData (required) and the options containsKeys that key
    if (key != "tfData" && containsKeys(options, key)) {
      // change defaults to the new options
      defaultOptions[key] = options[key];
    }
  });
  // Return object
  return defaultOptions;
}

/**
 * Checks module test for errors and returns needed data
 * @param {string} address  Module address. Should be relative to the parent module
 * @param {Object} tfPlan Terraform plan Object
 * @returns {parentAddress: string, moduleData: Object} Data to sent module data and parent address
 */
function checkModuleTest(address, tfPlan) {
  let moduleData, parentAddress; // Module data and parent address to return on successful completion
  try {
    if (address === "root_module") {
      moduleData = tfPlan.root_module; // Set module data as root modue if address is root_module
      moduleData.address = "root_module"; // Set address
      parentAddress = ""; // Set parent address to empty string
    } else {
      // Get module data and set
      moduleData = tfPlan.root_module;
      delete moduleData.address;
    }
    if (parentAddress === "" && !containsKeys(moduleData, "resources")) {
      throwRedText(constants.errors.no_resources_root_module);
    } else if (parentAddress === "" && moduleData.resources.length === 0) {
      throwRedText(constants.errors.no_resources_in_root_module_list);
    } else if (
      parentAddress === undefined &&
      tfPlan.root_module.child_modules.length < 1
    ) {
      throwRedText(constants.errors.no_parent_address_no_child_modules);
    }
  } catch (err) {
    // Handle errors for plan
    if (tfPlan.root_module == undefined) {
      throwRedText(constants.errors.no_root_module);
    } else if (
      tfPlan.root_module.child_modules == undefined &&
      parentAddress === undefined
    ) {
      throwRedText(constants.errors.no_parent_no_root_no_child_modules);
    } else {
      throw err; // throw errors from first half of try
    }
  }
  return {
    moduleData: moduleData,
    parentAddress: parentAddress,
  };
}

/**
 * Check to see if a module containsKeys an address
 * @param {Object} moduleData Object of module data
 * @param {string} address Address to find
 * @returns boolean if address match or unfound, otherwise reutrns object with containsKeysModule, moduleData, and parentAddress
 */
function containsKeysModule(moduleData, address) {
  if (moduleData.address === address) {
    return true;
  } else {
    try {
      let parentAddress =
        moduleData.address === undefined
          ? address
          : moduleData.address + "." + address; // Set parent address to parent.child
      let childArray = moduleData.child_modules; // get child modules
      let searchData = childArraySearch(parentAddress, childArray); // Look for the child module
      return {
        containsKeysModule: searchData.containsKeysModule, // get search data
        moduleData: searchData.moduleData, // get module data
        parentAddress: parentAddress, // return parent address
      };
    } catch {
      return false;
    }
  }
}

/**
 * Generate the string for resource expectation address
 * @param {string=} parentAddress Parent address of resources
 * @param {string} resourceAddress actual address of resource
 * @param {string} address address passed
 * @returns string for expected address
 */
function expectedResourceAddress(parentAddress, resourceAddress, address) {
  if (parentAddress === "") {
    return resourceAddress;
  } else if (parentAddress) {
    return `${parentAddress}.${resourceAddress}`;
  } else {
    return address + "." + resourceAddress;
  }
}

/**
 * Check to ensure only primitive types for tfvars
 * @param {Object} tfvarObject
 */
function tfVarCheck(tfvarObject) {
  let errList = [];
  eachKey(tfvarObject, (key) => {
    if (
      ["string", "number", "boolean"].indexOf(typeof tfvarObject[key]) === -1
    ) {
      errList.push(
        `Expected type of string, number, or boolean for ${key} got ${typeof key}`
      );
    }
  });
  if (errList.length !== 0) {
    throwRedText(errList.join("\n"));
  }
}

/**
 * capitalize words separated by spaces
 * @param {string} str string data
 * @returns {string} capitalize words
 */
function capitalizeWords(str) {
  typeCheck("capitalizeWords expects value", "string", str);
  let words = str.split(/\s/); // split words
  let newWords = []; // new values
  words.forEach((word) => {
    let splitWord = word.split("");
    splitWord[0] = splitWord[0].toUpperCase();
    newWords.push(splitWord.join(""));
  });
  // replace spaces
  return newWords.join(" ");
}

/**
 * Remove all null values from an object
 * @param {Object} obj Object with values to remove
 * @param {boolean} shallow Only return top level null values
 * @returns {Object} Object without null values
 */
function deepObjectIgnoreNullValues(obj, shallow) {
  if (deepEqual(obj, { identifier: null })) {
    return obj;
  } else if (obj === undefined) {
    return {};
  }
  typeCheck("deepObjectIgnoreNullValues expected type", "object", obj);
  let newObj = {}; // Object to return
  // For each key in the object

  eachKey(obj, (key) => {
    let value = obj[key]; // reference to value
    // If value isn't null and either is not an object or is in shallow mode
    if (value !== null && (getType(value) !== "object" || shallow)) {
      newObj[key] = value; // set value on return object
    }
    // Otherwise if value is object get values from that object if not in shallow mode
    else if (getType(value) === "object" && value !== null && !shallow) {
      let subObjectValue = deepObjectIgnoreNullValues(value);
      // If keys are returned, set value on return object
      if (keys(subObjectValue).length !== 0) newObj[key] = subObjectValue;
    }
  });

  return newObj; // return data
}

/**
 * match spaces to a string
 * @param {number} spaces number of spaces to match
 * @param {string} str  string to match length
 * @returns {string} string with matched spaces
 */
function matchSpace(spaces, str) {
  typeCheck("matchSpace expects spaces to be", "number", spaces);
  typeCheck("matchSpaces expected str to be", "string", str);
  let splitStr = str.split("\n");
  let spacestr = "";
  while (spacestr.length <= spaces) {
    spacestr += " ";
  }
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = spacestr + splitStr[i];
  }
  return splitStr.join("\n");
}

/**
 * Convert flags into a tfvars object
 * @param {Object} planFlagValues Plan flag values
 * @returns {Object} key value pairs of tfvars
 */
function convertTfVarsFromTags(planFlagValues) {
  let tfvars = {};
  if (!containsKeys(planFlagValues, "tfvars")) return tfvars;
  // While tfvars is > 0
  while (planFlagValues.tfvars.length > 0) {
    let composedValue = planFlagValues.tfvars.shift(); // Get value
    let splitValue = composedValue.split("="); // Split at =
    let key = splitValue[0]; // tfvar key
    let value = splitValue[1]; // tfvar value
    const numbersOnlyRegExp = new RegexButWithWords()
      .stringBegin()
      .digit()
      .oneOrMore()
      .stringEnd()
      .done("g");
    if (value.match(numbersOnlyRegExp)) {
      // convert int
      value = parseInt(value);
    } else if (contains(["true", "false"], value)) {
      // convert bool
      value = Boolean(value);
    } else {
      // replace quotes for string
      value = value.replace(constants.unescapedQuotesRegex, "");
    }
    // set tfvar key to value
    tfvars[key] = value;
  }
  tfVarCheck(tfvars);
  return tfvars; // return tfvars
}

module.exports = {
  valueFunctionTest: valueFunctionTest,
  checkResourceTests: checkResourceTests,
  composeName: composeName,
  childArraySearch: childArraySearch,
  getFoundResources: getFoundResources,
  parseTestModuleOptions: parseTestModuleOptions,
  checkModuleTest: checkModuleTest,
  containsKeysModule: containsKeysModule,
  expectedResourceAddress: expectedResourceAddress,
  tfVarCheck: tfVarCheck,
  capitalizeWords: capitalizeWords,
  deepObjectIgnoreNullValues: deepObjectIgnoreNullValues,
  matchSpace: matchSpace,
  convertTfVarsFromTags: convertTfVarsFromTags,
};
