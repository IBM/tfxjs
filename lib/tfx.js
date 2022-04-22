const child = require("child_process").spawn; // the kids love chains
/**
 * Takes in child_process and creates a child process with correct params
 * @param {string} filePath Path to tfx test file
 * @param {Object} options list of options
 */
const tfx = function (filePath, options) {
  let tfx;
  try {
    tfx = options.child("npx", ["mocha", "-timeout", "10000000", filePath], {
      shell: true,
    });
  } catch {
    tfx = child("npx", ["mocha", "-timeout", "10000000", filePath], {
      shell: true,
    });
  }
  // Stream data
  tfx.stdout.on("data", function (data) {
    console.log(data.toString().replace(/\n+/i, "")); // Remove first newline
  });

  // Stream data
  tfx.stderr.on("data", function (data) {
    console.log(data.toString());
  });

  // Thank you good night
  tfx.on("exit", function (code) {});
};

module.exports = tfx;
