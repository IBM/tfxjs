const { deepEqualTest } = require("./builders");
const builders = require("./builders");
const connect = function (connectionPackages, assert) {
  /**
   * Attempt connection to SSH
   * @param {string} testName name of the test
   * @param {string} host host URL or IP address
   * @param {string} username Username to use for ssh connection
   * @param {string} privateKey ssh private key
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.sshTest = function (testName, host, username, privateKey, doesNotConnect) {
    return connectionPackages.ssh
      .connect({
        host: host,
        username: username,
        privateKey: privateKey,
      })
      .then(() => {
        assert.deepEqual(ssh.isConnected() && !doesNotConnect, !doesNotConnect, testName)
      })
      .catch((err) => {
        // if doesNotConnect return true otherwise return err
        assert.deepEqual(doesNotConnect === true ? true : err.message, true, testName)
      });
  };
  /**
   * Attempt connection via ping
   * @param {string} host host URL or IP address
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.pingTest = function (host, doesNotConnect) {
    return connectionPackages.ping.promise.probe(host);
  };
};

module.exports = connect;
