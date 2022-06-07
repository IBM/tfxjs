const { assert } = require("chai");
const { describe, it } = require("mocha");
const {axiosMain, axiosDot} = require("./axios.mocks");

const optionTracker = function () {
    this.set = function (value) {
        this.value = value;
    };
    this.lastCall = () => {
        return this.value;
    };
};

describe("axiosMocks", () => {
    describe("axiosMain", () => {
        it("should return a Promise that resolves when no err", () => {
            let aMain = axiosMain(new optionTracker, "test", false);
            return aMain('testing', 'test').then( (data) => {
                assert.deepEqual(data, {data: "test"});
            });
        });
        it("should return a Promise that rejects when err is caught", () => {
            let aMain = axiosMain(new optionTracker, "test" , {stderr: "Gotcha! Promise rejected!"});
            return aMain('testing', 'test').catch((data) => {
                assert.deepEqual(data, {stderr: "Gotcha! Promise rejected!"}, "should return");
            })
        }); 
    });
    describe("axiosDot", () => {
        let aDotReject = axiosDot(new optionTracker, "test", {stderr: "Gotcha! Promise rejected!"});
        let aDotResolve = axiosDot(new optionTracker, "test", false);
        describe("get", () => {
            it("should return the correct data when err is false", () => {
                return aDotResolve.get('', '').then((data) => {
                    assert.deepEqual(data, {data: "test"});
                })
            });
            it("should be rejected when err is caught", () => {
                return aDotReject.get('', '').catch((data) => {
                    assert.deepEqual(data, {stderr: "Gotcha! Promise rejected!"});
                })
            });
        });
        describe("post", () => {
            it("should return the correct data when err is false", () => {
                return aDotResolve.post('', '', '').then((data) => {
                    assert.deepEqual(data, "success");
                })
            });
            it("should be rejected when err is false", () => {
                return aDotReject.post('', '', '').catch((data) => {
                    assert.deepEqual(data, {stderr: "Gotcha! Promise rejected!"});
                })
            });
        });
        describe("delete", () => {
            it("should return the correct data when err is false");
            it("should be rejected when err is false");
        });
        describe("put", () => {
            it("should return the correct data when err is false");
            it("should be rejected when err is false");
        });
    });
});