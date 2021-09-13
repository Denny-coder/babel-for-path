const File = require("./file");
const Babel = require("./babel");
const path = require("path");
const ncp = require("ncp").ncp;
const scssParse = require("postcss-scss/lib/scss-parse");
const scssStringify = require("postcss-scss/lib/scss-stringify");
ncp.limit = 16;
class XPath {
  constructor(data) {
    this.data = data;
    this.fs = new File(data);
    this.fs.getAllFile(data.root);
    this.moveComponents(() => {
      this.startJs();
      this.startScss();
    });
  }
  moveComponents(cb) {
    if (this.fs.existsSync(this.fs.rootComponents)) {
      const destination = path.join(this.fs.rootComponents, "../../Components");
      if (!this.fs.existsSync(destination)) {
        ncp(this.fs.rootComponents, destination, (err) => {
          if (err) {
            return console.error(err);
          } else {
            cb();
            console.log("done!");
          }
        });
      } else {
        cb();
      }
    } else {
      const sourceDB = path.join(
        this.fs.rootComponents.split("Corp_Wirless_Vue")[0],
        "Corp_Wirless_DB/APP"
      );
      ncp(sourceDB, this.fs.rootComponents, (err) => {
        if (err) {
          return console.error(err);
        }
        this.moveComponents(cb);
      });
    }
  }
  startJs() {
    this.fs.jsFileList.forEach((filePath) => {
      const source = this.fs.readFile(filePath);
      const result = Babel.ast(source);
      console.log("currentFilecurrentFilecurrentFile", filePath);
      result.program.body.forEach((program) => {
        // import 导入时
        if (
          program.type === "ImportDeclaration" &&
          /(Components)/.test(program.source.value)
        ) {
          this.ImportDeclaration(program, filePath);
        }
        // require 导入并赋值时
        if (
          program.type === "VariableDeclaration" &&
          Array.isArray(program.declarations)
        ) {
          program.declarations.forEach((declaration) => {
            if (
              declaration.type === "VariableDeclarator" &&
              declaration.init &&
              declaration.init.callee &&
              declaration.init.callee.name === "require" &&
              Array.isArray(declaration.init.arguments)
            ) {
              declaration.init.arguments.forEach((initProgram) => {
                this.RequireInit(initProgram, filePath);
              });
            }
          });
        }
        // require 仅导入时
        if (
          program.type === "ExpressionStatement" &&
          program.expression &&
          program.expression.callee &&
          program.expression.type === "CallExpression" &&
          program.expression.callee.name === "require" &&
          Array.isArray(program.expression.arguments)
        ) {
          program.expression.arguments.forEach((initProgram) => {
            this.RequireInit(initProgram, filePath);
          });
        }
        // if判断 require.ensure倒入时
        if (
          program.type === "IfStatement" &&
          program.consequent &&
          program.consequent.type === "BlockStatement" &&
          Array.isArray(program.consequent.body)
        ) {
          program.consequent.body.forEach((consequentProgram) => {
            if (
              consequentProgram.type === "ExpressionStatement" &&
              consequentProgram.expression &&
              consequentProgram.expression.type === "CallExpression" &&
              Array.isArray(consequentProgram.expression.arguments)
            ) {
              consequentProgram.expression.arguments.forEach(
                (arrayExpressionProgram) => {
                  if (
                    arrayExpressionProgram.type === "ArrayExpression" &&
                    Array.isArray(arrayExpressionProgram.elements)
                  ) {
                    arrayExpressionProgram.elements.forEach((item) => {
                      this.RequireInit(item, filePath);
                    });
                  }
                }
              );
            }
          });
        }
      });
      try {
        const targetCode = Babel.generate(result, { sourceMaps: true }, source);
        this.fs.writeFileSync(filePath, targetCode);
      } catch (error) {
        console.log(error);
      }
    });
  }
  startScss() {
    this.fs.scssFileList.forEach((filePath) => {
      const input = this.fs.readFile(filePath);
      let parser = scssParse(input);
      parser.nodes.forEach((program) => {
        this.ScssImport(program, filePath);
      });
      try {
        let targetCode = "";
        scssStringify(parser, (i) => {
          targetCode += i;
        });
        this.fs.writeFileSync(filePath, targetCode);
      } catch (error) {
        console.log(error);
      }
    });
  }
  // import 导入时
  ImportDeclaration(program, filePath) {
    //   const targetFilePath = path.join(this.fs.rootComponents, program.source.value);
    //   console.log("resolve", path.relative(filePath, this.fs.rootComponents));
    //   console.log("relative", path.relative(filePath, this.fs.targetPath));
    const currentPath = path.parse(filePath);
    console.log("currentPath", currentPath.dir);
    console.log("targetPath", program.source.value);
    let targetFile = path.resolve(currentPath.dir, `${program.source.value}`);
    console.log("targetFile", targetFile);
    const xPath = path.relative(filePath, targetFile);
    console.log("xPath", xPath);
    const xPathFile = path.resolve(currentPath.dir, xPath);
    if (this.fs.isFile(`${xPathFile}.js`)) {
      console.log(require("os").platform());
      program.source.value = xPath.split(path.sep).join("/");
    }
  }
  // require 导入
  RequireInit(program, filePath) {
    if (/(Components)/.test(program.value)) {
      //   const targetFilePath = path.join(this.fs.rootComponents, program.source.value);
      //   console.log("resolve", path.relative(filePath, this.fs.rootComponents));
      //   console.log("relative", path.relative(filePath, this.fs.targetPath));
      const currentPath = path.parse(filePath);
      console.log("currentPath", currentPath.dir);
      console.log("targetPath", program.value);
      let targetFile = path.resolve(currentPath.dir, program.value);
      console.log("targetFile", targetFile);
      const xPath = path.relative(filePath, targetFile);
      console.log("xPath", xPath);
      const xPathFile = path.resolve(currentPath.dir, xPath);
      if (this.fs.isFile(`${xPathFile}.js`)) {
        program.value = xPath.split(path.sep).join("/");
      }
    }
  }
  // scss @import
  ScssImport(program, filePath) {
    if (program.name === "import" && /(Components)/.test(program.params)) {
      //   const targetFilePath = path.join(this.fs.rootComponents, program.source.params);
      //   console.log("resolve", path.relative(filePath, this.fs.rootComponents));
      //   console.log("relative", path.relative(filePath, this.fs.targetPath));
      const currentPath = path.parse(filePath);
      const targetPath = program.params.replace(/'|"/g, "");
      console.log("currentPath", currentPath.dir);
      console.log("targetPath", path.parse(targetPath));
      const parseFile = path.parse(targetPath);
      let targetFile = path.resolve(currentPath.dir, targetPath);
      let targetFileLine = path.resolve(
        currentPath.dir,
        `${parseFile.dir}/_${parseFile.name}${parseFile.ext}`
      ); // 为了兼容带_的文件名
      console.log("targetFile", targetFile);
      console.log("targetFile", targetFileLine);
      const xPath = path.relative(filePath, targetFile);
      const xPathLine = path.relative(filePath, targetFileLine);
      console.log("xPath", xPath);
      console.log("xPath", xPathLine);
      const xPathFile = path.resolve(currentPath.dir, xPath);
      const xPathFileLine = path.resolve(currentPath.dir, xPathLine);
      if (this.fs.isFile(`${xPathFile}.scss`) || this.fs.isFile(xPathFile)) {
        program.params = '"' + xPath.split(path.sep).join("/") + '"';
      } else if (
        this.fs.isFile(`${xPathFileLine}.scss`) ||
        this.fs.isFile(xPathFileLine)
      ) {
        program.params = '"' + xPathLine.split(path.sep).join("/") + '"';
      }
    }
  }
}
module.exports = XPath;
