const { assert } = require("chai");
const cli = require("../lib/tfx-cli");
const constants = require("../lib/constants");
const sinon = require("sinon");
const { prettyJSON } = require("lazy-z");

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

const help = [
  `${constants.ansiCyan}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiBold}#############################################################################`,
  `${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#                                                                           #`,
  `${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#                                   tfxjs                                   #`,
  `${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#                                                                           #`,
  `${constants.ansiResetDim}${constants.ansiDefaultForeground}\n${constants.ansiCyan}${constants.ansiBold}#############################################################################`,
  `${constants.ansiResetDim}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}tfxjs cli tool allows you to run tfxjs tests.${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}To test a .js file:${constants.ansiResetDim}\n`,
  `${constants.ansiBold}${constants.ansiResetDim}${constants.ansiCyan}  $ tfx <file_path>${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiBold}To create tests from a terraform plan:${constants.ansiResetDim}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiCyan}  $ tfx plan --in <terraform file path> --out <filepath> --type <tfx or yaml>${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiBold}Additional flags are also available:${constants.ansiResetDim}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiCyan}  -v | --tf-var${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}      Inject a terraform.tfvar value into the plan. This flag can be added any number of times${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}To create a nodejs test file from a YAML plan:${constants.ansiResetDim}\n`,
  `${constants.ansiBold}${constants.ansiResetDim}${constants.ansiCyan}  $ tfx decode <yaml file path> --out <filepath>${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiBold}Additional flags are also available:${constants.ansiResetDim}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiCyan}  -v | --tf-var${constants.ansiDefaultForeground}\n`,
  `${constants.ansiCyan}${constants.ansiDefaultForeground}${constants.ansiLtGray}      Inject a terraform.tfvar value into the plan. This flag can be added any number of times${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiLtGray}${constants.ansiBold}To initialize a tfxjs test directory:${constants.ansiResetDim}${constants.ansiDefaultForeground}\n`,
  `${constants.ansiLtGray}${constants.ansiBold}${constants.ansiResetDim}${constants.ansiDefaultForeground}${constants.ansiCyan}  $ tfx init <directory_path>${constants.ansiDefaultForeground}\n`,
  '\x1B[36m\x1B[39m\x1B[37m\x1B[1m\x1B[22m\x1B[39m\n',
  '\x1B[37m\x1B[1mTo check the global tfx version:\x1B[22m\x1B[39m\n',
  '\x1B[37m\x1B[1m\x1B[22m\x1B[39m\x1B[36m  $ tfx version\x1B[39m\n',
  '\x1B[36m\x1B[39m'
].join("");

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
    it("should return version text if only command `version`", () => {
      let tfWithLogs = new cli(exec.promise, spawn.promise, "version");
      let actualData;
      tfWithLogs.log = (data) => {
        actualData = data;
      };
      tfWithLogs.tfxcli();
      assert.deepEqual(actualData, `tfx cli version 1.2.0`, "it should return correct data");
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

      assert.isTrue(
        writeFileCallBackSpy.calledOnceWith("./out-file-path"),
        "should have been called once with correct args"
      );
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

      assert.isTrue(
        writeFileCallBackSpy.calledOnceWith("./out-file-path"),
        "should be called with correct params"
      );
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

      assert.isTrue(
        writeFileCallBackSpy.calledOnceWith("./out-file-path"),
        "should be called with correct params"
      );
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
      assert.isFunction(tfx.writeFileCallBack(), "should be a function");
    });
    it("should return a function that calls writeFileSync with the correct parameters", () => {
      let callbackFunction = tfx.writeFileCallBack("outFilePath");
      callbackFunction("filedata");
      assert(
        writeFileSyncSpy.calledOnceWith("outFilePath", "filedata"),
        "should be called once with correct params"
      );
    });
  });
  describe("tfxInit", () => {
    it("should throw an error if more than two arguments are passed", () => {
      tfx = new cli(exec.promise, exec.promise, "init", "dir", "oops");
      tfx.writeFileSync = new sinon.spy();
      tfx.mkdirSync = new sinon.spy();
      tfx.fsExists = () => {
        return true;
      };
      try {
        tfx.tfxcli();
      } catch (err) {
        assert.deepEqual(
          err,
          `${constants.ansiRed}tfx init expects only a single arcument (directory path). Got a list of valid commands, run \`tfx --help\`.${constants.ansiDefaultForeground}`,
          "it should throw correct string"
        );
      }
    });
    it("should create needed files when called with correct number of params", () => {
      let childSpy = new sinon.spy();
      tfx = new cli(exec.promise, exec.promise, "init", "dir");
      tfx.writeFileSync = new sinon.spy();
      tfx.mkdirSync = new sinon.spy();
      tfx.fsExists = () => {
        return true;
      };
      tfx.tfxcli();
      assert.deepEqual(
        exec.commandList[0],
        `cd dir && npm run build`,
        "it should cd and run npm build"
      );
      assert.isTrue(
        tfx.writeFileSync.callCount === 2,
        "it should call writeFileSync twice"
      );
      assert.deepEqual(
        tfx.writeFileSync.lastCall.args,
        ["dir/tfxjs.test.js", ""],
        "it should create an empty test file"
      );
      assert.deepEqual(
        tfx.writeFileSync.firstCall.args,
        [
          "dir/package.json",
          prettyJSON({
            name: "tfxjs generated acceptance tests",
            version: "0.0.1",
            description: "acceptance tests for terraform directory",
            main: "tfxjs.test.js",
            scripts: {
              test: "tfx .",
              build: "npm i && npm i -g tfxjs mocha",
            },
            author: "This file was automatically generated by tfxjs",
            license: "ISC",
            dependencies: {
              tfxjs: "^1.1.0",
            },
          }),
        ],
        "it should have the correct package.json data"
      );
    });
  });
});
