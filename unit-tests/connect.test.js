const { assert } = require("chai");
const connect = require("../lib/connect");
const mocks = require("./tfx.mocks");
let mock = new mocks();
let mockSshPackage = new mock.mockSshPackage();
let errMockSshPackage = new mock.mockSshPackage(true);
let mockPingPackage = new mock.mockPingPackage();
let errMockPingPackge = new mock.mockPingPackage(true);

describe("SSH Tests", function () {
  it("should connect with mock ssh", () => {
    let sshConn = new connect({ ssh: mockSshPackage });
    return sshConn.sshTest(
      "passing connecting ssh test",
      "host",
      "name",
      "key"
    );
  });
  it("should not connect if doesNotConnect is true", () => {
    let sshConn = new connect({ ssh: errMockSshPackage });
    return sshConn.sshTest(
      "passing connecting ssh test",
      "host",
      "name",
      "key",
      true
    );
  });
  it("should throw an error if it doesn't connect when it should", () => {
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
  it("should throw an error when it connects and its not supposed to", () => {
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
  it("should connect with mock ping", () => {
    let pingConn = new connect({ ping: mockPingPackage });
    return pingConn.pingTest("passing connecting ping test", "host");
  });
  it("should not connect with doesNotConnect = true", () => {
    let pingConn = new connect({ ping: errMockPingPackge });
    return pingConn.pingTest("passing not connecting ping test", "host", true);
  });
  it("should throw an error when connects and doesNotConnect = true", () => {
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
  it("should throw an error when doesn't connect and doesNotConnect = false", () => {
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
