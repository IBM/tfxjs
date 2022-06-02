const { assert, expect } = require("chai");
const tfx = require("tfxjs");
const cli = require("../lib/cli");
// const mockTfx = require("../lib/cli.js")
// const tfx = require("../lib/tfx-cli")

// function mockExec(data) {
//     this.data = data;
//     this.commandList = [];
//     this.promise = (command) => {
//       this.commandList.push(command);
//       return new Promise((resolve, reject) => {
//         if (this.data?.stderr) reject(this.data);
//         else resolve(this.data);
//       });
//     };
//   }

let exec = ''; //doesn't matter, never used
let spawn = '';//doesn't matter, never used

describe("cli", () => {
   it("infrastructure test", () => {
       assert.equal(true, true);
   });
   it("should run the correct commands with no args ", () => {
       expect(()=>{cli.cli(cli.mockTfx, exec, spawn)}).to.not.throw();
   });
   it("should run the correct commands with one arg", () => {
    let tfxInst = new cli.mockTfx(exec, spawn, '--help');
    tfxInst.tfxcli()
    expect(()=>{cli.cli(cli.mockTfx, exec, spawn)}).to.not.throw(); 
    assert.deepEqual(tfxInst.commandArgs, ['--help'])
   });

});