/**
 * Initialize mocks
 */
const mocks = function () {
  // Last script run with exec
  this.lastScript = undefined;
  /**
   * Mock JS exec file
   * @param {string} script Script data
   * @returns Mock stdout with planned values
   */
  this.exec = async (script) => {
    this.lastScript = script;
    return {
      stdout: `{"planned_values" : "success"}`,
    };
  };

  // List of definitions calles
  this.definitionList = [];
  // List of it assertions called
  this.itList = [];
  // List of before assertions called
  this.beforeList = [];
  /**
   * Mock describe function for unit testing
   * @param {string} definition Definition of describe
   * @param {Function} callback callback function
   * @returns Execution of callback function
   */
  this.describe = (definition, callback) => {
    // Add definition to list
    this.definitionList.push(definition);
    return callback();
  };
  /**
   * Mock it function for unit testing
   * @param {string} definition Definition of describe
   * @param {Function} callback callback function
   * @returns Execution of callback function
   */
  this.it = (definition, callback) => {
    // Add it definition to list
    this.itList.push(definition);
    return callback();
  };

  /**
   * Mock before function for testing
   * @param {*} callback
   * @param {Function} callback callback function
   * @returns Execution of callback function
   */
  this.before = (callback) => {
    this.beforeList.push(callback());
    return callback();
  };

  this.logList = [];
  /**
   * Mock for console.log adds string to logList
   * @param {string} str arbitrary string
   */
  this.log = (str) => {
    this.logList.push(str);
  };

  /**
   * Create a mock exec function
   * @param {Object} data arbitrary data bject to return
   */
  this.mockExec = function (data) {
    this.data = data;
    this.commandList = [];
    this.promise = (command) => {
      this.commandList.push(command);
      return new Promise((resolve, reject) => {
        if (this.data?.stderr) reject(this.data);
        else resolve(this.data);
      });
    };
  };
  /**
   * Create a mock exec function for TCP connection using GNU netcat version 0.7.1
   * can be installed with brew install netcat
   * If successful, the Promise will reject with an empty output
   * If failure, the Promise will reject with a "Connection error" message
   * @param {boolean} success whether mock function will pass or fail
   * @returns a mock exec function to make a TCP connection to a port
   */
  this.tcpExec = function (success) {
    return function () {
      return new Promise((resolve, reject) => {
        if (success) {
          reject({stdout: "", stderr: ""});
        } else {
          reject({stdout: "", stderr: "TCP connection error"});
        }
      });
    };
  };
};
module.exports = mocks;
