const { assert } = require("chai");
const connect = require("../lib/connect");
const mocks = require('./tfx.mocks')

let mockLib = new mocks();



describe("Testing the TCP connection", () => {
  it("should successfully connect to the server using the port", () => {
    let connectPackage = new connect({exec: mockLib.tcpExec(true)});
    return connectPackage.tcpTest("host", "port", false);
  });
  it("should not connect when the port does not exist", () => {
    let connectPackage = new connect({exec: mockLib.tcpExec(false)});
    return connectPackage.tcpTest("host", "port", true);
  })
});
