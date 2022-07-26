const { assert } = require("chai");
const connect = function (connectionPackages) {
  /**
   * Attempt connection to SSH
   * @param {string} testName name of the test
   * @param {string} host host URL or IP address
   * @param {string} username Username to use for ssh connection
   * @param {string} privateKey ssh private key
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.sshTest = function (
    testName,
    host,
    username,
    privateKey,
    doesNotConnect
  ) {
    let assertionData = {
      name: testName,
      assertionType: "deepEqual",
      assertionArgs: [true, false],
    };
    return connectionPackages.ssh
      .connect({
        host: host,
        username: username,
        privateKey: privateKey,
      })
      .then(() => {
        assertionData = {
          name: testName,
          assertionType: "deepEqual",
          assertionArgs: [
            connectionPackages.ssh.isConnected(),
            !doesNotConnect,
          ],
        };
      })
      .catch((err) => {
        // if doesNotConnect return true otherwise return err
        assertionData = {
          name: testName,
          assertionType: "deepEqual",
          assertionArgs: [
            doesNotConnect === true ? true : err.message,
            true,
          ],
        };
      })
      .finally(() => {
        assert[assertionData.assertionType](...assertionData.assertionArgs, assertionData.name)
      });
  };
  /**
   * Attempt connection via ping
   * @param {string} host host URL or IP address
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.pingTest = function (testName, host, doesNotConnect) {
    return connectionPackages.ping.promise.probe(host).then((res) => {
      assert.deepEqual(res.alive, !doesNotConnect, testName);
    });
  };
};

module.exports = connect;
