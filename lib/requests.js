/**
 * Function builder for handling outside requests
 * @param {axios} initialized in npm axios package
 */
const outsideRequests = function (axios) {
  /**
   * Function for GET requests
   * @param {Object} options options necessary for executing request
   * @param {assertionCallback} assertion to run on data returned from request
   * @returns {Promise} Promise when complete will return the results of the assertion against returned data
   */
  this.axiosGet = (options, assertionCallback) => {
    return axios(options)
      .then((data) => {
        assertionCallback(data);
      })
      .catch((err) => {
        assertionCallback(err);
      });
  };
};

/**
 * @callback assertionCallback
 * @param {Object} data Data to check against assertion
 */

module.exports = outsideRequests;
