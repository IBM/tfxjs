const { assert } = require("chai");
const connect = require("../lib/connect");
const mocks = require("./tfx.mocks");

let mockLib = new mocks();

describe("Testing the TCP connection", () => {
  //passing test
  it("successfully connects to a port where it expects a successful response", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(true) });
    return connectPackage.tcpTest("host", "port", false);
  });
  //failing test
  it("connects to a port where it expects an unsuccessful response", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(false) });
    return connectPackage.tcpTest("host", "port", true);
  });
  //passing test
  it("does not connect to a port where a connection is expected to fail", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(true) });
    return connectPackage.tcpTest("host", "port", false);
  });
  //failing test
  it("connection expected to fail connects", () => {
    let connectPackage = new connect({ exec: mockLib.tcpExec(false) });
    return connectPackage.tcpTest("host", "port", true);
  });
});
