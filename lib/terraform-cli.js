const { containsKeys } = require("./helpers");
const { typeCheck, contains, hclEncode } = require("./utils");
const chalk = require("chalk");
const { RegexButWithWords } = require("regex-but-with-words");
const fs = require("fs");
/**
 * Constructor for execution of
 * @param {string} directory Path to terraform template
 * @param {Promise} exec Function to use when running commands
 * @param {boolean} enableLogs Enable logging for spawned commands
 */
const terraformCli = function (directory, exec, enableLogs) {
  this.directory = directory;
  this.enableLogs = enableLogs;
  this.fs = fs;
  /**
   * Clone directory into
   * @param {string} clonePath Path where clone directory will exist
   * @returns {Promise} Clone promise will return when complete
   */
  this.clone = function (clonePath) {
    return this.execPromise(
      `mkdir ${clonePath} && rsync -av --progress --exclude='*.tfstate' ${this.directory} ${clonePath} -q`
    ).catch(this.tfErr);
  };

  /**
   * Remove the clone of a path
   * @returns Promise if CLI is clone
   */
  this.purgeClone = () => {
    return this.execPromise(`rm -rf ${this.directory}`)
      .then(() => {
        this.print(chalk.cyan(`Clone directory ${this.directory} purged,`));
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
  this.createTfVarFile = function (tfvars) {
    typeCheck("createTfVarFile expected param of type", "object", tfvars);
    this.fs.writeFileSync(this.directory + "/tfxjs.tfvars", hclEncode(tfvars));
  };

  /**
   * Initialize terraform
   * @param {Object?} tfvars Object where every key is matched to a single terraform variable
   * @returns {Promise} Promise to run command
   */
  this.init = function (tfvars) {
    if (tfvars && Object.keys(tfvars).length > 0) {
      this.createTfVarFile(tfvars);
    }
    return this.cdAndExec(
      `terraform init` // Go into dir and initialize terraform
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
            `rm -rf tfplan .terraform/ .terraform.lock.hcl${
              Object.keys(tfvars).length == 0 ? "" : " tfxjs.tfvars"
            }` // Remove excess files
          );
      })
      .then(() => {
        if (callback) callback(jsonData);
      })
      .catch(this.tfErr);
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
          `echo "yes" | terraform apply${
            Object.keys(tfvars).length == 0 ? "" : " --var-file=tfxjs.tfvars"
          }` // Apply plan
        );
      })
      .then(() => {
        return this.cdAndExec("cat terraform.tfstate");
      })
      .then((data) => {
        jsonData = JSON.parse(data.stdout);
        if (destroyAndCleanup) {
          return this.cdAndExec(
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
  };
};

module.exports = terraformCli;
