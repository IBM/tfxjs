const { assert } = require("chai");
const { describe, it } = require("mocha");
const {axiosDot} = require("./axios.mocks")

const axios = axiosDot("test", false)
const errAxios = axiosDot("test", false)

describe("httpCallback", () => {

    // let getSuccess = new httpCallBuild(axiosDot(new optionTracker, "test", false)).get;
    // let getFail = new httpCallBuild(axiosDot(new optionTracker, "test", {stderr: "Gotcha! Promise rejected!"})).get;

    // it("should fail when the get request is rejected", () => {
    //     return getFail('', '').catch((data) => {
    //         assert.deepEqual(data, {stderr: "Gotcha! Promise rejected!"});
    //     })
    // });
    // it("should succeed when the get request is resolved");

});