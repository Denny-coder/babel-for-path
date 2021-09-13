var fs = require("fs");
var path = require("path");
class File {
  constructor(data) {
    this.data = data;
    this.rootComponents = path.join(data.root, "./Components");
    this.targetPath = data.targetPath;
    this.jsFileList = [];
    this.scssFileList = [];
  }
  static getSubFolder(filePath) {
    const result = [];
    const files = fs.readdirSync(filePath);
    for (var i = 0; i < files.length; i++) {
      const subPath = path.join(filePath, files[i]);
      if (
        fs.statSync(subPath).isDirectory() &&
        subPath.indexOf("Components") < 0
      ) {
        result.push({
          root: subPath,
          targetPath: path.join(filePath, "./Components"),
        });
      }
    }
    return result;
  }
  getAllFile(filePath) {
    const files = fs.readdirSync(filePath);
    for (var i = 0; i < files.length; i++) {
      const subPath = path.join(filePath, files[i]);
      if (subPath !== this.rootComponents) {
        if (this.isFile(subPath)) {
          if (/(\.js$)/.test(files[i])) {
            this.jsFileList.push(subPath);
          }
          if (/(\.scss$)/.test(files[i])) {
            this.scssFileList.push(subPath);
          }
        } else {
          this.getAllFile(subPath);
        }
      }
    }
  }

  readFile(filePath) {
    const source = fs.readFileSync(filePath, { encoding: "utf8" });
    return source;
  }
  writeFileSync(filePath, targetCode) {
    fs.writeFileSync(filePath, targetCode, { encoding: "utf8" });
  }
  isFile(subPath) {
    try {
      const statSync = fs.statSync(subPath);
      return statSync.isFile();
    } catch (error) {
      return false;
    }
  }
  existsSync(subPath) {
    const existsSync = fs.existsSync(subPath);
    return existsSync;
  }
}
module.exports = File;
