const { assert } = require("chai");
const cli = require("../lib/tfx-cli");

function mockExec(data) {
  this.data = data;
  this.commandList = [];
  this.promise = (command) => {
    this.commandList.push(command);
    return new Promise((resolve, reject) => {
      if (this.data?.stderr) reject(this.data);
      else resolve(this.data);
    });
  };
}

const help = `
#############################################################################
#                                                                           #
#                                   tfxjs                                   #
#                                                                           #
#############################################################################

tfxjs cli tool allows you to run tfxjs tests.

To test a .js file:
  $ tfx <file_path>

To create tests from a terraform plan:
  $ tfx --in <terraform file path> --out <filepath> --type <tfx or yaml>

Additional flags are also available:

`


let exec = new mockExec({}, false);
let tfx = new cli(exec.promise);

describe("cli", () => {
  beforeEach(() => {
    exec = new mockExec({}, false);
    tfx = new cli(exec.promise, "./filePath");
  });
  describe("runTest", () => {
    it("should print data when successful", () => {
      let testData;
      tfx.print = (data) => {
        testData = data;
      };
      return tfx.tfxcli().then(() => {
        assert.deepEqual(testData, {}, "it should return data");
      });
    });
    it("should throw an error when data has stderr", () => {
      exec.data = {
        stderr: "oops",
      };
      return tfx.runTest().catch((err) => {
        assert.deepEqual(err.message, "oops", "should error");
      });
    });
  });
  describe("print", () => {
    it("should print", () => {
      let tfWithLogs = new cli(exec.promise);
      let actualData;
      tfWithLogs.log = (data) => {
        actualData = data;
      };
      tfWithLogs.print("frog");
      assert.deepEqual(actualData, "frog", "it should return exact data");
    });
  });
  describe("tfxcli", () => {
    beforeEach(() => {
      exec = new mockExec({}, false);
      tfx = new cli(exec.promise);
    });
    it("should return help text if a help flag", () => {
      let tfWithLogs = new cli(exec.promise, "--help");
      let actualData;
      tfWithLogs.log = (data) => {
        actualData = data;
      };
      tfWithLogs.tfxcli();
      assert.deepEqual(actualData, help, "it should return correct data")
    });
    it("should throw an error if none commands passed", () => {
      tfx = new cli(exec.promise);
      let task = () => {
        tfx.tfxcli()
      };
      assert.throws(task,"tfx expects arguments after the command line. For a list of valid commands run `tfx --help`.")
    });
    it("should run runTest if one argument is passed", () => {
      tfx = new cli(exec.promise, "./filePath");
      let ranTest = false
      tfx.runTest = () => {
        ranTest = true;
      }
      tfx.tfxcli();
      assert.isTrue(ranTest, "it ran the test")
    })
    it("should run extract with correct commands and flags for plan", () => {
      tfx = new cli(exec.promise, "plan", "--in", "./filePath", "--out", "./out-file-path", "--type", "yaml");
      tfx.tfxcli();
    })
  })
});
