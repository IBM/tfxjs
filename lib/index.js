const helpers = require("./helpers.js");
const tfutils = require("./utils.js");
const jsutil = require("util"); // Utils to run child process
const builders = require("./builders.js");
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process

/**
 * Create a new tfx instance
 * @param {string} templatePath File path to terraform template to test
 * @param {string} apiKeyVariableName Name of the API Key terraform environment variable to run with your plan.
 * @param {Object} options options for testing
 */
const tfx = function (templatePath, apiKeyVariableName, options) {
  // Initialize tf utils with local teplate path and the test directory
  this.tfutils = new tfutils(templatePath, apiKeyVariableName);

  // Set log. Override this value for unit tests
  this.log = console.log;

  /**
   * Print a string. This is used in unit testing
   * @param {str} str String
   */
  this.print = (str) => {
    this.log(str);
  };

  // Try to override before
  try {
    this.before = options.overrideBefore;
  } catch {
    this.before = before; // default to chai
  }
  // Try to override describe
  try {
    this.describe = options.overrideDescribe;
  } catch {
    this.describe = describe; // default to chai
  }
  // try to override it
  try {
    this.it = options.overrideIt;
  } catch {
    this.it = it; // default to chai
  }

  // Set exec to be child process exec; this can be overriden for unit tests
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
    // Run module level describe
    this.describe(moduleName, () => {
      // Show text
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
   * @param {...{name: string, address: string, values:{Object}}} resources Array of resources from the module to check
   */
  this.module = function (moduleName, moduleAddress, ...resources) {
    // Throw an error if no plan exists
    if (!this.tfplan) {
      throw new Error(
        "`tfx.plan` needs to be successfully completed before running `tfx.module`."
      );
    }

    let tfPlanResources = Array.isArray(resources[0])
      ? resources[0]
      : resources; // Fallback for old tests
    helpers.checkResourceTests(tfPlanResources);

    // Options needed to run test module
    let options = {
      moduleName: moduleName,
      address: moduleAddress,
      tfData: this.tfplan,
      testList: tfPlanResources,
    };

    // Run the tests
    this.tfutils.testModule(options);
  };
  /**
   * Run tests for a module
   * @param {string} moduleName decorative string for module name
   * @param {...{address: string, instances: Array<Object>}} resources Object of resources from the module to check
   */
  this.state = function (moduleName, ...resources) {
    // Throw an error if no tfstate
    if (!this.tfstate) {
      throw new Error(
        "`tfx.apply` needs to be successfully completed before running `tfx.state`."
      );
    }

    // Create options for test suite
    let options = {
      moduleName: moduleName,
      tfData: this.tfstate,
      testList: Array.isArray(resources[0]) ? resources[0] : resources, // Fallback for old tests
      isApply: true,
    };

    // Run the tests
    this.tfutils.testModule(options);
  };

  this.resource = builders.resource;
  this.expect = builders.eval;
  this.address = builders.check;
};

// Ok bye
module.exports = tfx;
