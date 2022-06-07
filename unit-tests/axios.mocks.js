module.exports = {

    axiosMain: function(optionReturnVariable, data, err) {
      return function(options) {
        optionReturnVariable.set(options);
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
    axiosDot: function(optionReturnVariable, err) {
        return {
          get: function(url, options) {
            optionReturnVariable.set({
              url: url,
              body: null,
              options: options,
              method: "get"
            });
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
            optionReturnVariable.set({
              url: url,
              body: body,
              options: options,
              method: "post"
            });
            return new Promise((resolve, reject) => {
              if (err) {
                reject(err);
              } else {
                resolve("success");
              }
            });
          },
          delete: function(url, options) {
            optionReturnVariable.set({
              url: url,
              body: null,
              options: options,
              method: "delete"
            });
            return new Promise((resolve, reject) => {
              if (err) {
                reject(err);
              } else {
                resolve("success");
              }
            });
          },
          put: function(url, body, options) {
            optionReturnVariable.set({
              url: url,
              body: body,
              options: options,
              method: "put"
            });
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