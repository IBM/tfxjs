module.exports = {

    axiosMain: function(data, err) {
      return function(options) {
        return new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              data: data || {}
            });
          }
        });
      };
    },
    axiosDot: function(data, err) {
        return {
          get: function(url, options) {
            return new Promise((resolve, reject) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  data: data || {}
                });
              }
            });
          },
          post: function(url, body, options) {
            return new Promise((resolve, reject) => {
              if (err) {
                reject(err);
              } else {
                resolve("success");
              }
            });
          },
          delete: function(url, options) {
            return new Promise((resolve, reject) => {
              if (err) {
                reject(err);
              } else {
                resolve("success");
              }
            });
          },
          put: function(url, body, options) {
            return new Promise((resolve, reject) => {
              if (err) {
                reject(err);
              } else {
                resolve("success");
              }
            });
          }
        };
      }
  
};