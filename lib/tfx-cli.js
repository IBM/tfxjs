const { isEmpty, containsAny, flagValues } = require("./utils");
const extract = require("./extract");
const fs = require("fs");
<<<<<<< HEAD
const { convertTfVarsFromTags } = require("./helpers");

const help = `
=======
const chalk = require("chalk");
const { convertTfVarsFromTags } = require("./helpers");
const tfxInit = require("./tfx-init")

const help =
  chalk.cyan.bold(`
>>>>>>> intern-tfxjs/master
#############################################################################
#                                                                           #
#                                   tfxjs                                   #
#                                                                           #
#############################################################################
<<<<<<< HEAD

tfxjs cli tool allows you to run tfxjs tests.

To test a .js file:
  $ tfx <file_path>

To create tests from a terraform plan:
  $ tfx plan --in <terraform file path> --out <filepath> --type <tfx or yaml>

Additional flags are also available:
  -v | --tf-var
      Inject a terraform.tfvar value into the plan. This flag can be added any number of times

To create a nodejs test file from a YAML plan:
  $ tfx decode <yaml file path> --out <filepath>

Additional flags are also available:
  -v | --tf-var
  Inject a terraform.tfvar value into the plan. This flag can be added any number of times
`;
=======
`) +
  chalk.white(`\ntfxjs cli tool allows you to run tfxjs tests.\n\n`) +
  chalk.bold(`To test a .js file:\n`) +
  chalk.cyan(`  $ tfx <file_path>\n\n`) +
  chalk.white.bold(`To create tests from a terraform plan:\n`) +
  chalk.cyan(
    `  $ tfx plan --in <terraform file path> --out <filepath> --type <tfx or yaml>\n\n`
  ) +
  chalk.white.bold(`Additional flags are also available:\n`) +
  chalk.cyan(`  -v | --tf-var\n`) +
  chalk.white(
    `      Inject a terraform.tfvar value into the plan. This flag can be added any number of times\n\n`
  ) +
  chalk.bold(`To create a nodejs test file from a YAML plan:\n`) +
  chalk.cyan(`  $ tfx decode <yaml file path> --out <filepath>\n\n`) +
  chalk.white.bold(`Additional flags are also available:\n`) +
  chalk.cyan(`  -v | --tf-var\n`) +
  chalk.white(
    `      Inject a terraform.tfvar value into the plan. This flag can be added any number of times\n\n`
  ) +
  chalk.white.bold("To initialize a tfxjs test directory:\n") +
  chalk.cyan(`  $ tfx init <directory_path>\n`);
>>>>>>> intern-tfxjs/master

const cli = function (child, spawn, ...commandArgs) {
  this.log = console.log;

  this.tags = {
    help: ["-h", "--help"],
    in: ["-i", "--in"],
    out: ["-o", "--out"],
    type: ["-t", "--type"],
    tfvars: ["-v", "--tf-var"],
<<<<<<< HEAD
=======
    shallow: ["-s", "--shallow"],
    quiet: ["-q", "--quiet"],
>>>>>>> intern-tfxjs/master
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
<<<<<<< HEAD
=======
        {
          name: "shallow",
          noMatchingValue: true,
        },
        {
          name: "quiet",
          noMatchingValue: true,
        },
>>>>>>> intern-tfxjs/master
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
<<<<<<< HEAD
    }
=======
    },
>>>>>>> intern-tfxjs/master
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
<<<<<<< HEAD
  this.readFileSync = fs.readFileSync;
  this.planTfx = extract.planTfx;
  this.deyamilfy = extract.deyamilfy
=======
  this.mkdirSync = fs.mkdirSync;
  this.readFileSync = fs.readFileSync;
  this.fsExists = fs.existsSync;
  this.planTfx = extract.planTfx;
  this.deyamilfy = extract.deyamilfy;
>>>>>>> intern-tfxjs/master

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
<<<<<<< HEAD
      (fileData) => {
        this.writeFileSync(planFlagValues.out, fileData);
      }
    );
  };

  this.decode = () => {
    let fileData = this.readFileSync(commandArgs[1])
=======
      planFlagValues?.shallow ? true : false,
      planFlagValues?.quiet ? true : false,
      this.writeFileCallBack(planFlagValues.out)
    );
  };

  /**
   * Write File callback
   * @param {String} outFilePath
   * @returns {extractCallback} callback Callback function
   */
  this.writeFileCallBack = (outFilePath) => {
    return (fileData) => {
      this.writeFileSync(outFilePath, fileData);
    };
  };

  this.decode = () => {
    let fileData = this.readFileSync(commandArgs[1]);
>>>>>>> intern-tfxjs/master
    let decodeFlagValues = flagValues(
      "decode",
      this.verb.decode,
      this.tags,
      ...commandArgs
<<<<<<< HEAD
    )
    let decodedData = this.deyamilfy(fileData, decodeFlagValues.tfvars)
    this.writeFileSync(decodeFlagValues.out, decodedData)
=======
    );
    let decodedData = this.deyamilfy(fileData, decodeFlagValues.tfvars);
    this.writeFileSync(decodeFlagValues.out, decodedData);
  };

  this.tfxInit = () => {
    if (commandArgs.length !== 2) {
      throw chalk.red(`tfx init expects only a single arcument (directory path). Got a list of valid commands, run \`tfx --help\`.`)
    }
    tfxInit(
      // override fs object
      {
        writeFileSync: this.writeFileSync,
        mkdirSync: this.mkdirSync,
        existsSync: this.fsExists,
      },
      child,
      commandArgs[1]
    );
>>>>>>> intern-tfxjs/master
  };

  this.tfxcli = () => {
    if (isEmpty(commandArgs)) {
<<<<<<< HEAD
      throw "tfx expects arguments after the command line. For a list of valid commands run `tfx --help`.";
=======
      throw chalk.red(
        "tfx expects arguments after the command line. For a list of valid commands run `tfx --help`."
      );
>>>>>>> intern-tfxjs/master
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
<<<<<<< HEAD
    } else if (commandArgs[0] === "decode" ) {
      this.decode();
      return;
    } else {
      throw "Invalid tfx command. For a list of valid commands run `tfx --help`.";
=======
    } else if (commandArgs[0] === "decode") {
      this.decode();
      return;
    } else if (commandArgs[0] === "init") {
      this.tfxInit();
    } else {
      throw chalk.red(
        "Invalid tfx command. For a list of valid commands run `tfx --help`."
      );
>>>>>>> intern-tfxjs/master
    }
  };
};

module.exports = cli;
