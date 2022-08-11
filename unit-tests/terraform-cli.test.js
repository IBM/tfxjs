const { assert } = require("chai");
const cli = require("../lib/terraform-cli");
<<<<<<< HEAD

function mockExec(data) {
  this.data = data;
  this.commandList = [];
  this.promise = (command) => {
    this.commandList.push(command);
=======
const constants = require("../lib/constants");
const sinon = require("sinon");

function mockExec(data, spy) {
  this.data = data;
  this.spy = spy;
  this.promise = (command) => {
    this.spy(command);
>>>>>>> intern-tfxjs/master
    return new Promise((resolve, reject) => {
      if (this.data?.stderr) reject(this.data);
      else resolve(this.data);
    });
  };
}

<<<<<<< HEAD
let exec = new mockExec({}, false);
let tf = new cli("../directory", exec.promise);

describe("terraformCli", () => {
  beforeEach(() => {
    exec = new mockExec({}, false);
    tf = new cli("../directory", exec.promise);
  });
  describe("clone", () => {
=======
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
>>>>>>> intern-tfxjs/master
    it("should run with no overridePath", () => {
      return tf.clone("./.tmp-clone-template").then(() => {
        assert.deepEqual(
          tf.directory,
          "../directory",
          "it should return correct path"
        );
        assert.deepEqual(
<<<<<<< HEAD
          exec.commandList,
          [
            "mkdir ./.tmp-clone-template && rsync -av --progress ../directory ./.tmp-clone-template -q",
=======
          execSpy.args,
          [
            [
              "mkdir ./.tmp-clone-template && rsync -av --progress --exclude='*.tfstate' ../directory ./.tmp-clone-template -q",
            ],
>>>>>>> intern-tfxjs/master
          ],
          "should return correct commands"
        );
      });
    });
  });
  describe("purgeClone", () => {
<<<<<<< HEAD
=======
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
    });
>>>>>>> intern-tfxjs/master
    it("should run correct command if clone is done first", () => {
      return tf.clone("./.tmp-clone-template").then(() => {
        return tf.purgeClone().then(() => {
          assert.deepEqual(
<<<<<<< HEAD
            exec.commandList,
            [
              "mkdir ./.tmp-clone-template && rsync -av --progress ../directory ./.tmp-clone-template -q",
              "rm -rf ../directory",
=======
            execSpy.args,
            [
              [
                "mkdir ./.tmp-clone-template && rsync -av --progress --exclude='*.tfstate' ../directory ./.tmp-clone-template -q",
              ],
              ["rm -rf ../directory"],
>>>>>>> intern-tfxjs/master
            ],
            "should return correct commands"
          );
        });
      });
    });
  });
  describe("execPromise", () => {
<<<<<<< HEAD
    it("should return correct promise", () => {
      return tf.execPromise("command").then(() => {
        assert.deepEqual(
          exec.commandList,
          ["command"],
=======
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
>>>>>>> intern-tfxjs/master
          "it should run the correct command"
        );
      });
    });
  });
  describe("cdAndExec", () => {
<<<<<<< HEAD
    it("should return correct promise", () => {
      return tf.cdAndExec("command").then(() => {
        assert.deepEqual(
          exec.commandList,
          ["cd ../directory\ncommand"],
=======
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
>>>>>>> intern-tfxjs/master
          "it should run the correct command"
        );
      });
    });
  });
<<<<<<< HEAD
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
=======
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
>>>>>>> intern-tfxjs/master
      );
    });
  });
  describe("init", () => {
<<<<<<< HEAD
    it("should return correct promise with no vars", () => {
      return tf.init().then(() => {
        assert.deepEqual(
          exec.commandList,
          ["cd ../directory\nterraform init"],
=======
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
>>>>>>> intern-tfxjs/master
          "it should run the correct command"
        );
      });
    });
    it("should return correct promise with vars", () => {
<<<<<<< HEAD
=======
      tf.createTfVarFile = new sinon.spy();
>>>>>>> intern-tfxjs/master
      return tf
        .init({
          ibmcloud_api_key: "test",
          number: 12,
        })
        .then(() => {
<<<<<<< HEAD
          assert.deepEqual(
            exec.commandList,
            [
              "cd ../directory\nexport TF_VAR_ibmcloud_api_key=test\nexport TF_VAR_number=12\nterraform init",
            ],
=======
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
>>>>>>> intern-tfxjs/master
            "it should run the correct command"
          );
        });
    });
  });
  describe("plan", () => {
<<<<<<< HEAD
=======
    beforeEach(() => {
      execSpy = new sinon.spy();
      exec = new mockExec({}, execSpy);
      tf = new cli("../directory", exec.promise);
      tf.createTfVarFile = () => {};
    });
>>>>>>> intern-tfxjs/master
    it("should run the correct commands with no tfvars", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({}, () => {}, false)
        .then(() => {
          assert.deepEqual(
<<<<<<< HEAD
            exec.commandList,
            [
              "cd ../directory\nterraform init",
              "cd ../directory\nterraform plan -out=tfplan -input=false",
              "cd ../directory\nterraform show -json tfplan",
=======
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
>>>>>>> intern-tfxjs/master
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
<<<<<<< HEAD
            exec.commandList,
            [
              "cd ../directory\nterraform init",
              "cd ../directory\nterraform plan -out=tfplan -input=false",
              "cd ../directory\nterraform show -json tfplan",
              "cd ../directory\nrm -rf tfplan .terraform/ .terraform.lock.hcl",
=======
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
        .plan({test: "test"}, () => {}, {
          cleanup: true,
        })
        .then(() => {
          assert.deepEqual(
            execSpy.args,
            [
              ["cd ../directory\nterraform init"],
              ["cd ../directory\nterraform plan -out=tfplan -input=false --var-file=tfxjs.tfvars"],
              ["cd ../directory\nterraform show -json tfplan"],
              [
                "cd ../directory\nrm -rf tfplan .terraform/ .terraform.lock.hcl tfxjs.tfvars",
              ],
>>>>>>> intern-tfxjs/master
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands with no tfvars and no_output", () => {
<<<<<<< HEAD
=======
      beforeEach(() => {
        execSpy = new sinon.spy();
        exec = new mockExec({}, execSpy);
        tf = new cli("../directory", exec.promise);
      });
>>>>>>> intern-tfxjs/master
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };

      return tf
        .plan({}, () => {}, {
          no_output: true,
        })
        .then(() => {
          assert.deepEqual(
<<<<<<< HEAD
            exec.commandList,
            [
              "cd ../directory\nterraform init",
              "cd ../directory\nterraform plan",
=======
            execSpy.args,
            [
              ["cd ../directory\nterraform init"],
              ["cd ../directory\nterraform plan"],
>>>>>>> intern-tfxjs/master
            ],
            "it should run the correct command"
          );
        });
    });
    it("should run the correct commands when error", () => {
<<<<<<< HEAD
      exec.data = {
        stderr: "Error in main.tf",
      };

      return tf
        .plan({}, () => {}, false)
        .catch((err) => {
          assert.deepEqual(err.message, "Error in ../directory/main.tf");
=======
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
>>>>>>> intern-tfxjs/master
        });
    });
  });
  describe("print", () => {
<<<<<<< HEAD
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
=======
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
>>>>>>> intern-tfxjs/master
    it("should run the correct commands with no tfvars and no callback", () => {
      exec.data = {
        stdout: '{ "planned_values": "success" }',
      };
      return tf.apply({}).then(() => {
        assert.deepEqual(
<<<<<<< HEAD
          exec.commandList,
          [
            "cd ../directory\nterraform init",
            "cd ../directory\nterraform plan",
            'cd ../directory\necho "yes" | terraform apply',
            "cd ../directory\ncat terraform.tfstate",
=======
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
>>>>>>> intern-tfxjs/master
          ],
          "it should run the correct command"
        );
      });
    });
<<<<<<< HEAD
    it("should run the correct commands and get callback data", () => {
=======
    it("should run the correct commands and get callback data with", () => {
>>>>>>> intern-tfxjs/master
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
<<<<<<< HEAD
          exec.commandList,
          [
            "cd ../directory\nterraform init",
            "cd ../directory\nterraform plan",
            'cd ../directory\necho "yes" | terraform apply',
            "cd ../directory\ncat terraform.tfstate",
            'cd ../directory\necho "yes" | terraform destroy\nrm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup',
=======
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
      return tf.apply({test: "test"}, false, true).then(() => {
        assert.deepEqual(
          execSpy.args,
          [
            ["cd ../directory\nterraform init"],
            ["cd ../directory\nterraform plan --var-file=tfxjs.tfvars"],
            ['cd ../directory\necho "yes" | terraform apply --var-file=tfxjs.tfvars'],
            ["cd ../directory\ncat terraform.tfstate"],
            [
              'cd ../directory\necho "yes" | terraform destroy\nrm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup tfxjs.tfvars',
            ],
>>>>>>> intern-tfxjs/master
          ],
          "it should run the correct command"
        );
      });
    });
  });
});
