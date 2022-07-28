const { deepEqualTest } = require("./builders");
const builders = require("./builders");
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

  /**
   * Attempt connection to server via UDP. Uses GNU netcat version 0.7.1.
   * 
   * The expected exec call models the promisified one provided by the child_process 
   * package: (https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback)
   * 
   * When successful, the function will time out with no output.
   * Upon failure, the Promise will reject with a message stored in stderr.
   * @param {string} host host URL or IP address
   * @param {string} port port to use for udp connection
   * @param {Object} options contains the options configuring the exec call
   * @param {boolean} doesNotConnect determines whether the test should expect a failed connection
   * @returns {Promise} Promise for the connection test. The promise should run `.catch`, timing out if successful or returning an error if unsuccessful and `doesNotConnect` is true
   */
  this.udpTest = function (host, port, options, doesNotConnect) {
    return connectionPackages.exec(`echo "test" | netcat -u ${host} ${port}`, options)
      .catch(({stdout, stderr}) => {
        if (doesNotConnect) {
          assert.deepEqual(stderr, "read(net): Connection refused\n", "stderr should show expected data")
        }
        else {
          assert.deepEqual('', stderr, "stderr should be empty");
          assert.deepEqual('', stdout, "stdout should be empty");
        }
    })
  }
};

module.exports = connect;
