const File = require("./file");
const Babel = require("./babel");
const ncp = require("./ncp");
const path = require("path");
const scssParse = require("postcss-scss/lib/scss-parse");
const scssStringify = require("postcss-scss/lib/scss-stringify");
const config = require("../utils/const");
class XPath {
  constructor(data) {
    this.data = data;
    this.fs = new File(data);
    this.level =
      config[File.productType === "Flight" ? "Flight" : "Hotel"].level;
    this.fs.getAllFile(data.root);
  }
  async start() {
    await this.moveComponents();
    this.startJs();
    this.startScss();
  }
  async moveComponents() {
    if (this.fs.existsSync(this.fs.rootComponents)) {
      XPath.destination = path.join(
        this.fs.rootComponents,
        `../${this.level}Components`
      );
      if (!this.fs.existsSync(XPath.destination)) {
        const ncpRes = await ncp(this.fs.rootComponents, XPath.destination);
        if (ncpRes) {
          return console.error(ncpRes);
        } else {
          console.log("donedonedonedonedone!");
        }
      }
    } else {
      const sourceDB = path.join(
        this.fs.rootComponents.split("Corp_Wirless_Vue")[0],
        "Corp_Wirless_DB/APP"
      );
      const ncpRes = await ncp(sourceDB, this.fs.rootComponents);
      if (ncpRes) {
        return console.error(ncpRes);
      }
      await this.moveComponents();
    }
  }
  startJs() {
    this.fs.jsFileList.forEach((filePath) => {
      const source = this.fs.readFile(filePath);
      const result = Babel.ast(source);
      result.program.body.forEach((program) => {
        // import 导入时
        if (program.type === "ImportDeclaration") {
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
    if (/(Components)/.test(program.source.value) && !/\/H5\//.test(filePath)) {
      const [xPath, xPathFile] = this.getRelativePath(
        program.source.value,
        filePath
      );
      if (
        this.fs.isFile(xPathFile) ||
        this.fs.isFile(`${xPathFile}.js`) ||
        this.fs.isFile(path.join(xPathFile, "./index.js"))
      ) {
        program.source.value = xPath.split(path.sep).join("/");
      } else {
        console.log(filePath);
      }
    }
  }
  // require 导入
  RequireInit(program, filePath) {
    if (/(Components)/.test(program.value) && !/\/H5\//.test(filePath)) {
      const [xPath, xPathFile] = this.getRelativePath(program.value, filePath);
      if (
        this.fs.isFile(xPathFile) ||
        this.fs.isFile(`${xPathFile}.js`) ||
        this.fs.isFile(path.join(xPathFile, "./index.js"))
      ) {
        program.value = xPath.split(path.sep).join("/");
      } else {
        console.log(filePath);
      }
    }
  }
  // scss @import
  ScssImport(program, filePath) {
    if (
      program.name === "import" &&
      /(Components)/.test(program.params) &&
      !/\/H5\//.test(filePath)
    ) {
      const targetPath = program.params.replace(/'|"/g, "");
      const parseFile = path.parse(targetPath);
      const targetPathLine = `${parseFile.dir}/_${parseFile.name}${parseFile.ext}`;
      const [xPath, xPathFile] = this.getRelativePath(targetPath, filePath);
      const [xPathLine, xPathFileLine] = this.getRelativePath(
        targetPathLine,
        filePath
      );
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
  getRelativePath(programPath, filePath) {
    const xPath = path.join(`${this.level}${programPath}`);
    const xPathFile = path.join(filePath, `../${xPath}`);
    return [xPath, xPathFile];
  }
}
module.exports = XPath;
