const { assert } = require("chai");
const builders = require("../lib/builders");
const sinon = require("sinon");

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
        testInstance.send = new sinon.spy(testInstance, "send");
        testInstance.send();
        assert.isTrue(
          testInstance.send.returned({
            name: "",
            assertionType: "",
            assertionArgs: [],
          }),
          "it should return the correct object"
        );
        // let sendData = testInstance.send();
        // let expectedData = {
        //   name: "",
        //   assertionType: "",
        //   assertionArgs: [],
        // };
        // assert.deepEqual(
        //   sendData,
        //   expectedData,
        //   "it should return the correct object"
        // );
      });
    });
  });
  describe("notFalseTest", () => {
    it("should return the correct test", () => {
      let spy = new sinon.spy(builders, "notFalseTest");
      spy("test", [1, 2, 3]);
      assert.isTrue(
        spy.returned({
          name: "test",
          assertionType: "isNotFalse",
          assertionArgs: [1, 2, 3],
        }),
        "it should return the correct data"
      );
      // let testData = builders.notFalseTest("test", [1, 2, 3]);
      // let expectedData = {
      //   name: "test",
      //   assertionType: "isNotFalse",
      //   assertionArgs: [1, 2, 3],
      // };
      // assert.deepEqual(
      //   testData,
      //   expectedData,
      //   "it should return the correct data"
      // );
    });
  });
  describe("isTrueTest", () => {
    it("should return the correct test", () => {
      let spy = new sinon.spy(builders, "isTrueTest");
      spy("test", [1, 2, 3]);
      assert.isTrue(
        spy.returned({
          name: "test",
          assertionType: "isTrue",
          assertionArgs: [1, 2, 3],
        }),
        "it should return the correct data"
      );

      // let testData = builders.isTrueTest("test", [1, 2, 3]);
      // let expectedData = {
      //   name: "test",
      //   assertionType: "isTrue",
      //   assertionArgs: [1, 2, 3],
      // };
      // assert.deepEqual(
      //   testData,
      //   expectedData,
      //   "it should return the correct data"
      // );
    });
  });
  describe("deepEqualTest", () => {
    it("should return the correct test", () => {
      let spy = new sinon.spy(builders, "deepEqualTest");
      spy("test", [1, 2, 3]);
      assert.isTrue(
        spy.returned({
          name: "test",
          assertionType: "deepEqual",
          assertionArgs: [1, 2, 3],
        })
      );

      // let testData = builders.deepEqualTest("test", [1, 2, 3]);
      // let expectedData = {
      //   name: "test",
      //   assertionType: "deepEqual",
      //   assertionArgs: [1, 2, 3],
      // };
      // assert.deepEqual(
      //   testData,
      //   expectedData,
      //   "it should return the correct data"
      // );
    });
  });
  describe("eachKeyTest", () => {
    let eachKeyTest = new sinon.spy(builders, "eachKeyTest"); //= builders.eachKeyTest;

    it("should run value test against a function if the value is a function", () => {
      eachKeyTest(
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
      assert.isTrue(
        eachKeyTest.returned([
          {
            name: "test should have the correct value value",
            assertionType: "isTrue",
            assertionArgs: [
              true,
              "Expected address resource value value append",
            ],
          },
        ]),
        "it should return correct object"
      );

      // let data = eachKeyTest(
      //   "address",
      //   {
      //     value: (value) => {
      //       return {
      //         expectedData: value === "test",
      //         appendMessage: "append",
      //       };
      //     },
      //   },
      //   { value: "test" },
      //   "plan",
      //   "test"
      // );
      // let expectedData = [
      //   {
      //     name: "test should have the correct value value",
      //     assertionType: "isTrue",
      //     assertionArgs: [true, "Expected address resource value value append"],
      //   },
      // ];
      // assert.deepEqual(data, expectedData, "it should return correct object");
    });
    it("should run a notFalseTest for unfound keys", () => {
      eachKeyTest("test", { test: "data" }, {}, "apply", "test", 0);
      assert.isTrue(
        eachKeyTest.returned([
          {
            name: "Expected resource test[0] to have correct value for test[0].test",
            assertionType: "isNotFalse",
            assertionArgs: [
              false,
              "Expected test[0] attribute test.test to exist",
            ],
          },
        ]),
        "it should return correct object"
      );

      // let actualData = eachKeyTest(
      //   "test",
      //   { test: "data" },
      //   {},
      //   "apply",
      //   "test",
      //   0
      // );
      // let expectedData = [
      //   {
      //     name: "Expected resource test[0] to have correct value for test[0].test",
      //     assertionType: "isNotFalse",
      //     assertionArgs: [
      //       false,
      //       "Expected test[0] attribute test.test to exist",
      //     ],
      //   },
      // ];
      // assert.deepEqual(actualData, expectedData);
    });
  });
  describe("valueTest", () => {
    let valueTest = new sinon.spy(builders, "valueTest"); //builders.valueTest;
    it("should return the correct test if a valid valueFunction is passed", () => {
      valueTest(
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
      assert.isTrue(
        valueTest.returned({
          name: "testName",
          assertionType: "isTrue",
          assertionArgs: [true, "testMessage append"],
        }),
        "it should return correct test"
      );

      // let actualData = valueTest(
      //   (value) => {
      //     return {
      //       expectedData: true,
      //       appendMessage: "append",
      //     };
      //   },
      //   { data: true },
      //   "testName",
      //   "testMessage"
      // );
      // let expectedData = {
      //   name: "testName",
      //   assertionType: "isTrue",
      //   assertionArgs: [true, "testMessage append"],
      // };
      // assert.deepEqual(
      //   actualData,
      //   expectedData,
      //   "it should return correct test"
      // );
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
    let resource = new sinon.spy(builders, "resource"); //builders.resource;
    it("should return the correct object", () => {
      resource("test", "test", {});
      assert.isTrue(
        resource.returned({
          name: "test",
          address: "test",
          values: {},
        }),
        "it should return the correct object"
      );

      // let actualData = resource("test", "test", {});
      // assert.deepEqual(actualData, {
      //   name: "test",
      //   address: "test",
      //   values: {},
      // });
    });
  });
  describe("address", () => {
    let address = new sinon.spy(builders, "address"); //builders.address;
    it("should return instances", () => {
      address("test", { id: true });
      assert.isTrue(
        address.returned({
          address: "test",
          instances: [
            {
              id: true,
            },
          ],
        })
      );

      // let actualData = address("test", { id: true });
      // let expectedData = {
      //   address: "test",
      //   instances: [
      //     {
      //       id: true,
      //     },
      //   ],
      // };
      // assert.deepEqual(
      //   actualData,
      //   expectedData,
      //   "it should return correct data"
      // );
    });
  });
  describe("textTemplate", () => {
    let textTemplate = builders.textTemplate;
    const resourceTemplate = `tfx.resource(\n  "$RESOURCE_NAME",\n  "$RESOURCE_ADDRESS",\n$VALUES\n),`;
    it("should get all the args from a string teplate and set as templateArgs", () => {
      let expectedData = ["$RESOURCE_NAME", "$RESOURCE_ADDRESS", "$VALUES"];
      let actualData = new textTemplate(resourceTemplate).templateArgs;
      assert.deepEqual(actualData, expectedData, "should have correct array");
    });
    describe("fill", () => {
      it("should fill the template variable values", () => {
        let expectedData = `tfx.resource(\n  "yes",\n  "hi",\nhello\n),`;
        let actualData = new textTemplate(resourceTemplate).fill(
          "yes",
          "hi",
          "hello"
        );
        assert.deepEqual(
          actualData,
          expectedData,
          "It should return filled in template"
        );
      });
    });
    describe("set", () => {
      it("should replace a value and return the object", () => {
        let expectedData = `tfx.resource(\n  "$RESOURCE_NAME",\n  "$RESOURCE_ADDRESS",\nhi\n),`;
        let actualData = new textTemplate(resourceTemplate).set(
          "$VALUES",
          "hi"
        );
        assert.deepEqual(
          actualData,
          expectedData,
          "should return string template"
        );
      });
    });
    describe("clone", () => {
      it("should create a new instance of the textTemplate instance", () => {
        let original = new textTemplate(resourceTemplate);
        let cloneTemplate = original.clone();
        assert.deepEqual(original.str, cloneTemplate.str, "it should copy");
      });
      it("should not change the original when the clone is changed", () => {
        let original = new textTemplate(resourceTemplate);
        let cloneTemplate = original.clone();
        cloneTemplate.set("$VALUES", "frog");
        assert.notDeepEqual(original.str, cloneTemplate.str, "it should copy");
      });
    });
  });
});
