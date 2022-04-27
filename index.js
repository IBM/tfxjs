#!/usr/bin/env node
const filePath = process.argv[2]; // Get filepath from command line
const tfx = require('./lib/tfx-cli') // Import tfx
process.env.FORCE_COLOR = true; // Force env color
tfx(filePath)