/**
 * General utilities
 * - Function shortcuts
 */

const utils = function () {
  /**
   * helper function to see if an object containsKeys a key
   * @param {Object} object Any object
   * @param {string} str Name of the key to find
   * @returns {boolean} true if containsKeys, false if does not or is not an object
   */
  this.containsKeys = (object, str) => {
    return !(Object.keys(object).indexOf(str) === -1);
  };

  /**
   * Lazy get type
   * @param {*} value Value
   * @returns {string} Array for array, Function for function, `typeof` for other types
   */
  this.getType = function (value) {
    if (typeof value === "object" && Array.isArray(value)) {
      return "Array";
    }
    if (value instanceof Function) {
      return "Function";
    }
    return typeof value;
  };

  /**
   * Shortcut for Object.keys`
   * @param {object} obj Object
   * @returns {Array<string>} list of keys
   */
  this.keys = (obj) => {
    return Object.keys(obj);
  };

  /**
   * Check if array is empty
   * @param {Array} arr Array
   * @returns {boolean} true if length == 0
   */
  this.isEmpty = (arr) => {
    this.typeCheck(`isEmpty expects type of`, "Array", arr);
    return arr.length === 0;
  };

  /**
   * Shortcut to check if array of strings contains a value
   * @param {Array} arr array
   * @param {*} value Value to check
   * @returns {boolean} true if array contains value
   */
  this.contains = (arr, value) => {
    this.typeCheck("contains expects type", "Array", arr);
    this.arrTypeCheck(`contains expects all entries to be`, "string", arr);
    return arr.indexOf(value) !== -1;
  };

  /**
   * Test to see if an object has needed keys
   * @param {Object} value Value to check
   * @param {Array<string>} keys Keys to check for
   * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
   * @returns {boolean} True if all params match
   */
  this.keyTest = (value, keys, strict) => {
    if (strict && Object.keys(value).length !== keys.length) return false;
    let allKeysFound = true;
    keys.forEach((key) => {
      if (!this.containsKeys(value, key)) allKeysFound = false;
    });
    return allKeysFound;
  };

  /**
   * Checks a value type
   * @param {string} message Display message
   * @param {string} type Expected type
   * @param {*} value value to test
   * @throws When type is not found
   */
  this.typeCheck = (message, type, value) => {
    if (this.getType(value) !== type) {
      throw new Error(`${message} ${type} got ${this.getType(value)}`);
    }
  };

  /**
   * Check an objet for correct keys
   * @param {string} message Display message
   * @param {Object} value Value to check
   * @param {Array<string>} keys Keys to check for
   * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
   * @throws if keys do not match
   */
  this.keyCheck = (message, value, keys, strict) => {
    if (!this.keyTest(value, keys, strict))
      throw new Error(
        `${message}${strict ? ` ${keys.length} keys` : ""} ${JSON.stringify(
          keys
        )} got ${JSON.stringify(this.keys(value))}`
      );
  };

  /** Check if array length is 0
   * @param {string} message Display message
   * @param {Array} arr Array
   * @throws if array is empty
   */
  this.emptyCheck = (message, arr) => {
    this.typeCheck(`emptyCheck expects type of`, "Array", arr);
    if (this.isEmpty(arr)) {
      throw new Error(`${message} got 0`);
    }
  };

  /**
   * Check all items in an array for a specific type
   * @param {string} message Display message
   * @param {string} type type to check
   * @param {*} arr Array to check
   * @throws if types of each item in the array do not match
   */
  this.arrTypeCheck = (message, type, arr) => {
    this.typeCheck(`arrTypeCheck expects arr to be`, "Array", arr); // Array check
    let types = [], // list of types
      allMatch = true; // all match
    // For each item
    arr.forEach((entry) => {
      let entryType = this.getType(entry); // Get type
      types.push(entryType); // add to list
      if (entryType !== type) allMatch = false; // if doesn't match, all match becomes false
    });
    if (!allMatch) {
      throw new Error(`${message} type ${type} got ${JSON.stringify(types)}`);
    }
  };

  /**
   * Test to see if an array of strings contains a value
   * @param {string} message Display Message
   * @param {Array} arr array
   * @param {string} value Value to check
   * @throws If array oes not contain value
   */
  this.containsCheck = (message, arr, value) => {
    if (!this.contains(arr, value)) {
      throw new Error(`${message} got ${value}`);
    }
  };

  /**
   * Shortcut for JSON.stringify(obj, null, 2)
   * @param {Object} obj Object to return
   * @returns {string} prettified json string
   */
  this.prettyJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  /**
   * Shortcut for Object.keys(object).forEach(i=>{})
   * @param {Object} obj Object to call
   * @param {eachKeyCallback} callback Callback function to run
   */
  this.eachKey = (obj, callback) => {
    this.typeCheck(
      `eachKey expects the the first argument to be type`,
      "object",
      obj
    );
    this.typeCheck(`eachKey expects callback to be type`, "Function", callback);
    Object.keys(obj).forEach((i) => callback(i));
  };

  /**
   * Eachkey Callback
   * @callback eachKeyCallback
   * @param {string} key Key to check values against
   */
};

module.exports = new utils();
