let mockSshPackage = {
  connect: (data) => {
    if (data) {
      return new Promise((resolve, reject) => {
        resolve(data);
      });
    } else {
      return new Promise((resolve, reject) => {
        reject("connection failure");
      });
    }
  },
};
