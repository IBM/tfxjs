const helpers = require("../lib/helpers");
const { assert } = require("chai");
const { checkResourceTests, expectedResourceAddress, childArraySearch } = require("../lib/helpers");

describe("helpers", () => {
  describe("keyContains", () => {
    it("should return true if key is found in object", () => {
      assert.isTrue(
        helpers.keysContains({ test: true }, "test"),
        "it should return true"
      );
    });
    it("should return false if key is found in object", () => {
      assert.isFalse(helpers.keysContains({}, "test"), "it should return true");
    });
    it("should return false if the type passed is not object", () => {
      assert.isFalse(
        helpers.keysContains("frog", "test"),
        "it should return false"
      );
    });
  });
  describe("checkResourceTests", () => {
    it("should throw an error if resources is not an array", () => {
      let test = () => {
        checkResourceTests("frog")
      }
      assert.throws(test, "Expected resource tests to be an array got string.")
    })
    it("should throw an error if test is passed with no name", () => {
      let test = () => {
        checkResourceTests([
          {
            address: "test",
          },
        ]);
      };
      assert.throws(
        test,
        `Tests object requires \`name\` and \`address\` parameter. Got {\n  "address": "test"\n}`
      );
    });
    it("should throw an error if test is passed with no address", () => {
      let test = () => {
        checkResourceTests([
          {
            name: "test",
          },
        ]);
      };
      assert.throws(
        test,
        `Tests object requires \`name\` and \`address\` parameter. Got {\n  "name": "test"\n}`
      );
    });
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
    it("should throw an error if test is passed values array", () => {
      let test = () => {
        checkResourceTests([
          {
            name: "test",
            address: "test",
            values: [1, 2, 3, 4],
          },
        ]);
      };
      assert.throws(
        test,
        `Values fields for test objects must be type object, got Array:\n{\n  "name": "test",\n  "address": "test",\n  "values": [\n    1,\n    2,\n    3,\n    4\n  ]\n}`
      );
    });
    it("should throw an error if test is passed not object and not array", () => {
      let test = () => {
        checkResourceTests([
          {
            name: "test",
            address: "test",
            values: 1,
          },
        ]);
      };
      assert.throws(
        test,
        `Values fields for test objects must be type object, got number:\n{\n  "name": "test",\n  "address": "test",\n  "values": 1\n}`
      );
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
        containsModule: true,
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
        { containsModule: false, moduleData: undefined },
        "should contain correct data"
      );
    });
    it("should search child modules of child modules for address", () => {
      let data = childArraySearch("module.ez_vpc.module.vpc", [
        {
          "address": "module.ez_vpc",
          "child_modules": [
            {
              "address" : "module.ez_vpc.module.vpc"
            }
          ]
        }
      ]);
      let expectedData = {
        containsModule: true,
        moduleData: {
          "address" : "module.ez_vpc.module.vpc"
        }
      }
      assert.deepEqual(data, expectedData, "it should return correct data")
    })
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
    it("should throw an error if incorrect params are passed on function evaluation", () => {
      let test = () => {
        valueFunctionTest(() => {
          return {
            egg: "egg",
          };
        }, "egg");
      };
      assert.throws(
        test,
        "Value functions must have only two keys, `appendMessage` and `expectedData` got " +
          []
      );
    });
    it("should throw an error if function does not evaluate to boolean", () => {
      let test = () => {
        valueFunctionTest(() => {
          return {
            expectedData: "egg",
            appendMessage: "egg",
          };
        }, "egg");
      };
      assert.throws(
        test,
        "Value functions must evaluate to either true or false got egg"
      );
    });
    it("should throw an error if function appendMessage is not string", () => {
      let test = () => {
        valueFunctionTest(() => {
          return {
            expectedData: true,
            appendMessage: 2345,
          };
        }, "egg");
      };
      assert.throws(
        test,
        "Value functions appendMessage must be string got number"
      );
    });
    it("should return bad results if everything is correct but data isn't found", () => {
      let data = valueFunctionTest((frog) => {
        return "uh-oh";
      });
      assert.deepEqual(data, {
        appendMessage: "to exist in module, got undefined.",
        expectedData: false,
      });
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
  describe("eachKey", () => {
    let eachKey = helpers.eachKey;
    it("should throw an error if type of first arg passed is not object", () => {
      let task = () => {
        eachKey("test");
      };
      assert.throws(
        task,
        "eachKey expects the the first argument to be an Object got string"
      );
    });
    it("should throw an error if type of first arg passed is an Array", () => {
      let task = () => {
        eachKey(["test"]);
      };
      assert.throws(
        task,
        "eachKey expects the the first argument to be an Object got Array"
      );
    });
    it("should throw an error if callback is not function", () => {
      let task = () => {
        eachKey({}, "test");
      };
      assert.throws(
        task,
        "eachKey expects a function for callback, got string"
      );
    });
    it("should throw an error if callback function has more than one parameter", () => {
      let task = () => {
        eachKey({}, function badFunction1(key, keykey, keykeykey) {});
      };
      assert.throws(
        task,
        'eachKey callback function accepts only one argument got ["key","keykey","keykeykey"]'
      );
    });
    it("should correctly run eachKey", () => {
      let testData = [];
      eachKey({ test: "test" }, (key) => testData.push(key));
      assert.deepEqual(testData, ["test"], "it should return correct data");
    });
  });
  describe("containsModule", () => {
    let containsModule = helpers.containsModule;
    it("should return true if moduleData.address and address match", () => {
      assert.isTrue(
        containsModule({ address: "test" }, "test"),
        "should return true"
      );
    });
    it("should return false if not found", () => {
      assert.isFalse(
        containsModule({ address: "test" }, "fail"),
        "should return true"
      );
    });
    it("should return properly formatted data when a child is found", () => {
      let actualData = containsModule(
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
        containsModule: true,
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
      let actualData = expectedResourceAddress(undefined, "one", "two")
      assert.deepEqual(actualData, "two.one", "it should return correct string")
    })
  });
  describe("azsort", () => {
    it("should return -1 if string a is less than string b", () => {
      let actualData = helpers.azsort("a", "b");
      assert.deepEqual(actualData, -1, "it should return -1")
    })
    it("should return 1 if string a is greater than string b", () => {
      let actualData = helpers.azsort(3, 2);
      assert.deepEqual(actualData, 1, "it should return 11")
    })
    it("should return 0 if string a is equal to string b", () => {
      let actualData = helpers.azsort(2, 2);
      assert.deepEqual(actualData, 0, "it should return 11")
    })
  })
});
