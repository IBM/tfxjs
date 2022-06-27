const { assert } = require("chai");
const cli = require("../lib/cli");
const sinon = require("sinon");
const constants = require("../lib/constants");
/**
 * Constructor that returns mock tfx constructor
 * @param {sinon.spy} spy Sinon Spy
 */
const spyMockTfx = function (spy) {
  this.mockTfx = function (exec, spawn, ...commandArgs) {
    this.tfxcli = () => {
      spy(commandArgs);
    };
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

// object that mocks the console
const mockConsole = {
  log: new sinon.spy(),
};

describe("cli", () => {
  it("should call cmd.tfxcli() with no args", () => {
    let noArgSpy = sinon.spy();
    let spyMock = new spyMockTfx(noArgSpy);
    cli(spyMock.mockTfx, "", "", mockConsole, ["nodepath", "filepath"]);
    assert.isTrue(
      noArgSpy.calledOnceWith([]),
      "should have been called with no args"
    );
  });
  it("should call cmd.tfxcli() with more than 2 args", () => {
    let argSpy = sinon.spy();
    let spyMock = new spyMockTfx(argSpy);
    cli(spyMock.mockTfx, "", "", mockConsole, [
      "nodepath",
      "filepath",
      "argument1",
      "argument2",
    ]);
    assert(
      argSpy.calledOnceWith(["argument1", "argument2"]),
      "should have been called with expected args"
    );
  });
  it("should run console log with thrown error text", () => {
    cli(mockTfxError, "", "", mockConsole, ["nodepath", "filepath"]);
    assert(
      mockConsole.log.calledOnceWith(
        `${constants.ansiRed}this is an error${constants.ansiDefaultForeground}`
      ),
      "should have been called with expected args"
    );
  });
});
