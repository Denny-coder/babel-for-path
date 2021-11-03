#!/usr/bin/env node

const { program } = require("commander");
const XPath = require("./tools/move/xPath");
const path = require("path");
const fs = require("./tools/move/file");
const Clone = require("./tools/clone/clone");
const View = require("./tools/clone/view");
const Example = require("./tools/clone/example");
const TranslateMap = require("./tools/translate/trans");
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
      await xPath.start();
    }
    fs.removeFileAndRestore(data.root, path.join(data.root, "./Components"));
  });
program
  .command("clone")
  .option("-c, --config <path>", "配置文件")
  .option("-t, --target <path>", "目标路径")
  .option("-p, --preview", "预览目录结构")
  .option("-e, --example", "配置文件示例")
  .description("按配置文件目录结构批量克隆GIT项目")
  .action((data) => {
    if (data.example) {
      new Example();
    } else {
      if (!data.config) {
        console.log(
          `error: required option '-c, --cheese <type>' not specified`
        );
      } else {
        if (data.preview) {
          new View(data);
        } else {
          new Clone(data);
        }
      }
    }
  });
program
  .command("trans")
  .option("-f, --folder <path>", "需要翻译的文件夹或者文件")
  .description("映射翻译内容")
  .action((data) => {
    new TranslateMap()
  });
program.parse(process.argv);
