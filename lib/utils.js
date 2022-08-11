/**
 * General utilities
 * - Function shortcuts
 */

<<<<<<< HEAD
=======
const { RegexButWithWords } = require("regex-but-with-words");
>>>>>>> intern-tfxjs/master
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
<<<<<<< HEAD
   * Shortcut to check if array of strings contains a value
   * @param {Array} arr array
   * @param {*} value Value to check
   * @returns {boolean} true if array contains value
   */
  this.contains = (arr, value) => {
    this.typeCheck("contains expects type", "Array", arr);
    this.arrTypeCheck(`contains expects all entries to be`, "string", arr);
    return arr.indexOf(value) !== -1;
=======
   * Shortcut to check if string or array of strings contains a value
   * @param {String|Array} stringOrArray string or array of strings
   * @param {*} value Value to check
   * @returns {boolean} true if array contains value
   */
  this.contains = (stringOrArray, value) => {
    if (this.getType(stringOrArray) !== "string") {
      this.typeCheck(
        "if not string, contains expects type",
        "Array",
        stringOrArray
      );
      this.arrTypeCheck(
        `contains expects all entries to be`,
        "string",
        stringOrArray
      );
    }
    this.typeCheck("contains expects value to be type", "string", value);
    return stringOrArray.indexOf(value) !== -1;
>>>>>>> intern-tfxjs/master
  };

  /**
   * Checks to see if any instances of sting from one array are found in another
   * @param {Array} sourceArr Array to compare against
   * @param {Array} arr Array to search for
   * @returns {boolean} If any instance is found
   */
  this.containsAny = (sourceArr, arr) => {
    this.typeCheck("contains expects type", "Array", arr);
    this.typeCheck("contains expects type", "Array", sourceArr);
    this.arrTypeCheck(`contains expects all entries to be`, "string", arr);
    this.arrTypeCheck(
      `contains expects all entries to be`,
      "string",
      sourceArr
    );
    let found = false;
    arr.forEach((entry) => {
      if (this.contains(sourceArr, entry)) {
        found = true;
      }
    });
    return found;
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

  /**
   * Set keys from one object to another in place
   * @param {Object} source source object
   * @param {Object} destination where values from the source object will be added
   */
  this.transpose = (source, destination) => {
    this.eachKey(source, (key) => {
      destination[key] = source[key];
    });
  };

  /**
   * Test for invalid or duplicate required flags
   * @param {Object} aliases key map of key with allowed synonyms
   * @param  {...any} commandArgs List of arguments
   */
  this.flagTest = (command, aliases, ...commandArgs) => {
    let flagMap = {};
    commandArgs.forEach((flag) => {
      if (flag.indexOf("-") === 0) {
        if (!this.containsKeys(aliases, flag)) {
          throw `\nInvalid flag ${flag} for command ${command}. For a list of valid commands run \`tfx --help\`.\n`;
        }
        if (!this.containsKeys(flagMap, flag)) {
          flagMap[flag] = flag;
          flagMap[aliases[flag]] = flag;
        } else {
<<<<<<< HEAD
          throw `\nInvalid duplicate flag ${flag}. For a list of valid commands run \`tfx --help\`.\n`
=======
          throw `\nInvalid duplicate flag ${flag}. For a list of valid commands run \`tfx --help\`.\n`;
>>>>>>> intern-tfxjs/master
        }
      }
    });
    let requiredKeys = [];
<<<<<<< HEAD
    this.eachKey(aliases, key => {
      if(key.indexOf("?") !== 0) requiredKeys.push(key)
    })
    if(requiredKeys.length !== this.keys(flagMap).length) {
      let errString = `\nMissing flags from command 'tfx ${command}':`
      this.eachKey(aliases, (alias) => {
        if(alias.indexOf("--") !== -1) {
          errString += ` ${alias}`
        }
      })
      throw errString + `\n\nFor a list of valid commands run \`tfx --help\`.\n`
=======
    this.eachKey(aliases, (key) => {
      if (key.indexOf("?") !== 0) requiredKeys.push(key);
    });
    if (requiredKeys.length !== this.keys(flagMap).length) {
      let errString = `\nMissing flags from command 'tfx ${command}':`;
      this.eachKey(aliases, (alias) => {
        if (alias.indexOf("--") !== -1) {
          errString += ` ${alias}`;
        }
      });
      throw `${errString}\n\nFor a list of valid commands run \`tfx --help\`.\n`;
>>>>>>> intern-tfxjs/master
    }
  };

  /**
   * Get actions from a verb object
   * @param {Object} action action
   * @param {Array} action.requiredFlags Flags required by the action
   * @param {Array} action.optionalFlags Optional flags
   * @param {Object} tags tags object
   * @returns {Object} Aliases for the verb
   */
  this.getVerbActions = (action, tags) => {
    let flags = action.requiredFlags;
    let requiredFlags = {};
    this.eachKey(tags, (tag) => {
      if (this.contains(flags, tag)) {
        requiredFlags[tags[tag][0]] = tags[tag][1];
        requiredFlags[tags[tag][1]] = tags[tag][0];
      }
    });
<<<<<<< HEAD
    if(this.containsKeys(action, "optionalFlags")) {
      action.optionalFlags.forEach(optionalFlag => {
        let firstTagValue  = `?${optionalFlag.allowMultiple ? "*" : ""}${tags[optionalFlag.name][0]}`
        let secondTagValue = `?${optionalFlag.allowMultiple ? "*" : ""}${tags[optionalFlag.name][1]}`
        requiredFlags[firstTagValue] = secondTagValue
        requiredFlags[secondTagValue] = firstTagValue
      })
=======
    if (this.containsKeys(action, "optionalFlags")) {
      action.optionalFlags.forEach((optionalFlag) => {
        let firstTagValue = `?${optionalFlag?.allowMultiple ? "*" : ""}${
          tags[optionalFlag.name][0]
        }`;
        let secondTagValue = `?${optionalFlag?.allowMultiple ? "*" : ""}${
          tags[optionalFlag.name][1]
        }`;
        requiredFlags[firstTagValue] = secondTagValue;
        requiredFlags[secondTagValue] = firstTagValue;
      });
>>>>>>> intern-tfxjs/master
    }
    return requiredFlags;
  };
  /**
   * Replace optional flags from command args to denote multiple and optional flags
   * @param {Object} action action
   * @param {Array} action.requiredFlags Flags required by the action
   * @param {?Array} action.optionalFlags Optional flags
   * @param {Object} tags tags object
   * @param  {...any} commandArgs List of arguments
   * @returns {Array<string} Modified list of commang args
   */
  this.replaceOptionalFlags = (action, tags, ...commandArgs) => {
    let flagList = commandArgs; // Command args as array
    let optionalArguments = []; // Optional args
    let multiArguments = []; // Multiple arguments
<<<<<<< HEAD
    let replacedFlags = [] // list of flags to return replaced
    // If contains optional flags
    if(this.containsKeys(action, "optionalFlags")) {
      // For each optional flag
      action.optionalFlags.forEach(flag => {
        // Add to optional list
        optionalArguments = optionalArguments.concat(tags[flag.name])
        if(flag?.allowMultiple) {
          // If multiple arguments, add to multi
          multiArguments = multiArguments.concat(tags[flag.name])
        }
      });
      // For each argument
      flagList.forEach(flag => {
        // if it is optional
        if(this.contains(optionalArguments, flag)) {
          // Replace first - with ?*- if multiple and ?- if not
          replacedFlags.push(flag.replace(/-/i, `?${this.contains(multiArguments, flag) ? "*" : ""}-`))
        } else {
          replacedFlags.push(flag)
        }
      })
=======
    let replacedFlags = []; // list of flags to return replaced
    // If contains optional flags
    if (this.containsKeys(action, "optionalFlags")) {
      // For each optional flag
      action.optionalFlags.forEach((flag) => {
        // Add to optional list
        optionalArguments = optionalArguments.concat(tags[flag.name]);
        if (flag?.allowMultiple) {
          // If multiple arguments, add to multi
          multiArguments = multiArguments.concat(tags[flag.name]);
        }
      });
      // For each argument
      flagList.forEach((flag) => {
        // if it is optional
        const firstSlashRegExp = new RegexButWithWords().literal("-").done("i");
        if (this.contains(optionalArguments, flag)) {
          // Replace first - with ?*- if multiple and ?- if not
          replacedFlags.push(
            flag.replace(
              firstSlashRegExp,
              `?${this.contains(multiArguments, flag) ? "*" : ""}-`
            )
          );
        } else {
          replacedFlags.push(flag);
        }
      });
>>>>>>> intern-tfxjs/master
      return replacedFlags;
    } else {
      return commandArgs;
    }
<<<<<<< HEAD
  }
=======
  };
>>>>>>> intern-tfxjs/master

  /**
   * Create key value pairs from list of command arguments
   * @param {string} command name of command
   * @param {Array} action.requiredFlags Flags required by the action
   * @param {?Array} action.optionalFlags Optional flags
   * @param {Object} tags key value pair of tags
   * @param  {...any} commandArgs command line arguments
   * @returns {Object} object containing key value pairs of params from tags
   */
  this.flagValues = (command, action, tags, ...commandArgs) => {
    // Get aliases
<<<<<<< HEAD
    let aliases = this.getVerbActions(action, tags) 
=======
    let aliases = this.getVerbActions(action, tags);

>>>>>>> intern-tfxjs/master
    // Get list of flags
    let flagList = this.replaceOptionalFlags(action, tags, ...commandArgs);
    // Test for incorrect data
    this.flagTest(command, aliases, ...flagList);
    // Object to return
<<<<<<< HEAD
    let flagData = {}; 
    // create an object where each tag is converted to tag name for data
    let tagToName = {};
    this.eachKey(tags, (key) => {
      tags[key].forEach(alias => tagToName[alias] = key)
    })
    // While flags still exist in list
    while (flagList.length > 0) {
      let flag = flagList.shift(); // Flag
      let flagValue = flagList.shift(); // Flag Value
      // Replace ? and * for optional flags
      let flagName = tagToName[flag.replace(/(\?|\*)/g, "")];
      if (flag.indexOf("*") === -1) {
        // if not multiple, set to flag value
        flagData[flagName] = flagValue
      } else {
        if(this.containsKeys(flagData, flagName)) {
          // Add to existing array
          flagData[flagName].push(flagValue)
        } else {
          // Create new array
          flagData[flagName] = [flagValue]
=======
    let flagData = {};
    // create an object where each tag is converted to tag name for data
    let tagToName = {};
    this.eachKey(tags, (key) => {
      tags[key].forEach((alias) => (tagToName[alias] = key));
    });
    //create an array to check if flag names do match if they have no matching value
    let noMatchingValueFlagNames = [];
    action.optionalFlags.forEach((flag) => {
      if (flag?.noMatchingValue) {
        noMatchingValueFlagNames.push(tags[flag.name].join("|"));
      }
    });
    //create a regular expression for the no matching flag names
    let noMatchingValueRegex = new RegExp(
      `\\?(${noMatchingValueFlagNames.join("|")})`
    );

    // While flags still exist in list
    while (flagList.length > 0) {
      let flag = flagList.shift(); // Flag
      let flagName =
        tagToName[
          flag.replace(
            /(\?|\*)/g, // the regex-to-words do not work
            ""
          )
        ];
      //if not a * and does not require a matching value we set flagData at the flagName to true
      if (flag.indexOf("*") === -1 && flag.match(noMatchingValueRegex)) {
        flagData[flagName] = true;
      } else {
        let flagValue = flagList.shift(); // Flag Value
        // Replace ? and * for optional flags
        if (flag.indexOf("*") === -1) {
          // if not multiple, set to flag value
          flagData[flagName] = flagValue;
        } else {
          if (this.containsKeys(flagData, flagName)) {
            // Add to existing array
            flagData[flagName].push(flagValue);
          } else {
            // Create new array
            flagData[flagName] = [flagValue];
          }
>>>>>>> intern-tfxjs/master
        }
      }
    }
    return flagData;
<<<<<<< HEAD
  }
=======
  };

  /**
   * Get the longest key from an object
   * @param {Object} obj arbitrary object
   * @returns {number} integer length of the longest key in the object
   */
  this.getLongestKey = (obj) => {
    let longest = 0;
    this.eachKey(obj, (key) => {
      if (key.length > longest) longest = key.length;
    });
    return longest;
  };

  /**
   * Match the length of a string to a number by appending spaces
   * @param {string} str string
   * @param {number} count number to match
   * @returns {string} string with added spaces
   */
  this.matchLength = (str, count) => {
    while (str.length < count) {
      str = str + " ";
    }
    return str;
  };

  /**
   * Create an HCL encoded .tfvars file from json data
   * @param {Object} jsonObject object data to transpose
   * @param {number} spaceCount number of spaces to prepend to each line, passed during recursion
   * @returns {string} HCL encoded data
   */
  this.hclEncode = (jsonObject, spaceCount) => {
    let returnLines = [], // lines to return
      spaces = spaceCount || 0, // spaces to add to beginning of line
      spaceString = "", // list of spaces
      longestKey = this.getLongestKey(jsonObject);

    // For each space in count add space to string
    for (let i = 0; i < spaces; i++) {
      spaceString += " ";
    }

    // For each key in the object
    this.eachKey(jsonObject, (key) => {
      let value = jsonObject[key]; // Key value
      let valueType = this.getType(value); // Type of value
      let printKey = spaceString + this.matchLength(key, longestKey); // Value to print as key for value
      if (valueType === "Array") {
        // Add key to return text
        returnLines.push(`${printKey} = `);
        if (value.length === 0) {
          // Add empty array if empty
          returnLines[returnLines.length - 1] += "[]";
        } else if (this.getType(value[0]) === "object") {
          // if type object add opening brace
          returnLines[returnLines.length - 1] += "[";
          // Then for each value
          value.forEach((item) => {
            // Add spaced out hcl encoded object
            returnLines.push(
              `${spaceString}  {\n${this.hclEncode(
                item,
                spaces + 4
              )}\n${spaceString}  }`
            );
          });
          // add closing brace with spaces
          returnLines.push(`${spaceString}]`);
        } else {
          // otherwise add stringified json to array
          returnLines[returnLines.length - 1] += JSON.stringify(value);
        }
      } else if (valueType === "object") {
        // if type is object add hcl encoded fields
        returnLines.push(
          `${printKey} = {\n${this.hclEncode(
            value,
            spaces + 2
          )}\n${spaceString}}`
        );
      } else if (valueType === "string") {
        // force quotes for string type
        returnLines.push(`${printKey} = \"${value}\"`);
      } else {
        // fallback for number and boolean
        returnLines.push(`${printKey} = ${value}`);
      }
    });
    // return joined string
    return returnLines.join("\n");
  };
>>>>>>> intern-tfxjs/master
};

module.exports = new utils();
