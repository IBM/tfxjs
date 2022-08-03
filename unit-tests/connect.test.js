const { assert } = require("chai");
const connect = require("../lib/connect");
const mocks = require("./tfx.mocks");
let mock = new mocks();
let mockSshPackage = new mock.mockSshPackage();
let errMockSshPackage = new mock.mockSshPackage(true);
let mockPingPackage = new mock.mockPingPackage();
let errMockPingPackge = new mock.mockPingPackage(true);

describe("SSH Tests", function () {
  it("it should run a passing test when an expected connection is successful", () => {
    let sshConn = new connect({ ssh: mockSshPackage });
    return sshConn.sshTest(
      "passing connecting ssh test",
      "host",
      "name",
      "key"
    );
  });
  it("it should run a passing test assertion when an expected unsuccessful connection is refused", () => {
    let sshConn = new connect({ ssh: errMockSshPackage });
    return sshConn.sshTest(
      "passing connecting ssh test",
      "host",
      "name",
      "key",
      true
    );
  });
  it("it should create a failing test assertion when a expected connection is unsuccessful", () => {
    let sshConn = new connect({ ssh: errMockSshPackage });
    return sshConn
      .sshTest("failing not connecting ssh test", "host", "name", "key")
      .catch((err) => {
        assert.deepEqual(
          err.message,
          "failing not connecting ssh test: expected undefined to deeply equal true"
        );
      });
  });
  it("it should create a failing test assertion when an unexpected connection is made", () => {
    let sshConn = new connect({ ssh: mockSshPackage });
    return sshConn
      .sshTest("failing connecting ssh test", "host", "name", "key", true)
      .catch((err) => {
        assert.deepEqual(
          err.message,
          "failing connecting ssh test: expected true to deeply equal false"
        );
      });
  });
});
describe("Ping Tests", function () {
  it("it should run a passing test when an expected connection is successful", () => {
    let pingConn = new connect({ ping: mockPingPackage });
    return pingConn.pingTest("passing connecting ping test", "host");
  });
  it("it should run a passing test when an expected unsuccessful connection is refused", () => {
    let pingConn = new connect({ ping: errMockPingPackge });
    return pingConn.pingTest("passing not connecting ping test", "host", true);
  });
  it("it should run a failing test assertion when an unexpected connection occurs", () => {
    let pingConn = new connect({ ping: mockPingPackage });
    return pingConn
      .pingTest("failing connecting ping test", "host", true)
      .catch((err) => {
        assert.deepEqual(
          err.message,
          "failing connecting ping test: expected true to deeply equal false",
          "error should be the same"
        );
      });
  });
  it("it should run a failing test assertion when an expected connection fails", () => {
    let pingConn = new connect({ ping: errMockPingPackge });
    return pingConn
      .pingTest("failing not connecting ping test", "host")
      .catch((err) => {
        assert.deepEqual(
          err.message,
          "failing not connecting ping test: expected false to deeply equal true",
          "error should be the same"
        );
      });
  });
});
describe("Testing the TCP connection", () => {
  it("should run a successful test assertion when an expected connection is successful", () => {
    let connectPackage = new connect({ exec: mock.tcpPackage() });
    return connectPackage.tcpTest("host", "port");
  });
  it("should run a failing assertion test where an unexpected tcp connection is made", () => {
    let connectPackage = new connect({ exec: mock.tcpPackage(true) });
    return connectPackage.tcpTest("host", "port", true).catch((error) => {
      assert.equal(
        error.message,
        "Expected successful TCP connection: expected 'TCP Connection to host ${host} on por…' to deeply equal ''",
        "should display the same error"
      );
    });
  });
  it("should create a successful test assertion if a connection not expected to connect does not connect", () => {
    let connectPackage = new connect({ exec: mock.tcpPackage() });
    return connectPackage.tcpTest("host", "port");
  });
  it("should create a failing test assertion when a connection expected to fail succeeds", () => {
    let connectPackage = new connect({ exec: mock.tcpPackage(true) });
    return connectPackage.tcpTest("host", "port").catch((error) => {
      assert.equal(
        error.message,
        "Expected successful TCP connection: expected 'TCP Connection to host ${host} on por…' to deeply equal ''",
        "should display the same error"
      );
    });
  });
});
