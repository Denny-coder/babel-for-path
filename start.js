#!/usr/bin/env node

const { program } = require("commander");
const File = require("./tools/file");
// 定义当前版本
program.version(
  require("./package.json").version,
  "-v, --vers",
  "output the current version"
);

program.usage("<command>");
program
  .requiredOption("-r, --root <string>", "项目的根路径")
  .description("npm包批量发布。。。")
  .action(async (data) => {
    const fs = new File(data);
    console.log(fs.getAllFile(data.root));
  });
program.parse(process.argv);
