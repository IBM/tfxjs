const { assert } = require("chai");
const { describe, it } = require("mocha");
const {axiosDot} = require("./axios.mocks")

const optionTracker = function () {
    this.set = function (value) {
        this.value = value;
    };
    this.lastCall = () => {
        return this.value;
    };
};

describe("httpCallback", () => {

    let buildSuccess = httpCallBuild(axiosDot(new optionTracker, "test", false));
    let buildFail = httpCallBuild(axiosDot(new optionTracker, "test", {stderr: "Gotcha! Promise rejected!"}));

    it("should fail when the get request is rejected");
    it("should succeed when the get request is resolved");

});