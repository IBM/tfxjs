const tfutils = require("./utils.js"); // Terraform utils
const jsutil = require("util"); // Utils to run child process
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process
const builders = require("./builders.js"); // Constructors
const tfCli = require("./terraform-cli"); // Terraform CLI commands
const { eachKey, keysContains, checkResourceTests } = require("./helpers.js");
const { testHead } = require("./builders.js");

// Options map
const optionsMap = {
  overrideBefore: "before",
  overrideDescribe: "describe",
  overrideIt: "it",
  quiet: "enableLogs",
};

/**
 * Create a new tfx instance
 * @param {string} templatePath File path to terraform template
 * @param {Object} tfvars key value pair of tfvars
 * @param {Object} options options for testing
 * @param {boolean} options.quiet Set to true to disable template outputs
 */
const tfx = function (templatePath, tfvars, options) {
  this.tfutils = new tfutils(options); // Initialize tf utils with local teplate path and the test directory
  this.log = console.log; // Set log. Override this value for unit tests
  this.templatePath = templatePath; // Set template path will be overridden if clone
  this.resource = builders.resource; // Resource template
  this.expect = builders.eval; // Eval template
  this.address = builders.address; // Address template
  this.before = before; // default to chai
  this.describe = describe; // default to chai
  this.it = it; // default to chai
  this.enableLogs = true; // enable logging
  this.tfvars = {}; // default tfvars

  // For all of the options
  eachKey(optionsMap, (key) => {
    // If contains key
    if (options?.[key]) {
      let value = key === "quiet" ? true : options[key];
      this[optionsMap[key]] = value; // Override values
    }
  });

  // Create object for calling CLI actions
  this.cli = new tfCli(
    templatePath, // Template path
    // If override exec, override. otherwise use exec
    keysContains(options, "overrideExec") ? options.overrideExec : exec,
    // If exec is overridden or quiet is passed, disable logs
    keysContains(options, "overrideExec") || keysContains(options, "quiet")
      ? false
      : this.enableLogs
  );

  // fallback for old versions
  if (typeof tfvars === "string") {
    this.tfvars = {
      [tfvars]: process.env.API_KEY,
    };
  }

  // Set tfvars to inject
  if (typeof tfvars === "object") {
    this.tfvars = tfvars;
  }

  /**
   * Print a string. This is used in unit testing
   * @param {str} str String
   */
  this.print = (str) => {
    this.log(str);
  };

  /**
   * Run code to store this.tfplan from actual plan
   */
  this.planAndSetData = async function () {
    await this.cli.plan(
      this.tfvars,
      (data) => {
        this.tfplan = data;
      },
      { cleanup: true }
    );
  };

  /**
   * Run code to store state data
   */
  this.applyAndSetState = async function () {
    await this.cli.apply(this.tfvars, (data) => {
      this.tfstate = data;
    });
  };

  /**
   * Runs the basic steps to perform tfx function
   * @param {string} templateName Decorative name of module
   * @param {string} actionName Name of action (plan or apply)
   * @param {string} headerBlock Header block to display
   * @param {beforeFn} beforeFn Function to run before running callbacl
   * @param {actionCallback} callback Callback to run once before is complete
   * @param {string?} clonePath (Optional) Path to clone folder if clone
   */
  this.tfAction = function (
    templateName,
    actionName,
    beforeFn,
    callback,
    clonePath
  ) {
    let actions = {
      plan: "Successfully generates a terraform plan file",
      apply: "Runs `terraform apply` in the target directory",
      clone: "Creates a clone directory at destination path " + clonePath,
    };
    let actionTypes = Object.keys(actions);
    if (actionTypes.indexOf(actionName) === -1) {
      throw new Error(
        `tfAction currently only accepts ${JSON.stringify(
          actionTypes
        )}, got ${actionName}`
      );
    }
    if (!(callback instanceof Function)) {
      throw new Error(
        `tfx.${actionName} expected callback to be a function got ${typeof callback}`
      );
    }
    if (!(beforeFn instanceof Function)) {
      throw new Error(
        `tfx.${actionName} expected beforeFn to be a function got ${typeof beforeFn}`
      );
    }
    this.describe(templateName, () => {
      // Run describe
      this.print(testHead(this.templatePath, actionName, clonePath)); // Print header
      this.before(beforeFn); // Pass async function to before to force await promise return
      this.it(actions[actionName], () => {
        callback();
      });
    });
  };

  /**
   * Callback to run after action is completed
   * @callback actionCallback
   */

  /**
   * Callback to run after in before statement
   * @callback beforeFn
   */

  /**
   * Plan Terraform template from directory and return data
   * @param {string} templateName Decorative name of the template that is being tested
   * @param {actionCallback} callback Callback function
   */
  this.plan = function (templateName, callback) {
    let asyncBefore = async () => {
      await this.planAndSetData(); // Wait for plan to be set
    };
    this.tfAction(templateName, "plan", asyncBefore, callback);
  };

  /**
   * Apply Terraform template from directory and return tfstate data using mocha
   * @param {string} templateName Name of the module that is being tested
   * @param {actionCallback} callback Callback function
   */
  this.apply = function (templateName, callback) {
    let asyncBefore = async () => {
      await this.applyAndSetState(); // Wait for state to be set
    };
    this.tfAction(templateName, "apply", asyncBefore, callback);
  };

  /**
   * Create a clone of an existing template in a filepath specified
   * @param {string} clonePath Path where the clone template will be created
   * @param {cloneCallback} callback Callback function
   */
  this.clone = function (clonePath, callback) {
    let cloneTfx; // Initialize clone
    let asyncBefore = async () => {
      cloneTfx = new tfx(templatePath, tfvars, options); // Create a new tfx instance to return
      await cloneTfx.cli.clone(clonePath); // Wait for the clone to initialize
    };
    let cloneCallback = () => {
      // Intialize function to run current callback
      // and to return purge command when done
      cloneTfx.cli.directory = clonePath;
      cloneTfx.templatePath = clonePath;
      callback(cloneTfx, cloneTfx.cli.purgeClone);
    };
    this.tfAction(
      `Clone ${templatePath}`,
      "clone",
      asyncBefore,
      cloneCallback,
      clonePath
    );
  };

  /**
   * Callback descriptor
   * @callback cloneCallback
   * @param {tfx} tfxClone Clone tfx object
   * @param {Function} done Function to delete clone directory
   */

  /**
   * RRun tests for a module in terraform plan
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
    checkResourceTests(tfPlanResources);

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
};

// Ok bye
module.exports = tfx;
