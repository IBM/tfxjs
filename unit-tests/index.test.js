const { assert } = require("chai");
const tfUnitTestUtils = require("../lib/utils.js"); // Import utils
const tfxjs = require("../lib/index"); // import main constructor
const mocks = require("./tfx.mocks"); // import mocks
const tfx = new tfxjs("./mock_path"); // initialize tfx
const path = require("path"); // init path
let mock = new mocks(); // initialize mocks
// initialize mock tfx
let overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
  overrideBefore: mock.before,
  overrideDescribe: mock.describe,
  overrideIt: mock.it,
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
    it("should initialize the planTestPath correctly", () => {
      let expectedPath = path
        .join(__dirname, "/lib/plan_test.sh")
        .replace(/unit-tests\//i, "");
      let actualPlan = tfx.planTestPath;
      assert.deepEqual(
        actualPlan,
        expectedPath,
        "it should return the correct path"
      );
    });
    it("should correctly initialize tfutils", () => {
      let tfutils = new tfUnitTestUtils(tfx.planTestPath, "./mock_path");
      assert.deepEqual(
        tfx.tfutils.toString(),
        tfutils.toString(),
        "it should correctly initialize utils"
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
      let data = ""
      overrideTfx.log = (str) => {
        data = str;
      };
      overrideTfx.print("string");
      assert.deepEqual(data, "string", "should send correct function to console log")
    })
    it("should by default have console.log set to this.log", () => {
      assert.deepEqual(overrideTfx.log, console.log, "should be correct function")
    })
  })
  describe("plan", () => {
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
      overrideTfx.plan("describe", () => {});
      assert.deepEqual(
        mock.definitionList,
        ["describe"],
        "it should add the correct data to the mock definitionList"
      );
    });
    it("should run the correct callback function", () => {
      let callbackSuccess = false;
      overrideTfx.plan("describe", () => {
        callbackSuccess = true;
      });
      assert.isTrue(
        callbackSuccess,
        "it should return the correct describe function"
      );
    });
    it("should run the correct it function", () => {
      overrideTfx.plan("describe", () => {});
      let exepectedItList = ["Successfully generates a terraform plan file"];
      assert.deepEqual(
        mock.itList,
        exepectedItList,
        "it should run the correct it assertion"
      );
    });
    it("should produce the correct console.log data", () => {
      overrideTfx.plan("describe", () => {});
      assert.deepEqual(
        mock.logList,
        [
          "\n\n* tfxjs testing\n\n##############################################################################\n# \n#  Running `terraform plan`\n#  Teplate File:\n#     ./mock_path\n# \n##############################################################################\n",
        ],
        "it should print out the correct data"
      );
    });
    it("should set this.tfplan to plan data", async() => {
      overrideTfx.exec = mock.exec;

    })
  });
  describe("apply", () => {
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
      overrideTfx.apply("describe", () => {});
      assert.deepEqual(
        mock.definitionList,
        ["describe"],
        "it should add the correct data to the mock definitionList"
      );
    });
    it("should run the correct callback function", () => {
      let callbackSuccess = false;
      overrideTfx.apply("describe", () => {
        callbackSuccess = true;
      });
      assert.isTrue(
        callbackSuccess,
        "it should return the correct describe function"
      );
    });
    it("should run the correct it function", () => {
      overrideTfx.apply("describe", () => {});
      let exepectedItList = ["Runs `terraform apply` in the target directory"];
      assert.deepEqual(
        mock.itList,
        exepectedItList,
        "it should run the correct it assertion"
      );
    });
    it("should produce the correct console.log data", () => {
      overrideTfx.apply("describe", () => {});
      assert.deepEqual(
        mock.logList,
        [
          "\n\n* tfxjs testing\n\n##############################################################################\n# \n#  Running `terraform apply`\n#  Teplate File:\n#     ./mock_path\n# \n##############################################################################\n"
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
      });
      overrideTfx.print = mock.log;
    });
    it("should return the correct data and set this.tfplan", async() => {
      overrideTfx.exec = mock.exec;
      await overrideTfx.planAndSetData()
      assert.deepEqual(overrideTfx.tfplan, "success", "it should store correct plan")
    })
  });
  describe("module", () => {
    it("should run tfutils with correct params", () => {
      let testModuleArgs;
      overrideTfx.tfutils.testModule = function(...args) {
        testModuleArgs = args;
      }
      overrideTfx.module("test", "test", [])
      assert.deepEqual(testModuleArgs, [{
        address: "test",
        moduleName: "test",
        testList: [],
        tfData: "success"
      }])
    })
    it("should throw an error if no tfplan", () => {
      overrideTfx.tfplan = undefined;
      let task = () => {
        overrideTfx.module("test", "test", [])
      }
      assert.throws(task, "`tfx.plan` needs to be successfully completed before running `tfx.module`.")
    })
  })
  describe("applyAndSetState", () => {
    beforeEach(() => {
      mock = new mocks();
      overrideTfx = new tfxjs("./mock_path", "ibmcloud_api_key", {
        overrideBefore: mock.before,
        overrideDescribe: mock.describe,
        overrideIt: mock.it,
      });
      overrideTfx.print = mock.log;
    });
    it("should return the correct data and set this.apply", async() => {
      overrideTfx.exec = mock.exec;
      await overrideTfx.applyAndSetState()
      assert.deepEqual(overrideTfx.tfstate,{ planned_values: 'success' }, "it should store correct plan")
    })
  });
  describe("state", () => {
    it("should run tfutils with correct params", () => {
      let testModuleArgs;
      overrideTfx.tfutils.testModule = function(...args) {
        testModuleArgs = args;
      }
      overrideTfx.state("test", "test", [])
      assert.deepEqual(testModuleArgs, [{
        isApply: true,
        moduleName: "test",
        testList: "test",
        tfData: {
          planned_values: "success"
        }
      }])
    })
    it("should throw an error if no tfstate", () => {
      overrideTfx.tfstate = undefined;
      let task = () => {
        overrideTfx.state("test", "test", [])
      }
      assert.throws(task, "`tfx.apply` needs to be successfully completed before running `tfx.state`.")
    })
  })
});
