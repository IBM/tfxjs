const { containsKeys } = require("./helpers");
const { eachKey, typeCheck, contains } = require("./utils");

const emptyDir = "The directory has no Terraform configuration files.";

/**
 * Constructor for execution of
 * @param {string} directory Path to terraform template
 * @param {Promise} exec Function to use when running commands
 * @param {boolean} enableLogs Enable logging for spawned commands
 */
const terraformCli = function (directory, exec, enableLogs) {
  this.directory = directory;
  this.enableLogs = enableLogs;

  /**
   * Clone directory into
   * @param {string} clonePath Path where clone directory will exist
   * @returns {Promise} Clone promise will return when complete
   */
  this.clone = function (clonePath) {
    return this.execPromise(
      `mkdir ${clonePath} && rsync -av --progress ${this.directory} ${clonePath} -q` // --exclude '*.tfvars' -q`
    ).catch(this.tfErr);
  };

  /**
   * Remove the clone of a path
   * @returns Promise if CLI is clone
   */
  this.purgeClone = () => {
    return this.execPromise(`rm -rf ${this.directory}`)
      .then(() => {
        this.print(`Clone directory ${this.directory} purged,`);
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
  };

  /**
   * Initialize terraform
   * @param {Object?} tfvars Object where every key is matched to a single terraform variable
   * @returns {Promise} Promise to run command
   */
  this.init = function (tfvars) {
    return this.cdAndExec(
      `${tfvars ? this.setTfVarString(tfvars) : ""}` + // Set vars
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
        if (contains(data.stdout, emptyDir)) {
          throw {stderr: "Error: Terraform initialized in empty directory " + this.directory};
        }
        this.print(data.stdout);
        let command = `terraform plan -out=tfplan -input=false`;
        if (options?.no_output) {
          // If no output remove out and input
          command = command.replace(/\s-.+/g, "");
        }
        return this.cdAndExec(
          this.setTfVarString(tfvars) + // initialize tfvars
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
            `rm -rf tfplan .terraform/ .terraform.lock.hcl` // Remove excess files
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
          this.setTfVarString(tfvars) + // set tfvars
            `echo "yes" | terraform apply` // Apply plan
        );
      })
      .then(() => {
        return this.cdAndExec("cat terraform.tfstate");
      })
      .then((data) => {
        jsonData = JSON.parse(data.stdout);
        if (destroyAndCleanup) {
          return this.cdAndExec(
            this.setTfVarString(tfvars) + // set tfvars
              `echo "yes" | terraform destroy\n` + // Destroy
              `rm -rf .terraform/ .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup` // Remove excess files
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
    throw new Error(
      `${err.stderr.replace(/\s(?=\S+\.tf)/g, ` ${this.directory}/`)}`
    );
  };
};

module.exports = terraformCli;
