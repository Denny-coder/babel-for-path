#!/usr/bin/env node

const { program } = require("commander");
const XPath = require("./tools/xPath");
const fs = require("./tools/file");
// 定义当前版本
program.version(
  require("./package.json").version,
  "-v, --vers",
  "output the current version"
);

program.usage("<command>");
program
  .requiredOption("-r, --root <string>", "项目的根路径")
  .option("-t, --targetPath <string>", "转换的目标路径")
  .description("npm包批量发布。。。")
  .action(async (data) => {
    if (!data.targetPath) {
      const allTarget = fs.getSubFolder(data.root);
      allTarget.forEach((target) => {
        new XPath(target);
      });
    } else {
      new XPath(data);
    }
  });
program.parse(process.argv);
