const fs = require("fs");
const { isEmpty } = require("./utils");

/**
 * Lazy get
 * @param {*} value Value
 * @returns {string} Array for array, Function for function, `typeof` for other types
 */
function getType(value) {
  if (typeof value === "object" && Array.isArray(value)) {
    return "Array";
  }
  if (value instanceof Function) {
    return "Function";
  }
  return typeof value;
}

/**
 * Checks a value type
 * @param {string} message Display message
 * @param {string} type Expected type
 * @param {*} value value to test
 * @throws When type is not found
 */
function typeCheck(message, type, value) {
  if (getType(value) !== type) {
    throw new Error(`${message} ${type} got ${getType(value)}`);
  }
}

/**
 * Shortcut to check if string or array of strings contains a value
 * @param {String|Array} stringOrArray string or array of strings
 * @param {*} value Value to check
 * @returns {boolean} true if array contains value
 */
function contains(stringOrArray, value) {
  if (getType(stringOrArray) !== "string") {
    typeCheck("if not string, contains expects type", "Array", stringOrArray);
    arrTypeCheck(`contains expects all entries to be`, "string", stringOrArray);
  } else {
    typeCheck("contains expects value to be type", "string", value);
  }
  return stringOrArray.indexOf(value) !== -1;
}

/**
 * Check all items in an array for a specific type
 * @param {string} message Display message
 * @param {string} type type to check
 * @param {*} arr Array to check
 * @throws if types of each item in the array do not match
 */
function arrTypeCheck(message, type, arr) {
  typeCheck(`arrTypeCheck expects arr to be`, "Array", arr); // Array check
  let types = [], // list of types
    allMatch = true; // all match
  // For each item
  arr.forEach((entry) => {
    let entryType = getType(entry); // Get type
    types.push(entryType); // add to list
    if (entryType !== type) allMatch = false; // if doesn't match, all match becomes false
  });
  if (!allMatch) {
    throw new Error(`${message} type ${type} got ${JSON.stringify(types)}`);
  }
}

const lazyUtils = {
  getType: getType,
  typeCheck: typeCheck,
  arrTypeCheck: arrTypeCheck,
  contains: contains,
  /**
   * helper function to see if an object containsKeys a key
   * @param {Object} object Any object
   * @param {string} str Name of the key to find
   * @returns {boolean} true if containsKeys, false if does not or is not an object
   */
  containsKeys: function (object, str) {
    typeCheck("containsKeys expects type", "object", object);
    typeCheck("containsKeys expects type", "string", str);
    return !(Object.keys(object).indexOf(str) === -1);
  },
  /**
   * Shortcut for Object.keys`
   * @param {object} object Object
   * @returns {Array<string>} list of keys
   */
  keys: function (object) {
    typeCheck("keys expects type", "object", object);
    return Object.keys(object);
  },

  /**
   * Check if array is empty
   * @param {Array} arr Array
   * @returns {boolean} true if length == 0
   */
  isEmpty: function (arr) {
    typeCheck(`isEmpty expects type of`, "Array", arr);
    return arr.length === 0;
  },

  /**
   * Test to see if an array of strings contains a value
   * @param {string} message Display Message
   * @param {Array} arr array
   * @param {string} value Value to check
   * @throws If array oes not contain value
   */
  containsCheck: function (message, arr, value) {
    typeCheck("containsCheck expects message type of", "string", message);
    typeCheck("containsCheck expects arr to be type", "Array", arr);
    if (!contains(arr, value)) {
      throw new Error(`${message} got ${value}`);
    }
  },
};

module.exports = lazyUtils;
