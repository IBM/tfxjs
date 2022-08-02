const { assert } = require("chai");
const builders = require("./builders");
/**
 * Creates a connect instance
 * @param {Object} connectionPackages
 * @param {Object} connectionPackages.ssh ssh package: initialized node-ssh package
 * @param {Object} connectionPackages.ping ping package: initialized ping package
 * @param {Object} connectionPackages.exec -> tcp, used for mock or real tcp package
 */
const connect = function (connectionPackages) {
  /**
   * Attempt connection to SSH
   * @param {string} testName name of the test
   * @param {string} host host URL or IP address
   * @param {string} username Username to use for ssh connection
   * @param {string} privateKey ssh private key
   * @param {boolean} doesNotConnect represents the expected behavior
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.sshTest = function (
    testName,
    host,
    username,
    privateKey,
    doesNotConnect
  ) {
    // used to determine the which assertion test and arguments to use
    let assertionData;
    return connectionPackages.ssh
      .connect({
        host: host,
        username: username,
        privateKey: privateKey,
      })
      .then(() => {
        assertionData = builders.deepEqualTest(testName, [
          connectionPackages.ssh.isConnected(),
          !doesNotConnect,
        ]);
      })
      .catch((err) => {
        // if doesNotConnect return true otherwise return err
        assertionData = {
          name: testName,
          assertionType: "deepEqual",
          assertionArgs: [doesNotConnect === true ? true : err.message, true],
        };
      })
      .finally(() => {
        assert[assertionData.assertionType](
          ...assertionData.assertionArgs,
          assertionData.name
        );
      });
  };
  /**
   * Attempt connection via ping
   * @param {string} host host URL or IP address
   * @param {boolean} doesNotConnect represents the expected behavior
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.pingTest = function (testName, host, doesNotConnect) {
    return connectionPackages.ping.promise.probe(host).then((res) => {
      assert.deepEqual(res.alive, !doesNotConnect, testName);
    });
  };
  /**
   * Attempt connection to TCP. When finished, will run a chai assertion
   * @param {string} test assertion test pass/fail
   * @param {string} host host URL or IP address
   * @param {string} port port to use for tcp connection
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.tcpTest = function (test, host, port, doesNotConnect) {
    return connectionPackages
      .exec("netcat -vz ${host} ${port}")
      .catch(({ stdout, stderr }) => {
        assert.deepEqual(
          stderr,
          doesNotConnect
            ? "TCP Connection to host ${host} on port ${port} expected"
            : "",
          `Expected ${
            doesNotConnect ? "unsuccessful" : "successful"
          } TCP connection`
        );
      });
  };
};

module.exports = connect;
