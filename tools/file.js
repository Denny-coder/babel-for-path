var fs = require("fs");
var path = require("path");
class File {
  constructor(data) {
    this.data = data;
  }
  getAllFile() {
    let dirs = [];
    fs.readdir(this.data.root, (err, files) => {
      for (var i = 0; i < files.length; i++) {
        fs.stat(path.join(this.data.root, files[i]), function (err, data) {
          if (data.isFile()) {
            dirs.push(files[i]);
          }
        });
      }
      console.log(dirs);
    });
  }
}
module.exports = File;
