var fs = require("fs");
const shell = require("shelljs");
const process = require("process");

class Clone {
  constructor(data) {
    this.projectManagerConfig = [];
    this.config = require(data.config);
    this.targetPath = data.target || process.cwd();
    this.startClone(this.config, this.targetPath);
    console.log(JSON.stringify(this.projectManagerConfig));
  }
  startClone(config, targetPath) {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath);
    }
    if (config.group && Array.isArray(config.group)) {
      config.group.forEach((repo) => {
        const fileName = repo.match(/(?<=\/)[^\/]+(?=\.git)/)[0];
        this.addProjectManager(fileName, `${targetPath}/${fileName}`);
        shell.exec(
          `cd ${targetPath} && git clone ${repo}`,
          function (code, stdout, stderr) {
            if (stderr) {
              console.log("targetPath", targetPath);
              console.log(stderr);
            } else {
              console.log("targetPath", targetPath);
              console.log(code, stdout);
            }
          }
        );
      });
      delete config.group;
    }
    const keys = Object.keys(config);
    keys.forEach((fileName) => {
      let filePath = `${targetPath}/${fileName}`;
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(`${targetPath}/${fileName}`);
      }
      this.startClone(config[fileName], filePath);
    });
  }
  addProjectManager(name, rootPath) {
    this.projectManagerConfig.push({
      name: name,
      rootPath: rootPath,
      paths: [],
      tags: [],
      enabled: true,
    });
  }
}
module.exports = Clone;
