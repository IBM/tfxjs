const { assert } = require("chai");
/**
 * Creates a connect instance
 * @param {Object} connectionPackages 
 * @param {function} connectionPackages.exec exec function: initialized exec function
 */
const connect = function (connectionPackages) {
  /**
   * Attempt connection to server via UDP. Expects GNU netcat version 0.7.1.
   * When successful, the function will time out with no output.
   * Upon failure, the Promise will reject with a message stored in stderr.
   * @param {string} host host URL or IP address
   * @param {string} port port to use for udp connection
   * @param {number} timeout time for the test to time out
   * @param {boolean} doesNotConnect determines whether the test should expect a failed connection
   * @returns {Promise} Promise for the connection test. The promise should run `.catch`,
   * timing out if successful or returning an error if unsuccessful and `doesNotConnect` is true.
   * The Promise, when finished, will run a chai assertion. The Promise should not resolve.
   */
  this.udpTest = function (host, port, timeout, doesNotConnect) {
    let udpTimeout = timeout || 90000
    return connectionPackages
      .exec(`echo "test" | netcat -u ${host} ${port}`, { timeout: udpTimeout })
      .catch(({ stdout, stderr }) => {
        if (doesNotConnect) {
          assert.deepEqual(
            stderr,
            "read(net): Connection refused\n",
            "stderr should show expected data"
          );
        } else {
          assert.deepEqual(stderr, "", "stderr should be empty");
        }
      });
  };
};

module.exports = connect;
