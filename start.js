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
  .requiredOption("-r, --root <string>", "Vue项目中的产线根路径")
  .option("-t, --targetPath <string>", "Vue项目中的产线DB的目标路径")
  .option("-p, --projectPath <string>", "新项目的路径")
  .description("npm包批量发布。。。")
  .action(async (data) => {
    if (!data.targetPath) {
      const allTarget = fs.getSubFolder(data.root);
      for (let index = 0; index < allTarget.length; index++) {
        const element = allTarget[index];
        const xPath = new XPath(element);
        console.log("index", index);
        await xPath.start();
        console.log("index", index);
      }
      if (data.projectPath) {
        fs.movProject(data.root, data.projectPath);
      }
    } else {
      const xPath = new XPath(data);
      xPath.start();
    }
  });
program.parse(process.argv);
