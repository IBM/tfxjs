/**
 * HTTP Callback Function
 * @param {*} assertion Assertion to run when the call is finished
 * @returns {Promise} Promise when complete will return the results of the assertion against returned data
 */
const outsideRequests = function (axios) {
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
