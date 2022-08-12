const { assert } = require("chai");
const utils = require("../lib/lz");

describe("lz", () => {
  describe("getType", () => {
    let getType = utils.getType;
    it("should return array if is array", () => {
      assert.deepEqual(getType([]), "Array", "should return correct value");
    });
    it("should return Function if is Function", () => {
      assert.deepEqual(
        getType(getType),
        "Function",
        "should return correct value"
      );
    });
    it("should return typeof if is not function or Array", () => {
      assert.deepEqual(getType({}), "object", "should return correct value");
    });
  });
  describe("typeCheck", () => {
    it("should throw a error with the correct message if value is wrong type", () => {
      assert.throws(() => {
        utils.typeCheck("uh oh", "number", "string");
      }, "uh oh number got string");
    });
  });
  describe("containsKeys", () => {
    let containsKeys = utils.containsKeys;
    it("should return true if key exists in object", () => {
      assert.isTrue(containsKeys({ test: true }, "test"));
    });
    it("should return false if key does not exist in object", () => {
      assert.isTrue(containsKeys({ test: true }, "test"));
    });
  });
  describe("keys", () => {
    it("should return correct keys", () => {
      let keys = utils.keys;
      assert.deepEqual(
        keys({ test: true }),
        ["test"],
        "should return correct keys"
      );
    });
  });
  describe("isEmpty", () => {
    let isEmpty = utils.isEmpty;
    it("should return false if not empty", () => {
      assert.deepEqual(isEmpty(["test"]), false, "should return correct keys");
    });
  });
  describe("contains", () => {
    let contains = utils.contains;
    it("should return true if string in string", () => {
      assert.isTrue(contains("test", "es"), "should be true");
    });
    it("should return false if string not in string", () => {
      assert.isFalse(contains("test", "frog"), "should be false");
    });
    it("should return true if item in array", () => {
      assert.isTrue(contains(["test"], "test"), "should be true");
    });
    it("should return false if item not in array", () => {
      assert.isFalse(contains(["test"], "frog"), "should be true");
    });
  });
  describe("arrTypeCheck", () => {
    assert.throws(() => {
      utils.arrTypeCheck("should", "string", [1, 2, 3, 4]);
    }, `should type string got ["number","number","number","number"]`);
  });
  describe("containsCheck", () => {
    it("should throw error if not in array", () => {
      assert.throws(() => {
        utils.containsCheck("should", ["frog", "string", "egg"], "4");
      }, "should got 4");
    });
    it("should not throw error if is in array", () => {
      assert.doesNotThrow(() => {
        utils.containsCheck("should", ["frog", "string", "egg"], "egg");
      }, "should got 4");
    });
  });
});
