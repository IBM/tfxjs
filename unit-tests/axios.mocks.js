module.exports = {
  /**
   * Sets up the mock function for main axios function `axios(options)`
   * @param {*} data data that the Promise should return
   * @param {*} err false if Promise should resolve, true or Object if Promise should reject
   * @returns function that mocks the main axios function `axios(options)`
   */
  axiosMain: function (data, err) {
    /**
     * Mock function for main axios function `axios(options)`
     * @returns Promise that will either reject with err or resolve with {data: data || {}}
     */
    return function (options) {
      return new Promise((resolve, reject) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            data: data || {},
          });
        }
      });
    };
  },
  /**
   * Sets up the mock axios functions `axios.get`, `axios.post`, `axios.delete`, and `axios.put`
   * @param {*} data data that each Promise should return
   * @param {*} err false if Promise should resolve, true or Object if Promise should reject
   * @returns Object containing mock `get`, `post`, `delete`, and `put` functions
   */
  axiosDot: function (data, err) {
    return {
      /**
       * Mock function for `axios.get(url, options)`
       * @param {String} url url to target for get request (arbitrary)
       * @param {*} options arbitrary parameter
       * @returns Promise that will either reject with err or resolve with {data: data || {}}
       */
      get: function (url, options) {
        return new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              data: data || {},
            });
          }
        });
      },
      /**
       * Mock function for `axios.post(url, body, options)`
       * @param {String} url url to target for post request (arbitrary)
       * @param {*} body arbitrary parameter
       * @param {*} options arbitrary parameter
       * @returns Promise that will either reject with err or resolve with "success"
       */
      post: function (url, body, options) {
        return new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          } else {
            resolve("success");
          }
        });
      },
      /**
       * Mock function for `axios.delete(url, options)`
       * @param {String} url url to target for delete request (arbitrary)
       * @param {*} options arbitrary parameter
       * @returns Promise that will either reject with err or resolve with "success"
       */
      delete: function (url, options) {
        return new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          } else {
            resolve("success");
          }
        });
      },
      /**
       * Mock function for `axios.put(url, body, options)`
       * @param {String} url url to target for put request (arbitrary)
       * @param {*} body arbitrary parameter
       * @param {*} options arbitrary parameter
       * @returns Promise that will either reject with err or resolve with "success"
       */
      put: function (url, body, options) {
        return new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          } else {
            resolve("success");
          }
        });
      },
    };
  },
};
