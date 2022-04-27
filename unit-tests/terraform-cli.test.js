const { assert } = require("chai");
const cli = require("../lib/terraform-cli");

function mockExec(data) {
  this.data = data;
  this.commandList = [];
  this.promise = (command) => {
    this.commandList.push(command);
    return new Promise((resolve, reject) => {
      if (this.data?.stderr) reject(this.data);
      else resolve(this.data);
    });
  };
}

let exec = new mockExec({}, false);
let tf = new cli("../directory", exec.promise);

describe("terraformCli", () => {
  beforeEach(() => {
    exec = new mockExec({}, false);
    tf = new cli("../directory", exec.promise);
  });
  describe("clone", () => {
    it("should run with no overridePath", () => {
      return tf.clone("./.tmp-clone-template").then(() => {
        assert.deepEqual(
          tf.directory,
          "../directory",
          "it should return correct path"
        );
        assert.deepEqual(
          exec.commandList,
          [
            "mkdir ./.tmp-clone-template && cp -r ../directory ./.tmp-clone-template",
          ],
          "should return correct commands"
        );
      });
    });
  });
  describe("purgeClone", () => {
    it("should run correct command if clone is done first", () => {
      return tf.clone("./.tmp-clone-template").then(() => {
        return tf.purgeClone().then(() => {
          assert.deepEqual(
            exec.commandList,
            [
              "mkdir ./.tmp-clone-template && cp -r ../directory ./.tmp-clone-template",
              "rm -rf ../directory",
            ],
            "should return correct commands"
          );
        });
      });
    });
  });
  describe("execPromise", () => {
    it("should return correct promise", () => {
      return tf.execPromise("command").then(() => {
        assert.deepEqual(
          exec.commandList,
          ["command"],
          "it should run the correct command"
        );
      });
    });
  });
  describe("cdAndExec", () => {
    it("should return correct promise", () => {
      return tf.cdAndExec("command").then(() => {
        assert.deepEqual(
          exec.commandList,
          ["cd ../directory\ncommand"],
          "it should run the correct command"
        );
      });
    });
  });
  describe("setTfVarString", () => {
    it("should return the correct output for an object", () => {
      let actualData = tf.setTfVarString({
        ibmcloud_api_key: "test",
        number: 12,
      });
      let expectedData =
        "export TF_VAR_ibmcloud_api_key=test\nexport TF_VAR_number=12\n";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct stements"
      );
    });
    it("should throw error if array passed", () => {
      let task = () => tf.setTfVarString([]);
      assert.throws(
        task,
        "setTfVarString expected param of type object got Array"
      );
    });
    it("should throw error if non object passed", () => {
      let task = () => tf.setTfVarString("hi");
      assert.throws(
        task,
        "setTfVarString expected param of type object got string"
      );
    });
  });
  describe("init", () => {
    it("should return correct promise with no vars", () => {
      return tf.init().then(() => {
        assert.deepEqual(
          exec.commandList,
          ["cd ../directory\nterraform init"],
          "it should run the correct command"
        );
      });
    });
    it("should return correct promise with vars", () => {
      return tf
        .init({
          ibmcloud_api_key: "test",
          number: 12,
        })
        .then(() => {
          assert.deepEqual(
            exec.commandList,
            [
              "cd ../directory\nexport TF_VAR_ibmcloud_api_key=test\nexport TF_VAR_number=12\nterraform init",
            ],
            "it should run the correct command"
          );
        });
    });
  });
  describe("plan", () => {
    it("should run the correct commands with no tfvars", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({}, () => {}, false)
        .then(() => {
          assert.deepEqual(
            exec.commandList,
            [
              "cd ../directory\nterraform init",
              "cd ../directory\nterraform plan -out=tfplan -input=false",
              "cd ../directory\nterraform show -json tfplan",
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands with no tfvars and cleanup", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({}, () => {}, {
          cleanup: true,
        })
        .then(() => {
          assert.deepEqual(
            exec.commandList,
            [
              "cd ../directory\nterraform init",
              "cd ../directory\nterraform plan -out=tfplan -input=false",
              "cd ../directory\nterraform show -json tfplan",
              "cd ../directory\nrm -rf tfplan .terraform/ .terraform.lock.hcl",
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands with no tfvars and no_output", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({}, () => {}, {
          no_output: true,
        })
        .then(() => {
          assert.deepEqual(
            exec.commandList,
            [
              "cd ../directory\nterraform init",
              "cd ../directory\nterraform plan",
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands when error", () => {
      exec.data = {
        stderr: "Error in main.tf",
      };

      return tf
        .plan({}, () => {}, false)
        .catch((err) => {
          assert.deepEqual(err.message, "Error in ../directory/main.tf");
        });
    });
  });
  describe("print", () => {
    it("should run log if enableLogs passed", () => {
      let tfWithLogs = new cli("../", exec.promise, true);
      let actualData;
      tfWithLogs.log = (data) => {
        actualData = data;
      };
      tfWithLogs.print("frog");
      assert.deepEqual(actualData, "frog", "it should return exact data");
    });
  });
  describe("apply", () => {
    it("should run the correct commands with no tfvars and no callback", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({}).then(() => {
        assert.deepEqual(
          exec.commandList,
          [
            "cd ../directory\nterraform init",
            "cd ../directory\nterraform plan",
            'cd ../directory\necho "yes" | terraform apply',
            "cd ../directory\ncat terraform.tfstate",
          ],
          "it should run the correct command"
        );
      });
    });
    it("should run the correct commands and get callback data", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({}, (data) => {
        assert.deepEqual(
          data,
          { planned_values: "success" },
          "it should return correct data"
        );
      });
    });
    it("should run the correct commands with no tfvars and no callback and destroy", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({}, false, true).then(() => {
        assert.deepEqual(
          exec.commandList,
          [
            "cd ../directory\nterraform init",
            "cd ../directory\nterraform plan",
            'cd ../directory\necho "yes" | terraform apply',
            "cd ../directory\ncat terraform.tfstate",
            'cd ../directory\necho "yes" | terraform destroy\nrm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup',
          ],
          "it should run the correct command"
        );
      });
    });
  });
});
