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
    describe("setArgs", () => {
      it("should throw an error if set args is not an array", () => {
        let test = () => {
          let data = new mochaTest();
          data.setArgs("frog");
        };
        assert.throws(
          test,
          "Test  expected type of Array for setArgs, got string"
        );
      });
      it("should set args if array is passed", () => {
        let testInstance = new mochaTest();
        testInstance.setArgs([1, 2, 3]);
        assert.deepEqual(
          testInstance.assertionArgs,
          [1, 2, 3],
          "it should correctly set the array"
        );
      });
    });
    describe("setType", () => {
      it("should throw an error if set type is not a string", () => {
        let test = () => {
          let data = new mochaTest();
          data.setType(9);
        };
        assert.throws(
          test,
          "Test  expected type of string for setType, got number"
        );
      });
      it("should set type if string is passed", () => {
        let testInstance = new mochaTest();
        testInstance.setType("isTrue");
        assert.deepEqual(
          testInstance.assertionType,
          "isTrue",
          "it should correctly set the array"
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
});
