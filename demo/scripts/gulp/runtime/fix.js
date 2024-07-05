/**
 * 修正regeneratorRuntime报错
 * - 引入runtime.js
 */

const gutil = require('gulp-util')
const path = require('path');
const through = require("through2");
const fse = require('fs-extra');
const glob = require('glob');
const chalk = require("chalk");
const findup = require('mora-scripts/libs/fs/findup');
const util = require("../../util");

const PLUGIN_NAME = 'runtime';
const DEST_NODE_DIR = 'miniprogram_npm';
const PATH_OTHER = /^\.\.\/\.\.\//    // ../../ => ../
const PATH_SAME = /^\.\.\//           // ../ => ./
const ROOT_PATH = path.dirname(findup.pkg());

const DEFAULT_CONFIG = {
  src: 'src',
  dest: 'dist',
}

let config = DEFAULT_CONFIG;


/**
 * 将 runtime 复制到 DEST_NODE_DIR
 */
function checkAndInitRuntime() {
  let dir = path.join(ROOT_PATH, config.dest, DEST_NODE_DIR);
  if (!util.isDirectory(dir)) {
    fse.ensureDirSync(dir);
  }

  let runtime = path.join(dir, 'runtime.js');
  if (!util.isFile(runtime)) {
    let source = path.join(__dirname, 'runtime.js');
    fse.copyFileSync(source, runtime);
  }
}

function getRelativePath(file) {
  let runtime = path.join(ROOT_PATH, config.dest, DEST_NODE_DIR, 'runtime.js');
  let relativePath = path.relative(file, runtime);
  relativePath = relativePath.replace(/\\/g, '/')
  if (PATH_OTHER.test(relativePath)) {
    relativePath = relativePath.replace(PATH_OTHER, '../');
  } else if (PATH_SAME.test(relativePath)) {
    relativePath = relativePath.replace(PATH_SAME, './');
  }
  return relativePath;
}

function fixRuntime() {
  glob(`./${config.dest}/**/*.js`, (err, files) => {
    files.forEach(file => {
      if (file.includes('/dist/miniprogram_npm/runtime.js')) {
        console.log('ignore runtime.js')
        return;
      }

      fixFile(path.join(ROOT_PATH, file));
    })
  })
}

function fixFile(file) {
  checkAndInitRuntime();

  let content = fse.readFileSync(file).toString();
  let relativePath = getRelativePath(file);
  let importInfo = `var regeneratorRuntime = require("${relativePath}");\n`

  if (!content.includes(importInfo)) {
    content = importInfo + content;
    fse.writeFileSync(file, content);
  }
}

function dealFile(file) {
  try {
    let content = file.contents.toString();
    let relativePath = getRelativePath(file.path);
    let importInfo = `var regeneratorRuntime = require("${relativePath}");\n`
    if (!content.includes(importInfo)) {
      content = importInfo + content;
      file.contents = Buffer.from(content);
    }
  } catch (e) {
    console.error(PLUGIN_NAME, `解析${file.name}文件错误`)
  }
}

// 插件级别函数
function trans() {
  return through.obj(function (file, unused, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }
    
    if (file.isBuffer()) {
      dealFile(file)
    }

    // 确保文件进入下一个 gulp 插件
    this.push(file);

    // 告诉 stream 引擎，我们已经处理完了这个文件
    cb();
  })
}

module.exports = {
  fixRuntime: fixRuntime,
  runtime: trans
}