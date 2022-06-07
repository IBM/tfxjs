const { assert } = require("chai");
const { describe, it } = require("mocha");
const {axiosMain, axiosDot} = require("./axios.mocks");

const optionTracker = function () {
    this.set = (value) => {
        this.value = value;
    };
    this.lastCall = () => {
        return this.value;
    };
};

describe("axiosMocks", () => {
    describe("axiosMain", () => {
        it("should return a Promise that rejects when err is true", () => {
            let aMain = axiosMain(optionTracker, {test: "data"}, true);
            aMain('testing', 'test' ).then( (data) => {
                assert.deepEqual(data, {test: "data"});
            });
        });
        it("should return a Promise that resolves when err is false", () => {

        }); 
    });
    describe("axiosDot", () => {
        let aDotResolve = axiosDot(optionTracker, true)
        let aDotReject = axiosDot(optionTracker, false)
        describe("get", () => {
            it("should return the correct data when err is false", () => {
                aDotResolve.get('', '').then((data) => {
                    assert.deepEqual(data, {test: "data"});
                })
            });
            it("should be rejected when err is true")
        });
        describe("post", () => {
            it("should return the correct data when err is false");
            it("should be rejected when err is false");
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