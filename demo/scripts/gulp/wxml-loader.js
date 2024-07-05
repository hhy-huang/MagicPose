'use strict';
const through = require('through2');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const OS = require('os');
const EOL = OS.EOL;
const parser = require('@minapp/wxml-parser');

// 常量
const PLUGIN_NAME = 'wxml-loader';

/**
 * 1. bind:xxx 和 catch:xxx => bindxxx 和 catchxxx
 * 2. 将 aaa.sync="bbb" xxx.sync="yyy" => aaa="{{bbb}}" xxx="{{yyy}}" minappsync="aaa=bbb&xxx=yyy"
 */
function updateNode(nodes) {
  iterateTagNode(nodes, (node) => {
    let minappsync = []

    if (!node || !node.attrs) {
      return;
    }

    node.attrs.forEach(attr => {
      let {name, value} = attr

      if (!name || !value) return;

      if (/^(bind|catch):(\w+)$/.test(name)) {
        attr.name = RegExp.$1 + RegExp.$2
      } else if (name.endsWith('.sync') && typeof value === 'string') {
        name = name.substr(0, name.length - 5)
        value = stripBrackets(value)

        attr.name = name
        if (value.includes('@')) {
          let temp = value.split('@')
          minappsync.push(`${name}=${temp[1]}`)
          attr.value = `{{${temp[0]}}}`
        } else {
          minappsync.push(`${name}=${value}`)
          attr.value = `{{${value}}}`
        }
      }
    })

    if (minappsync.length > 0) {
      node.attrs.push(
        new parser.TagNodeAttr('minappsync', minappsync.join('&'), '"'),
        new parser.TagNodeAttr('bindminappsyncupdate', 'minappsyncupdate', '"')
      )
    }
  })
}

function iterateTagNode(ns, callback) {
  ns.forEach(n => {
    if (n && n.is(parser.Node.TYPE.TAG)) {
      callback(n)
      iterateTagNode(n.children, callback)
    }
  })
}

/**
 * 去除 str 中的 {{ }} 符号
 */
function stripBrackets(str) {
  if (typeof str !== "string") {
    return "";
  }

  return str.startsWith('{{') && str.endsWith('}}')
    ? str.substr(2, str.length - 4).trim()
    : str
}

// 插件级别函数
function trans() {
  return through.obj(function (file, unused, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }

    if (!file || !file.contents) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'file content not valid!'));
      return cb();
    }
    
    try {
      let xml = parser.parse(file.contents.toString())
      updateNode(xml.nodes)

      let content = xml.toXML({reserveTags: ['text']})
      file.contents = Buffer.from(content)

      // 确保文件进入下一个 gulp 插件
      this.push(file);
    } catch (e) {
      this.emit('error', new PluginError(PLUGIN_NAME, `解析${file.name}错误`))
    }
    
    // 告诉 stream 引擎，我们已经处理完了这个文件
    cb();
  })
}

module.exports = trans