const mocks = require("./tfx.mocks");
const connect = require("../lib/connect");
const { assert } = require("chai");

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
  it("should run a failing test when an expected UDP connection is unsuccessful", () => {
    let mockExec = new mockLib.mockExec({ stdout: "", stderr: "read(net): Connection refused\n" }, false);
    let connectPackage = new connect({ exec: mockExec.promise });
    return connectPackage.udpTest("host", "port", 1000, false).catch((err) => {
      assert.deepEqual(err.message, "stderr should be empty: expected 'read(net): Connection refused\\n' to deeply equal ''", "should fail with expected error message")
    });
  });
  it("should run a failing test when an expected unsuccessful UDP connection is successful", () => {
    let mockExec = new mockLib.mockExec(
      { stdout: "", stderr: "" },
      true
    );
    let connectPackage = new connect({ exec: mockExec.promise });
    return connectPackage.udpTest("host", "port", 1000, true).catch((err) => {
      assert.deepEqual(err.message, "stderr should show expected data: expected '' to deeply equal 'read(net): Connection refused\\n'", "should fail with expected error message");
    });
  });
});
