/**
 * 生成pages路径
 * - base_app: 注入页面路径
 * - app.json: 注入页面路径信息
 */

const fs = require('fs');
const EOL = require('os').EOL;
const path = require('path');
const findup = require('mora-scripts/libs/fs/findup');
const inject = require('mora-scripts/libs/fs/inject');
const JSON5 = require('json5');
const util = require('../util');

const ROOT_PATH = path.dirname(findup.pkg());

const DEFAULT_CONFIG = {
  src: 'src',
  index: 'pages/index/index',
  main: ['pages'],
  sub: ['subpackages'],
  baseApp: path.join('base', 'base_app.ts'),
  appJson: 'app.cjson'
}
Object.freeze(DEFAULT_CONFIG)

let config = DEFAULT_CONFIG

// baseApp注入模板
const BASE_APP_TEMPLETE = `
// @ts-ignore
$url: {
#URL_DEFINE#
};

/** 自动生成方法, 不要覆盖 */
protected __initHomeUrl() {
  // @ts-ignore
  #HOME_VALUE#

  // @ts-ignore
  this.$url = {};
#URL_VALUE#
}
`

// 页面的路径 "pages/index/index"
let pages_path = []
// 分包的路径
let subpages_path = []

function genPagesPath() {
  pages_path = []
  config.main.forEach((pagePath) => {
    let fPath = path.join(ROOT_PATH, config.src, pagePath);

    if (util.isDirectory(fPath)) {
      const files = fs.readdirSync(fPath)
      iterateDir(pages_path, files, pagePath);
    }
  })
}

function genSubPagesPath() {
  subpages_path = []

  config.sub.forEach(subPath => {
    let fPath = path.join(ROOT_PATH, config.src, subPath);
    if (util.isDirectory(fPath)) {
      const files = fs.readdirSync(fPath);
      files.forEach(dname => {
        let spath = path.join(fPath, dname);
        let page = {
          name: dname,
          root: `${subPath}/${dname}`,
          pages: []
        }
        subpages_path.push(page)
        
        if (util.isDirectory(spath)) {
          const sfiles = fs.readdirSync(spath)
          iterateDir(page.pages, sfiles, path.join(subPath, dname))
        }
      })
    }
  })

  // 处理pages
  subpages_path.forEach(item => {
    let root = item.root
    for (let index = 0; index < item.pages.length; index++) {
      let page = item.pages[index]
      item.pages[index] = page.substring(root.length+1)
    }
  })
}

function iterateDir(dirs, files, pagePath) {
  for (let i=0; i<files.length; i++) {
    let fileName = files[i];
    let fPath = path.join(ROOT_PATH, config.src, pagePath, fileName);
    
    if (util.isDirectory(fPath)) {
      if (util.isPagePath(fPath)) {
        let _path = path.join(pagePath, fileName, fileName);
        if (process.platform === 'win32') {
          _path = _path.replace(/\\/g, '/');
        }
        if(_path.startsWith(config.index)){
          dirs.unshift(_path);
        }else{
          dirs.push(_path);
        }
      }

      let _pPath = path.join(pagePath, fileName);
      let _files = fs.readdirSync(fPath)
      iterateDir(dirs, _files, _pPath);
    }
  }
}

/*
{ file: appJson, data: { page: "\"" + page + "\"," }, tags: 'loose', append: true },
{ file: baseAppTs, data: { pagesMap: camelCase(rawModuleName) + ": Url" }, tags: 'loose', append: true },
*/
function injectBaseApp() {
  let content = getJsonContent();
  let json = JSON5.parse(content);
  let _tabs = json['tabBar']?json['tabBar']['list'] || []:[];
  let tabs = []
  _tabs.forEach((item) => {
    tabs.push(item.pagePath)
  });

  let templete = BASE_APP_TEMPLETE;
  let temp = ''
  
  // 生成url定义
  pages_path.forEach((path) => {
    temp += `  ${getPageName(path, null)}: Url; ${EOL}`;
  })

  subpages_path.forEach(item => {
    item.pages.forEach(page => {
      temp += `  ${getPageName(page, item.name)}: Url; ${EOL}`;
    });
  })
  templete = templete.replace('#URL_DEFINE#', temp.trimEnd());

  // 生成home
  temp = `this.$home = new Url("/${pages_path[0]}", ${tabs.indexOf(pages_path[0]) >= 0});`;
  templete = templete.replace('#HOME_VALUE#', temp);

  temp = '';
  // 生成url
  pages_path.forEach((path) => {
    temp += `  this.$url["${getPageName(path, null)}"] = new Url("/${path}", ${tabs.indexOf(path) >= 0});${EOL}`;
  })

  subpages_path.forEach(item => {
    item.pages.forEach(page => {
      temp += `  this.$url["${getPageName(page, item.name)}"] = new Url("/${item.root}/${page}", ${tabs.indexOf(page) >= 0});${EOL}`;
    });
  })

  templete = templete.replace('#URL_VALUE#', temp.trimEnd());
  templete = templete.trimStart().trimEnd();

  inject(config.baseApp, {pagesMap: templete}, { append: false, tags: 'loose'});
}

/**
 * 获取page的名称
 * - 将`pages`目录后的目录连起来
 * @param {string} pagePath 
 * @param {string} prefix 
 * 
 * 示例：pages/club/create => clubCreate
 */
function getPageName(pagePath, prefix) {
  pagePath = path.dirname(pagePath);
  let nodes = pagePath.split('/');
  let index = nodes.indexOf('pages');
  let name = nodes[nodes.length-1];

  if (index > -1) {
    name = nodes.slice(index+1).join('_');
  }

  return util.camelCase(prefix ? `${prefix}_${name}` : name);
}

function injectAppJson() {
  let content = getJsonContent();
  let app = JSON5.parse(content);

  app['pages'] = pages_path;
  app['subPackages'] = subpages_path;

  content = JSON.stringify(app, null, 2);
  saveJsonContent(content)
}

function getJsonContent() {
  let buffer = fs.readFileSync(config.appJson);
  return buffer.toString();
}

function saveJsonContent(content) {
  fs.writeFileSync(config.appJson, content)
}

function checkOptions(options) {
  if (util.isDef(options)) {
    options = util.isPlainObject(options) ? options : {};

    if (util.isDef(options.main) && !util.isArray(options.main)) {
      if (typeof options.main === 'string') {
        options.main = [options.main];
      } else {
        console.warn(`injector: main必须是'string'或'array'类型`)
        delete options.main
      }
    }

    if (util.isDef(options.main) && !util.isArray(options.sub)) {
      if (typeof options.sub === 'string') {
        options.sub = [options.sub];
      } else {
        console.warn(`injector: sub必须是'string'或'array'类型`)
        delete options.sub
      }
    }
  }

  return options;
}

/**
 * 注入page路径
 * @param {object} option 一般只需要配置`index`、`main`、`sub`即可。
 * 路径不包含src目录。如: pages/index/index。
 * - src {string} 源码目录
 * - `index` {string} 首页路径
 * - `main` {string | array} 主包路径
 * - `sub` {string | array} 分包路径
 * - baseApp {string} base/base_app.ts 路径
 * - appJson {string} app.cjson 路径
 */
function injectInfo(options) {
  let option = checkOptions(options);
  config = Object.assign({}, DEFAULT_CONFIG, option);
  config.baseApp = path.join(ROOT_PATH, config.src, config.baseApp);
  config.appJson = path.join(ROOT_PATH, config.src, config.appJson);

  genPagesPath();
  genSubPagesPath();

  injectBaseApp();
  injectAppJson();
}

module.exports = {
  injectInfo
}