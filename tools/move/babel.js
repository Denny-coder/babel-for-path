var babel = require("@babel/core");
class Babel {
  static ast(code) {
    var result = babel.parse(code, {
      ast: true,
      code: false,
    });
    return result;
  }
  static generate(ast, otp, code) {
    const result = babel.transformFromAstSync(ast, code, otp);
    return result.code;
  }
}
module.exports = Babel;
