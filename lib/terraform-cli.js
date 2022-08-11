const { containsKeys } = require("./helpers");
<<<<<<< HEAD
const { eachKey, typeCheck } = require("./utils");

=======
const { typeCheck, contains, hclEncode } = require("./utils");
const chalk = require("chalk");
const { RegexButWithWords } = require("regex-but-with-words");
const fs = require("fs");
>>>>>>> intern-tfxjs/master
/**
 * Constructor for execution of
 * @param {string} directory Path to terraform template
 * @param {Promise} exec Function to use when running commands
 * @param {boolean} enableLogs Enable logging for spawned commands
 */
const terraformCli = function (directory, exec, enableLogs) {
  this.directory = directory;
  this.enableLogs = enableLogs;
<<<<<<< HEAD

=======
  this.fs = fs;
>>>>>>> intern-tfxjs/master
  /**
   * Clone directory into
   * @param {string} clonePath Path where clone directory will exist
   * @returns {Promise} Clone promise will return when complete
   */
  this.clone = function (clonePath) {
    return this.execPromise(
<<<<<<< HEAD
      `mkdir ${clonePath} && rsync -av --progress ${this.directory} ${clonePath} -q` // --exclude '*.tfvars' -q`
=======
      `mkdir ${clonePath} && rsync -av --progress --exclude='*.tfstate' ${this.directory} ${clonePath} -q`
>>>>>>> intern-tfxjs/master
    ).catch(this.tfErr);
  };

  /**
   * Remove the clone of a path
   * @returns Promise if CLI is clone
   */
  this.purgeClone = () => {
    return this.execPromise(`rm -rf ${this.directory}`)
      .then(() => {
<<<<<<< HEAD
        this.print(`Clone directory ${this.directory} purged,`);
=======
        this.print(chalk.cyan(`Clone directory ${this.directory} purged,`));
>>>>>>> intern-tfxjs/master
      })
      .catch(this.tfErr);
  };

  /**
   * Exec Promise function used to run unit tests
   * @param {string} command Bash command to run
   * @returns {Promise} Returns a promise to run the bash function in child processs
   */
  this.execPromise = function (command) {
    return exec(command);
  };

  /**
   * use bash `cd` then run command
   * @param {string} command Bash command to run
   * @returns {Promise} Returns a promise to run the bash function in child processs
   */
  this.cdAndExec = function (command) {
    return this.execPromise(`cd ${this.directory}\n${command}`);
  };

  /**
   * Create bash command to set tfvars
   * @param {Object} tfvars Object where every key is matched to a single terraform variable
   * @returns {string} List of export commands separated by newline
   */
<<<<<<< HEAD
  this.setTfVarString = function (tfvars) {
    typeCheck(
      "setTfVarString expected param of type",
      "object",
      tfvars
    )
    let exportCommands = ""; // init string
    // for each key in tfvars
    eachKey(tfvars, (varkey) => {
      exportCommands += `export TF_VAR_${varkey}=${tfvars[varkey]}\n`; // Export that key = value
    });
    return exportCommands; // return string
=======
  this.createTfVarFile = function (tfvars) {
    typeCheck("createTfVarFile expected param of type", "object", tfvars);
    this.fs.writeFileSync(this.directory + "/tfxjs.tfvars", hclEncode(tfvars));
>>>>>>> intern-tfxjs/master
  };

  /**
   * Initialize terraform
   * @param {Object?} tfvars Object where every key is matched to a single terraform variable
   * @returns {Promise} Promise to run command
   */
  this.init = function (tfvars) {
<<<<<<< HEAD
    return this.cdAndExec(
      `${tfvars ? this.setTfVarString(tfvars) : ""}` + // Set vars
        `terraform init` // Go into dir and initialize terraform
=======
    if (tfvars && Object.keys(tfvars).length > 0) {
      this.createTfVarFile(tfvars);
    }
    return this.cdAndExec(
      `terraform init` // Go into dir and initialize terraform
>>>>>>> intern-tfxjs/master
    );
  };

  /**
   *
   * @param {Object} tfvars Object where every key is matched to a single terraform variable
   * @param {Function} callback Callback function to execute when finished
   * @param {Object} options options object
   * @returns {Promise} Plan promise
   */
  this.plan = function (tfvars, callback, options) {
    let jsonData; // Storage for plan json
    return this.init(tfvars) // Initialize terraform with tfvars
      .then((data) => {
<<<<<<< HEAD
        this.print(data.stdout);
        let command = `terraform plan -out=tfplan -input=false`;
        if (options?.no_output) {
          // If no output remove out and input
          command = command.replace(/\s-.+/g, "");
        }
        return this.cdAndExec(
          this.setTfVarString(tfvars) + // initialize tfvars
            command // run command
=======
        if (
          contains(
            data.stdout,
            "The directory has no Terraform configuration files."
          )
        ) {
          throw {
            stderr:
              "Error: Terraform initialized in empty directory " +
              this.directory +
              "\n\nEnsure you are targeting the correct directory and try again",
          };
        }
        this.print(data.stdout);
        let command = `terraform plan -out=tfplan -input=false${
          // if tfvars are passed, set var file
          Object.keys(tfvars).length == 0 ? "" : " --var-file=tfxjs.tfvars"
        }`;
        if (options?.no_output) {
          // If no output remove out and input
          const inOutExp = new RegexButWithWords()
            .whitespace()
            .literal("-out=tfplan")
            .whitespace()
            .literal("-input=false")
            .done("gs");
          command = command.replace(inOutExp, "");
        }
        return this.cdAndExec(
          command // run command
>>>>>>> intern-tfxjs/master
        );
      })
      .then((data) => {
        this.print(data.stdout);
        if (options?.no_output) return;
        return this.cdAndExec(
          `terraform show -json tfplan` // get plan JSON
        );
      })
      .then((data) => {
        // Set jsonData if output
        if (!containsKeys(options, "no_output"))
          jsonData = JSON.parse(data.stdout).planned_values;
      })
      .then(() => {
        if (options?.cleanup)
          // if cleanup
          return this.cdAndExec(
<<<<<<< HEAD
            `rm -rf tfplan .terraform/ .terraform.lock.hcl` // Remove excess files
          );
      })
      .catch(this.tfErr)
      .finally(() => {
        // Run callback with data
        if (callback) callback(jsonData);
      });
=======
            `rm -rf tfplan .terraform/ .terraform.lock.hcl${
              Object.keys(tfvars).length == 0 ? "" : " tfxjs.tfvars"
            }` // Remove excess files
          );
      })
      .then(() => {
        if (callback) callback(jsonData);
      })
      .catch(this.tfErr);
>>>>>>> intern-tfxjs/master
  };

  /**
   * Run terraform apply
   * @param {Object} tfvars Object where every key is matched to a single terraform variable
   * @param {Function} callback Callback run when promise terminates, will get tfstate
   * @param {boolean} destroyAndCleanup Run destroy in workspace and delete files when done
   * @returns {Promise} Apply promise
   */
  this.apply = function (tfvars, callback, destroyAndCleanup) {
    let jsonData;
    return this.plan(tfvars, false, {
      no_output: true,
    })
      .then(() => {
        return this.cdAndExec(
<<<<<<< HEAD
          this.setTfVarString(tfvars) + // set tfvars
            `echo "yes" | terraform apply` // Apply plan
=======
          `echo "yes" | terraform apply${
            Object.keys(tfvars).length == 0 ? "" : " --var-file=tfxjs.tfvars"
          }` // Apply plan
>>>>>>> intern-tfxjs/master
        );
      })
      .then(() => {
        return this.cdAndExec("cat terraform.tfstate");
      })
      .then((data) => {
        jsonData = JSON.parse(data.stdout);
        if (destroyAndCleanup) {
          return this.cdAndExec(
<<<<<<< HEAD
            this.setTfVarString(tfvars) + // set tfvars
              `echo "yes" | terraform destroy\n` + // Destroy
              `rm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup` // Remove excess files
          );
        }
      })
      .catch(this.tfErr)
      .finally(() => {
        if (callback) callback(jsonData);
      });
=======
            `echo "yes" | terraform destroy\n` + // Destroy
              `rm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup${
                Object.keys(tfvars).length == 0 ? "" : " tfxjs.tfvars"
              }` // Remove excess files
          );
        }
      })
      .then(() => {
        if (callback) callback(jsonData);
      })
      .catch(this.tfErr);
>>>>>>> intern-tfxjs/master
  };

  this.log = console.log;
  /**
   * Optionally print texts
   * @param {string} text Arbitrary string
   */
  this.print = (text) => {
    if (this.enableLogs) {
      this.log(text);
    }
  };

  /**
   * TF error catch function
   * @param {string} err Error string
   */
  this.tfErr = (err) => {
<<<<<<< HEAD
    throw new Error(
      `${err.stderr.replace(/\s(?=\S+\.tf)/g, ` ${this.directory}/`)}`
    );
=======
    const fileNameRegExp = new RegexButWithWords()
      .whitespace()
      .look.ahead((exp) => {
        exp.notWhitespace().oneOrMore().literal(".tf");
      })
      .done("g");
    let errorText = `${err.stderr.replace(
      fileNameRegExp,
      ` ${this.directory}/`
    )}\n`;
    this.print(chalk.red(errorText));
    throw errorText;
>>>>>>> intern-tfxjs/master
  };
};

module.exports = terraformCli;
