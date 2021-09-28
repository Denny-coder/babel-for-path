/*
 * @Author: your name
 * @Date: 2021-09-16 17:27:07
 * @LastEditTime: 2021-09-16 17:36:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /babel-for-path/tools/ncp.js
 */
const ncp = require("ncp").ncp;
ncp.limit = 16;
const ncpPromise = function (source, destination) {
  return new Promise(function (resolve, reject) {
    ncp(source, destination, (err) => {
      resolve(err);
    });
  });
};
module.exports = ncpPromise;
