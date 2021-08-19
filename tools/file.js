var fs = require("fs");
var path = require("path");
const targetFile = /(\.js)|(\.scss)|(\.vue)/;
class File {
  constructor(data) {
    this.data = data;
    this.rootComponents = path.join(data.root, "./Components");
    this.dirs = [];
  }
  async getAllFile(filePath) {
    const files = fs.readdirSync(filePath);
    for (var i = 0; i < files.length; i++) {
      const subPath = path.join(filePath, files[i]);
      if (subPath !== this.rootComponents) {
        const data = fs.statSync(subPath);
        if (data.isFile()) {
          if (targetFile.test(files[i])) {
            this.dirs.push(subPath);
          }
        } else {
          this.getAllFile(subPath);
        }
      }
    }
  }
}
module.exports = File;
