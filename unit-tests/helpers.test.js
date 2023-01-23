const helpers = require("../lib/helpers");
const { assert } = require("chai");
const {
  checkResourceTests,
  expectedResourceAddress,
  childArraySearch,
  convertTfVarsFromTags,
} = require("../lib/helpers");
const constants = require("../lib/constants");

describe("helpers", () => {
  describe("checkResourceTests", () => {
    it("should add empty values object to tests passed with no values param", () => {
      let tests = [
        {
          name: "test",
          address: "test",
        },
      ];
      checkResourceTests(tests);
      assert.deepEqual(tests[0].values, {}, "it should add empty object");
    });
    it("should not throw an error if everything is correct", () => {
      let test = () => {
        checkResourceTests([
          {
            name: "test",
            address: "test",
            values: {},
          },
        ]);
      };
      assert.doesNotThrow(test, "it should not throw an error");
    });
  });
  describe("composeName", () => {
    it("should compose a name from a resource not in a module", () => {
      let actualData = helpers.composeName({
        name: "test",
        mode: "managed",
        type: "test",
      });
      let expectedData = "test.test";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return composed name"
      );
    });
    it("should compose a name from a data resource", () => {
      let actualData = helpers.composeName({
        module: "test",
        name: "test",
        mode: "data",
        type: "test",
      });
      let expectedData = "test.data.test.test";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return composed name"
      );
    });
  });
  describe("childArraySearch", () => {
    it("should return correct object for found parent address", () => {
      let data = helpers.childArraySearch("found", [
        {
          address: "found",
        },
      ]);
      assert.deepEqual(data, {
        containsKeysModule: true,
        moduleData: {
          address: "found",
        },
      });
    });
    it("should return correct object for unfound parent address", () => {
      let data = helpers.childArraySearch("missing", [
        {
          address: "found",
        },
      ]);
      assert.deepEqual(
        data,
        { containsKeysModule: false, moduleData: undefined },
        "should contain correct data"
      );
    });
    it("should search child modules of child modules for address", () => {
      let data = childArraySearch("module.ez_vpc.module.vpc", [
        {
          address: "module.ez_vpc",
          child_modules: [
            {
              address: "module.ez_vpc.module.vpc",
            },
          ],
        },
      ]);
      let expectedData = {
        containsKeysModule: true,
        moduleData: {
          address: "module.ez_vpc.module.vpc",
        },
      };
      assert.deepEqual(data, expectedData, "it should return correct data");
    });
  });
  it("should search child modules of child modules of child_modules for address", () => {
    let data = childArraySearch(
      "module.ez_vpc.module.vpc.module.test_module.module.deep_test2",
      [
        {
          address: "module.ez_vpc",
          child_modules: [
            {
              address: "module.ez_vpc.module.vpc",
              child_modules: [
                {
                  address: "module.ez_vpc.module.vpc.module.test_module",
                  child_modules: [
                    {
                      address:
                        "module.ez_vpc.module.vpc.module.test_module.module.deep_test",
                    },
                    {
                      address:
                        "module.ez_vpc.module.vpc.module.test_module.module.deep_test2",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]
    );
    let expectedData = {
      containsKeysModule: true,
      moduleData: {
        address:
          "module.ez_vpc.module.vpc.module.test_module.module.deep_test2",
      },
    };
    assert.deepEqual(data, expectedData, "it should return correct data");
  });
  describe("getFoundResources", () => {
    it("should return correct array when none unexpected resources found and address is empty string", () => {
      let data = helpers.getFoundResources(
        [
          {
            address: "test.test",
          },
        ],
        "",
        ["test.test"]
      );
      assert.deepEqual(data.length, 0, "should return empty array");
    });
    it("should return correct array when none unexpected resources found and address is not empty string", () => {
      let data = helpers.getFoundResources(
        [
          {
            address: "test.test",
          },
        ],
        "frog",
        ["frog.test.test"]
      );
      assert.deepEqual(data.length, 0, "should return empty array");
    });
    it("should return correct array when an unexpected resource is found", () => {
      let data = helpers.getFoundResources(
        [
          {
            address: "test.test",
          },
        ],
        "test.test",
        ["frog.test.test"]
      );
      assert.deepEqual(data, ["test.test"], "should return empty array");
    });
  });
  describe("valueFunctionTest", () => {
    let valueFunctionTest = helpers.valueFunctionTest;
    it("should return bad results if everything is correct but data isn't found", () => {
      let data = valueFunctionTest((frog) => {
        return "uh-oh";
      });
      assert.deepEqual(
        data,
        {
          appendMessage: "to exist in module, got undefined.",
          expectedData: false,
        },
        "should return expected data"
      );
    });
  });
  describe("checkModuleTest", () => {
    let checkModuleTest = helpers.checkModuleTest;
    it("should throw an error if no root_module", () => {
      let task = () => {
        checkModuleTest("root_module", {});
      };
      assert.throws(
        task,
        "Expected terraform plan to have root_module at top level. Check your plan configuration and try again."
      );
    });
    it("should throw an error if no resources are found and parent is root_module", () => {
      let task = () => {
        checkModuleTest("root_module", { root_module: {} });
      };
      assert.throws(
        task,
        "Expected root module to have resources. Check your plan configuration and try again."
      );
    });
    it("should throw an error if resources is empty and parent is root_module", () => {
      let task = () => {
        checkModuleTest("root_module", {
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
    it("should throw an error if address is not root module and child modules length is 0", () => {
      let task = () => {
        checkModuleTest("module.test", {
          root_module: {
            child_modules: [],
          },
        });
      };
      assert.throws(
        task,
        "Expected child_modules to be created. Check your plan configuration and try again."
      );
    });
    it("should throw an error if no root module is found", () => {
      let task = () => {
        checkModuleTest("module.test", {});
      };
      assert.throws(
        task,
        "Expected terraform plan to have root_module at top level. Check your plan configuration and try again."
      );
    });
    it("should throw an error if not child modules", () => {
      let task = () => {
        checkModuleTest("module.test", { root_module: {} });
      };
      assert.throws(
        task,
        "Expected terraform plan root_module to have child_modules. Check your plan configuration and try again."
      );
    });
    it("should return moduleData and parentAddress if everything is good", () => {
      let actualData = checkModuleTest("root_module", {
        root_module: { resources: ["test"] },
      });
      let expectedData = {
        moduleData: {
          address: "root_module",
          resources: ["test"],
        },
        parentAddress: "",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("parseTestModuleOptions", () => {
    let parseTestModuleOptions = helpers.parseTestModuleOptions;
    it("should return the defaults if no options are passed other than tfData", () => {
      let actualData = parseTestModuleOptions({
        tfData: true,
      });
      assert.isTrue(actualData.tfData, "should have passed data");
      assert.deepEqual("", actualData.address, "should have default data");
      assert.isFalse(actualData.callback, "should have default data");
      assert.isFalse(actualData.isApply, "should have default data");
      assert.deepEqual(actualData.testList, [], "should have default data"),
        assert.deepEqual(actualData.moduleName, "", "should have default data");
    });
    it("should overwrite any passed data", () => {
      let actualData = parseTestModuleOptions({
        tfData: true,
        address: 1234,
        callback: "hello",
        isApply: true,
        moduleName: "test",
        testList: [1234],
      });
      assert.isTrue(actualData.tfData, "should have passed data");
      assert.deepEqual(actualData.address, 1234, "should have default data");
      assert.deepEqual(
        actualData.callback,
        "hello",
        "should have default data"
      );
      assert.isTrue(actualData.isApply, "should have default data");
      assert.deepEqual(actualData.testList, [1234], "should have default data"),
        assert.deepEqual(
          actualData.moduleName,
          "test",
          "should have default data"
        );
    });
  });
  describe("containsKeysModule", () => {
    let containsKeysModule = helpers.containsKeysModule;
    it("should return true if moduleData.address and address match", () => {
      assert.isTrue(
        containsKeysModule({ address: "test" }, "test"),
        "should return true"
      );
    });
    it("should return false if not found", () => {
      assert.isFalse(
        containsKeysModule({ address: "test" }, "fail"),
        "should return true"
      );
    });
    it("should return properly formatted data when a child is found", () => {
      let actualData = containsKeysModule(
        {
          address: "test",
          child_modules: [
            {
              address: "test.child.test",
            },
          ],
        },
        "child.test"
      );
      let expectedData = {
        containsKeysModule: true,
        moduleData: {
          address: "test.child.test",
        },
        parentAddress: "test.child.test",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct object"
      );
    });
  });
  describe("expectedResourceAddress", () => {
    it("should return address plus resource address if not parent address", () => {
      let actualData = expectedResourceAddress(undefined, "one", "two");
      assert.deepEqual(
        actualData,
        "two.one",
        "it should return correct string"
      );
    });
  });

  describe("tfVarCheck", () => {
    let tfVarCheck = helpers.tfVarCheck;
    it("should not throw if string, boolean, and number are passed", () => {
      let data = {
        one: 1,
        two: "two",
        three: true,
      };
      let task = () => {
        tfVarCheck(data);
      };
      assert.doesNotThrow(task, "everything is fine");
    });
    it("should  throw if types other than string, boolean, and number are passed", () => {
      let data = {
        one: [],
        two: {},
        three: true,
      };
      let task = () => {
        tfVarCheck(data);
      };
      assert.throws(
        task,
        `${constants.ansiRed}Expected type of string, number, or boolean for one got string${constants.ansiDefaultForeground}\n${constants.ansiRed}Expected type of string, number, or boolean for two got string${constants.ansiDefaultForeground}`
      );
    });
  });
  describe("capitalizeWords", () => {
    it("should return capitalized words", () => {
      let actualData = helpers.capitalizeWords(
        "all lowercase words separated by spaces"
      );
      let expectedData = "All Lowercase Words Separated By Spaces";
      assert.deepEqual(
        actualData,
        expectedData,
        "It should correctly format the string"
      );
    });
  });
  describe("deepObjectIgnoreNullValues", () => {
    let deepObjectIgnoreNullValues = helpers.deepObjectIgnoreNullValues;
    it("should remove all null values from an object with sub object", () => {
      let testData = {
        test: {
          test2: {
            test3: null,
            test4: "hello",
          },
          test23: {
            test5: null,
          },
        },
        test6: "world",
      };
      let actualData = deepObjectIgnoreNullValues(testData);
      let expectedData = {
        test: {
          test2: {
            test4: "hello",
          },
        },
        test6: "world",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
    it("should remove all null values top level when shallow", () => {
      let testData = {
        test: {
          test2: {
            test3: null,
            test4: "hello",
          },
          test23: {
            test5: null,
          },
        },
        test6: "world",
        top_level_null: null,
      };
      let actualData = deepObjectIgnoreNullValues(testData, true);
      let expectedData = {
        test: {
          test2: {
            test3: null,

            test4: "hello",
          },
          test23: {
            test5: null,
          },
        },
        test6: "world",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct object"
      );
    });
    it("should not recurr if an object value is null", () => {
      let actualData = helpers.deepObjectIgnoreNullValues({ identifier: null });
      let expectedData = { identifier: null };
      assert.deepEqual(actualData, expectedData, "it should return object");
    });
    it("should not recurr if an object value is undefined", () => {
      let actualData = helpers.deepObjectIgnoreNullValues(undefined);
      let expectedData = {};
      assert.deepEqual(actualData, expectedData, "it should return object");
    });
    it("should not recurr if an object child value is null", () => {
      let actualData = helpers.deepObjectIgnoreNullValues({
        frog: { identifier: null },
      });
      let expectedData = { frog: { identifier: null } };
      assert.deepEqual(actualData, expectedData, "it should return object");
    });
  });
  describe("convertTfVarsFromTags", () => {
    it("should return empty object when no planFlagValues.tfvars", () => {
      let actualData = convertTfVarsFromTags({});
      let expectedData = {};
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return empty object"
      );
    });
  });
  describe("restoreStringifiedJson", () => {
    let testData, jsonStringValues;
    beforeEach(() => {
      testData = {
        version: 4,
        terraform_version: "1.2.9",
        serial: 13,
        lineage: "410554f0-fc4d-6733-850a-fce3af2ec2e1",
        outputs: {
          config: {
            value: "__json_value_2",
            type: "string",
          },
        },
        resources: [
          {
            module: "module.ez_vpc",
            mode: "data",
            type: "external",
            name: "format_output",
            provider: 'provider["registry.terraform.io/hashicorp/external"]',
            instances: [
              {
                schema_version: 0,
                attributes: {
                  id: "-",
                  program: ["python3", "ez_vpc/scripts/output.py", "__json_value_1"],
                  query: null,
                  result: {
                    data: "__json_value_3",
                  },
                  working_dir: null,
                },
                sensitive_attributes: [],
              },
            ],
          },
        ],
      };
      jsonStringValues = ["zero", "one", "two", "three"];
    });
    it("should restore data", () => {
      let actualData = helpers.restoreStringifiedJson(
        testData,
        jsonStringValues
      );
      let expectedData = {
        version: 4,
        terraform_version: "1.2.9",
        serial: 13,
        lineage: "410554f0-fc4d-6733-850a-fce3af2ec2e1",
        outputs: {
          config: {
            value: "two",
            type: "string",
          },
        },
        resources: [
          {
            module: "module.ez_vpc",
            mode: "data",
            type: "external",
            name: "format_output",
            provider: 'provider["registry.terraform.io/hashicorp/external"]',
            instances: [
              {
                schema_version: 0,
                attributes: {
                  id: "-",
                  program: ["python3", "ez_vpc/scripts/output.py", "one"],
                  query: null,
                  result: {
                    data: "three",
                  },
                  working_dir: null,
                },
                sensitive_attributes: [],
              },
            ],
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
