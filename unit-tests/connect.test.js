const { assert } = require("chai");
const connect = require("../lib/connect");
const node_ssh = require("node-ssh");
const ping = require("ping");
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

let mockExecPackage = {
  mockExec: function (success) {
    return function (
      cmd,
      options = {
        cwd: process.cwd(),
        env: process.env,
        encoding: "utf8",
        shell: "/bin/sh",
        timeout: 0,
        maxBuffer: 1024 * 1024,
        killSignal: "SIGTERM",
        windowsHide: false,
      }
    ) {
      return new Promise((resolve, reject) => {
        if (success) {
          setTimeout(() => {
            reject({ stdout: "", stderr: "" });
          }, options.timeout);
        } else {
          reject({ stdout: "", stderr: "read(net): Connection refused\n" });
        }
      });
    };
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
  it("should successfully connect using UDP when there is a UDP listener on server", () => {
    let connectPackage = new connect({exec: mockExecPackage.mockExec(true)})
    return connectPackage.udpTest("host", "port", false);
  });
  it("should refuse UDP connection with no UDP listener on server", () => {
    let connectPackage = new connect({exec: mockExecPackage.mockExec(false)})
    return connectPackage.udpTest("host", "port", true);
  });
});
