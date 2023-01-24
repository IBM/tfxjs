<<<<<<< HEAD
const {
  formatModuleName,
  escapeStringifiedText,
} = require("../lib/text-replacements");
=======
const { formatModuleName } = require("../lib/text-replacements");
>>>>>>> 423c0b1 (refactor: extract.js)
const { assert } = require("chai");

describe("text replacements", () => {
  describe("formatModuleName", () => {
    it("should create a name for a top level module", () => {
      let actualData = formatModuleName("module.test_module");
      let expectedData = "Test Module";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct name"
      );
    });
    it("should create a name for a child module", () => {
      let actualData = formatModuleName(
        'module.test_module["frog"].module.child.module.deep_child'
      );
      let expectedData = "Deep Child";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct name"
      );
    });
  });
});
