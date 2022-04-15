const { assert } = require("chai");
const builders = require("../lib/builders");

describe("builders", () => {
  describe("mochaTest", () => {
    describe("setArgs", () => {
      it("should throw an error if set args is not an array", () => {
        let test = () => {
          let data = new builders.mochaTest();
          data.setArgs("frog");
        };
        assert.throws(
          test,
          "Test  expected type of Array for setArgs, got string"
        );
      });
    });
    describe("setType", () => {
      it("should throw an error if set type is not a string", () => {
        let test = () => {
          let data = new builders.mochaTest();
          data.setType(9);
        };
        assert.throws(
          test,
          "Test  expected type of string for setType, got number"
        );
      });
    });
  });
});
