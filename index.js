#!/usr/bin/env node
const cli = require("./lib/cli")
const tfx = require('./tfx-cli') // Import tfx
const jsutil = require("util"); // Utils to run child process
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process
const spawn = jsutil.promisify(require("child_process").spawn); // Exec from child process

cli(tfx, exec, spawn)