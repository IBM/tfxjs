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
  describe("eval", () => {
    let eval = builders.eval;
    it("should throw an error if appendMessage is not string", () => {
      let task = () => {
        eval(2);
      };
      assert.throws(
        task,
        "tfx.expect expects append message to be a string got number"
      );
    });
    it("should throw an error if evaluationFunction is not function", () => {
      let task = () => {
        eval("name", 3);
      };
      assert.throws(
        task,
        "tfx.expect expected evaluationFunction to be a function"
      );
    });
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
    it("should throw an error if any of the values are undefined", () => {
      let task = () => {
        resource(1, 3);
      };
      assert.throws(task, "Resource function expected three values got 2");
    });
    it("should throw an error if values is wrong type", () => {
      let task = () => {
        resource("hi", "hello", "x");
      };
      assert.throws(task, "Expected type of object for values, got string");
    });
    it("should throw an error if values is array", () => {
      let task = () => {
        resource("hi", "hello", []);
      };
      assert.throws(task, "Expected type of object for values, got Array");
    });
    it("should throw an error if name is wrong type", () => {
      let task = () => {
        resource(2, "hello", {});
      };
      assert.throws(task, "Expected type of string for name got number");
    });
    it("should throw an error if name is wrong type", () => {
      let task = () => {
        resource("hi", 3, "x");
      };
      assert.throws(task, "Expected type of string for address got number");
    });
    it("should return the correct object otherwise", () => {
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
    it("should throw an error if address is not sring", () => {
      let task = () => {
        address(2);
      };
      assert.throws(
        task,
        "tfx.address expects address to be a string got number"
      );
    });
    it("should throw an error if instances not passed", () => {
      let task = () => {
        address("test");
      };
      assert.throw(task, "tfx.address expects at least one instance got 0");
    });
    it("should throw an error if instances is not array of object", () => {
      let task = () => {
        address("test", {}, "frog", 0, [1, 2, 3]);
      };
      assert.throws(
        task,
        'tfx.address expected all instances to be of type Object got ["object","string","number","Array"]'
      );
    });
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
