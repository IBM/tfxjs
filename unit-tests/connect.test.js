const mocks = require('./tfx.mocks');
const connect = require("../lib/connect");

let mockLib = new mocks();

describe("UDP connection", () => {
  it("should run a passing test when an expected UDP connection is successful", () => {
    let connectPackage = new connect({exec: mockLib.udpExec(true)})
    return connectPackage.udpTest("host", "port", {timeout: 1000}, false);
  });
  it("should run a passing test when an expected unsuccessful UDP connection is refused", () => {
    let connectPackage = new connect({exec: mockLib.udpExec(false)})
    return connectPackage.udpTest("host", "port", {timeout: 1000}, true);
  });
});
