const { assert } = require("chai");
const mocks = require('./tfx.mocks');
const connect = require("../lib/connect");
const node_ssh = require("node-ssh");
const ping = require("ping");

let mockLib = new mocks();

let mockSshPackage = {
  connect: (data) => {
    if (data) {
      return new Promise((resolve, reject) => {
        resolve(data);
      });
    } else {
      return new Promise((resolve, reject) => {
        reject("connection failure");
      });
    }
  },
};

let mockPingPackage = {
  promise: {
    probe: (host) => {
      if (host) {
        return new Promise((resolve, reject) => {
          resolve(host);
        });
      } else {
        return new Promise((resolve, reject) => {
          reject("connection failure");
        });
      }
    },
  },
};

describe("SSH Tests", function () {
  it("should connect with mock ssh", () => {
    return connect.sshTest(mockSshPackage, "host", "name", "key", false);
  }),
    it("should connect with correct credentials real ssh", () => {
      return connect.sshTest(
        new node_ssh.NodeSSH(),
        "150.239.84.248",
        "root",
        "/Users/tahajafry/.ssh/id_rsa_ibm",
        false
      );
    });
});

describe("Ping Tests", function () {
  it("should connect with mock ping", () => {
    return connect.pingTest(mockPingPackage, "host", false);
  }),
    it("should connect with ping", () => {
      return connect.pingTest(ping, "host", false);
    });
});

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
