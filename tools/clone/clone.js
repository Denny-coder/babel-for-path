var fs = require("fs");
const shell = require("shelljs");

class Clone {
  constructor(data) {
    this.config = require(data.config);
    this.targetPath = data.target;
    this.startClone(this.config, this.targetPath);
  }
  startClone(config, targetPath) {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath);
    }
    if (config.group && Array.isArray(config.group)) {
      config.group.forEach((path) => {
        shell.exec(
          `cd ${targetPath} && git clone ${path}`,
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
      let fliePath = `${targetPath}/${fileName}`;
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(`${targetPath}/${fileName}`);
      }
      this.startClone(config[fileName], fliePath);
    });
  }
}
module.exports = Clone;
