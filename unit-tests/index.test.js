const { assert } = require("chai");
const tfUnitTestUtils = require("../lib/tf-utils.js"); // Import utils
const tfxjs = require("../lib/index"); // import main constructor
const mocks = require("./tfx.mocks"); // import mocks
const tfx = new tfxjs("./mock_path"); // initialize tfx
const chalk = require("chalk");
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
          mock.before.toString(),
          "it should have correct it function"
        );
      });
      it("should not use the chai it function if override option passed", () => {
        assert.deepEqual(
          overrideTfx.it.toString(),
          mock.it.toString(),
          "it should have correct it function"
        );
      });
      it("should not use the chai describe function if override option passed", () => {
        assert.deepEqual(
          overrideTfx.describe.toString(),
          mock.describe.toString(),
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
          overrideBefore: mock.before,
          overrideDescribe: mock.describe,
          overrideIt: mock.it,
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
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
      });
      overrideTfx.print = mock.log;
    });
    it("should run the correct describe function", () => {
      overrideTfx.tfAction(
        "describe",
        "plan",
        () => {},
        () => {}
      );
      assert.deepEqual(
        mock.definitionList,
        ["describe"],
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
        mock.itList,
        ["Successfully generates a terraform plan file"],
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
        mock.itList,
        ["Runs `terraform apply` in the target directory"],
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
        mock.itList,
        ["Creates a clone directory at destination path path"],
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
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
        overrideExec: new mock.mockExec({}).promise
      });
      overrideTfx.print = mock.log;
    });
    it("should produce the correct console.log data", () => {
      overrideTfx.plan("describe", () => {});
      console.log(JSON.stringify(chalk.white(`

      * tfxjs testing
      
      `) + chalk.bold(`##############################################################################
      # 
      #`) + chalk.blue("  Running `terraform plan`\n") + chalk.bold(`#`) + chalk.white(`  Teplate File:
      `) + chalk.bold(`#`) + chalk.blue(`     ./mock_path
      `) + chalk.bold(`# 
      ##############################################################################
      `)));
      assert.deepEqual(
        mock.logList,
        [
          "\u001b[37m\u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m* tfxjs testing\u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m\u001b[39m\u001b[1m##############################################################################\u001b[22m\n\u001b[1m# \u001b[22m\n\u001b[1m#\u001b[22m\u001b[34m  Running `terraform plan`\u001b[39m\n\u001b[34m\u001b[39m\u001b[1m#\u001b[22m\u001b[37m  Teplate File:\u001b[39m\n\u001b[37m\u001b[39m\u001b[1m#\u001b[22m\u001b[34m     ./mock_path\u001b[39m\n\u001b[34m\u001b[39m\u001b[1m# \u001b[22m\n\u001b[1m##############################################################################\u001b[22m\n\u001b[1m\u001b[22m",
        ],
        "it should print out the correct data"
      );
    });
  });
  describe("apply", () => {
    beforeEach(() => {
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
        quiet: true,
      });
      overrideTfx.print = mock.log;
    });
    it("should produce the correct console.log data", () => {
      overrideTfx.apply("describe", () => {});
      assert.deepEqual(
        mock.logList,
        [
          "\u001b[37m\u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m* tfxjs testing\u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m\u001b[39m\u001b[1m##############################################################################\u001b[22m\n\u001b[1m# \u001b[22m\n\u001b[1m#\u001b[22m\u001b[34m  Running `terraform apply`\u001b[39m\n\u001b[34m\u001b[39m\u001b[1m#\u001b[22m\u001b[37m  Teplate File:\u001b[39m\n\u001b[37m\u001b[39m\u001b[1m#\u001b[22m\u001b[34m     ./mock_path\u001b[39m\n\u001b[34m\u001b[39m\u001b[1m# \u001b[22m\n\u001b[1m##############################################################################\u001b[22m\n\u001b[1m\u001b[22m",
        ],
        "it should print out the correct data"
      );
    });
  });
  describe("planAndSetData", () => {
    beforeEach(() => {
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
        overrideExec: new mock.mockExec({
          stdout: '{"planned_values" : "success"}',
        }).promise,
        quiet: true,
      });
      overrideTfx.print = mock.log;
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
          address: "test",
          moduleName: "test",
          testList: [],
          tfData: "arbitraty_data",
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
        },
      ]);
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
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
        overrideExec: new mock.mockExec({
          stdout: '{"planned_values" : "success"}',
        }).promise,
      });
      overrideTfx.print = mock.log;
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
    it("should run tfutils with correct params", () => {
      let testModuleArgs;
      overrideTfx.tfutils.testModule = function (...args) {
        testModuleArgs = args;
      };
      overrideTfx.state("test", [{ test: "test" }]);
      assert.deepEqual(testModuleArgs, [
        {
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
          isApply: true,
          moduleName: "test",
          testList: ["test", { test: "test" }, { test: "test" }],
          tfData: {
            planned_values: "success",
          },
        },
      ]);
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
  });
});
