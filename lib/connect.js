const connect = function () {
  /**
   * Attempt connection to SSH
   * @param {string} host host URL or IP address
   * @param {string} username Username to use for ssh connection
   * @param {string} privateKey ssh private key
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  function sshTest(host, username, privateKey, doesNotConnect) {}

  /**
   * Attempt connection via ping
   * @param {string} host host URL or IP address
   * @param {boolean} doesNotConnect test to see if the server does not connect
   * @returns {Promise} Promise for the connection test. The promise should run `.then` if successful or if unsuccessful and `doesNotConnect` is true
   */
  function pingTest(host, doesNotConnect) {}
};
