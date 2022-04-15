const { assert } = require("chai");
const tfUnitTestUtils = require("../lib/utils.js");
const mocks = require("./tfx.mocks");
process.env.API_KEY = "apikey";

// Initialize mocks for unit testing
let mock = new mocks();
// Initialize mocks to test against `mock`
let tfUtilMocks = new mocks();
// create new tfutils overriding describe, it, and assert for unit testing
const tfutils = new tfUnitTestUtils(
  "./plan_test.sh",
  "../defaults",
  "ibmcloud_api_key",
  {
    overrideDescribe: tfUtilMocks.describe,
    overrideIt: tfUtilMocks.it,
    overrideAssert: assert,
  }
);

describe("tfUnitTestUtils", () => {
  describe("override chai utils", () => {
    let defaultTfUtils = new tfUnitTestUtils();
    it("should use the chai it function if not override option passed", () => {
      assert.deepEqual(
        defaultTfUtils.it,
        it,
        "it should have correct it function"
      );
    });
    it("should use the chai describe function if not override option passed", () => {
      assert.deepEqual(
        defaultTfUtils.describe,
        describe,
        "it should have correct describe function"
      );
    });
    it("should use the chai assert function if not override option passed", () => {
      assert.deepEqual(
        defaultTfUtils.assert,
        assert,
        "it should have correct assert function"
      );
    });
    it("should not use the chai it function if override option passed", () => {
      assert.deepEqual(
        tfutils.it.toString(),
        mock.it.toString(),
        "it should have correct it function"
      );
    });
    it("should not use the chai describe function if override option passed", () => {
      assert.deepEqual(
        tfutils.describe.toString(),
        mock.describe.toString(),
        "it should have correct describe function"
      );
    });
    it("should not use the chai assert function if override option passed", () => {
      assert.deepEqual(
        tfutils.assert.toString(),
        assert.toString(),
        "it should have correct assert function"
      );
    });
  });
  describe("getPlanJson", () => {
    it("should run the correct bash script", async () => {
      await tfutils.getPlanJson(mock.exec);
      assert.deepEqual(
        mock.lastScript,
        "sh ./plan_test.sh ibmcloud_api_key apikey ../defaults",
        "it should correctly run the script"
      );
    });
    it("should return a value if valid json is passed", async () => {
      let json = await tfutils.getPlanJson(mock.exec);
      assert.deepEqual(json, "success", "it should correctly run the script");
    });
    it("should throw an error if invalid json is passed", async () => {
      let expectedError =
        "SyntaxError: Unexpected token u in JSON at position 0. Ensure your template file is correct and try again.";
      await tfutils.getPlanJson(mock.errExec).catch((err) => {
        assert.deepEqual(
          err.message,
          expectedError,
          "it should return the correct error"
        );
      });
    });
  });
  describe("getApplyJson", () => {
    it("should run the correct bash script", async () => {
      await tfutils.getApplyJson(mock.exec);
      assert.isTrue(
        mock.lastScript.match(
          /^sh\s.*\/apply\.sh\sibmcloud_api_key\sapikey\s\.\.\/defaults$/i
        ).length === 1,
        "it should correctly run the script"
      );
    });
    it("should return a value if valid json is passed", async () => {
      let json = await tfutils.getApplyJson(mock.exec);
      assert.deepEqual(
        json,
        { planned_values: "success" },
        "it should correctly run the script"
      );
    });
    it("should throw an error if invalid json is passed", async () => {
      let expectedError =
        "SyntaxError: Unexpected token u in JSON at position 0. Ensure your template file is correct and try again.";
      await tfutils.getApplyJson(mock.errExec).catch((err) => {
        assert.deepEqual(
          err.message,
          expectedError,
          "it should return the correct error"
        );
      });
    });
  });
  describe("buildResourceTest", () => {
    it("should create correct test object for found address", () => {
      let actualData = tfutils.buildResourceTest(
        "frog",
        { address: "frog", resources: [{ address: "frog.frog" }] },
        "frog",
        []
      );
      let expectedData = {
        describe: "frog",
        tests: [
          {
            name: "Module frog should contain resource frog",
            assertionType: "isNotFalse",
            assertionArgs: [true, "Expected frog contain the frog resource."],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
    it("should create correct test object for not found address", () => {
      let actualData = tfutils.buildResourceTest(
        "frog",
        { address: "frog", resources: [{ address: "frog.bad" }] },
        "frog",
        []
      );
      let expectedData = {
        describe: "frog",
        tests: [
          {
            name: "Module frog should contain resource frog",
            assertionType: "isNotFalse",
            assertionArgs: [false, "Expected frog contain the frog resource."],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
    it("should create correct test object for not found address with correctly formatted value function", () => {
      let actualData = tfutils.buildResourceTest(
        "frog",
        {
          address: "frog",
          resources: [{ address: "frog.bad", values: { test: "test" } }],
        },
        "frog",
        {
          test: function (value) {
            return {
              expectedData: value == value,
              appendMessage: "test",
            };
          },
        }
      );
      let expectedData = {
        describe: "frog",
        tests: [
          {
            name: "Module frog should contain resource frog",
            assertionType: "isNotFalse",
            assertionArgs: [false, "Expected frog contain the frog resource."],
          },
          {
            name: "frog should have the correct test value",
            assertionType: "isNotFalse",
            assertionArgs: [
              false,
              "Expected frog resource test to be defined got undefined."           ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
    it("should throw an error when invalid value function passed", () => {
      let actualData = () => {
        tfutils.buildResourceTest(
          "frog",
          {
            address: "frog",
            resources: [{ address: "frog.frog", values: { test: "test" } }],
          },
          "frog",
          {
            test: function (value) {
              return {};
            },
          }
        );
      };
      assert.throws(
        actualData,
        "Value functions must have only two keys, `appendMessage` and `expectedData` got"
      );
    });
    it("should throw an error when invalid value function passed with only appendMessage", () => {
      let actualData = () => {
        tfutils.buildResourceTest(
          "frog",
          {
            address: "frog",
            resources: [{ address: "frog.frog", values: { test: "test" } }],
          },
          "frog",
          {
            test: function (value) {
              return {
                appendMessage: "test",
              };
            },
          }
        );
      };
      assert.throws(
        actualData,
        "Value functions must have only two keys, `appendMessage` and `expectedData` got appendMessage"
      );
    });
    it("should throw an error when invalid value function passed with only expectedData", () => {
      let actualData = () => {
        tfutils.buildResourceTest(
          "frog",
          {
            address: "frog",
            resources: [{ address: "frog.frog", values: { test: "test" } }],
          },
          "frog",
          {
            test: function (value) {
              return {
                expectedData: "test",
              };
            },
          }
        );
      };
      assert.throws(
        actualData,
        "Value functions must have only two keys, `appendMessage` and `expectedData` got expectedData"
      );
    });
    it("should throw an error when invalid value function passed with extra params", () => {
      let actualData = () => {
        tfutils.buildResourceTest(
          "frog",
          {
            address: "frog",
            resources: [{ address: "frog.frog", values: { test: "test" } }],
          },
          "frog",
          {
            test: function (value) {
              return {
                expectedData: "test",
                appendMessage: "test",
                badField: true,
              };
            },
          }
        );
      };
      assert.throws(
        actualData,
        "Value functions must have only two keys, `appendMessage` and `expectedData` got expectedData,appendMessage,badField"
      );
    });
    it("should throw an error when value function does not evaluate to boolean", () => {
      let actualData = () => {
        tfutils.buildResourceTest(
          "frog",
          {
            address: "frog",
            resources: [{ address: "frog.frog", values: { test: "test" } }],
          },
          "frog",
          {
            test: function (value) {
              return {
                expectedData: "test",
                appendMessage: "test",
              };
            },
          }
        );
      };
      assert.throws(
        actualData,
        "Value functions must evaluate to either true or false got test"
      );
    });
    it("should throw an error when value function message is not string", () => {
      let actualData = () => {
        tfutils.buildResourceTest(
          "frog",
          {
            address: "frog",
            resources: [{ address: "frog.frog", values: { test: "test" } }],
          },
          "frog",
          {
            test: function (value) {
              return {
                expectedData: true,
                appendMessage: [],
              };
            },
          }
        );
      };
      assert.throws(
        actualData,
        "Value functions appendMessage must be string got object"
      );
    });
    it("should create correct test object with static tests on found value", () => {
      let actualData = tfutils.buildResourceTest(
        "frog",
        {
          address: "frog",
          resources: [{ address: "frog.frog", values: { test: "test" } }],
        },
        "frog",
        {
          test: "test",
        }
      );
      let expectedData = {
        describe: "frog",
        tests: [
          {
            name: "Module frog should contain resource frog",
            assertionType: "isNotFalse",
            assertionArgs: [true, "Expected frog contain the frog resource."],
          },
          {
            name: "frog should have the correct test value",
            assertionType: "deepEqual",
            assertionArgs: [
              "test",
              "test",
              "Expected frog to have correct value for test.",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
    it("should create correct test object with static tests on found value with function", () => {
      let actualData = tfutils.buildResourceTest(
        "frog",
        {
          address: "frog",
          resources: [{ address: "frog.frog", values: { test: "test" } }],
        },
        "frog",
        {
          test: function(value) {
            return {
              appendMessage: "should",
              expectedData: true
            }
          },
        }
      );
      let expectedData = {
        describe: "frog",
        tests: [
          {
            name: "Module frog should contain resource frog",
            assertionType: "isNotFalse",
            assertionArgs: [true, "Expected frog contain the frog resource."],
          },
          {
            name: "frog should have the correct test value",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected frog resource test value should",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
    it("should create correct test object with static tests on not found value", () => {
      let actualData = tfutils.buildResourceTest(
        "frog",
        {
          address: "frog",
          resources: [{ address: "frog.frog", values: { test: "test" } }],
        },
        "frog",
        {
          egg: "test",
        }
      );
      let expectedData = {
        describe: "frog",
        tests: [
          {
            name: "Module frog should contain resource frog",
            assertionType: "isNotFalse",
            assertionArgs: [true, "Expected frog contain the frog resource."],
          },
          {
            name: "frog should have the correct egg value",
            assertionType: "isNotFalse",
            assertionArgs: [
              false,
              "Expected frog resource egg to be defined got undefined.",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
  });
  describe("buildModuleTest", () => {
    let buildModuleTest = tfutils.buildModuleTest;
    it("should throw an error if plan has no root module", () => {
      let actualData = () => {
        buildModuleTest("test", "test", {}, []);
      };
      assert.throws(
        actualData,
        "Expected terraform plan to have root_module at top level. Check your plan configuration and try again."
      );
    });
    it("should throw an error if plan root module has no child modules", () => {
      let actualData = () => {
        buildModuleTest("test", "test", { root_module: {} }, []);
      };
      assert.throws(
        actualData,
        "Expected terraform plan root_module to have child_modules. Check your plan configuration and try again."
      );
    });
    it("should throw an error if plan root module has empty child modules", () => {
      let actualData = () => {
        buildModuleTest(
          "test",
          "test",
          { root_module: { child_modules: [] } },
          []
        );
      };
      assert.throws(
        actualData,
        "Expected child_modules to be created. Check your plan configuration and try again."
      );
    });
    it("should return the correct test for a found module", () => {
      let actualData = buildModuleTest(
        "test",
        "module.test",
        { root_module: { child_modules: [{ address: "module.test" }] } },
        []
      );

      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module module.test",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "The module module.test should exist in the terraform plan.",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
    });
    it("should return the correct test for an unfound module", () => {
      let actualData = buildModuleTest(
        "test",
        "module.test",
        {
          root_module: {
            child_modules: [
              { address: "module.bad" },
              { address: "module.worse" },
            ],
          },
        },
        []
      );

      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module module.test",
            assertionType: "isTrue",
            assertionArgs: [
              false,
              "The module module.test should exist in the terraform plan.",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
      assert.isFalse(
        actualData.tests[0].assertionArgs[0],
        "it should be false"
      );
    });
    it("should check through sub modules if the parent module has children", () => {
      let actualData = buildModuleTest(
        "test",
        "module.test",
        {
          root_module: {
            child_modules: [
              {
                address: "module.bad",
                child_modules: [{ address: "module.bad.module.test" }],
              },
            ],
          },
        },
        []
      );

      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module module.test",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "The module module.test should exist in the terraform plan.",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
    });
    it("should return correct data if the parent module has children and none match", () => {
      let actualData = buildModuleTest(
        "test",
        "module.test",
        {
          root_module: {
            child_modules: [
              {
                address: "module.bad",
                child_modules: [
                  {
                    address: "module.bad.module.test",
                    child_modules: [{ address: "todd" }],
                  },
                ],
              },
            ],
          },
        },
        []
      );

      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module module.test",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "The module module.test should exist in the terraform plan.",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
    });
    it("should return the correct data if module has resources", () => {
      let actualData = buildModuleTest(
        "test",
        "module.test",
        {
          root_module: {
            child_modules: [
              {
                address: "module.test",
                child_modules: [{ address: "module.test" }],
              },
            ],
          },
        },
        [
          {
            name: "test",
            address: "test",
            values: {
              test: "test",
            },
          },
        ]
      );

      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module module.test",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "The module module.test should exist in the terraform plan.",
            ],
          },
          {
            describe: "test",
            tests: [
              {
                name: "Module module.test should contain resource test",
                assertionType: "isNotFalse",
                assertionArgs: [
                  false,
                  "Expected module.test contain the test resource.",
                ],
              },
              {
                name: "test should have the correct test value",
                assertionType: "isNotFalse",
                assertionArgs: [
                  false,
                  "Expected test resource test to be defined got undefined."                
                ],
              },
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
    });
    it("should return a failing resource test if resources declared in the module are found", () => {
      let actualData = buildModuleTest(
        "test",
        "module.test",
        {
          root_module: {
            child_modules: [
              {
                address: "module.test",
                resources: [
                  {
                    name: "test",
                    address: "module.test.test",
                    values: {
                      test: "test",
                    },
                  },
                  {
                    name: "todd",
                    address: "module.test.todd",
                    values: {
                      test: "test",
                    },
                  },
                ],
              },
            ],
          },
        },
        [
          {
            name: "test",
            address: "test",
            values: {
              test: "test",
            },
          },
        ]
      );
      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module module.test",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "The module module.test should exist in the terraform plan.",
            ],
          },
          {
            describe: "test",
            tests: [
              {
                name: "Module module.test should contain resource test",
                assertionType: "isNotFalse",
                assertionArgs: [
                  true,
                  "Expected module.test contain the test resource.",
                ],
              },
              {
                name: "test should have the correct test value",
                assertionType: "deepEqual",
                assertionArgs: [
                  "test",
                  "test",
                  "Expected test to have correct value for test.",
                ],
              },
            ],
          },
          {
            name: "module.test should not contain additional resources",
            assertionType: "deepEqual",
            assertionArgs: [
              ["module.test.test", "module.test.todd"],
              ["module.test.test"],
              "The module module.test should not contain any resources in addition to ones passed",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
    });
    it("should return a failing resource test if resources declared in child module are found", () => {
      let actualData = buildModuleTest(
        "test",
        "module.test",
        {
          root_module: {
            child_modules: [
              {
                address: "module.parent",
                child_modules: [
                  {
                    address: "module.parent.module.test",
                    resources: [
                      {
                        name: "test",
                        address: "module.parent.module.test.test",
                        values: {
                          test: "test",
                        },
                      },
                      {
                        name: "todd",
                        address: "module.parent.module.test.todd",
                        values: {
                          test: "test",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        [
          {
            name: "test",
            address: "test",
            values: {
              test: "test",
            },
          },
        ]
      );
      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module module.test",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "The module module.test should exist in the terraform plan.",
            ],
          },
          {
            describe: "test",
            tests: [
              {
                name: "Module module.parent.module.test should contain resource test",
                assertionType: "isNotFalse",
                assertionArgs: [
                  true,
                  "Expected module.parent.module.test contain the test resource.",
                ],
              },
              {
                name: "test should have the correct test value",
                assertionType: "deepEqual",
                assertionArgs: [
                  "test",
                  "test",
                  "Expected test to have correct value for test.",
                ],
              },
            ],
          },
          {
            name: "module.test should not contain additional resources",
            assertionType: "deepEqual",
            assertionArgs: [
              [
                "module.parent.module.test.test",
                "module.parent.module.test.todd",
              ],
              ["module.parent.module.test.test"],
              "The module module.test should not contain any resources in addition to ones passed",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
    });
    it("should throw an error root module is address and no resources are provided", () => {
      let task = () => {
        buildModuleTest("Example", "root_module", {
          root_module: {},
        });
      };
      assert.throws(
        task,
        "Expected root module to have resources. Check your plan configuration and try again."
      );
    });
    it("should throw an error root module is address and resources length is 0", () => {
      let task = () => {
        buildModuleTest("Example", "root_module", {
          root_module: {
            resources: [],
          },
        });
      };
      assert.throws(
        task,
        "Expected root_modules to contain at least one resource. Check your plan configuration and try again."
      );
    });
    it("should return the correct data if module is root_module and has resources", () => {
      let actualData = buildModuleTest(
        "test",
        "root_module",
        {
          root_module: {
            resources: [
              {
                address: "test.test",
                values: {
                  test: "test",
                },
              },
            ],
          },
        },
        [
          {
            name: "test",
            address: "test.test",
            values: {
              test: "test",
            },
          },
        ]
      );

      let expecctedData = {
        describe: "Module test",
        tests: [
          {
            name: "Plan should contain the module root_module",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "The module root_module should exist in the terraform plan.",
            ],
          },
          {
            describe: "test",
            tests: [
              {
                name: "Module root_module should contain resource test.test",
                assertionType: "isNotFalse",
                assertionArgs: [
                  true,
                  "Expected root_module contain the test resource.",
                ],
              },
              {
                name: "test should have the correct test value",
                assertionType: "deepEqual",
                assertionArgs: [
                  "test",
                  "test",
                  "Expected test.test to have correct value for test.",
                ],
              },
            ],
          },
          {
            name: "root_module should not contain additional resources",
            assertionType: "deepEqual",
            assertionArgs: [
              ["test.test"],
              ["test.test"],
              "The module root_module should not contain any resources in addition to ones passed",
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct json data"
      );
    });
  });
  describe("testModule", () => {
    beforeEach(() => (mock = new mocks()));
    it("should run the correct describe and test functions for plan", () => {
      let callbackDone = false;
      let options = {
        moduleName: "test",
        address: "module.test",
        tfData: {
          root_module: {
            child_modules: [
              {
                address: "module.test",
                resources: [
                  {
                    name: "test",
                    address: "module.test.test",
                    values: {
                      test: "test",
                    },
                  },
                ],
              },
            ],
          },
        },
        callback: function () {
          callbackDone = true;
        },
        testList: [
          {
            name: "test",
            address: "test",
            values: {
              test: "test",
            },
          },
        ],
      };
      tfutils.testModule(options);
      assert.deepEqual(
        tfUtilMocks.itList,
        [
          "Plan should contain the module module.test",
          "Module module.test should contain resource test",
          "test should have the correct test value",
          "module.test should not contain additional resources",
        ],
        "should return correct it function were run"
      );
      assert.deepEqual(
        tfUtilMocks.definitionList,
        ["Module test", "test"],
        "should return correct it function were run"
      );
      assert.isTrue(callbackDone, "it should execute the callback");
    });
    it("should run the correct describe and test function for apply", () => {
      let tfstate = {
        resources: [
          {
            module: "module.landing_zone",
            mode: "data",
            type: "ibm_container_cluster_versions",
            name: "cluster_versions",
            instances: [
              {
                index_key: 0,
                attributes: {
                  name: "name-one",
                },
              },
              {
                index_key: "test",
                attributes: {
                  name: "name-two",
                },
              },
            ],
          },
          {
            module: "module.landing_zone",
            mode: "data",
            type: "ibm_resource_instance",
            name: "cos",
            provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
            instances: [],
          },
        ],
      };
      let options = {
        moduleName: "Cluster Versions",
        address:
          "module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
        tfData: tfstate,
        isApply: true,
        testList: [
          {
            name: "Cluster Versions",
            address:
              "module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
            instances: [
              {
                name: "name-one",
              },
              {
                index_key: "test",
                name: "name-two",
              },
            ],
          },
        ],
      };
      tfutils.testModule(options);
      assert.deepEqual(
        tfUtilMocks.itList,
        [
          "Plan should contain the module module.test",
          "Module module.test should contain resource test",
          "test should have the correct test value",
          "module.test should not contain additional resources",
          "Resource module.landing_zone.data.ibm_container_cluster_versions.cluster_versions should be in tfstate",
          "Expected resource module.landing_zone.data.ibm_container_cluster_versions.cluster_versions[0] to have correct value for name.",
          "Expected instance with key 0 to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
          "Expected resource module.landing_zone.data.ibm_container_cluster_versions.cluster_versions[test] to have correct value for name.",
          "Expected instance with key test to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
        ],
        "should return correct it function were run"
      );
      assert.deepEqual(
        tfUtilMocks.definitionList,
        [
          "Module test",
          "test",
          "Cluster Versions",
          "module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
        ],
        "should return correct it function were run"
      );
    });
    it("should throw an error if no tf data", () => {
      let task = () => tfutils.testModule({ frog: "frog" });
      assert.throws(task, `tfData must be passed as an option got ["frog"]`);
    });
  });
  describe("buildInstanceTest", () => {
    it("should return a test to check if the resource exists in the resources object when found in state", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
            },
          ],
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return a test to check if the resource exists in the resources object when not found in state", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.btracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
            },
          ],
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.btracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.btracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              false,
              "Expected module.landing_zone.ibm_atracker_target.btracker_target resource to be included in tfstate",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for a string attribute for instance at index 0", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",

        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            name: "ut-atracker",
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for name.",
            assertionType: "deepEqual",
            assertionArgs: [
              "ut-atracker",
              "ut-atracker",
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] name to have value ut-atracker",
            ],
          },
          {
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
            assertionType: "isTrue",
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for a function for attribute of instance at index 0", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",

        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            name: function (value) {
              return {
                expectedData: value.indexOf("ut-") !== -1,
                appendMessage: "to contain the prefix `ut-`.",
              };
            },
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for name.",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] name to contain the prefix `ut-`.",
            ],
          },
          {
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
            assertionType: "isTrue",
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for a function for unfound attribute of instance at index 0", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",

        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    shame: "ut-atracker",
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            name: function (value) {
              return {
                expectedData: value.indexOf("ut-") !== -1,
                appendMessage: "to contain the prefix `ut-`.",
              };
            },
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for name.",
            assertionType: "isTrue",
            assertionArgs: [
              false,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] name to exist in module, got undefined.",
            ],
          },
          {
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
            assertionType: "isTrue",
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for a missing string attribute for instance at index 0", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",

        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    frog: "ut-atracker",
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            name: "ut-atracker",
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for name.",
            assertionType: "deepEqual",
            assertionArgs: [
              undefined,
              "ut-atracker",
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] name to have value ut-atracker",
            ],
          },
          {
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
            assertionType: "isTrue",
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for an object nested in an array with only one object where it exists", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                    cos_endpoint: [
                      {
                        api_key: "REDACTED",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            cos_endpoint: {
              api_key: "REDACTED",
            },
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have value for cos_endpoint",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] attribute cos_endpoint to exist",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for cos_endpoint[0].api_key",
            assertionType: "deepEqual",
            assertionArgs: [
              "REDACTED",
              "REDACTED",
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] attribute cos_endpoint[0].api_key to be REDACTED",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for an object nested in an array with only one object where it exists and the value is evaluated with a function", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                    cos_endpoint: [
                      {
                        api_key: "REDACTED",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            cos_endpoint: {
              api_key: function (value) {
                return {
                  expectedData: value === "REDACTED",
                  appendMessage: "to be equal to REDACTED",
                };
              },
            },
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have value for cos_endpoint",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] attribute cos_endpoint to exist",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for cos_endpoint[0].api_key",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] attribute cos_endpoint[0].api_key to be equal to REDACTED",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for an object nested in an array with only one object where object does not exist", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                    cos_endpoint: [
                      {
                        api_key: "REDACTED",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            dos_endpoint: {
              api_key: "REDACTED",
            },
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for dos_endpoint.",
            assertionType: "deepEqual",
            assertionArgs: [
              undefined,
              {
                api_key: "REDACTED",
              },
              'Expected module.landing_zone.ibm_atracker_target.atracker_target[0] dos_endpoint to have value {"api_key":"REDACTED"}',
            ],
          },
          {
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for an object nested in an array with only one object where one key exists and one does not", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                    cos_endpoint: [
                      {
                        api_key: "REDACTED",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            cos_endpoint: {
              api_key: "REDACTED",
              unfound: true,
            },
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have value for cos_endpoint",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] attribute cos_endpoint to exist",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for cos_endpoint[0].api_key",
            assertionType: "deepEqual",
            assertionArgs: [
              "REDACTED",
              "REDACTED",
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] attribute cos_endpoint[0].api_key to be REDACTED",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have value for cos_endpoint.unfound",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[0] attribute cos_endpoint.unfound to exist",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for an array of primitive type", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                    tags: ["tag1", "tag2"],
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            tags: ["tag1", "tag2"],
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for tags.",
            assertionType: "deepEqual",
            assertionArgs: [
              ["tag1", "tag2"],
              ["tag1", "tag2"],
              'Expected module.landing_zone.ibm_atracker_target.atracker_target[0] tags to have value ["tag1","tag2"]',
            ],
          },
          {
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for an array of object with more than one index", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  attributes: {
                    name: "ut-atracker",
                    tags: [
                      {
                        frog: "true",
                      },
                      {
                        frog: "false",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          0: {
            tags: [
              {
                frog: "true",
              },
              {
                frog: "false",
              },
            ],
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[0] to have correct value for tags.",
            assertionType: "deepEqual",
            assertionArgs: [
              [
                {
                  frog: "true",
                },
                {
                  frog: "false",
                },
              ],
              [
                {
                  frog: "true",
                },
                {
                  frog: "false",
                },
              ],
              'Expected module.landing_zone.ibm_atracker_target.atracker_target[0] tags to have value [{"frog":"true"},{"frog":"false"}]',
            ],
          },
          {
            name: "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected instance with key 0 to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
    it("should return the correct test for a string attribute for instance at index with index_key (string)", () => {
      let actualData = tfutils.buildInstanceTest(
        "module.landing_zone.ibm_atracker_target.atracker_target",
        {
          resources: [
            {
              module: "module.landing_zone",
              mode: "managed",
              type: "ibm_atracker_target",
              name: "atracker_target",
              instances: [
                {
                  index_key: "atracker",
                  attributes: {
                    name: "ut-atracker",
                  },
                },
              ],
            },
          ],
        },

        {
          atracker: {
            name: "ut-atracker",
          },
        }
      );
      let expectedData = {
        describe: "module.landing_zone.ibm_atracker_target.atracker_target",
        tests: [
          {
            name: "Resource module.landing_zone.ibm_atracker_target.atracker_target should be in tfstate",
            assertionType: "isNotFalse",
            assertionArgs: [
              true,
              "Expected module.landing_zone.ibm_atracker_target.atracker_target resource to be included in tfstate",
            ],
          },
          {
            name: "Expected resource module.landing_zone.ibm_atracker_target.atracker_target[atracker] to have correct value for name.",
            assertionType: "deepEqual",
            assertionArgs: [
              "ut-atracker",
              "ut-atracker",
              "Expected module.landing_zone.ibm_atracker_target.atracker_target[atracker] name to have value ut-atracker",
            ],
          },
          {
            name: "Expected instance with key atracker to exist at module.landing_zone.ibm_atracker_target.atracker_target",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected instance with key atracker to exist at module.landing_zone.ibm_atracker_target.atracker_target.instances",
            ],
          },
        ],
      };
      assert.deepEqual(actualData, expectedData);
    });
  });
  describe("buildStateTest", () => {
    it("should return a list of instance tests based on the module name, tfstate, and instance tests", () => {
      let tfstate = {
        resources: [
          {
            module: "module.landing_zone",
            mode: "data",
            type: "ibm_container_cluster_versions",
            name: "cluster_versions",
            instances: [
              {
                index_key: 0,
                attributes: {
                  name: "name-one",
                },
              },
              {
                index_key: "test",
                attributes: {
                  name: "name-two",
                },
              },
            ],
          },
          {
            module: "module.landing_zone",
            mode: "data",
            type: "ibm_resource_instance",
            name: "cos",
            provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
            instances: [],
          },
        ],
      };
      let actualData = tfutils.buildStateTest("Landing Zone", tfstate, [
        {
          name: "module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
          address:
            "module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
          instances: [
            {
              name: "name-one",
            },
            {
              index_key: "test",
              name: "name-two",
            },
            {
              index_key: "bad-index",
            },
          ],
        },
      ]);
      let expectedData = {
        describe: "Landing Zone",
        tests: [
          {
            describe:
              "module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
            tests: [
              {
                name: "Resource module.landing_zone.data.ibm_container_cluster_versions.cluster_versions should be in tfstate",
                assertionType: "isNotFalse",
                assertionArgs: [
                  true,
                  "Expected module.landing_zone.data.ibm_container_cluster_versions.cluster_versions resource to be included in tfstate",
                ],
              },
              {
                name: "Expected resource module.landing_zone.data.ibm_container_cluster_versions.cluster_versions[0] to have correct value for name.",
                assertionType: "deepEqual",
                assertionArgs: [
                  "name-one",
                  "name-one",
                  "Expected module.landing_zone.data.ibm_container_cluster_versions.cluster_versions[0] name to have value name-one",
                ],
              },
              {
                name: "Expected instance with key 0 to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
                assertionType: "isTrue",
                assertionArgs: [
                  true,
                  "Expected instance with key 0 to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions.instances",
                ],
              },
              {
                name: "Expected resource module.landing_zone.data.ibm_container_cluster_versions.cluster_versions[test] to have correct value for name.",
                assertionType: "deepEqual",
                assertionArgs: [
                  "name-two",
                  "name-two",
                  "Expected module.landing_zone.data.ibm_container_cluster_versions.cluster_versions[test] name to have value name-two",
                ],
              },
              {
                name: "Expected instance with key test to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
                assertionType: "isTrue",
                assertionArgs: [
                  true,
                  "Expected instance with key test to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions.instances",
                ],
              },
              {
                name: "Expected instance with key bad-index to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
                assertionType: "isTrue",
                assertionArgs: [
                  false,
                  "Expected instance with key bad-index to exist at module.landing_zone.data.ibm_container_cluster_versions.cluster_versions.instances",
                ],
              },
            ],
          },
        ],
      };

      assert.deepEqual(
        actualData,
        expectedData,
        "It should return correct instance test data"
      );
    });
    it("should correctly return a list of tests for resources in root_module", () => {
      let tfstate = {
        resources: [
          {
            mode: "data",
            type: "external",
            name: "example",
            provider: 'provider["registry.terraform.io/hashicorp/external"]',
            instances: [
              {
                schema_version: 0,
                attributes: {
                  id: "-",
                  program: ["sh", "./test-output.sh", "example", "test"],
                  query: null,
                  result: {
                    data: "example-test-value",
                  },
                  working_dir: null,
                },
                sensitive_attributes: [],
              },
            ],
          },
        ],
      };
      let actualData = tfutils.buildStateTest("External Data Source", tfstate, [
        {
          name: "External Data Source",
          address: "data.external.example",
          instances: [
            {
              id: "-",
              program: ["sh", "./test-output.sh", "example", "test"],
              result: {
                data: "example-test-value",
              },
            },
          ],
        },
      ]);
      let expecctedData = {
        describe: "External Data Source",
        tests: [
          {
            describe: "data.external.example",
            tests: [
              {
                name: "Resource data.external.example should be in tfstate",
                assertionType: "isNotFalse",
                assertionArgs: [
                  true,
                  "Expected data.external.example resource to be included in tfstate",
                ],
              },
              {
                name: "Expected resource data.external.example[0] to have correct value for id.",
                assertionType: "deepEqual",
                assertionArgs: [
                  "-",
                  "-",
                  "Expected data.external.example[0] id to have value -",
                ],
              },
              {
                name: "Expected resource data.external.example[0] to have correct value for program.",
                assertionType: "deepEqual",
                assertionArgs: [
                  ["sh", "./test-output.sh", "example", "test"],
                  ["sh", "./test-output.sh", "example", "test"],
                  'Expected data.external.example[0] program to have value ["sh","./test-output.sh","example","test"]',
                ],
              },
              {
                name: "Expected resource data.external.example[0] to have correct value for result.",
                assertionType: "deepEqual",
                assertionArgs: [
                  {
                    data: "example-test-value",
                  },
                  {
                    data: "example-test-value",
                  },
                  'Expected data.external.example[0] result to have value {"data":"example-test-value"}',
                ],
              },
              {
                name: "Expected instance with key 0 to exist at data.external.example",
                assertionType: "isTrue",
                assertionArgs: [
                  true,
                  "Expected instance with key 0 to exist at data.external.example.instances",
                ],
              },
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return correct data"
      );
    });
  });
});
