#!/usr/bin/env node

const { program } = require("commander");
const XPath = require("./tools/move/xPath");
const path = require("path");
const File = require("./tools/move/file");
const Clone = require("./tools/clone/clone");
const View = require("./tools/clone/view");
const Example = require("./tools/clone/example");
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
    const pathArr = data.root.split("/");
    const productType = pathArr[pathArr.length - 1];
    File.productType = productType;
    if (!data.targetPath) {
      const allTarget = File.getSubFolder(data.root);
      for (let index = 0; index < allTarget.length; index++) {
        const element = allTarget[index];
        const xPath = new XPath(element);
        console.log("index", index);
        await xPath.start();
        console.log("index", index);
        // File.removeFile(xPath.fs.rootComponents);
      }
      if (data.projectPath) {
        File.movProject(data.root, data.projectPath);
        // File.removeFile(XPath.destination);
      }
    } else {
      const xPath = new XPath(data);
      await xPath.start();
      File.removeFile(xPath.fs.rootComponents);
    }
    File.gitRestore(data.root);
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
program.parse(process.argv);
