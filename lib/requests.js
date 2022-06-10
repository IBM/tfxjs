/**
 * Function builder for handling outside requests
 * @param {*} axios function to execute requests
 */
const outsideRequests = function (axios) {
  /**
   * Function for GET requests
   * @param {Object} options options necessary for executing request
   * @param {*} assertionCallback assertion to run on data returned from request
   * @returns {Promise} Promise when complete will return the results of the assertion against returned data
   */
  this.axiosGet = (options, assertionCallback) => {
    /**
     * @callback assertionCallback
     * @param {Object} data Data to check against assertion
     */
    return axios(options)
      .then((data) => {
        assertionCallback(data);
      })
      .catch((err) => {
        assertionCallback(err);
      });
  };
};

module.exports = outsideRequests;
