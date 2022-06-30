const { assert } = require("chai");
const { it } = require("mocha");
const {
  keyCheck,
  emptyCheck,
  arrTypeCheck,
  containsCheck,
  flagTest,
  getVerbActions,
  containsAny,
  flagValues,
  replaceOptionalFlags,
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
      assert.throws(() => {
        containsCheck("should", ["frog", "string", "egg"], "4");
      }, "should got 4");
    });
  });
  describe("flagTest", () => {
    it("should throw an error if duplicate flags are found", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "-h": "--help",
            "--help": "-h",
          },
          "-h",
          "-h"
        );
      };
      assert.throws(task, "Invalid duplicate flag -h");
    });
    it("should throw an error if a flag is used with a synonym multiple times", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "-h": "--help",
            "--help": "-h",
          },
          "-h",
          "--help"
        );
      };
      assert.throws(task, "Invalid duplicate flag --help");
    });
    it("should throw an error if a flag is not found in aliases", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "-h": "--help",
            "--help": "-h",
          },
          "-h",
          "-f"
        );
      };
      assert.throws(task, "Invalid flag -f");
    });
    it("should not throw an error if reading an argument that does not have at least one hyphen", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "--in": "-i",
            "-i": "--in",
          },
          "--in",
          "filePath"
        );
      };
      assert.doesNotThrow(task);
    });
    it("should throw an error if all needed flags are not provided", () => {
      let task = () => {
        flagTest(
          "help",
          { "--in": "-i", "-i": "--in", "-o": "--out", "--out": "-o" },
          "--in",
          "./filePath"
        );
      };
      assert.throws(
        task,
        "\nMissing flags from command 'tfx help': --in --out\n\nFor a list of valid commands run `tfx --help`."
      );
    });
    it("should not throw an error if an optional flag is passed", () => {
      let task = () => {
        flagTest(
          "plan",
          getVerbActions(
            {
              requiredFlags: ["in", "out", "type"],
              optionalFlags: [
                {
                  name: "tfvar",
                  allowMultiple: true,
                },
              ],
            },
            {
              help: ["-h", "--help"],
              in: ["-i", "--in"],
              out: ["-o", "--out"],
              type: ["-t", "--type"],
              tfvar: ["-v", "--tf-var"],
            }
          ),
          "-i",
          "./in-file-path/",
          "-o",
          "./out-file.test.js",
          "-t",
          "tfx",
          "-v",
          "testVar1=true",
          "-v",
          'testVar2="true"'
        );
        assert.doesNotThrow(task);
      };
    });
  });
  describe("getVerbActions", () => {
    it("should return correct alias map for a verb", () => {
      let plan = {
        requiredFlags: ["in", "out", "type"],
      };
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        // extract -in path -out path -type tfx | yaml
      };
      let expectedData = {
        "-i": "--in",
        "--in": "-i",
        "-o": "--out",
        "--out": "-o",
        "-t": "--type",
        "--type": "-t",
      };
      let actualData = getVerbActions(plan, tags);
      assert.deepEqual(expectedData, actualData, "should return correct data");
    });
    it("should remove optional flags with no needed key values", () => {
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        shallow: ["-s", "--shallow"],
        // extract -in path -out path -type tfx | yaml
      };
    });
    it("should return correct alias map for a verb with optional multiple tags", () => {
      let plan = {
        requiredFlags: ["in", "out", "type"],
        optionalFlags: [
          {
            name: "tfvar",
            allowMultiple: true,
          },
        ],
      };
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        tfvar: ["-v", "--tf-var"],
        // extract -in path -out path -type tfx | yaml
      };
      let expectedData = {
        "-i": "--in",
        "--in": "-i",
        "-o": "--out",
        "--out": "-o",
        "-t": "--type",
        "--type": "-t",
        "?*-v": "?*--tf-var",
        "?*--tf-var": "?*-v",
      };
      let actualData = getVerbActions(plan, tags);
      assert.deepEqual(expectedData, actualData, "should return correct data");
    });
    it("should return correct alias map for a verb with optional tags", () => {
      let plan = {
        requiredFlags: ["in", "out", "type"],
        optionalFlags: [
          {
            name: "tfvar",
          },
        ],
      };
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        tfvar: ["-v", "--tf-var"],
        // extract -in path -out path -type tfx | yaml
      };
      let expectedData = {
        "-i": "--in",
        "--in": "-i",
        "-o": "--out",
        "--out": "-o",
        "-t": "--type",
        "--type": "-t",
        "?-v": "?--tf-var",
        "?--tf-var": "?-v",
      };
      let actualData = getVerbActions(plan, tags);
      assert.deepEqual(expectedData, actualData, "should return correct data");
    });
  });
  describe("containsAny", () => {
    it("should return false if no overlapping entries", () => {
      let actualData = containsAny(["a"], ["b"]);
      assert.isFalse(actualData, "should be false");
    });
    it("should return true if overlapping keys", () => {
      let actualData = containsAny(["b"], ["b"]);
      assert.isTrue(actualData, "should be true");
    });
  });
  describe("replaceOptionalFlags", () => {
    it("should return command if none optional flags", () => {
      let actualData = replaceOptionalFlags(
        { requiredFlags: ["one"] },
        {},
        "hi"
      );
      assert.deepEqual(actualData, ["hi"], "it should return commands");
    });
    it("should replace optional flags that do not accept multiple arguments", () => {
      let actualData = replaceOptionalFlags(
        {
          optionalFlags: [
            {
              name: "optional",
            },
          ],
        },
        {
          optional: ["-o", "--ooo"],
        },
        "-o",
        "frog"
      );
      let expectedData = ["?-o", "frog"];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("flagValues", () => {
    it("should return key value pair of flag values", () => {
      let actualData = flagValues(
        "plan",
        {
          requiredFlags: ["in", "out", "type"],
          optionalFlags: [
            {
              name: "tfvars",
              allowMultiple: true,
            },
          ],
        },
        {
          help: ["-h", "--help"],
          in: ["-i", "--in"],
          out: ["-o", "--out"],
          type: ["-t", "--type"],
          tfvars: ["-v", "--tf-var"],
        },
        "-i",
        "./in-file-path/",
        "-o",
        "./out-file.test.js",
        "-t",
        "tfx",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"'
      );
      let expectedData = {
        in: "./in-file-path/",
        out: "./out-file.test.js",
        type: "tfx",
        tfvars: ["testVar1=true", 'testVar2="true"'],
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should not assign a value to optional flags with no matching key = true", () => {
      let expectedData = {
        in: "./in-file-path/",
        out: "./out-file.test.js",
        type: "tfx",
        tfvars: ["testVar1=true", 'testVar2="true"'],
        shallow: true,
      };
      let actualData = flagValues(
        "plan",
        {
          requiredFlags: ["in", "out", "type"],
          optionalFlags: [
            {
              name: "tfvars",
              allowMultiple: true,
            },
            {
              name: "shallow",
              noMatchingValue: true,
            },
          ],
        },
        {
          help: ["-h", "--help"],
          in: ["-i", "--in"],
          out: ["-o", "--out"],
          type: ["-t", "--type"],
          tfvars: ["-v", "--tf-var"],
          shallow: ["-s", "--shallow"],
        },
        "-i",
        "./in-file-path/",
        "-o",
        "./out-file.test.js",
        "-s",
        "-t",
        "tfx",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"'
      );
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
  });
});
