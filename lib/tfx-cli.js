const { isEmpty, containsAny, flagValues } = require("./utils");
const extract = require("./extract");
const fs = require("fs");
const chalk = require("chalk");
const { convertTfVarsFromTags } = require("./helpers");

const help = chalk.cyan.bold(`
#############################################################################
#                                                                           #
#                                   tfxjs                                   #
#                                                                           #
#############################################################################
`) + chalk.white(`
tfxjs cli tool allows you to run tfxjs tests.

`) + chalk.bold(`To test a .js file:
`) + chalk.cyan(`  $ tfx <file_path>

`) + chalk.white.bold(`To create tests from a terraform plan:
`) + chalk.cyan(`  $ tfx plan --in <terraform file path> --out <filepath> --type <tfx or yaml>

`) + chalk.white.bold(`Additional flags are also available:
`) + chalk.cyan(`  -v | --tf-var
`) + chalk.white(`      Inject a terraform.tfvar value into the plan. This flag can be added any number of times

`) + chalk.bold(`To create a nodejs test file from a YAML plan:
`) + chalk.cyan(`  $ tfx decode <yaml file path> --out <filepath>

`) + chalk.white.bold(`Additional flags are also available:
`) + chalk.cyan(`  -v | --tf-var
`) + chalk.white(`      Inject a terraform.tfvar value into the plan. This flag can be added any number of times
`);

const cli = function (child, spawn, ...commandArgs) {
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
    decode: {
      requiredFlags: ["out"],
      optionalFlags: [
        {
          name: "tfvars",
          allowMultiple: true,
        },
      ],
    }
  };

  /**
   * Run tfx tests
   */
  this.runTest = () => {
    return spawn("npx", ["mocha", "-timeout", "10000000", commandArgs[0]], {
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
  this.readFileSync = fs.readFileSync;
  this.planTfx = extract.planTfx;
  this.deyamilfy = extract.deyamilfy

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

  this.decode = () => {
    let fileData = this.readFileSync(commandArgs[1])
    let decodeFlagValues = flagValues(
      "decode",
      this.verb.decode,
      this.tags,
      ...commandArgs
    )
    let decodedData = this.deyamilfy(fileData, decodeFlagValues.tfvars)
    this.writeFileSync(decodeFlagValues.out, decodedData)
  };

  this.tfxcli = () => {
    if (isEmpty(commandArgs)) {
      throw chalk.red("tfx expects arguments after the command line. For a list of valid commands run `tfx --help`.")
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
    } else if (commandArgs[0] === "decode" ) {
      this.decode();
      return;
    } else {
      throw chalk.red("Invalid tfx command. For a list of valid commands run `tfx --help`.");
    }
  };
};

module.exports = cli;
