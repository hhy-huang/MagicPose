'use strict';
const through = require('through2');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const JSON5 = require('json5');
const util = require('../util')

// 常量
const PLUGIN_NAME = 'cjson-loader';

function dealFile(file) {
  try {
    let json = JSON5.parse(file.contents.toString(), (key, value) => {
      if (key === '$schema') {
        return undefined
      }

      return value
    })

    // 去掉@符号
    if (util.isPlainObject(json.usingComponents)) {
      for (const key in json.usingComponents) {
        let value = json.usingComponents[key];
        json.usingComponents[key] = value.replace("@", "");
      }
    }

    file.contents = Buffer.from(JSON.stringify(json, null, 2))
  } catch (e) {
    console.error(PLUGIN_NAME, `解析${file.name}文件错误`)
  }

  file.path = util.changeExt(file.path, 'json');
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

module.exports = trans