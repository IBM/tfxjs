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
  $ tfx plan --in <terraform file path> --out <filepath> --type <tfx or yaml>

Additional flags are also available:
  -v | --tf-var
      Inject a terraform.tfvar value into the plan. This flag can be added any number of times

To create a nodejs test file from a YAML plan:
  $ tfx decode <yaml file path> --out <filepath>

Additional flags are also available:
  -v | --tf-var
  Inject a terraform.tfvar value into the plan. This flag can be added any number of times
`;

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
        assert.deepEqual(err, "oops", "should error");
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
      assert.deepEqual(actualData, help, "it should return correct data");
    });
    it("should throw error text if bad command", () => {
      let tfWithLogs = new cli(exec.promise, "bad-command", "bad-command");
      let task = () => {
        tfWithLogs.tfxcli();
      };
      assert.throws(
        task,
        "Invalid tfx command. For a list of valid commands run `tfx --help`."
      );
    });
    it("should throw an error if none commands passed", () => {
      tfx = new cli(exec.promise);
      let task = () => {
        tfx.tfxcli();
      };
      assert.throws(
        task,
        "tfx expects arguments after the command line. For a list of valid commands run `tfx --help`."
      );
    });
    it("should run runTest if one argument is passed", () => {
      tfx = new cli(exec.promise, "./filePath");
      let ranTest = false;
      tfx.runTest = () => {
        ranTest = true;
      };
      tfx.tfxcli();
      assert.isTrue(ranTest, "it ran the test");
    });
    it("should run decode", () => {
      tfx = new cli(exec.promise, "decode", "./filePath");
      let returnedDecode = false;
      tfx.decode = () => {
        returnedDecode = true
      }
      tfx.tfxcli();
      assert.isTrue(returnedDecode, "it should run the correct test")
    })
  });
  describe("plan", () => {
    it("should run extract with correct commands and flags for plan and write data", () => {
      tfx = new cli(
        exec.promise,
        "plan",
        "--in",
        "./filePath",
        "--out",
        "./out-file-path",
        "--type",
        "tfx",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"', 
        "-v",
        'testValue3=3'
      );
      let actualData = [];
      let expectedData = ["tfx Generated Plan", "./filePath", "tfx", {
        testVar1: true,
        testVar2: "true",
        testValue3: 3
      }];
      
      tfx.planTfx = (...args) => {
        let callback = args.pop(); // remove callback
        args.pop(); // remove child
        actualData = args;
        callback("fileData")
      }
      let actualCallback = [];
      let expectedCallback = ["./out-file-path", "fileData"];
      tfx.writeFileSync = (filePath, data) => {
        actualCallback = [filePath, data]
      }
      tfx.tfxcli();
      assert.deepEqual(actualData, expectedData, "it should return correct params")
      assert.deepEqual(actualCallback, expectedCallback, "it should run writeFileSync with correct params")
    });
  })
  describe("decode", () => {
    it("should run extract with correct commands and flags for decode and write data", () => {
      tfx = new cli(
        exec.promise,
        "decode",
        "./filePath",
        "--out",
        "./out-file-path",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"', 
        "-v",
        'testValue3=3'
      );
      let expectedReadArg = ["./filePath"]
      let expectedParams = [
        undefined,
        [
          "testVar1=true",
          "testVar2=\"true\"",
          "testValue3=3"
        ]
      ]
      let expectedFileData = ["./out-file-path", undefined]
      let actualParams
      let actualReadArg
      let actualFileData
      tfx.readFileSync = (...args) => {
        actualReadArg = args;
      }
      tfx.deyamilfy = (...args) => {
        actualParams = args;
      }
      tfx.writeFileSync = (...args) => {
        actualFileData = args
      }
      tfx.decode();
      assert.deepEqual(actualReadArg, expectedReadArg, "it should correctly read file data")
      assert.deepEqual(actualParams, expectedParams, "it should return all params")
      assert.deepEqual(actualFileData, expectedFileData, "it should return correct file data")
    });
  })
});
