#!/usr/bin/env node

const { program } = require("commander");
const XPath = require("./tools/move/xPath");
const fs = require("./tools/move/file");
const Clone = require("./tools/clone/clone");
// 定义当前版本
program.version(
  require("./package.json").version,
  "-v, --vers",
  "output the current version"
);

program.usage("<command>");
program
  .command("move")
  .requiredOption("-r, --root <string>", "Vue项目中的产线根路径")
  .option("-t, --targetPath <string>", "Vue项目中的产线DB的目标路径")
  .option("-p, --projectPath <string>", "新项目的路径")
  .description("VUE与DB合并快捷命令")
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
program
  .command("clone")
  .requiredOption("-t, --target <string>", "目标路径")
  .option("-c, --config <string>", "配置文件")
  .description("按配置文件目录结构批量克隆GIT项目")
  .action((data) => {
    new Clone(data);
  });
program.parse(process.argv);
