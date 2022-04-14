const helpers = require("./helpers.js")
const tfutils = require("./utils.js");
const jsutil = require("util"); // Utils to run child process
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process
const path = require("path");

/**
 * Create a new tfx instance
 * @param {string} templatePath File path to terraform template to test
 * @param {string} apiKeyVariableName Name of the API Key terraform environment variable to run with your plan.
 * @param {Object} options options for testing
 */
const tfx = function (templatePath, apiKeyVariableName, options) {
  // Get plan to local plan.test
  this.planTestPath = path.join(__dirname + "/plan_test.sh");
  // Initialize tf utils with local teplate path and the test directory
  this.tfutils = new tfutils(
    this.planTestPath,
    templatePath,
    apiKeyVariableName
  );
  // Set log for unit tests
  this.log = console.log;

  /**
   * Print a string
   * @param {str} str String
   */
  this.print = (str) => {
    this.log(str);
  };

  // Try to override before
  try {
    this.before = options.overrideBefore;
  } catch {
    this.before = before;
  }
  // Try to override describe
  try {
    this.describe = options.overrideDescribe;
  } catch {
    this.describe = describe;
  }
  // try to override it
  try {
    this.it = options.overrideIt;
  } catch {
    this.it = it;
  }

  this.exec = exec;

  /**
   * Run code to store this.tfplan from actual plan
   */
  this.planAndSetData = async function () {
    await this.tfutils
      .getPlanJson(this.exec)
      .then((tfplan) => (this.tfplan = tfplan)); // On return set
  };

  /**
   * Run code to store state data
   */
  this.applyAndSetState = async function () {
    await this.tfutils
      .getApplyJson(this.exec)
      .then((tfstate) => (this.tfstate = tfstate));
  };

  /**
   * Plan Terraform module from directory and return data using mocha
   * @param {string} moduleName Name of the module that is being tested
   * @param {Function} callback Callback function
   */
  this.plan = function (moduleName, callback) {
    this.describe(moduleName, () => {
      this.print(`

* tfxjs testing

##############################################################################
# 
#  Running \`terraform plan\`
#  Teplate File:
#     ${templatePath}
# 
##############################################################################
`);
      // run before as an async to await plan data
      this.before(async () => {
        await this.planAndSetData();
      });
      // trick mocha into running async function by forcing it statement
      this.it("Successfully generates a terraform plan file", () => {
        callback(); // run callback
      });
    });
  };

  /**
   * Plan Terraform module from directory and return data using mocha
   * @param {string} moduleName Name of the module that is being tested
   * @param {Function} callback Callback function
   */
  this.apply = function (moduleName, callback) {
    this.describe(moduleName, () => {
      this.print(`

* tfxjs testing

##############################################################################
# 
#  Running \`terraform apply\`
#  Teplate File:
#     ${templatePath}
# 
##############################################################################
`);
      // run before as an async to await plan data
      this.before(async () => {
        await this.applyAndSetState();
      });
      // trick mocha into running async function by forcing it statement
      this.it("Runs `terraform apply` in the target directory", () => {
        callback(); // run callback
      });
    });
  };

  /**
   * Run tests for a module
   * @param {string} moduleName decorative string for module name
   * @param {string} moduleAddress relative module address from root
   * @param {Array<{name: string, address: string, values:{Object}}>} resources Array of resources from the module to check
   */
  this.module = function (moduleName, moduleAddress, resources) {
    if(!this.tfplan) {
      throw new Error("`tfx.plan` needs to be successfully completed before running `tfx.module`.")
    }
    helpers.checkResourceTests(resources)
    let options = {
      moduleName: moduleName,
      address: moduleAddress,
      tfData: this.tfplan,
      testList: resources
    }
    this.tfutils.testModule(options);
  };
  /**
   * Run tests for a module
   * @param {string} moduleName decorative string for module name
   * @param {Array.<{address: string, instances: Array<Object>}>} resources Array of resources from the module to check
   */
   this.state = function (moduleName, resources) {
    if(!this.tfstate) {
      throw new Error("`tfx.apply` needs to be successfully completed before running `tfx.state`.")
    }
    let options = {
      moduleName: moduleName,
      tfData: this.tfstate,
      testList: resources,
      isApply: true
    }
    this.tfutils.testModule(options);
  };
};

// Ok bye
module.exports = tfx;
