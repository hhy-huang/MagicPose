/**
 * 修正自动引入缺少index的问题
 * node引入和小程序不同，node可以省略index，但小程序不可以
 */

const gutil = require("gulp-util")
const fs = require('fs-extra')
const path = require('path')
const through = require('through2');
const util = require("../util");
const PluginError = gutil.PluginError;
const findup = require('mora-scripts/libs/fs/findup');

const PLUGIN_NAME = 'fixpath-loader';

const ROOT_PATH = path.dirname(findup.pkg());
const REQUIRE_REG = /require\s*\(\s*['"]([@\w\d_\-\.\/]+)['"]\s*\)/ig
const IMPORT_REG = /from\s*['"]([@\w\d_\-\.\/]+)['"]/ig
const DEFAULT_CONFIG = {
  src: 'src',
  dist: 'dist',
  ignor: [path.join('base', 'core', 'mobx')]
}
Object.freeze(DEFAULT_CONFIG)

let config = DEFAULT_CONFIG


function isIgnor(p) {
  for (const index in config.ignor) {
    let item = config.ignor[index];
    if (p.indexOf(item) !== -1) {
      return true
    }
  }

  return false
}

function fix(filePath) {
  let p = filePath.replace(`${path.join(ROOT_PATH, config.dist)}`, `${path.join(ROOT_PATH, config.src)}`)
  let dir = path.join(ROOT_PATH, config.src)
  if (!p.startsWith(dir)) {
    p = p.replace(ROOT_PATH, dir)
  }
  return p
}


function fixPath(file) {
  let matchs = []
  let libs = []

  let content = file.contents.toString();

  // let isApp = file.path.endsWith("app.js")
  // if (isApp) {
  //   console.log(file.path)
  // }

  content.replace(REQUIRE_REG, (match, lib) => {
    matchs.push(match)
    libs.push(lib)
  })

  content.replace(IMPORT_REG, (match, lib) => {
    matchs.push(match)
    libs.push(lib)
  })

  for (let i = 0; i < libs.length; i++) {
    let lib = libs[i]
    let match = matchs[i]
    
    // 不是相对位置的, 先别管（NPM包）
    if (!lib.startsWith('.')) {
      continue
    }

    let p = path.join(path.dirname(file.path), lib)
    p = fix(p)

    if (isIgnor(p)) {
      continue
    }
    
    if (util.isFile(p) || util.isFile(p+'.js') || util.isFile(p+'.ts')) {
      continue
    }

    if (util.isDirectory(p) && (util.isFile(path.join(p, 'index.js')) || util.isFile(path.join(p, 'index.ts')))) {
      if (match.startsWith('from')) {
        content = content.replace(match, `from "${lib}/index"`)
      } else {
        content = content.replace(match, `require('${lib}/index')`)
      }
    }
  }

  file.contents = Buffer.from(content)
}


module.exports = function(options) {
  config = Object.assign({}, DEFAULT_CONFIG, options)

  return through.obj(function(file, enc, callback) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return callback();
    }
    
    if (file.isBuffer()) {
      fixPath(file)
    }

    this.push(file)
    callback();
  });
}