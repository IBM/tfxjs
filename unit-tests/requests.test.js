const { assert } = require("chai");
const { axiosMain } = require("./axios.mocks");
const sinon = require("sinon");
const outsideRequests = require("../lib/requests");

const mockAxios = axiosMain("test", false);
const mockErrAxios = axiosMain("test", { stderr: "Gotcha! Promise rejected!" });

let assertionSpy;

describe("httpCallback", () => {
  beforeEach(() => {
    assertionSpy = new sinon.spy();
  });
  it("should run assertion on data returned from axios", () => {
    let httpCall = new outsideRequests(mockAxios);
    return httpCall.axiosGet({}, assertionSpy).then(() => {
      assert.isTrue(
        assertionSpy.calledOnceWith({ data: "test" }),
        "should have been called with data passed to axiosMain"
      );
    });
  });
  it("should run assertion on err returned from axios", () => {
    let errHttpCall = new outsideRequests(mockErrAxios);
    return errHttpCall.axiosGet({}, assertionSpy).then(() => {
      assert.isTrue(
        assertionSpy.calledOnceWith({ stderr: "Gotcha! Promise rejected!" }),
        "should have been called with error object passed to axiosMain"
      );
    });
  });
});
