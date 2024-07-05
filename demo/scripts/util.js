const fs = require('fs-extra');
const path = require('path');
const JSON5 = require('json5');


/**
 * 判断是否是page路径（绝对路径）
 * - 目录: page目录
 * - 文件: page目录中的文件
 * @param {string} _path 
 * 
 * 判断条件：
 * - 目录下有cjson文件、wxml文件
 * - cjson中component是false
 */
function isPagePath(_path) {
  if (!path.isAbsolute(_path)) {
    console.log('请使用绝对路径 path:', _path);
    return false;
  }

  // 如果不存在, 肯定不是
  if (!fs.existsSync(_path)) {
    console.log('不是文件或目录 path:', _path);
    return false;
  }

  let stat = fs.lstatSync(_path);

  if (!stat.isDirectory()) {
    let p = path.dirname(_path);
    return isPagePath(p);
  }

  if (stat.isDirectory()) {
    let files = fs.readdirSync(_path);

    let hasWXML = false, hasJSON = false;
    files.forEach(file => {
      let filePath = path.join(_path, file);
      let stat = fs.lstatSync(filePath);
      if (!stat.isFile()) {
        return;
      }

      let extname = path.extname(file);
      if (extname.endsWith('json')) {
        let content = fs.readFileSync(filePath).toString();
        let json = JSON5.parse(content);
        // 排除掉组件
        if (!json['component']) {
          hasJSON = true;
        }
      } else if (extname.endsWith('wxml')) {
        hasWXML = true;
      }
    })

    return hasJSON && hasWXML;
  }
}

function camelCase(str) {
   return str.replace(/[-_](\w)/g, (r, k) => k.toUpperCase()) 
}

function toTypeString(value) {
  return Object.prototype.toString.call(value)
}

function isPlainObject(val) {
  return toTypeString(val) === '[object Object]'
}

function isArray(val) {
  return Array.isArray(val)
}

function isDef(val) {
  return val !== undefined && val !== null
}

function isFile(val) {
  return fs.existsSync(val) && fs.lstatSync(val).isFile();
}

function isDirectory(val) {
  return fs.existsSync(val) && fs.lstatSync(val).isDirectory();
}

function hasProperty(val, name) {
  return Object.prototype.hasOwnProperty.call(val, name)
}

function changeExt(npath, ext) {
  ext = ext.startsWith('.') ? ext : '.' + ext;

  let nFileName = path.basename(npath, path.extname(npath)) + ext;
  let nFilePath = path.join(path.dirname(npath), nFileName);

  let char = npath.slice(0, 2);
  if (char === '.' + path.sep || char === './') {
    return '.' + path.sep + nFilePath;
  }

  return nFilePath;
}

module.exports = {
  isPagePath,
  camelCase,
  isPlainObject,
  isArray,
  isDef,
  hasProperty,
  changeExt,
  isFile,
  isDirectory
}