const { assert } = require("chai");
const cli = require("../lib/terraform-cli");
const jsutil = require("util"); // Utils to run child process
const fs = require("fs");
const jsExec = jsutil.promisify(require("child_process").exec); // Exec from child process
let tf;
let tfLogs = [];

describe("example-test terraformCli", () => {
  beforeEach(() => {
    tfLogs = [];
    tf = new cli("../example-tests", jsExec, true);
    tf.log = (log) => {
      tfLogs.push(log);
    };
  });
  describe("plan", () => {
    it("should get plan data", () => {
      return tf.plan(
        {
          trigger_value: "this-is-the-plan-test",
          shuffle_count: 2,
        },
        (data) => {
          fs.writeFileSync("./data-files/plan-logs.txt", tfLogs[1]);
          assert.deepEqual(
            tfLogs[1],
            fs.readFileSync("./data-files/plan-logs.txt", "utf8"),
            "it should product correct logs"
          );
          assert.deepEqual(
            data,
            require("./data-files/plan.json"),
            "should return correct data"
          );
        },
        { cleanup: true }
      );
    });
    it("should correctly cleanup data", () => {
      return tf.cdAndExec("ls").then((data) => {
        let fileList = [
          "README.md",
          "example-module",
          "local-files",
          "main.tf",
          "test-output.sh",
          "tests",
          "tfxjs.tfvars",
          "variables.tf",
          "versions.tf",
          "",
        ];
        assert.deepEqual(
          data.stdout.split("\n"),
          fileList,
          "it should return correct data"
        );
      });
    });
  });
  describe("apply", () => {
    it("should get the state after apply", () => {
      return tf.apply(
        {
          trigger_value: "this-is-the-apply",
          shuffle_count: 5,
        },
        (data) => {
          let template = require("./data-files/tfstate.json");
          assert.deepEqual(
            data.resources.length,
            template.resources.length,
            "should have number of resources in state"
          );
        },
        true
      );
    });
    it("should correctly cleanup data", () => {
      return tf.cdAndExec("ls").then((data) => {
        let fileList = [
          "README.md",
          "example-module",
          "local-files",
          "main.tf",
          "test-output.sh",
          "tests",
          "tfxjs.tfvars",
          "variables.tf",
          "versions.tf",
          "",
        ];
        assert.deepEqual(
          data.stdout.split("\n"),
          fileList,
          "it should return correct data"
        );
      });
    });
  });
  describe("clone", () => {
    it("should create a clone directory", () => {
      let cloneLs;
      return tf
        .clone("./clone")
        .then(() => {
          return tf.execPromise("ls ./clone/example-tests");
        })
        .then((lsData) => {
          cloneLs = lsData;
        })
        .then(() => {
          return tf.execPromise("ls ../example-tests");
        })
        .then((expectedData) => {
          assert.deepEqual(cloneLs, expectedData);
        });
    });
    it("should correctly purge the directory", () => {
      tf.directory = "./clone";
      return tf
        .purgeClone()
        .then(() => {
          return tf.execPromise("ls ./clone");
        })
        .catch((err) => {
          assert.deepEqual(
            err.stderr,
            "ls: ./clone: No such file or directory\n",
            "it should have correct error"
          );
        });
    });
  });
});
