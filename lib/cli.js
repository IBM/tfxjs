const tfx = require('./tfx-cli') // Import tfx
const jsutil = require("util"); // Utils to run child process
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process
const spawn = jsutil.promisify(require("child_process").spawn); // Exec from child process

function cli () {
    let commandArgs = [];
    for(let i = 2; i<process.argv.length; i++) {
       commandArgs.push(process.argv[i])
    }
    let cmd = new tfx(exec, spawn, ...commandArgs)
    try {
        cmd.tfxcli();
    } catch (err) {
        console.log(err)
    }
}

module.exports = cli