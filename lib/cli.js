<<<<<<< HEAD
const tfx = require('./tfx-cli') // Import tfx
const jsutil = require("util"); // Utils to run child process
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process
const spawn = jsutil.promisify(require("child_process").spawn); // Exec from child process

function cli () {
    let commandArgs = [];
    for(let i = 2; i<process.argv.length; i++) {
       commandArgs.push(process.argv[i])
=======
const chalk = require("chalk");
/**
 * calls tfxcli with command line inputs
 * @param {tfxCli} tfx tfxCli construcutor 
 * @param {Promise} exec promisified child process.exec
 * @param {Promise} spawn promisified child process.spawn
 * @param {Object} console javascript console, used for testing
 * @param {Array<string>} cliArgs reference to process.argv
 */
function cli (tfx, exec, spawn, console, cliArgs) {
    let commandArgs = [];
    for(let i = 2; i<cliArgs.length; i++) {
       commandArgs.push(cliArgs[i])
>>>>>>> intern-tfxjs/master
    }
    let cmd = new tfx(exec, spawn, ...commandArgs)
    try {
        cmd.tfxcli();
    } catch (err) {
<<<<<<< HEAD
        console.log(err)
    }
}

module.exports = cli
=======
        console.log(chalk.red(err))
    }
}

module.exports = cli;

>>>>>>> intern-tfxjs/master
