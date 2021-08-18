#!/usr/bin/env node
const { program } = require("commander");

// 定义当前版本
program
  .version(
    require("./package.json").version,
    "-v, --vers",
    "output the current version"
  );

program.usage("<command>");
program.parse(process.argv);
