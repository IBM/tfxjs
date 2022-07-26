const { assert } = require("chai");
const connect = require("../lib/connect");
const badHost = "bad_host";
let mockSshPackage = function (err) {
  this.connected = false;
  this.isConnected = function () {
    return this.connected;
  };
  this.connect = function (data) {
    return new Promise((resolve, reject) => {
      if (err) {
        this.connected = false;
        reject("connection failure");
      } else {
        this.connected = true;
        resolve();
      }
    });
  };
};

let mockPingPackage = function (err) {
  this.promise = {
    probe: function (host) {
      return new Promise((resolve, reject) => {
        if (err) {
          resolve({ alive: false });
        } else {
          resolve({ alive: true });
        }
      });
    },
  };
};

describe("SSH Tests", function () {
  it("should connect with mock ssh", () => {
    let sshPackage = new mockSshPackage();
    let sshConn = new connect({ ssh: sshPackage });
    return sshConn.sshTest(
      "passing connecting ssh test",
      "host",
      "name",
      "key"
    );
  });
  it("should not connect if doesNotConnect is true", () => {
    let sshPackage = new mockSshPackage(true);
    let sshConn = new connect({ ssh: sshPackage });
    return sshConn.sshTest(
      "passing connecting ssh test",
      "host",
      "name",
      "key",
      true
    );
  });
  it("should throw an error if it doesn't connect when it should", () => {
    let sshPackage = new mockSshPackage(true);
    let sshConn = new connect({ ssh: sshPackage });
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
    let sshPackage = new mockSshPackage();
    let sshConn = new connect({ ssh: sshPackage });
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
    let pingConn = new connect({ ping: new mockPingPackage() });
    return pingConn.pingTest("passing connecting ping test", "host");
  });
  it("should not connect with doesNotConnect = true", () => {
    let pingConn = new connect({ ping: new mockPingPackage(true) });
    return pingConn.pingTest("passing not connecting ping test", "host", true);
  });
  it("should throw an error when connects and doesNotConnect = true", () => {
    let pingConn = new connect({ ping: new mockPingPackage() });
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
  it("should throw an error when doesn't and doesNotConnect = false", () => {
    let pingConn = new connect({ ping: new mockPingPackage(true) });
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
