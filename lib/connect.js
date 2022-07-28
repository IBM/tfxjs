
const { assert } = require("chai");

const connect = function (connectionPackages) {




    /**
     * Attempt connection to TCP
     * @param {string} host host URL or IP address
     * @param {string} port port to use for tcp connection
     * @param {boolean} doesNotConnect test to see if the server does not connect
     * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
     */
    this.tcpTest = function (host, port, doesNotConnect) {
        return connectionPackages.exec('echo "test" | netcat -vz ' + host + " " + port).catch((stderr) => {
            if(doesNotConnect) {
                assert.equal(stderr, "Connection error", "stderr should show expected data")
            }
            else {
                assert.equal(stderr, "", "stderr should be empty");
            }
        })
    }
}
module.exports = connect;
