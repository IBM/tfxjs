const { assert } = require("chai");
const mocks = require("./tfx.mocks");
let mock = new mocks();

describe("mocks", () => {
  describe("describe", () => {
    it("should return the evaluation of the inside callback function", () => {
      let data = mock.describe("should blah blah blah", () => {
        return {
          data: true,
        };
      });
      assert.deepEqual(
        data,
        { data: true },
        "Should return result of inner function"
      );
    });
    it("should add a definition to the definition list", () => {
      assert.deepEqual(
        mock.definitionList,
        ["should blah blah blah"],
        "Should return result of inner function"
      );
    });
    it("should return the value of it when the mock it is used inside describe", () => {
      let data = mock.describe("should outside", () => {
        return mock.it("should insdie", () => {
          return "sending out an sos";
        });
      });
      assert.deepEqual(
        data,
        "sending out an sos",
        "it should evaluate inner callback"
      );
    });
  });
  describe("it", () => {
    before(() => {
      mock = new mocks();
    });
    it("should return the evaluation of the inside callback function", () => {
      let data = mock.it("should blah blah blah", () => {
        return {
          data: true,
        };
      });
      assert.deepEqual(
        data,
        { data: true },
        "Should return result of inner function"
      );
    });
    it("should add a definition to the it list", () => {
      assert.deepEqual(
        mock.itList,
        ["should blah blah blah"],
        "Should return result of inner function"
      );
    });
  });
  describe("before", () => {
    before(() => {
      mock = new mocks();
    });
    it("should return the evaluation of the inside callback function", () => {
      let data = mock.before(() => {
        return {
          data: true,
        };
      });
      assert.deepEqual(
        data,
        { data: true },
        "Should return result of inner function"
      );
    });
    it("should add a definition to the before list", () => {
      assert.deepEqual(
        mock.beforeList,
        [
          {
            data: true,
          },
        ],
        "Should return result of inner function"
      );
    });
  });
  describe("exec", () => {
    it("should return the correct string", async () => {
      assert.deepEqual(
        await mock.exec(""),
        {
          stdout: `{"planned_values" : "success"}`,
        },
        "it should return the correct string"
      );
    });
    it("should set lest script to equal script run", async () => {
      await mock.exec("script");
      assert.deepEqual(
        mock.lastScript,
        `script`,
        "it should return the correct string"
      );
    });
  });
  describe("log", () => {
    it("should add a string to log list when called", () => {
      mock.log("hi");
      assert.deepEqual(
        mock.logList,
        ["hi"],
        "it should return the correct array"
      );
    });
  });
  describe("mockExec", () => {
    let mockExec;
    beforeEach(() => {
      mockExec = new mock.mockExec('{"ding": "dong"}');
    });
    it("should init data", () => {
      assert.deepEqual(
        mockExec.data,
        '{"ding": "dong"}',
        "it should have correct data"
      );
    });
    describe("promise", () => {
      it("should resolve if correct data and add command to command list", () => {
        return mockExec.promise("hi").then((data) => {
          assert.deepEqual(data, `{"ding": "dong"}`, "should return");
          assert.deepEqual(
            mockExec.commandList,
            ["hi"],
            "should have correct commands"
          );
        });
      });
      it("should reject if incorrect data and add command to command list", () => {
        mockExec.data = {
          stderr: "whoops",
        };
        return mockExec.promise("hi").catch((data) => {
          assert.deepEqual(
            data,
            {
              stderr: "whoops",
            },
            "should return"
          );
          assert.deepEqual(
            mockExec.commandList,
            ["hi"],
            "should have correct commands"
          );
        });
      });
    });
  });
<<<<<<< HEAD
=======
  describe("tcp", () => {
    let mockTcpPackage = new mock.tcpPackage();
    let errorTcpPackage = new mock.tcpPackage(true);
    it("should connect without an error", () => {
      return mockTcpPackage().catch(({ stdout, stderr }) => {
        assert.deepEqual(
          stdout,
          "Success",
          "stdout should display expected data"
        );
        assert.deepEqual(stderr, "", "should be no error");
      });
    });
    it("should not connect with an error", () => {
      return errorTcpPackage().catch(({ stdout, stderr }) => {
        assert.deepEqual(stdout, "", "stdout should be empty");
        assert.deepEqual(
          stderr,
          "TCP Connection to host host on port port expected",
          "should be an error"
        );
      });
    });
  });
  describe("mockFs", () => {
    let mockFs = new mock.mockFs();
    let dirMockFs = new mock.mockFs(true)
    it("should return running writeFileSync", () => {
      let actualData = mockFs.writeFileSync("path", "data");
      assert.deepEqual(actualData, "data", "it should return data")
    })
    it("should return running mkdirSync", () => {
      let actualData = mockFs.mkdirSync("path");
      assert.deepEqual(actualData, "path", "it should return data")
    })
    it("should return false running existsSync if file does not exist", () => {
      let actualData = mockFs.existsSync("path");
      assert.deepEqual(actualData, false, "it should return data")
    })
    it("should return false running existsSync if file does not exist", () => {
      let actualData = dirMockFs.existsSync("path");
      assert.deepEqual(actualData, true, "it should return data")
    })
  })
  describe("ssh", () => {
    let mockSshPackage = new mock.mockSshPackage();
    let errMockSshPackage = new mock.mockSshPackage(true);
    it("should not be connected to any host when initialized", () => {
      assert.deepEqual(
        mockSshPackage.isConnected(),
        false,
        "should not be connected"
      );
      assert.deepEqual(
        errMockSshPackage.isConnected(),
        false,
        "should not be connected"
      );
    });
    it("should be connected after connect() is run when there is no error", () => {
      mockSshPackage.connect();
      assert.deepEqual(
        mockSshPackage.isConnected(),
        true,
        "should be connected"
      );
    });
    it("should not be connected even after connect() with an error", () => {
      errMockSshPackage.connect();
      assert.deepEqual(
        errMockSshPackage.isConnected(),
        false,
        "should not be connected"
      );
    });
  });
  describe("ping", () => {
    let mockPingPackage = new mock.mockPingPackage();
    let errMockPingPackage = new mock.mockPingPackage(true);

    it("should connect with no error", () => {
      return mockPingPackage.promise.probe().then((res) => {
        assert.deepEqual(res.alive, true, "host should be alive");
      });
    });

    it("should not connect with error", () => {
      return errMockPingPackage.promise.probe().then((res) => {
        assert.deepEqual(res.alive, false, "host should be dead");
      });
    });
  });
>>>>>>> intern-tfxjs/master
});
