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
    }
    let cmd = new tfx(exec, spawn, ...commandArgs)
    try {
        cmd.tfxcli();
    } catch (err) {
        console.log(chalk.red(err))
    }
}

module.exports = cli;

