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
<<<<<<< HEAD
   * @param {Object} data arbitrary data bject to return
   */
  this.mockExec = function (data) {
    this.data = data;
=======
   * @param {Object} data arbitrary data object to return
   * @param {boolean} reject tells the function to reject the Promise
   */
  this.mockExec = function (data, reject) {
    this.data = data;
    this.reject = reject;
>>>>>>> intern-tfxjs/master
    this.commandList = [];
    this.promise = (command) => {
      this.commandList.push(command);
      return new Promise((resolve, reject) => {
<<<<<<< HEAD
        if (this.data?.stderr) reject(this.data);
=======
        if (this.reject) {
          reject(this.data);
        } else if (this.data?.stderr) reject(this.data);
>>>>>>> intern-tfxjs/master
        else resolve(this.data);
      });
    };
  };
<<<<<<< HEAD
};

=======
  /**
   * Create a mock exec function for TCP connection using GNU netcat version 0.7.1
   * can be installed with brew install netcat
   * If successful, the Promise will reject with an empty output
   * If failure, the Promise will reject with a "Connection error" message
   * @param {boolean} error whether mock function will pass or fail
   * @returns a mock exec function to make a TCP connection to a port
   */
  this.tcpPackage = function (error) {
    return function () {
      return new Promise((resolve, reject) => {
        if (error) {
          reject({
            stdout: "",
            stderr: `TCP Connection to host host on port port expected`,
          });
        } else {
          resolve({ stdout: "Success", stderr: "" });
        }
      });
    };
  };

  /**
   * Mock FS package
   * @param {bool} existingPath true if using existing filepath
   */
  this.mockFs = function (existingPath) {
    this.writeFileSync = (path, data) => {
      return data;
    };
    this.existsSync = (directory) => {
      return existingPath == true ? true : false;
    };
    this.mkdirSync = (path) => {
      return path;
    }
  };
  
  /**
   * Creates a mockSshPackage instance
   * @param {boolean} err whether or not this mock package throws an error
   */
  this.mockSshPackage = function (err) {
    this.connected = false;
    this.isConnected = function () {
      return this.connected;
    };
    this.connect = function (data) {
      return new Promise((resolve, reject) => {
        if (err) {
          this.connected = false;
          reject("connection failure");
        } else {
          this.connected = true;
          resolve();
        }
      });
    };
  };

  /**
   * Creates a mock ping package instance
   * @param {boolean} err whether or not this package will fail
   */
  this.mockPingPackage = function (err) {
    this.promise = {
      probe: function (host) {
        return new Promise((resolve, reject) => {
          if (err) {
            resolve({ alive: false });
          } else {
            resolve({ alive: true });
          }
        });
      },
    };
  };
};
>>>>>>> intern-tfxjs/master
module.exports = mocks;
