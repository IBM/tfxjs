const { assert } = require("chai");
const cli = require("../lib/cli");

// stores the commandArgs that will be compared to later
let commandArgsStore;

/**
 * Mock tfx function to pass in args 
 * @param {*} exec - arbirtrary for this
 * @param {*} spawn - arbitrary
 * @param  {...any} commandArgs - args to pass in
 */
const mockTfx = function (exec, spawn, ...commandArgs) {
  this.tfxcli = function () {
    commandArgsStore = commandArgs;
  };
};

/**
 * Mock tfx function used to throw an error
 */
const mockTfxError = function () {
  this.tfxcli = function () {
    throw "this is an error";
  };
};

// stores the console log that will be compared to later
let logStore;
// object that mocks the console 
const mockConsole = {
  log: function (str) {
    logStore = str;
  },
};

describe("cli", () => {
  it("infrastructure test", () => {
    assert.equal(true, true);
  });
  it("should call cmd.tfxcli() with no args", () => {
    let expectedData = [];
    cli(mockTfx, "", "", mockConsole, ["nodepath", "filepath"]);
    let actualData = commandArgsStore;
    assert.deepEqual(actualData, expectedData, "should return expected data");
  });
  it("should call cmd.tfxcli() with more than 2 args", () => {
    let expectedData = ["argument1", "argument2"];
    cli(mockTfx, "", "", mockConsole, [
      "nodepath",
      "filepath",
      "argument1",
      "argument2",
    ]);
    let actualData = commandArgsStore;
    assert.deepEqual(actualData, expectedData, "should return expected data");
  });
  it("should run console log with thrown error text", () => {
    let expectedData = "\u001b[31mthis is an error\u001b[39m";
    cli(mockTfxError, "", "", mockConsole, ["nodepath", "filepath"]);
    let actualData = logStore;
    assert.deepEqual(actualData, expectedData, "should return expected data");
  });
});
