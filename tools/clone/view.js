
class View {
  constructor(data) {
    this.startRender(require(data.config));
  }
  startRender(config, deep = 0) {
    ++deep;
    for (const key in config) {
      if (Object.hasOwnProperty.call(config, key)) {
        const groupOrFolder = config[key];
        if (key === "group" && Array.isArray(groupOrFolder)) {
          this.gitRepo(groupOrFolder, deep);
        } else {
          this.folder(key, deep);
          this.startRender(groupOrFolder, deep);
        }
      }
    }
  }
  gitRepo(group, number) {
    group.forEach((repo) => {
      const repoArr = repo.split("/");
      this.indent(repoArr[repoArr.length - 1], number);
    });
  }
  folder(folder, number) {
    this.indent(folder, number);
  }
  indent(folderName, number) {
    console.log(
      "|" + Array.from({ length: number }, (v) => "── ").join("") + folderName
    );
  }
}
module.exports = View;
