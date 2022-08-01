const { assert } = require("chai");
/**
 *
 * @param {Object} connectionPackages
 * @param {Object} connectionPackages.tcp -> tcp, used for mock or real tcp package
 */
const connect = function (connectionPackages) {
  /**
   * Attempt connection to TCP. When finished, will run a chai assertion
   * @param {string} host host URL or IP address
   * @param {string} port port to use for tcp connection
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  this.tcpTest = function (host, port, doesNotConnect) {
    return connectionPackages
      .exec("netcat -vz " + host + " " + port)
      .catch(({ stdout, stderr }) => {
        assert.deepEqual(
          stderr,
          doesNotConnect ? "TCP connection error" : "",
          doesNotConnect
            ? "stderr should show expected data"
            : "stderr should be empty"
        );
        assert.deepEqual(stdout, "", "stdout should be empty");
      });
  };
};
module.exports = connect;
