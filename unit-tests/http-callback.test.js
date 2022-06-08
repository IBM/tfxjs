const { assert } = require("chai");
const { axiosDot } = require("./axios.mocks");
const sinon = require("sinon");
const httpCallBuild = require("../lib/http-callback");

const axios = axiosDot("test", false);
const errAxios = axiosDot("test", { stderr: "Gotcha! Promise rejected!" });

let httpCall, errHttpCall;

describe("httpCallback", () => {
  beforeEach(() => {
    httpCall = new httpCallBuild(axios);
    errHttpCall = new httpCallBuild(errAxios);

    httpCall.get = sinon.spy(httpCall, "get");
    errHttpCall.get = sinon.spy(errHttpCall, "get");
  });

  // let getSuccess = new httpCallBuild(axiosDot(new optionTracker, "test", false)).get;
  // let getFail = new httpCallBuild(axiosDot(new optionTracker, "test", {stderr: "Gotcha! Promise rejected!"})).get;

  it("should fail when the get request is rejected", () => {
    return errHttpCall
      .get("the url", "the options")
      .catch((data) => {
        assert.deepEqual(data, { stderr: "Gotcha! Promise rejected!" });
      })
      .finally(() => {
        assert.isTrue(errHttpCall.get.calledOnceWith("the url", "the options"));
      });
  });
  it("should succeed when the get request is resolved", () => {
    return httpCall
      .get("the url", "the options")
      .then((data) => {
        assert.deepEqual(data, { data: "test" });
      })
      .finally(() => {
        assert.isTrue(httpCall.get.calledOnceWith("the url", "the options"));
      });
  });
});
