const mockTfx = function(exec, spawn, ...commandArgs){
    this.commandArgs = []
    this.tfxcli = function() {
        this.commandArgs = commandArgs;
    }
}

function cli (tfx, exec, spawn) {
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

module.exports['cli'] = cli;
module.exports['mockTfx'] = mockTfx;