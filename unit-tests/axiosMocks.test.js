const { assert } = require("chai");
const { axiosMain, axiosDot } = require("./axios.mocks");
const sinon = require("sinon");

let aDotReject, aDotResolve;

describe("axiosMocks", () => {
  describe("axiosMain", () => {
    it("should return a Promise that resolves when no err", () => {
      let aMain = axiosMain("test", false);
      return aMain("testing", "test").then((data) => {
        assert.deepEqual(
          data,
          { data: "test" },
          "should return data passed to axiosMain"
        );
      });
    });
    it("should resolve when no data is passed", () => {
      let aMain = axiosMain();
      return aMain().then((data) => {
        assert.deepEqual(
          data,
          { data: {} },
          "should return empty object for data"
        );
      });
    });
    it("should return a Promise that rejects when err is caught", () => {
      let aMain = axiosMain("test", { stderr: "Gotcha! Promise rejected!" });
      return aMain("testing", "test").catch((data) => {
        assert.deepEqual(
          data,
          { stderr: "Gotcha! Promise rejected!" },
          "should return error object passed to axiosMain"
        );
      });
    });
  });
  describe("axiosDot", () => {
    beforeEach(() => {
      aDotReject = axiosDot("test", { stderr: "Gotcha! Promise rejected!" });
      aDotResolve = axiosDot("test", false);
    });

    describe("get", () => {
      it("should return the correct data when err is false", () => {
        aDotResolve.get = sinon.spy(aDotResolve, "get");
        return aDotResolve
          .get("the url", "the options")
          .then((data) => {
            assert.deepEqual(
              data,
              { data: "test" },
              "should return data passed to axiosDot"
            );
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.get.calledOnceWith("the url", "the options"),
              "should have been called with correct params"
            );
          });
      });
      it("should resolve when no data is passed", () => {
        let datalessDot = axiosDot();
        datalessDot.get = sinon.spy(datalessDot, "get");
        return datalessDot
          .get("the url", "the options")
          .then((data) => {
            assert.deepEqual(
              data,
              { data: {} },
              "should return empty object for data"
            );
          })
          .finally(() => {
            assert.isTrue(
              datalessDot.get.calledOnceWith("the url", "the options"),
              "should have been called with correct params"
            );
          });
      });
      it("should be rejected when err is caught", () => {
        aDotReject.get = sinon.spy(aDotReject, "get");
        return aDotReject
          .get("the url", "the options")
          .catch((data) => {
            assert.deepEqual(
              data,
              { stderr: "Gotcha! Promise rejected!" },
              "should return error object passed to axiosDot"
            );
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.get.calledOnceWith("the url", "the options"),
              "should have been called with correct params"
            );
          });
      });
    });
    describe("post", () => {
      it("should return the correct data when err is false", () => {
        aDotResolve.post = sinon.spy(aDotResolve, "post");
        return aDotResolve
          .post("the url", "the body", "the options")
          .then((data) => {
            assert.deepEqual(data, "success", "should return `success`");
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.post.calledOnceWith(
                "the url",
                "the body",
                "the options"
              ),
              "should have been called with correct params"
            );
          });
      });
      it("should be rejected when err is caught", () => {
        aDotReject.post = sinon.spy(aDotReject, "post");
        return aDotReject
          .post("the url", "the body", "the options")
          .catch((data) => {
            assert.deepEqual(
              data,
              { stderr: "Gotcha! Promise rejected!" },
              "should return error object passed to axiosDot"
            );
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.post.calledOnceWith(
                "the url",
                "the body",
                "the options"
              ),
              "should have been called with correct params"
            );
          });
      });
    });
    describe("delete", () => {
      it("should return the correct data when err is false", () => {
        aDotResolve.delete = sinon.spy(aDotResolve, "delete");
        return aDotResolve
          .delete("the url", "the options")
          .then((data) => {
            assert.deepEqual(data, "success", "should return `success`");
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.delete.calledOnceWith("the url", "the options"),
              "should have been called with correct params"
            );
          });
      });
      it("should be rejected when err is caught", () => {
        aDotReject.delete = sinon.spy(aDotReject, "delete");
        return aDotReject
          .delete("the url", "the options")
          .catch((data) => {
            assert.deepEqual(
              data,
              { stderr: "Gotcha! Promise rejected!" },
              "should return error object passed to axiosDot"
            );
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.delete.calledOnceWith("the url", "the options"),
              "should have been called with correct params"
            );
          });
      });
    });
    describe("put", () => {
      it("should return the correct data when err is false", () => {
        aDotResolve.put = sinon.spy(aDotResolve, "put");
        return aDotResolve
          .put("the url", "the body", "the options")
          .then((data) => {
            assert.deepEqual(data, "success", "should return `success`");
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.put.calledOnceWith(
                "the url",
                "the body",
                "the options"
              ),
              "should have been called with correct params"
            );
          });
      });
      it("should be rejected when err is caught", () => {
        aDotReject.put = sinon.spy(aDotReject, "put");
        return aDotReject
          .put("the url", "the body", "the options")
          .catch((data) => {
            assert.deepEqual(
              data,
              { stderr: "Gotcha! Promise rejected!" },
              "should return error object passed to axiosDot"
            );
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.put.calledOnceWith(
                "the url",
                "the body",
                "the options"
              ),
              "should have been called with correct params"
            );
          });
      });
    });
  });
});
