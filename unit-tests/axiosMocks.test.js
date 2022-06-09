const { assert } = require("chai");
const { axiosMain, axiosDot } = require("./axios.mocks");
const sinon = require("sinon");
const { it } = require("mocha");

let aDotReject, aDotResolve;

describe("axiosMocks", () => {
  describe("axiosMain", () => {
    it("should return a Promise that resolves when no err", () => {
      let aMain = axiosMain("test", false);
      return aMain("testing", "test").then((data) => {
        assert.deepEqual(data, { data: "test" });
      });
    });
    it("should resolve when no data is passed", () => {
      let aMain = axiosMain();
      return aMain().then((data) => {
        assert.deepEqual(data, { data: {} });
      });
    });
    it("should return a Promise that rejects when err is caught", () => {
      let aMain = axiosMain("test", { stderr: "Gotcha! Promise rejected!" });
      return aMain("testing", "test").catch((data) => {
        assert.deepEqual(
          data,
          { stderr: "Gotcha! Promise rejected!" },
          "should return"
        );
      });
    });
  });
  describe("axiosDot", () => {
    beforeEach(() => {
      aDotReject = axiosDot("test", { stderr: "Gotcha! Promise rejected!" });
      aDotResolve = axiosDot("test", false);

      aDotReject.get = sinon.spy(aDotReject, "get");
      aDotResolve.get = sinon.spy(aDotResolve, "get");

      aDotReject.post = sinon.spy(aDotReject, "post");
      aDotResolve.post = sinon.spy(aDotResolve, "post");

      aDotReject.delete = sinon.spy(aDotReject, "delete");
      aDotResolve.delete = sinon.spy(aDotResolve, "delete");

      aDotReject.put = sinon.spy(aDotReject, "put");
      aDotResolve.put = sinon.spy(aDotResolve, "put");
    });

    describe("get", () => {
      it("should return the correct data when err is false", () => {
        return aDotResolve
          .get("the url", "the options")
          .then((data) => {
            assert.deepEqual(data, { data: "test" });
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.get.calledOnceWith("the url", "the options")
            );
          });
      });
      it("should resolve when no data is passed", () => {
        let datalessDot = axiosDot();
        datalessDot.get = sinon.spy(datalessDot, "get");
        return datalessDot
          .get("the url", "the options")
          .then((data) => {
            assert.deepEqual(data, { data: {} });
          })
          .finally(() => {
            assert.isTrue(
              datalessDot.get.calledOnceWith("the url", "the options")
            );
          });
      });
      it("should be rejected when err is caught", () => {
        return aDotReject
          .get("the url", "the options")
          .catch((data) => {
            assert.deepEqual(data, { stderr: "Gotcha! Promise rejected!" });
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.get.calledOnceWith("the url", "the options")
            );
          });
      });
    });
    describe("post", () => {
      it("should return the correct data when err is false", () => {
        return aDotResolve
          .post("the url", "the body", "the options")
          .then((data) => {
            assert.deepEqual(data, "success");
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.post.calledOnceWith(
                "the url",
                "the body",
                "the options"
              )
            );
          });
      });
      it("should be rejected when err is caught", () => {
        return aDotReject
          .post("the url", "the body", "the options")
          .catch((data) => {
            assert.deepEqual(data, { stderr: "Gotcha! Promise rejected!" });
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.post.calledOnceWith(
                "the url",
                "the body",
                "the options"
              )
            );
          });
      });
    });
    describe("delete", () => {
      it("should return the correct data when err is false", () => {
        return aDotResolve
          .delete("the url", "the options")
          .then((data) => {
            assert.deepEqual(data, "success");
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.delete.calledOnceWith("the url", "the options")
            );
          });
      });
      it("should be rejected when err is caught", () => {
        return aDotReject
          .delete("the url", "the options")
          .catch((data) => {
            assert.deepEqual(data, { stderr: "Gotcha! Promise rejected!" });
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.delete.calledOnceWith("the url", "the options")
            );
          });
      });
    });
    describe("put", () => {
      it("should return the correct data when err is false", () => {
        return aDotResolve
          .put("the url", "the body", "the options")
          .then((data) => {
            assert.deepEqual(data, "success");
          })
          .finally(() => {
            assert.isTrue(
              aDotResolve.put.calledOnceWith(
                "the url",
                "the body",
                "the options"
              )
            );
          });
      });
      it("should be rejected when err is caught", () => {
        return aDotReject
          .put("the url", "the body", "the options")
          .catch((data) => {
            assert.deepEqual(data, { stderr: "Gotcha! Promise rejected!" });
          })
          .finally(() => {
            assert.isTrue(
              aDotReject.put.calledOnceWith(
                "the url",
                "the body",
                "the options"
              )
            );
          });
      });
    });
  });
});
