const helpers = require("../lib/helpers");
const { assert } = require("chai");
const { checkResourceTests } = require("../lib/helpers");

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
  });
  describe("checkResourceTests", () => {
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
        `Tests object requires \`name\` and \`test\` parameter. Got {\n  "address": "test"\n}`
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
        `Tests object requires \`name\` and \`test\` parameter. Got {\n  "name": "test"\n}`
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
    it("should compose a name from a resource", () => {
      let actualData = helpers.composeName({
        module: "test",
        name: "test",
        mode: "managed",
        type: "test",
      });
      let expecctedData = "test.test.test";
      assert.deepEqual(
        actualData,
        expecctedData,
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
      let expecctedData = "test.data.test.test";
      assert.deepEqual(
        actualData,
        expecctedData,
        "it should return composed name"
      );
    });
  });
});
