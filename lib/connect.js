const { assert } = require("chai");
const builders = require("./builders");
/**
 * Creates a connect instance
 * @param {Object} connectionPackages
 * @param {Object} connectionPackages.ssh ssh package: initialized node-ssh package
 * @param {Object} connectionPackages.ping ping package: initialized ping package
 * @param {Object} connectionPackages.exec initialized javaScript child promise package
 */
const connect = function (connectionPackages) {
  /**
   * Uses GNU netcat version 0.7.1 to test UDP connection, and runs a chai assertion when finished. Both successful and unsuccessful connections can be created. If the connection is not refused within the timeout window, it will be assumed as successful. 
   * @param {string} host host URL or IP address
   * @param {string} port port to use for udp connection
   * @param {number} timeout time for the test to time out
   * @param {boolean} doesNotConnect determines whether the test should expect a failed connection
   * @returns {Promise} Promise for the connection test
   */
  this.udpTest = function (host, port, doesNotConnect, timeout) {
    let udpTimeout = timeout || 90000
    return connectionPackages
      .exec(`echo "test" | netcat -u ${host} ${port}`, { timeout: udpTimeout })
      .catch(({ stdout, stderr }) => {
        if (doesNotConnect) {
          assert.deepEqual(
            stderr,
            "read(net): Connection refused\n",
            "expected to not connect"
          );
        } else {
          assert.deepEqual(stderr, "", "expected successful connection");
        }
      });
  };
  
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
        assertionData = {
          name: testName,
          assertionType: deepEqual,
          assertionArgs: [connectionPackages.ssh.isConnected(),!doesNotConnect]
        }
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
   * @param {string} host host URL or IP address
   * @param {string} port port to use for tcp connection
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.tcpTest = function (host, port, doesNotConnect) {
    return connectionPackages
      .exec(`netcat -vz ${host} ${port}`)
      .catch(({ stdout, stderr }) => {
        assert.deepEqual(
          stderr,
          doesNotConnect
            ? `TCP Connection to host ${host} on port ${port} expected`
            : "",
          `Expected ${
            doesNotConnect ? "unsuccessful" : "successful"
          } TCP connection`
        );
        
      });
  };
};

module.exports = connect;
