const { assert } = require("chai");
const cli = require("../lib/tfx-cli");
const constants = require("../lib/constants");
const sinon = require("sinon");
const { isFunction } = require("../lib/helpers");

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

const help = `${constants.ansiCyan}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#############################################################################${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#                                                                           #${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#                                   tfxjs                                   #${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#                                                                           #${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#############################################################################${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}tfxjs cli tool allows you to run tfxjs tests.${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}To test a .js file:${constants.ansiResetDim}\n${constants.ansiBold}${constants.ansiResetDim}${constants.ansiCyan}  $ tfx <file_path>${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiBold}To create tests from a terraform plan:${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiCyan}  $ tfx plan --in <terraform file path> --out <filepath> --type <tfx or yaml>${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiBold}Additional flags are also available:${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiCyan}  -v | --tf-var${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}      Inject a terraform.tfvar value into the plan. This flag can be added any number of times${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}To create a nodejs test file from a YAML plan:${constants.ansiResetDim}\n${constants.ansiBold}${constants.ansiResetDim}${constants.ansiCyan}  $ tfx decode <yaml file path> --out <filepath>${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiBold}Additional flags are also available:${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiCyan}  -v | --tf-var${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}      Inject a terraform.tfvar value into the plan. This flag can be added any number of times${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}`;

let exec = new mockExec({}, false);
let spawn = new mockExec({}, false);
let tfx = new cli(exec.promise, spawn.promise);

describe("cli", () => {
  beforeEach(() => {
    exec = new mockExec({}, false);
    tfx = new cli(exec.promise, spawn.promise, "./filePath");
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
      spawn.data = {
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
      let tfWithLogs = new cli(exec.promise, spawn.promise, "--help");
      let actualData;
      tfWithLogs.log = (data) => {
        actualData = data;
      };
      tfWithLogs.tfxcli();
      assert.deepEqual(actualData, help, "it should return correct data");
    });
    it("should throw error text if bad command", () => {
      let tfWithLogs = new cli(
        exec.promise,
        spawn.promise,
        "bad-command",
        "bad-command"
      );
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
      tfx = new cli(exec.promise, spawn.promise, "./filePath");
      let ranTest = false;
      tfx.runTest = () => {
        ranTest = true;
      };
      tfx.tfxcli();
      assert.isTrue(ranTest, "it ran the test");
    });
    it("should run decode", () => {
      tfx = new cli(exec.promise, spawn.promise, "decode", "./filePath");
      let returnedDecode = false;
      tfx.decode = () => {
        returnedDecode = true;
      };
      tfx.tfxcli();
      assert.isTrue(returnedDecode, "it should run the correct test");
    });
  });
  describe("plan", () => {
    let planTfxSpy, writeFileCallBackSpy;
    beforeEach(() => {
      planTfxSpy = new sinon.spy();
      writeFileCallBackSpy = new sinon.spy();
    });
    it("should run extract with correct commands and flags for plan and write data", () => {
      tfx = new cli(
        "exec.promise",
        "spawn.promise",
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
        "testValue3=3"
      );
      tfx.planTfx = planTfxSpy;

      tfx.writeFileCallBack = writeFileCallBackSpy;

      tfx.tfxcli();
      assert.isTrue(
        planTfxSpy.calledOnceWith(
          "tfx Generated Plan",
          "./filePath",
          "tfx",
          { testVar1: true, testVar2: "true", testValue3: 3 },
          "exec.promise",
          false,
          false
        ),
        "it should return correct params"
      );

      assert.isTrue(writeFileCallBackSpy.calledOnceWith("./out-file-path"));
    });
    it("should run extract with correct commands and flags for plan and write data when shallow", () => {
      tfx = new cli(
        "exec.promise",
        "spawn.promise",
        "plan",
        "--in",
        "./filePath",
        "--out",
        "./out-file-path",
        "-s",
        "--type",
        "tfx",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"',
        "-v",
        "testValue3=3"
      );
      tfx.planTfx = planTfxSpy;

      tfx.writeFileCallBack = writeFileCallBackSpy;

      tfx.tfxcli();
      assert.isTrue(
        planTfxSpy.calledOnceWith(
          "tfx Generated Plan",
          "./filePath",
          "tfx",
          { testVar1: true, testVar2: "true", testValue3: 3 },
          "exec.promise",
          true,
          false
        ),
        "it should return correct params"
      );

      assert.isTrue(writeFileCallBackSpy.calledOnceWith("./out-file-path"));
    });
    it("should run extract with correct commands and flags for plan and write data when quiet", () => {
      tfx = new cli(
        "exec.promise",
        "spawn.promise",
        "plan",
        "--in",
        "./filePath",
        "--out",
        "./out-file-path",
        "-q",
        "--type",
        "tfx",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"',
        "-v",
        "testValue3=3"
      );

      tfx.planTfx = planTfxSpy;

      tfx.writeFileCallBack = writeFileCallBackSpy;

      tfx.tfxcli();
      assert.isTrue(
        planTfxSpy.calledOnceWith(
          "tfx Generated Plan",
          "./filePath",
          "tfx",
          { testVar1: true, testVar2: "true", testValue3: 3 },
          "exec.promise",
          false,
          true
        ),
        "it should return correct params"
      );

      assert.isTrue(writeFileCallBackSpy.calledOnceWith("./out-file-path"));
    });
  });
  describe("decode", () => {
    it("should run extract with correct commands and flags for decode and write data", () => {
      tfx = new cli(
        exec.promise,
        spawn.promise,
        "decode",
        "./filePath",
        "--out",
        "./out-file-path",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"',
        "-v",
        "testValue3=3"
      );
      let expectedReadArg = ["./filePath"];
      let expectedParams = [
        undefined,
        ["testVar1=true", 'testVar2="true"', "testValue3=3"],
      ];
      let expectedFileData = ["./out-file-path", undefined];
      let actualParams;
      let actualReadArg;
      let actualFileData;
      tfx.readFileSync = (...args) => {
        actualReadArg = args;
      };
      tfx.deyamilfy = (...args) => {
        actualParams = args;
      };
      tfx.writeFileSync = (...args) => {
        actualFileData = args;
      };
      tfx.decode();
      assert.deepEqual(
        actualReadArg,
        expectedReadArg,
        "it should correctly read file data"
      );
      assert.deepEqual(
        actualParams,
        expectedParams,
        "it should return all params"
      );
      assert.deepEqual(
        actualFileData,
        expectedFileData,
        "it should return correct file data"
      );
    });
  });
  describe("writeFileCallBack", () => {
    tfx = new cli();
    let writeFileSyncSpy;
    beforeEach(() => {
      writeFileSyncSpy = sinon.spy();
      tfx.writeFileSync = writeFileSyncSpy;
    });
    it("should return a function", () => {
      assert.isFunction(tfx.writeFileCallBack());
    });
    it("should return a function that calls writeFileSync with the correct parameters", () => {
      let callbackFunction = tfx.writeFileCallBack("outFilePath");
      callbackFunction("filedata");
      assert(writeFileSyncSpy.calledOnceWith("outFilePath", "filedata"));
    });
  });
});
