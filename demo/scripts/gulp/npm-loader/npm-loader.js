const gutil = require('gulp-util')
const path = require('path');
const through = require("through2");
const fse = require('fs-extra');
const chalk = require("chalk");
const util = require("../../util");
const findup = require('mora-scripts/libs/fs/findup');

const PLUGIN_NAME = 'npm-loader';

const DEST_NODE_DIR = 'miniprogram_npm';
const REQUIRE_REG = /require\s*\(\s*['"]([@\w\d_\-\.\/]+)['"]\s*\)/ig
const IMPORT_REG = /from\s*['"]([@\w\d_\-\.\/]+)['"]/ig
const PATH_OTHER = /^\.\.\/\.\.\//    // ../../ => ../
const PATH_SAME = /^\.\.\//           // ../ => ./

const DEFAULT_CONFIG = {
  src: 'src',
  dest: 'dist',
  node_modules: '../node_modules',
  log: false,
  ignore: [path.join(DEST_NODE_DIR, 'global')],
  /** 不引入自定义global的列表 */
  global_ignore: [],
  /** 重新定义引入文件，而不是package.main。例如mobx */
  npm_paths: {

  }
}

Object.freeze(DEFAULT_CONFIG)

let config = DEFAULT_CONFIG

const ROOT_PATH = path.dirname(findup.pkg());

class NpmLoader {
  constructor() {
    this.initDependencies()
  }

  init({file, enc, callback}) {
    this.cache = {};
    this.gulp = {
      file,
      enc,
      callback
    };
  }

  fixPath(filepath) {
    let dist = path.join(ROOT_PATH, config.dest);
    if (!filepath.startsWith(dist)) {
      return filepath.replace(ROOT_PATH, dist)
    } else {
      return filepath
    }
  }

  srcToDest(source) {
    return source.replace(path.join(ROOT_PATH, config.src), path.join(ROOT_PATH, config.dest));
  }

  destToSrc(source) {
    return source.replace(path.join(ROOT_PATH, config.dest), path.join(ROOT_PATH, config.src));
  }

  destDir() {
    return path.join(ROOT_PATH, config['dest']);
  }

  srcDir() {
    return path.join(ROOT_PATH, config['src']);
  }

  destNodeDir() {
    return path.join(this.destDir(), DEST_NODE_DIR);
  }

  srcNodeDir() {
    return path.join(this.srcDir(), config['node_modules']);
  }

  isIgnore(p) {
    for (const index in config.ignore) {
      let item = config.ignore[index];
      if (p.indexOf(item) !== -1) {
        return true
      }
    }
  
    return false
  }

  initDependencies() {
    let pkgPath = path.join(ROOT_PATH, 'package.json');
    let content = fse.readFileSync(pkgPath, {encoding: 'utf8'});
    let pkg = JSON.parse(content.toString());
    this.deps = pkg['dependencies'];
  }

  isDeps(pkg) {
    return this.deps && (pkg in this.deps)
  }

  copyNpmComponents() {
    if (!this.deps) { return; }
    
    for (const lib in this.deps) {
      let pkg = this.getPkgConfig(lib, {encoding: 'utf8'});

      if (!pkg || !pkg['miniprogram']) {
        continue;
      }

      let miniprogram = pkg['miniprogram'];
      let srcPath = path.join(this.srcNodeDir(), lib, miniprogram);
      let destPath = path.join(this.destNodeDir(), lib);
      if (util.isDirectory(srcPath)) {
        fse.ensureDirSync(destPath)
        fse.copySync(srcPath, destPath);
      }
    }
  }

  fixGlobalAndWindow(code, filePath) {
    if (/global|window/.test(code)) {
      let destPath = path.join(this.destDir(), DEST_NODE_DIR, 'global.js');
      let relativePath = path.relative(filePath, destPath)
      relativePath = relativePath.replace(/\\/g, '/')
      if (PATH_OTHER.test(relativePath)) {
        relativePath = relativePath.replace(PATH_OTHER, '../');
      } else if (PATH_SAME.test(relativePath)) {
        relativePath = relativePath.replace(PATH_SAME, './');
      }

      code = `var global=window=require('${relativePath}');\n` + `${code}`;

      // 复制global文件
      if (!util.isFile(destPath)) {
        config['log'] && gutil.log(`fixGlobalAndWindow relativePath => ${chalk.cyan(relativePath)} file: ${chalk.cyan(filePath)}`)

        let srcPath = path.join(__dirname, 'global.js');
        let content = fse.readFileSync(srcPath, {encoding: this.gulp.enc}).toString();
        fse.outputFileSync(destPath, content, {encoding: this.gulp.enc});
      }
    }

    return code;
  }

  fixNPM(code) {
    code = code.replace(/([\w\[\]a-d\.]+)\s*instanceof Function/g, function (matchs, word) {
      return ' typeof ' + word + " === 'function' ";
    });
    code = code.replace(/'use strict';\n?/g, '');

    if (/[^\w_]process\.\w/.test(code) && !/typeof process/.test(code)) {
      code = `let process={};${code}`;
    }
    return code;
  }

  npmHack(filename, code) {
    switch (filename) {
      case 'lodash.js':
      case '_global.js':
        code = code.replace('Function(\'return this\')()', 'this');
        break;
      case '_html.js':
        code = 'module.exports = false;';
        break;
      case '_microtask.js':
        code = code.replace('if(Observer)', 'if(false && Observer)');
        // IOS 1.10.2 Promise BUG
        code = code.replace('Promise && Promise.resolve', 'false && Promise && Promise.resolve');
        break;
    }
    return code;
  }

  // 获取npm lib名
  getNpmLib(destPath) {
    let nodeModulePath = this.destNodeDir();
    let index = destPath.indexOf(nodeModulePath);
    if (index !== -1) {
      let paths = (destPath+'').substr(index+nodeModulePath.length).split(path.sep).filter(k => !!k);
      let lib = "";
      for (let i = 0; i < paths.length; i++) {
        lib = path.join(lib, paths[i]);
        if (util.isFile(path.join(this.srcNodeDir(), lib, "package.json"))) {
          lib = lib.replace(/\\/g, '/')
          return lib;
        }
      }
    }

    return '';
  }

  copyNPMDeps(code, destPath, currentNodeSrcDir, isNPM) {
    if (this.cache[destPath]) {
      return;
    }

    this.cache[destPath] = true;

    let err = null;
    let destNodeDir = this.destNodeDir();
    let destDir = path.parse(destPath).dir;
    let libs = [];
    let matchs = [];

    if (isNPM) {
      let lib = this.getNpmLib(destPath);
      if (lib && !config.global_ignore.includes(lib)) {
        code = this.fixGlobalAndWindow(code, destPath);
      }
    }
    
    code.replace(REQUIRE_REG, (match, lib) => {
      libs.push(lib);
      matchs.push(match);
    });

    code.replace(IMPORT_REG, (match, lib) => {
      libs.push(lib);
      matchs.push(match);
    });

    for (let i = 0; i < libs.length; i++) {
      let lib = libs[i];
      let match = matchs[i];
      if (err) {
        break;
      }

      let p = path.join(destDir, lib)
      if (this.isIgnore(p)) {
        continue
      }

      let ext = '';
      let resolved = lib;
      let dep;
      let relative = '';

      if (lib[0] === '.') { // require('./something'');
        if (!isNPM) {
          continue;
        }

        dep = path.join(currentNodeSrcDir, lib);
        if (util.isDirectory(dep) && util.isFile(path.join(dep, 'index.js'))) {
          ext = path.sep + 'index.js';
        } else if (util.isFile(dep+".js")) {
          ext = ".js";
        } else if (util.isFile(dep)) {
          ext = '';
        } else {
          err = new gutil.PluginError(PLUGIN_NAME, 'File not found:' + dep);
          break;
        }
        
        relative = '';
      } else {
        let pkg = this.getPkgConfig(lib, this.gulp.enc);

        if (pkg) { // require("@we-app/core") || require('asset');
          if (config.npm_paths[pkg.name] && typeof config.npm_paths[pkg.name] === 'string') {
            ext = config.npm_paths[pkg.name]
          } else {
            ext = pkg.main || 'index.js';

            if (lib.indexOf("mobx") !== -1) {
              console.log("FIND MOBX 1", lib, pkg.name, config.npm_paths)
            }
  
            // TODO: 可能不需要
            if (pkg.browser && typeof pkg.browser === 'string') {
              ext = pkg.browser;
            }
          }
          
          if (ext.indexOf('./') == 0) {
            ext = ext.replace('./', '');
          }
          ext = path.sep + ext;
          dep = path.join(this.srcNodeDir(), lib);
          relative = path.relative(destDir, destNodeDir);
        } else {
          if (lib.indexOf('/') === -1 || lib.indexOf('/') === lib.length - 1) { // require('asset');
            err = new gutil.PluginError(PLUGIN_NAME, 'Package not found:' + lib);
            break;
          } else {
            dep = path.join(this.srcNodeDir(), lib);

            if (lib.indexOf("mobx") !== -1) {
              console.log("FIND MOBX 2", lib)
            }

            if (util.isDirectory(dep) && util.isFile(dep + path.sep + 'index.js')) {
              ext = path.sep + 'index.js';
            } else if (util.isFile(dep + '.js')) {
              ext = '.js';
            } else if (util.isFile(dep)) {
              ext = '';
            } else {
              err = new gutil.PluginError(PLUGIN_NAME, 'File not found:' + dep);
              break;
            }
            relative = path.relative(destDir, destNodeDir);
          }
        }
      }

      resolved = path.join(relative, lib + ext);

      // 修复同级不是相对目录问题
      if (!resolved.startsWith('.')) {
        resolved = `./${resolved}`;
      }

      let npmPathString = dep.endsWith(ext) ? dep : dep + ext;
      let npmPath = path.parse(npmPathString);

      let outPath = path.join(ROOT_PATH, config['dest'], DEST_NODE_DIR, npmPathString.replace(this.srcNodeDir(), ''));

      if (lib != resolved && lib !== 'tslib') {
        config['log'] && gutil.log(`Replace dependence: from(${chalk.cyan(lib)}) to(${chalk.cyan(resolved)}) file: ${outPath}`);
      }

      resolved = resolved.replace(new RegExp('\\' + path.sep, 'g'), '/'); //Fix #1

      if (match.startsWith('from')) {
        code = code.replace(match, `from '${resolved}'`);
      } else {
        code = code.replace(match, `require('${resolved}')`);
      }

      if (this.cache[outPath]) {
        continue;
      }

      let depCode = fse.readFileSync(npmPathString, {
        encoding: this.gulp.enc
      });

      err = this.copyNPMDeps(depCode.toString(), outPath, npmPath.dir, true).err;
    }

    if (isNPM && !err && !util.isFile(destPath)) {
      config['log'] && gutil.log(`Copy npm (${chalk.cyan(this.getNpmLib(destPath))}) to (${chalk.cyan(destPath)})`);
      code = this.npmHack(path.parse(destPath).base, code);
      code = this.fixNPM(code);
      code = this.doPlugins(code, destPath);
      fse.outputFileSync(destPath, code, {
        encoding: this.gulp.enc
      });
    }

    return {
      code: code,
      err: err
    };
  }

  getPkgConfig(lib, enc) {
    let pkg = null
    try {
      pkg = fse.readFileSync(path.join(this.srcNodeDir(), lib, 'package.json'), enc);
      pkg = JSON.parse(pkg.toString());
    } catch (error) {}

    return pkg;
  }

  doPlugins(depCode, destPath) {
    let result = depCode;
    let plugins = config.plugins;
    if (config.plugins) {
      for (let i = 0; i < plugins.length; i++) {
        let plugin = plugins[i];
        result = plugin(result, destPath, this.gulp);
      }
    }
    return result;
  }
}

const loader = new NpmLoader();
function trans(options) {
  config = Object.assign({}, DEFAULT_CONFIG, options);
  return through.obj(function (file, enc, callback) {
    loader.init({
      file,
      enc,
      callback
    })

    let sourceCode = file.contents.toString(enc);
    let filePath = loader.fixPath(file.path)
    let {
      err,
      code
    } = loader.copyNPMDeps(sourceCode, loader.srcToDest(filePath), loader.srcNodeDir(), false);

    file.contents = Buffer.from(code);
    this.push(file)

    if (err) {
      this.emit('error', err)
    }

    callback();
  });
}

function copyNpmComponents(options) {
  config = Object.assign(config, options);
  const loader = new NpmLoader();
  loader.copyNpmComponents();
}

module.exports = {
  loader: trans,
  copyNpmComponents
}