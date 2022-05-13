const { isEmpty, containsAny, flagValues } = require("./utils");
const extract = require("./extract");
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
        throw err.stderr;
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
    this.planTfx(
      "tfx Generated Plan",
      planFlagValues.in,
      planFlagValues.type,
      planFlagValues.tfvars,
      child,
      (fileData) => {
        this.writeFileSync(planFlagValues.out, fileData);
      }
    );
  };

  this.tfxcli = () => {
    if (isEmpty(commandArgs)) {
      throw "tfx expects arguments after the command line. For a list of valid commands run `tfx --help`.";
    }
    if (containsAny(commandArgs, this.tags.help)) {
      this.print(help);
      return;
    }
    if (commandArgs.length === 1) {
      return this.runTest();
    }
    if (commandArgs[0] === "plan") {
      this.plan();
      return;
    } else {
      throw "Invalid tfx command. For a list of valid commands run `tfx --help`.";
    }
  };
};

module.exports = cli;
