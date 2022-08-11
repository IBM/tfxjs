const { assert } = require("chai");
const tfUnitTestUtils = require("../lib/tf-utils.js"); // Import utils
const tfxjs = require("../lib/index"); // import main constructor
const mocks = require("./tfx.mocks"); // import mocks
const tfx = new tfxjs("./mock_path"); // initialize tfx
<<<<<<< HEAD
let mock = new mocks(); // initialize mocks
process.env.API_KEY = "test";

// initialize mock tfx
let overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
  overrideBefore: mock.before,
  overrideDescribe: mock.describe,
  overrideIt: mock.it,
  quiet: true,
  overrideExec: new mock.mockExec({}).promise
});
=======
const constants = require("../lib/constants");
const sinon = require("sinon");
let mock = new mocks(); // initialize mocks
process.env.API_KEY = "test";

let describeSpy, itSpy, beforeSpy, logSpy;
describeSpy = new sinon.spy();
itSpy = new sinon.spy();
beforeSpy = new sinon.spy();
logSpy = new sinon.spy();

let beforeFn = (callback) => {
  beforeSpy(callback());
  return callback();
};
let describeFn = (definition, callback) => {
  describeSpy(definition);
  return callback();
};
let itFn = (definition, callback) => {
  itSpy(definition);
  return callback();
};

// initialize mock tfx
let overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
  overrideBefore: beforeFn,
  overrideDescribe: describeFn,
  overrideIt: itFn,
  quiet: true,
  overrideExec: new mock.mockExec({}).promise,
});
// prevent creation of file
overrideTfx.cli.createTfVarFile = () => {};
>>>>>>> intern-tfxjs/master

describe("tfxjs", () => {
  describe("tfxjs init", () => {
    describe("override chai utils", () => {
      it("should use the chai it function if not override option passed", () => {
        assert.deepEqual(
          tfx.it.toString(),
          it.toString(),
          "it should have correct it function"
        );
      });
      it("should use the chai describe function if not override option passed", () => {
        assert.deepEqual(
          tfx.describe.toString(),
          describe.toString(),
          "it should have correct describe function"
        );
      });
      it("should use the chai before function if not override option passed", () => {
        assert.deepEqual(
          tfx.before.toString(),
          before.toString(),
          "it should have correct before function"
        );
      });
      it("should not use the chai before function if override option passed", () => {
        assert.deepEqual(
          overrideTfx.before.toString(),
<<<<<<< HEAD
          mock.before.toString(),
=======
          beforeFn.toString(),
>>>>>>> intern-tfxjs/master
          "it should have correct it function"
        );
      });
      it("should not use the chai it function if override option passed", () => {
        assert.deepEqual(
          overrideTfx.it.toString(),
<<<<<<< HEAD
          mock.it.toString(),
=======
          itFn.toString(),
>>>>>>> intern-tfxjs/master
          "it should have correct it function"
        );
      });
      it("should not use the chai describe function if override option passed", () => {
        assert.deepEqual(
          overrideTfx.describe.toString(),
<<<<<<< HEAD
          mock.describe.toString(),
=======
          describeFn.toString(),
>>>>>>> intern-tfxjs/master
          "it should have correct describe function"
        );
      });
    });
    it("should correctly initialize tfutils", () => {
      let tfutils = new tfUnitTestUtils("./mock_path");
      assert.deepEqual(
        tfx.tfutils.toString(),
        tfutils.toString(),
        "it should correctly initialize utils"
      );
    });
    it("shoudld create tfvars if a string passed", () => {
      assert.deepEqual(
        overrideTfx.tfvars,
        {
          ibmcloud_api_key: "test",
        },
        "should create correct data from string"
      );
    });
    it("should set tfvars if object passed", () => {
      overrideTfx = new tfxjs(
        "./mock_path",
        { test: "test" },
        {
<<<<<<< HEAD
          overrideBefore: mock.before,
          overrideDescribe: mock.describe,
          overrideIt: mock.it,
=======
          overrideBefore: beforeFn,
          overrideDescribe: describeFn,
          overrideIt: itFn,
>>>>>>> intern-tfxjs/master
        }
      );
      assert.deepEqual(
        overrideTfx.tfvars,
        { test: "test" },
        "should correctly set variables"
      );
    });
  });
  describe("print", () => {
    beforeEach(() => {
      mock = new mocks();
<<<<<<< HEAD
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
      });
    });
    it("should send correct string to console log", () => {
      let data = "";
      overrideTfx.log = (str) => {
        data = str;
      };
      overrideTfx.print("string");
      assert.deepEqual(
        data,
        "string",
=======
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {});
    });
    it("should send correct string to console log", () => {
      overrideTfx.log = new sinon.spy();
      overrideTfx.print("string");
      assert.isTrue(
        overrideTfx.log.calledOnceWith("string"),
>>>>>>> intern-tfxjs/master
        "should send correct function to console log"
      );
    });
    it("should by default have console.log set to this.log", () => {
      assert.deepEqual(
        overrideTfx.log,
        console.log,
        "should be correct function"
      );
    });
  });
  describe("tfAction", () => {
    beforeEach(() => {
<<<<<<< HEAD
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
      });
      overrideTfx.print = mock.log;
=======
      describeSpy = new sinon.spy();
      itSpy = new sinon.spy();
      beforeSpy = new sinon.spy();
      logSpy = new sinon.spy();
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: beforeFn,
        overrideDescribe: describeFn,
        overrideIt: itFn,
      });
      overrideTfx.print = logSpy;
>>>>>>> intern-tfxjs/master
    });
    it("should run the correct describe function", () => {
      overrideTfx.tfAction(
        "describe",
        "plan",
        () => {},
        () => {}
      );
      assert.deepEqual(
<<<<<<< HEAD
        mock.definitionList,
        ["describe"],
=======
        describeSpy.args,
        [["describe"]],
>>>>>>> intern-tfxjs/master
        "it should add the correct data to the mock definitionList"
      );
    });
    it("should run the correct it function for plan", () => {
      overrideTfx.tfAction(
        "describe",
        "plan",
        () => {},
        () => {}
      );
      assert.deepEqual(
<<<<<<< HEAD
        mock.itList,
        ["Successfully generates a terraform plan file"],
=======
        itSpy.args,
        [["Successfully generates a terraform plan file"]],
>>>>>>> intern-tfxjs/master
        "it should add the correct data to the mock itList"
      );
    });
    it("should run the correct it function for apply", () => {
      overrideTfx.tfAction(
        "describe",
        "apply",
        () => {},
        () => {}
      );
      assert.deepEqual(
<<<<<<< HEAD
        mock.itList,
        ["Runs `terraform apply` in the target directory"],
=======
        itSpy.args,
        [["Runs `terraform apply` in the target directory"]],
>>>>>>> intern-tfxjs/master
        "it should add the correct data to the mock itList"
      );
    });
    it("should run the correct it function for clone", () => {
      overrideTfx.tfAction(
        "describe",
        "clone",
        () => {},
        () => {},
        "path"
      );
      assert.deepEqual(
<<<<<<< HEAD
        mock.itList,
        ["Creates a clone directory at destination path path"],
=======
        itSpy.args,
        [["Creates a clone directory at destination path path"]],
>>>>>>> intern-tfxjs/master
        "it should add the correct data to the mock itList"
      );
    });
    it("should run the before function", () => {
      let value;
      overrideTfx.tfAction(
        "describe",
        "clone",
        () => {
          value = true;
        },
        () => {},
        "path"
      );
      assert.isTrue(value, "it should return true");
    });
    it("should run the callback function", () => {
      let value;
      overrideTfx.tfAction(
        "describe",
        "clone",
        () => {},
        () => {
          value = true;
        },
        "path"
      );
      assert.isTrue(value, "it should return true");
    });
  });
  describe("plan", () => {
    beforeEach(() => {
<<<<<<< HEAD
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
        overrideExec: new mock.mockExec({}).promise
      });
      overrideTfx.print = mock.log;
=======
      describeSpy = new sinon.spy();
      itSpy = new sinon.spy();
      beforeSpy = new sinon.spy();
      logSpy = new sinon.spy();
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: beforeFn,
        overrideDescribe: describeFn,
        overrideIt: itFn,
        overrideExec: new mock.mockExec({}).promise,
        overridePing: new mock.mockPingPackage(),
        overrideSSH: new mock.mockSshPackage(),
      });
      overrideTfx.print = logSpy;
      // prevent creation of file
      overrideTfx.cli.createTfVarFile = () => {};
>>>>>>> intern-tfxjs/master
    });
    it("should produce the correct console.log data", () => {
      overrideTfx.plan("describe", () => {});
      assert.deepEqual(
<<<<<<< HEAD
        mock.logList,
        [
          "\n\n* tfxjs testing\n\n##############################################################################\n# \n#  Running `terraform plan`\n#  Teplate File:\n#     ./mock_path\n# \n##############################################################################\n",
=======
        logSpy.args,
        [
          [
            `${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}* tfxjs testing${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}##############################################################################${constants.ansiResetDim}\n${constants.ansiBold}# ${constants.ansiResetDim}\n${constants.ansiBold}#${constants.ansiResetDim}${constants.ansiBlue}  Running \`terraform plan\`${constants.ansiDefaultForeground}\n${constants.ansiBlue}${constants.ansiDefaultForeground}${constants.ansiBold}#${constants.ansiResetDim}${constants.ansiLtGray}  Teplate File:${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}#${constants.ansiResetDim}${constants.ansiBlue}     ./mock_path${constants.ansiDefaultForeground}\n${constants.ansiBlue}${constants.ansiDefaultForeground}${constants.ansiBold}# ${constants.ansiResetDim}\n${constants.ansiBold}##############################################################################${constants.ansiResetDim}\n${constants.ansiBold}${constants.ansiResetDim}`,
          ],
>>>>>>> intern-tfxjs/master
        ],
        "it should print out the correct data"
      );
    });
  });
  describe("apply", () => {
    beforeEach(() => {
<<<<<<< HEAD
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
        quiet: true,
      });
      overrideTfx.print = mock.log;
=======
      describeSpy = new sinon.spy();
      itSpy = new sinon.spy();
      beforeSpy = new sinon.spy();
      logSpy = new sinon.spy();
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: beforeFn,
        overrideDescribe: describeFn,
        overrideIt: itFn,
        quiet: true,
      });
      overrideTfx.print = logSpy;
>>>>>>> intern-tfxjs/master
    });
    it("should produce the correct console.log data", () => {
      overrideTfx.apply("describe", () => {});
      assert.deepEqual(
<<<<<<< HEAD
        mock.logList,
        [
          "\n\n* tfxjs testing\n\n##############################################################################\n# \n#  Running `terraform apply`\n#  Teplate File:\n#     ./mock_path\n# \n##############################################################################\n",
=======
        logSpy.args,
        [
          [
            `${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}* tfxjs testing${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}##############################################################################${constants.ansiResetDim}\n${constants.ansiBold}# ${constants.ansiResetDim}\n${constants.ansiBold}#${constants.ansiResetDim}${constants.ansiBlue}  Running \`terraform apply\`${constants.ansiDefaultForeground}\n${constants.ansiBlue}${constants.ansiDefaultForeground}${constants.ansiBold}#${constants.ansiResetDim}${constants.ansiLtGray}  Teplate File:${constants.ansiDefaultForeground}\n${constants.ansiLtGray}${constants.ansiDefaultForeground}${constants.ansiBold}#${constants.ansiResetDim}${constants.ansiBlue}     ./mock_path${constants.ansiDefaultForeground}\n${constants.ansiBlue}${constants.ansiDefaultForeground}${constants.ansiBold}# ${constants.ansiResetDim}\n${constants.ansiBold}##############################################################################${constants.ansiResetDim}\n${constants.ansiBold}${constants.ansiResetDim}`,
          ],
>>>>>>> intern-tfxjs/master
        ],
        "it should print out the correct data"
      );
    });
  });
  describe("planAndSetData", () => {
    beforeEach(() => {
<<<<<<< HEAD
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
=======
      describeSpy = new sinon.spy();
      itSpy = new sinon.spy();
      beforeSpy = new sinon.spy();
      logSpy = new sinon.spy();
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: beforeFn,
        overrideDescribe: describeFn,
        overrideIt: itFn,
>>>>>>> intern-tfxjs/master
        overrideExec: new mock.mockExec({
          stdout: '{"planned_values" : "success"}',
        }).promise,
        quiet: true,
      });
<<<<<<< HEAD
      overrideTfx.print = mock.log;
=======
      overrideTfx.print = logSpy;
      // prevent creation of file
      overrideTfx.cli.createTfVarFile = () => {};
>>>>>>> intern-tfxjs/master
    });
    it("should return the correct data and set this.tfplan", async () => {
      await overrideTfx.planAndSetData();
      assert.deepEqual(
        overrideTfx.tfplan,
        "success",
        "it should store correct plan"
      );
    });
  });
  describe("module", () => {
    beforeEach(() => {
<<<<<<< HEAD
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
        quiet: true,
        overrideExec: new mock.mockExec({}).promise
      });
      overrideTfx.print = mock.log;
      overrideTfx.tfplan = "arbitraty_data"
    });
    it("should run tfutils with correct params", () => {
      let testModuleArgs;
      overrideTfx.tfutils.testModule = function (...args) {
        testModuleArgs = args;
      };
      overrideTfx.module("test", "test", []);
      assert.deepEqual(testModuleArgs, [
        {
=======
      describeSpy = new sinon.spy();
      itSpy = new sinon.spy();
      beforeSpy = new sinon.spy();
      logSpy = new sinon.spy();
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: beforeFn,
        overrideDescribe: describeFn,
        overrideIt: itFn,
        quiet: true,
        overrideExec: new mock.mockExec({}).promise,
      });
      overrideTfx.print = logSpy;
      overrideTfx.tfplan = "arbitraty_data";
      overrideTfx.tfutils.testModule = new sinon.spy();
      // prevent creation of file
      overrideTfx.cli.createTfVarFile = () => {};
    });
    it("should run tfutils with correct params", () => {
      overrideTfx.module("test", "test", []);
      assert.isTrue(
        overrideTfx.tfutils.testModule.calledOnceWith({
>>>>>>> intern-tfxjs/master
          address: "test",
          moduleName: "test",
          testList: [],
          tfData: "arbitraty_data",
<<<<<<< HEAD
        },
      ]);
    });
    it("should run tfutils with correct params using spread operator", () => {
      let testModuleArgs;
      overrideTfx.tfutils.testModule = function (...args) {
        testModuleArgs = args;
      };
      overrideTfx.module("test", "test", { name: "test", address: "test" });
      assert.deepEqual(testModuleArgs, [
        {
=======
        }),
        "should have been called with correct params"
      );
    });
    it("should run tfutils with correct params using spread operator", () => {
      overrideTfx.module("test", "test", { name: "test", address: "test" });
      assert.isTrue(
        overrideTfx.tfutils.testModule.calledOnceWith({
>>>>>>> intern-tfxjs/master
          address: "test",
          moduleName: "test",
          testList: [
            {
              address: "test",
              name: "test",
              values: {},
            },
          ],
          tfData: "arbitraty_data",
<<<<<<< HEAD
        },
      ]);
=======
        }),
        "should have been called with correct params"
      );
>>>>>>> intern-tfxjs/master
    });
    it("should throw an error if no tfplan", () => {
      overrideTfx.tfplan = undefined;
      let task = () => {
        overrideTfx.module("test", "test", []);
      };
      assert.throws(
        task,
        "`tfx.plan` needs to be successfully completed before running `tfx.module`."
      );
    });
  });
  describe("applyAndSetState", () => {
    beforeEach(() => {
<<<<<<< HEAD
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
=======
      describeSpy = new sinon.spy();
      itSpy = new sinon.spy();
      beforeSpy = new sinon.spy();
      logSpy = new sinon.spy();
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: beforeFn,
        overrideDescribe: describeFn,
        overrideIt: itFn,
>>>>>>> intern-tfxjs/master
        overrideExec: new mock.mockExec({
          stdout: '{"planned_values" : "success"}',
        }).promise,
      });
<<<<<<< HEAD
      overrideTfx.print = mock.log;
=======
      overrideTfx.print = logSpy;
      // prevent creation of file
      overrideTfx.cli.createTfVarFile = () => {};
>>>>>>> intern-tfxjs/master
    });
    it("should return the correct data and set this.apply", async () => {
      overrideTfx.exec = mock.exec;
      await overrideTfx.applyAndSetState();
      assert.deepEqual(
        overrideTfx.tfstate,
        { planned_values: "success" },
        "it should store correct plan"
      );
    });
  });
  describe("state", () => {
<<<<<<< HEAD
    it("should run tfutils with correct params", () => {
      let testModuleArgs;
      overrideTfx.tfutils.testModule = function (...args) {
        testModuleArgs = args;
      };
      overrideTfx.state("test", [{ test: "test" }]);
      assert.deepEqual(testModuleArgs, [
        {
=======
    beforeEach(() => {
      overrideTfx.tfutils.testModule = new sinon.spy();
    });
    it("should run tfutils with correct params", () => {
      overrideTfx.state("test", [{ test: "test" }]);
      assert.isTrue(
        overrideTfx.tfutils.testModule.calledOnceWith({
>>>>>>> intern-tfxjs/master
          isApply: true,
          moduleName: "test",
          testList: [
            {
              test: "test",
            },
          ],
          tfData: {
            planned_values: "success",
          },
<<<<<<< HEAD
        },
      ]);
    });
    it("should run tfutils with correct params using multiple objects", () => {
      let testModuleArgs;
      overrideTfx.tfutils.testModule = function (...args) {
        testModuleArgs = args;
      };
      overrideTfx.state("test", "test", { test: "test" }, { test: "test" });
      assert.deepEqual(testModuleArgs, [
        {
=======
        }),
        "should have been called with expected params"
      );
    });
    it("should run tfutils with correct params using multiple objects", () => {
      overrideTfx.state("test", "test", { test: "test" }, { test: "test" });
      assert.isTrue(
        overrideTfx.tfutils.testModule.calledOnceWith({
>>>>>>> intern-tfxjs/master
          isApply: true,
          moduleName: "test",
          testList: ["test", { test: "test" }, { test: "test" }],
          tfData: {
            planned_values: "success",
          },
<<<<<<< HEAD
        },
      ]);
=======
        }),
        "should have been called with expected params"
      );
>>>>>>> intern-tfxjs/master
    });
    it("should throw an error if no tfstate", () => {
      overrideTfx.tfstate = undefined;
      let task = () => {
        overrideTfx.state("test", "test", []);
      };
      assert.throws(
        task,
        "`tfx.apply` needs to be successfully completed before running `tfx.state`."
      );
    });
    describe("clone", () => {
      beforeEach(() => {
<<<<<<< HEAD
        mock = new mocks();
        overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
          overrideBefore: mock.before,
          overrideDescribe: mock.describe,
          overrideIt: mock.it,
          overrideExec: new mock.mockExec("ff").promise
        });
        overrideTfx.print = mock.log;

      });
      it("should create a clone with correct template path", () => {
        overrideTfx.clone("test", (cloneTfx, done) => {
          assert.deepEqual(cloneTfx.templatePath, "test", "it should have correct path")
          assert.isTrue(done instanceof Function, "it should be a function")
        })
      })
    })
=======
        describeSpy = new sinon.spy();
        itSpy = new sinon.spy();
        beforeSpy = new sinon.spy();
        logSpy = new sinon.spy();
        mock = new mocks();
        overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
          overrideBefore: beforeFn,
          overrideDescribe: describeFn,
          overrideIt: itFn,
          overrideExec: new mock.mockExec("ff").promise,
        });
        overrideTfx.print = logSpy;
      });
      it("should create a clone with correct template path", () => {
        overrideTfx.clone("test", (cloneTfx, done) => {
          assert.deepEqual(
            cloneTfx.templatePath,
            "test",
            "it should have correct path"
          );
          assert.isTrue(done instanceof Function, "it should be a function");
        });
      });
    });
>>>>>>> intern-tfxjs/master
  });
});
