/**
 * Function builder for handling outside requests
 * @param {*} axios function to execute requests
 */
const outsideRequests = function (axios) {
  /**
   * Function for GET requests
   * @param {*} options options necessary for executing request
   * @param {*} assertion assertion to run on data returned from request
   * @returns {Promise} Promise when complete will return the results of the assertion against returned data
   */
  this.axiosGet = (options, assertion) => {
    return axios(options)
      .then((data) => {
        assertion(data);
      })
      .catch((err) => {
        assertion(err);
      });
  };
};

module.exports = outsideRequests;
