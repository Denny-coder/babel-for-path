var fs = require("fs");
var path = require("path");
var copyDir = require("copy-dir");
const shell = require("shelljs");
class File {
  constructor(data) {
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
  static movProject(originPath, targetPath) {
    copyDir.sync(path.join(originPath, "../.."), targetPath, {
      filter: function (stat, filepath, filename) {
        if (/\.git$|node_modules$|node-v7\.4\.0|H5$/.test(filename)) {
          return false;
        }
        if (File.productType === "Flight") {
          if (/src/g.test(filepath)) {
            if (/src\/\w+\/\w+\/Components/g.test(filepath)) {
              if (/src\/\w+\/Components\//g.test(filepath)) {
                return true;
              }
              return false;
            }
            if (/src\/\w+\/Components/g.test(filepath)) {
              return true;
            }
            if (/src\/\w+$/g.test(filepath)) {
              if (new RegExp(`src\/${File.productType}`, "g").test(filepath)) {
                return true;
              } else {
                return false;
              }
            }
          }
        } else {
          if (/src/g.test(filepath)) {
            if (/src\/\w+\/\w+\/Components/g.test(filepath)) {
              if (/src\/Components\//g.test(filepath)) {
                return true;
              }
              return false;
            }
            if (/src\/\w+$/g.test(filepath)) {
              if (
                new RegExp(`src\/${File.productType}`, "g").test(filepath) ||
                new RegExp(`src\/Components`, "g").test(filepath)
              ) {
                return true;
              } else {
                return false;
              }
            }
          }
        }
        return true; // remind to return a true value when file check passed.
      },
    });
  }
  // 删除新增的文件和修改
  static removeFile(rootComponents) {
    shell.exec(`rm -rf ${rootComponents}`, function (code, stdout, stderr) {
      if (stderr) {
        console.log(stderr);
      } else {
        console.log("done!!!");
      }
    });
  }
  // 删除新增的文件和修改
  static gitRestore(rootPath) {
    shell.exec(
      `cd ${rootPath} && git restore .`,
      function (code, stdout, stderr) {
        if (stderr) {
          console.log(stderr);
        } else {
          console.log("done!!!");
        }
      }
    );
  }
  getAllFile(filePath) {
    const files = fs.readdirSync(filePath);
    for (var i = 0; i < files.length; i++) {
      if (files[i] !== "Components") {
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
