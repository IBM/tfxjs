const mocks = require("./tfx.mocks");
const connect = require("../lib/connect");

let mockLib = new mocks();

describe("UDP connection", () => {
  it("should run a passing test when an expected UDP connection is successful", () => {
    let mockExec = new mockLib.mockExec({ stdout: "", stderr: "" }, true);
    let connectPackage = new connect({ exec: mockExec.promise });
    return connectPackage.udpTest("host", "port", 1000, false);
  });
  it("should run a passing test when an expected unsuccessful UDP connection is refused", () => {
    let mockExec = new mockLib.mockExec(
      { stdout: "", stderr: "read(net): Connection refused\n" },
      false
    );
    let connectPackage = new connect({ exec: mockExec.promise });
    return connectPackage.udpTest("host", "port", 1000, true);
  });
});
