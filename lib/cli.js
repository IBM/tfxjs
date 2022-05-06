const { eachKey } = require("./utils");

const cli = function(child, options){
    this.spawn = child;
    this.print = console.log;
    eachKey(options, (key) => {
        this[key] = options[key]
    })
}

module.exports = cli