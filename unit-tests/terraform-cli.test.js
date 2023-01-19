const { assert } = require("chai");
const cli = require("../lib/terraform-cli");
const sinon = require("sinon");

function mockExec(data, spy) {
  this.data = data;
  this.spy = spy;
  this.promise = (command) => {
    this.spy(command);
    return new Promise((resolve, reject) => {
      if (this.data?.stderr) reject(this.data);
      else resolve(this.data);
    });
  };
}

let execSpy = new sinon.spy();
let exec = new mockExec({}, execSpy);
let tf = new cli("../directory", exec.promise);

describe("terraformCli", () => {
  describe("clone", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
    it("should run with no overridePath", () => {
      return tf.clone("./.tmp-clone-template").then(() => {
        assert.deepEqual(
          tf.directory,
          "../directory",
          "it should return correct path"
        );
        assert.deepEqual(
          execSpy.args,
          [
            [
              "mkdir ./.tmp-clone-template && rsync -av --progress --exclude='*.tfstate' ../directory ./.tmp-clone-template -q",
            ],
          ],
          "should return correct commands"
        );
      });
    });
  });
  describe("purgeClone", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
    it("should run correct command if clone is done first", () => {
      return tf.clone("./.tmp-clone-template").then(() => {
        return tf.purgeClone().then(() => {
          assert.deepEqual(
            execSpy.args,
            [
              [
                "mkdir ./.tmp-clone-template && rsync -av --progress --exclude='*.tfstate' ../directory ./.tmp-clone-template -q",
              ],
              ["rm -rf ../directory"],
            ],
            "should return correct commands"
          );
        });
      });
    });
  });
  describe("execPromise", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
    it("should return correct promise", () => {
      return tf.execPromise("command").then(() => {
        assert.deepEqual(
          execSpy.args,
          [["command"]],
          "it should run the correct command"
        );
      });
    });
  });
  describe("cdAndExec", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
    it("should return correct promise", () => {
      return tf.cdAndExec("command").then(() => {
        assert.deepEqual(
          execSpy.args,
          [["cd ../directory\ncommand"]],
          "it should run the correct command"
        );
      });
    });
  });
  describe("createTfVarFile", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
    it("should return the correct output for an object", () => {
      tf.fs = {
        writeFileSync: new sinon.spy(),
      };
      tf.createTfVarFile({
        ibmcloud_api_key: "test",
        number: 12,
      });
      assert.isTrue(
        tf.fs.writeFileSync.calledOnceWith(
          "../directory/tfxjs.tfvars",
          `ibmcloud_api_key = "test"\nnumber           = 12`
        ),
        "it should call fs with correct data"
      );
    });
  });
  describe("init", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
    it("should return correct promise with no vars", () => {
      return tf.init().then(() => {
        assert.deepEqual(
          execSpy.args,
          [["cd ../directory\nterraform init"]],
          "it should run the correct command"
        );
      });
    });
    it("should return correct promise with vars", () => {
      tf.createTfVarFile = new sinon.spy();
      return tf
        .init({
          ibmcloud_api_key: "test",
          number: 12,
        })
        .then(() => {
          assert.isTrue(
            tf.createTfVarFile.calledOnceWith({
              ibmcloud_api_key: "test",
              number: 12,
            }),
            "it should call createTfVarFile"
          );
          assert.deepEqual(
            execSpy.args,
            [["cd ../directory\nterraform init"]],
            "it should run the correct command"
          );
        });
    });
  });
  describe("plan", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
      tf.createTfVarFile = () => {};
    });
    it("should run the correct commands with no tfvars", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({}, () => {}, false)
        .then(() => {
          assert.deepEqual(
            execSpy.args,
            [
              ["cd ../directory\nterraform init"],
              ["cd ../directory\nterraform plan -out=tfplan -input=false"],
              ["cd ../directory\nterraform show -json tfplan"],
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands with tfvars", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({ test: "test" }, () => {}, false)
        .then(() => {
          assert.deepEqual(
            execSpy.args,
            [
              ["cd ../directory\nterraform init"],
              [
                "cd ../directory\nterraform plan -out=tfplan -input=false --var-file=tfxjs.tfvars",
              ],
              ["cd ../directory\nterraform show -json tfplan"],
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
            execSpy.args,
            [
              ["cd ../directory\nterraform init"],
              ["cd ../directory\nterraform plan -out=tfplan -input=false"],
              ["cd ../directory\nterraform show -json tfplan"],
              [
                "cd ../directory\nrm -rf tfplan .terraform/ .terraform.lock.hcl",
              ],
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands with tfvars and cleanup", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({ test: "test" }, () => {}, {
          cleanup: true,
        })
        .then(() => {
          assert.deepEqual(
            execSpy.args,
            [
              ["cd ../directory\nterraform init"],
              [
                "cd ../directory\nterraform plan -out=tfplan -input=false --var-file=tfxjs.tfvars",
              ],
              ["cd ../directory\nterraform show -json tfplan"],
              [
                "cd ../directory\nrm -rf tfplan .terraform/ .terraform.lock.hcl tfxjs.tfvars",
              ],
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands with no tfvars and no_output", () => {
      beforeEach(() => {
        execSpy = new sinon.spy();
        exec = new mockExec({}, execSpy);
        tf = new cli("../directory", exec.promise);
      });
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({}, () => {}, {
          no_output: true,
        })
        .then(() => {
          assert.deepEqual(
            execSpy.args,
            [
              ["cd ../directory\nterraform init"],
              ["cd ../directory\nterraform plan"],
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands when error", () => {
      beforeEach(() => {
        execSpy = new sinon.spy();
        exec = new mockExec({}, execSpy);
        tf = new cli("../directory", exec.promise);
      });
      exec.data = {
        stderr: "Error in main.tf",
      };
      return tf
        .plan({}, () => {}, false)
        .catch((err) => {
          assert.deepEqual(
            err,
            `Error in ../directory/main.tf\n`,
            "should throw expected error"
          );
        });
    });
    it("should throw an error when terraform init is called in an empty directory", () => {
      beforeEach(() => {
        execSpy = new sinon.spy();
        exec = new mockExec({}, execSpy);
        tf = new cli("../directory", exec.promise);
      });
      exec.data = {
        stdout: "The directory has no Terraform configuration files.",
      };
      return tf
        .plan(
          {},
          () => {
            throw { stderr: "This should not execute" };
          },
          false
        )
        .catch((err) => {
          assert.deepEqual(
            err,
            `Error: Terraform initialized in empty directory ../directory\n\nEnsure you are targeting the correct directory and try again\n`,
            "should throw expected error"
          );
        });
    });
  });
  describe("print", () => {
    let tfLogsSpy;
    beforeEach(() => {
      tfLogsSpy = new sinon.spy();
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
    it("should run log if enableLogs passed", () => {
      let tfWithLogs = new cli("../", exec.promise, true);
      tfWithLogs.log = tfLogsSpy;
      tfWithLogs.print("frog");
      assert.isTrue(
        tfLogsSpy.calledOnceWith("frog"),
        "should have been called with expected args"
      );
    });
    it("should not run log if enableLogs is false", () => {
      let tfWithLogs = new cli("../", exec.promise, false);
      tfWithLogs.log = tfLogsSpy;
      tfWithLogs.print("frog");
      assert.isFalse(tfLogsSpy.calledOnce, "should not have been called");
    });
  });
  describe("apply", () => {
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
      tf.createTfVarFile = () => {};
    });
    it("should run the correct commands with no tfvars and no callback", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({}).then(() => {
        assert.deepEqual(
          execSpy.args,
          [
            ["cd ../directory\nterraform init"],
            ["cd ../directory\nterraform plan"],
            ['cd ../directory\necho "yes" | terraform apply'],
            ["cd ../directory\ncat terraform.tfstate"],
          ],
          "it should run the correct command"
        );
      });
    });
    it("should run the correct commands with tfvars and no callback", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({ test: "test" }).then(() => {
        assert.deepEqual(
          execSpy.args,
          [
            ["cd ../directory\nterraform init"],
            ["cd ../directory\nterraform plan --var-file=tfxjs.tfvars"],
            [
              'cd ../directory\necho "yes" | terraform apply --var-file=tfxjs.tfvars',
            ],
            ["cd ../directory\ncat terraform.tfstate"],
          ],
          "it should run the correct command"
        );
      });
    });
    it("should run the correct commands and get callback data with", () => {
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
    it("should run the correct commands with no tfvars and no callback targeting a tfstate file to run tests", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({}, false, false, "../terraform.tfstate").then(() => {
        assert.deepEqual(
          execSpy.args,
          [["cd ../directory\ncat ../terraform.tfstate"]],
          "it should run the correct command"
        );
      });
    });
    it("should run the correct commands with no tfvars and callback targeting a tfstate file to run tests", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({}, false, false, "../terraform.tfstate", (data) => {
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
          execSpy.args,
          [
            ["cd ../directory\nterraform init"],
            ["cd ../directory\nterraform plan"],
            ['cd ../directory\necho "yes" | terraform apply'],
            ["cd ../directory\ncat terraform.tfstate"],
            [
              'cd ../directory\necho "yes" | terraform destroy\nrm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup',
            ],
          ],
          "it should run the correct command"
        );
      });
    });
    it("should run the correct commands with tfvars and no callback and destroy", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({ test: "test" }, false, true).then(() => {
        assert.deepEqual(
          execSpy.args,
          [
            ["cd ../directory\nterraform init"],
            ["cd ../directory\nterraform plan --var-file=tfxjs.tfvars"],
            [
              'cd ../directory\necho "yes" | terraform apply --var-file=tfxjs.tfvars',
            ],
            ["cd ../directory\ncat terraform.tfstate"],
            [
              'cd ../directory\necho "yes" | terraform destroy\nrm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup tfxjs.tfvars',
            ],
          ],
          "it should run the correct command"
        );
      });
    });
  });
});
