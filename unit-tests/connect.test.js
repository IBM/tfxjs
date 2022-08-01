const { assert } = require("chai");
const connect = require("../lib/connect");
const mocks = require("./tfx.mocks");

let mockLib = new mocks();

describe("Testing the TCP connection", () => {
  it("successfully connects to a port where it expects a successful response", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(true) });
    return connectPackage.tcpTest("host", "port", false);
  });
  it("connects to a port where it expects an unsuccessful response", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(false) });
    return connectPackage.tcpTest("host", "port", false).catch((error) => {
      assert.equal(
        error.message,
        "stderr should be empty: expected 'TCP connection error' to deeply equal ''",
        "should display the same error"
      );
    });
  });
  it("does not connect to a port where a connection is expected to fail", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(false) });
    return connectPackage.tcpTest("host", "port", true);
  });
  it("connection expected to fail connects", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(true) });
    return connectPackage.tcpTest("host", "port", true).catch((error) => {
      assert.equal(
        error.message,
        "stderr should show expected data: expected '' to deeply equal 'TCP connection error'",
        "should display the same error"
      );
    });
  });
});
