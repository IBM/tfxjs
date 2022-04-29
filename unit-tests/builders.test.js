const { assert } = require("chai");
const builders = require("../lib/builders");

describe("builders", () => {
  const mochaTest = builders.mochaTest;
  describe("mochaTest", () => {
    describe("init", () => {
      it("should initialize correctly with no args", () => {
        let testInstance = new mochaTest();
        assert.deepEqual(testInstance.name, "", "it should have default name");
        assert.deepEqual(
          testInstance.assertionType,
          "",
          "it should have default type"
        );
        assert.deepEqual(
          testInstance.assertionArgs,
          [],
          "it should have default args"
        );
      });
    });
    describe("send", () => {
      it("should return the correct object when send is called", () => {
        let testInstance = new mochaTest();
        let sendData = testInstance.send();
        let expectedData = {
          name: "",
          assertionType: "",
          assertionArgs: [],
        };
        assert.deepEqual(
          sendData,
          expectedData,
          "it should return the correct object"
        );
      });
    });
  });
  describe("notFalseTest", () => {
    it("should return the correct test", () => {
      let testData = builders.notFalseTest("test", [1, 2, 3]);
      let expectedData = {
        name: "test",
        assertionType: "isNotFalse",
        assertionArgs: [1, 2, 3],
      };
      assert.deepEqual(
        testData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("isTrueTest", () => {
    it("should return the correct test", () => {
      let testData = builders.isTrueTest("test", [1, 2, 3]);
      let expectedData = {
        name: "test",
        assertionType: "isTrue",
        assertionArgs: [1, 2, 3],
      };
      assert.deepEqual(
        testData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("deepEqualTest", () => {
    it("should return the correct test", () => {
      let testData = builders.deepEqualTest("test", [1, 2, 3]);
      let expectedData = {
        name: "test",
        assertionType: "deepEqual",
        assertionArgs: [1, 2, 3],
      };
      assert.deepEqual(
        testData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("eachKeyTest", () => {
    let eachKeyTest = builders.eachKeyTest;
    it("should run value test against a function if the value is a function", () => {
      let data = eachKeyTest(
        "address",
        {
          value: (value) => {
            return {
              expectedData: value === "test",
              appendMessage: "append",
            };
          },
        },
        { value: "test" },
        "plan",
        "test"
      );
      let expectedData = [
        {
          name: "test should have the correct value value",
          assertionType: "isTrue",
          assertionArgs: [true, "Expected address resource value value append"],
        },
      ];
      assert.deepEqual(data, expectedData, "it should return correct object");
    });
    it("should run a notFalseTest for unfound keys", () => {
      let actualData = eachKeyTest(
        "test",
        { test: "data" },
        {},
        "apply",
        "test",
        0
      );
      let expectedData = [
        {
          name: "Expected resource test[0] to have correct value for test[0].test",
          assertionType: "isNotFalse",
          assertionArgs: [
            false,
            "Expected test[0] attribute test.test to exist",
          ],
        },
      ];
      assert.deepEqual(actualData, expectedData);
    });
  });
  describe("valueTest", () => {
    let valueTest = builders.valueTest;
    it("should return the correct test if a valid valueFunction is passed", () => {
      let actualData = valueTest(
        (value) => {
          return {
            expectedData: true,
            appendMessage: "append",
          };
        },
        { data: true },
        "testName",
        "testMessage"
      );
      let expectedData = {
        name: "testName",
        assertionType: "isTrue",
        assertionArgs: [true, "testMessage append"],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct test"
      );
    });
  });
  describe("eval", () => {
    let eval = builders.eval;
    it("should return a function", () => {
      assert.isTrue(
        eval("test", () => {}) instanceof Function,
        "it should return funciton"
      );
    });
    it("should evaluate the function when run", () => {
      let actualData = eval("test", () => {
        return true;
      })();
      let expectedData = {
        appendMessage: "test",
        expectedData: true,
      };
      assert.deepEqual(actualData, expectedData, "it should return value");
    });
  });
  describe("resource", () => {
    let resource = builders.resource;
    it("should return the correct object", () => {
      let actualData = resource("test", "test", {});
      assert.deepEqual(actualData, {
        name: "test",
        address: "test",
        values: {},
      });
    });
  });
  describe("address", () => {
    let address = builders.address;
    it("should return instances", () => {
      let actualData = address("test", { id: true });
      let expectedData = {
        address: "test",
        instances: [
          {
            id: true,
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
