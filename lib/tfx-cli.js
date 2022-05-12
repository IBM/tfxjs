const {
  isEmpty,
  containsAny,
  flagValues,
} = require("./utils");
const jsutil = require("util"); // Utils to run child process
const extract = require("./extract");
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process
const fs = require("fs");
const { convertTfVarsFromTags } = require("./helpers");

const help = `
#############################################################################
#                                                                           #
#                                   tfxjs                                   #
#                                                                           #
#############################################################################

tfxjs cli tool allows you to run tfxjs tests.

To test a .js file:
  $ tfx <file_path>

To create tests from a terraform plan:
  $ tfx --in <terraform file path> --out <filepath> --type <tfx or yaml>

Additional flags are also available:

`;

const cli = function (child, ...commandArgs) {
  this.log = console.log;

  this.tags = {
    help: ["-h", "--help"],
    in: ["-i", "--in"],
    out: ["-o", "--out"],
    type: ["-t", "--type"],
    tfvars: ["-v", "--tf-var"],
  };
  // extract -in path -out path -type tfx | yaml

  this.verb = {
    plan: {
      requiredFlags: ["in", "out", "type"],
      optionalFlags: [
        {
          name: "tfvars",
          allowMultiple: true,
        },
      ],
    },
  };

  /**
   * Run tfx tests
   */
  this.runTest = () => {
    return child("npx", ["mocha", "-timeout", "10000000", commandArgs[0]], {
      stdio: "inherit",
    })
      .then((data) => {
        this.print(data);
      })
      .catch((err) => {
        throw new Error(err.stderr);
      });
  };

  /**
   * Optionally print texts
   * @param {string} text Arbitrary string
   */
  this.print = (text) => {
    this.log(text);
  };

  this.writeFileSync = fs.writeFileSync;
  this.planTfx = extract.planTfx;

  this.plan = () => {
    // Get needed plan aliases
    commandArgs.shift();
    // Plan Flag Values
    let planFlagValues = flagValues(
      "plan",
      this.verb.plan,
      this.tags,
      ...commandArgs
      );
      
    planFlagValues.tfvars = convertTfVarsFromTags(planFlagValues);
    if (planFlagValues.type === "tfx")
      this.planTfx(
        "tfx Generated Plan",
        planFlagValues.in,
        planFlagValues.tfvars,
        child,
        (fileData) => {
          this.writeFileSync(planFlagValues.out, fileData);
        }
      );
  };

  this.tfxcli = () => {
    if (isEmpty(commandArgs)) {
      throw new Error(
        "tfx expects arguments after the command line. For a list of valid commands run `tfx --help`."
      );
    }
    if (containsAny(commandArgs, this.tags.help)) {
      this.print(help);
    }
    if (commandArgs.length === 1) {
      return this.runTest();
    }
    if (commandArgs[0] === "plan") {
      this.plan();
    }
  };
};

module.exports = cli;
