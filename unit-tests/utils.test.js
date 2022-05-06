const { assert } = require("chai");
const {
  keyCheck,
  emptyCheck,
  arrTypeCheck,
  containsCheck,
} = require("../lib/utils");
const utils = require("../lib/utils");

describe("utils", () => {
  describe("eachKey", () => {
    let eachKey = utils.eachKey;
    it("should correctly run eachKey", () => {
      let testData = [];
      eachKey({ test: "test" }, (key) => testData.push(key));
      assert.deepEqual(testData, ["test"], "it should return correct data");
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
  describe("getType", () => {
    let getType = utils.getType;
    it("should return array if is array", () => {
      assert.deepEqual(getType([]), "Array", "should retun corrct value");
    });
    it("should return Function if is Function", () => {
      assert.deepEqual(
        getType(getType),
        "Function",
        "should retun corrct value"
      );
    });
    it("should return typeof if is not function or Array", () => {
      assert.deepEqual(getType({}), "object", "should retun corrct value");
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
  describe("keyTest", () => {
    let keyTest = utils.keyTest;
    it("should return false if strict and number of keys don't match", () => {
      assert.isFalse(
        keyTest(
          {
            test: true,
            bad: "frog",
          },
          ["test"],
          true
        ),
        "should be false"
      );
    });
    it("should return false if strict and missing key", () => {
      assert.isFalse(
        keyTest(
          {
            test: true,
            bad: "frog",
          },
          ["test", "test-2"]
        ),
        "should be false"
      );
    });
    it("should return true if all match", () => {
      assert.isTrue(
        keyTest(
          {
            test: true,
          },
          ["test"]
        ),
        "should be true"
      );
    });
  });
  describe("contains", () => {
    let contains = utils.contains;
    it("should return true if item in array", () => {
      assert.isTrue(contains(["test"], "test"), "should be true");
    });
    it("should return false if item not in array", () => {
      assert.isFalse(contains(["test"], "frog"), "should be true");
    });
  });
  describe("typeCheck", () => {
    it("should throw a error with the correct message if value is wrong type", () => {
      assert.throws(() => {
        utils.typeCheck("uh oh", "number", "string");
      }, "uh oh number got string");
    });
  });
  describe("keyCheck", () => {
    it("should throw an error if strict check fails", () => {
      assert.throws(() => {
        keyCheck("uh oh", { frog: true, foo: "baz" }, ["frog"], true);
      }, 'uh oh 1 keys ["frog"] got ["frog","foo"]');
    });
    it("should throw an error if non strict check fails", () => {
      assert.throws(() => {
        keyCheck("uh oh", { foo: "baz" }, ["frog"]);
      }, 'uh oh ["frog"] got ["foo"]');
    });
  });
  describe("emptyCheck", () => {
    it("should throw an error if length is not 0", () => {
      assert.throws(() => {
        emptyCheck("should got 0", []);
      }, "should got 0");
    });
  });
  describe("arrTypeCheck", () => {
    assert.throws(() => {
      arrTypeCheck("should", "string", [1, 2, 3, 4]);
    }, `should type string got ["number","number","number","number"]`);
  });
  describe("containsCheck", () => {
    it("should throw error if not in array", () => {
      assert.throws(
        () => {
          containsCheck("should", ["frog", "string", "egg"], "4")
        },
        'should got 4'
      );
    });
  });
});
