var fs = require("fs");

class TranslateMap {
  constructor() {
    this.startMap(
      "/Users/denny/Downloads/workSpace/vue-release/corp_wirless_vue_flight/src/Flight/Booking/Search/_DB.js"
    );
  }
  startMap(path) {
    const content = fs.readFileSync(path);
    console.log(content)
  }
}
module.exports = TranslateMap;
