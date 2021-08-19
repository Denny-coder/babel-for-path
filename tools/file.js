var fs = require("fs");
var path = require("path");
class File {
  constructor(data) {
    this.data = data;
    this.dirs = [];
  }
  getAllFile(filePath) {
    fs.readdir(filePath, (err, files) => {
      for (var i = 0; i < files.length; i++) {
        fs.stat(path.join(filePath, files[i]), (err, data) => {
          if (data.isFile()) {
            this.dirs.push(files[i]);
          } else {
            this.getAllFile(files[i]);
          }
        });
      }
      console.log(this.dirs);
    });
  }
}
module.exports = File;
