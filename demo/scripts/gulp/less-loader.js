const gutil = require("gulp-util")
const path = require('path')
const { EOL } = require("os")
const less = require("less")
const applySourceMap = require('vinyl-sourcemaps-apply')
const through = require('through2')
const util = require('../util')
const PluginError = gutil.PluginError;

const PLUGIN_NAME = 'less-loader';

function parseLess(file, opts) {
  let content = file.contents.toString();
  let mod = [];
  content = content.replace(/^\s*@import\s*["|'](.*\.less)["|']/gm, (a, b) => {
    mod.push(b)
    return `@import (reference) '${b}'`
  });

  return less.render(content, opts).then(resp => {
    let imps = '';
    mod.forEach(mod => {
      imps += `@import '${util.changeExt(mod, opts.ext)}';${EOL}`;
    })

    file.contents = Buffer.from(imps + resp.css);
    file.path = util.changeExt(file.path, opts.ext)
    if (resp.map) {
      resp.map.file = file.relative;
      resp.map.sources = resp.map.sources.map(source => path.relative(file.base, source));

      applySourceMap(file, resp.map);
    }
  })
}


module.exports = function(options) {
  const opts = Object.assign({
    compress: false,
    paths: [],
    ext: 'wxss'
  }, options)

  return through.obj(function(file, enc, callback) {
    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
    }

    opts.filename = file.path;
    if (file.sourcemap) {
      opts.sourcemap = true;
    }
    
    if (file.isBuffer()) {
      parseLess(file, opts).then(() => {
        this.push(file)
        callback()
      }).catch(error => {
        return callback(new PluginError(PLUGIN_NAME, error));
      })
    }    
  });
}