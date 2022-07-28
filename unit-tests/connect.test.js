const { assert } = require("chai");
const connect = require("../lib/connect");

let mockLib = new mocks();

let mockTcpPackage = function (err) {
  promise: {
    tcp_connect: (data) => {
      if (data) {
        return new Promise((resolve, reject) => {
            resolve(host);
        })
      }
      else {
        return new Promise((resolve, reject) => {
            reject("Connection failure");
        })
      }
    };
  }
};

describe("Testing the TCP connection", () => {
  it("should successfully connect to the server using the port", () => {
    let connectPackage = new connect({exec: mockLib.})
    return connect.tcpTest("host", "port", false);
  });
  it("should not connect when the port does not exist", () => {
    return connect.tcpTest("host", "port", true)
  })
});
