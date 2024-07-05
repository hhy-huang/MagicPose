/************************************************************************
 * 清理未使用的资源和组件
 * - 清理未使用的自定义组件
 * - 清理未使用的资源
 * - 清理空文件夹
 ************************************************************************/
const glob = require("glob");
const JSON5 = require("json5");
const chalk = require("chalk");
const path = require("path");
const fse = require("fs-extra");
const util = require("../util");
const findup = require('mora-scripts/libs/fs/findup');

const ROOT_DIR = path.dirname(findup.pkg());
const SRC_DIR = path.join(ROOT_DIR, "src");
const DIST_DIR = path.join(ROOT_DIR, "dist");

const DEFAULT_CONFIG = {
  resDir: "res",
  // 确认已经使用的资源 "/res/..."
  resUsed: [],
  debug: true
}

Object.freeze(DEFAULT_CONFIG);

let config = DEFAULT_CONFIG;

/////////////////////////////////////////////////
// 清理未使用的自定义组件
// 1、搜集组件和依赖(page和app.json中是有效依赖)
// 2、删除dist中没有有效依赖的自定义组件
/////////////////////////////////////////////////

let allCompoents = Object.create(null);
let usedCompoents = [];

/**
 * 生成
 * - allCompoents: 全部组件
 * - usedCompoents: 有效组件
 */
function collectCompoents() {
  allCompoents = Object.create(null);
  usedCompoents = [];

  let files = glob.sync(`${SRC_DIR}/**/*.?(json|cjson)`);
  // console.log(JSON.stringify(files))
  files.forEach(file => {
    let content = fse.readFileSync(file).toString();
    let obj = JSON5.parse(content);
    let fileName = getCompoentName(file);

    // 判断是否是组件
    if (obj.component) {
      allCompoents[fileName] = [];
    }

    if (util.isPlainObject(obj.usingComponents)) {
      for (const key in obj.usingComponents) {
        let item = obj.usingComponents[key];
        let componentPath = getCompoentPath(file, item);
        let name = getCompoentName(componentPath);

        if (obj.component) {
          // 可能会出现自己依赖自己的情况
          if (fileName !== name) {
            allCompoents[fileName].push(name);
          }
        } else {
          usedCompoents.push(name);
        }
      }
    }
  })
}

/**
 * 生成未使用的组件列表
 */
function getUnusedComponents() {
  collectCompoents();

  getDependence = (name) => {
    if (util.hasProperty(allCompoents, name)) {
      if (allCompoents[name].length) {
        usedList = usedList.concat(allCompoents[name]);
        allCompoents[name].forEach(subname => {
          getDependence(subname);
        })
      }
    } else {
      console.error(`组件：${chalk.cyan(name)} 未定义`);
    }
  }

  // 生成完整的已使用的组件列表
  let usedList = [];
  usedCompoents.forEach(name => {
    usedList.push(name);
    getDependence(name);
  })

  usedList = [...new Set(usedList)];

  return Object.keys(allCompoents).filter(item => !usedList.includes(item));
}

function getCompoentPath(file, cpath) {
  cpath = cpath.replace("@", "");    
  if (cpath.startsWith("/")) {
    return path.join(SRC_DIR, cpath);    
  } else {
    let dir = path.parse(file).dir;
    return path.join(dir, cpath);
  }
}

function getCompoentName(fullPath) {
  let name = fullPath.replace(SRC_DIR+path.sep, "");
  let ext = path.extname(name);
  return name.replace(ext, "");
}


function cleanComponents() {
  let unused = getUnusedComponents();
  unused.forEach(name => {
    let file = path.join(DIST_DIR, name);
    let dir = path.dirname(file);
    if (util.isDirectory(dir)) {
      fse.removeSync(dir);
    }
  })
}


/////////////////////////////////////////////////
// 清理未使用的资源
// 1、搜集全部资源
// 2、扫描已使用资源
// 3、清除未使用资源
/////////////////////////////////////////////////

// 全部的资源
let allRes = Object.create(null);
// 确认已经使用的资源（全路径匹配）
let usedRes = [];
let noticeRes = [];

function collectAllRes() {
  allRes = Object.create(null), usedRes = [], noticeRes = [];
  let files = glob.sync(`${path.join(SRC_DIR, "res")}/**/*`);
  files = files.filter(file => util.isFile(file)).map(file => file.replace(`${SRC_DIR}`, "").replace(new RegExp(path.sep, "g"), "/"));
  files.forEach(file => {
    allRes[file] = path.basename(file);
  })
}

function getUnusedRes() {
  collectAllRes();

  let files = glob.sync(`${SRC_DIR}/**/*.?(ts|js|wxml|less|sass|scss|wxss)`);
  files.forEach(file => {
    let content = removeComment(file);
    for (const _path in allRes) {
      let filename = allRes[_path];
      if (content.indexOf(_path) !== -1) {
        usedRes.push(_path);
      } else if (content.indexOf(filename) !== -1) {
        noticeRes.push(_path);
      }
    }
  })

  usedRes = [...new Set(usedRes)];
  noticeRes = [...new Set(noticeRes)];

  let i = noticeRes.length;
  while(i--) {
    if (usedRes.includes(noticeRes[i])) {
      noticeRes.splice(i, 1);
    }
  }

  // 通知可能未使用资源
  if (config.debug) {
    noticeRes.forEach(file => {
      if (!config.resUsed.includes(file)) {
        console.log(`可能未使用资源：${chalk.cyan(file)}`)
      }
    })
  }

  // console.log("已使用资源：", JSON.stringify(usedRes))
  // console.log("可能使用资源：", JSON.stringify(noticeRes))
  
  let unused = [];
  for (const _path in allRes) {
    if (!usedRes.includes(_path) && !noticeRes.includes(_path) && !config.resUsed.includes(_path)) {
      unused.push(_path);
    }
  }

  return unused;
}

const commentReg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
function removeComment(file) {
  let content = fse.readFileSync(file).toString();
  let ext = path.extname(file);
  if ([".ts", ".js", ".wxss", ".less", ".sass", ".scss"].includes(ext)) {
    return content.replace(commentReg, function(word) {
      return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
    })
  } else {
    return content.replace(/(<!--[\w\W\r\n]*?-->)/gim, "");
  }
}

function cleanRes() {
  let unused = getUnusedRes();

  // console.log("未使用资源：", JSON.stringify(unused))

  unused.forEach(file => {
    let _path = path.join(DIST_DIR, file);
    if (util.isFile(_path)) {
      fse.unlinkSync(path.join(DIST_DIR, file));
    }
  })
}

/////////////////////////////////////////////////
// 清理空文件夹
/////////////////////////////////////////////////
function cleanEmptyDir() {
  walkDir(DIST_DIR, (dir, files) => {
    if (!files.length) {
      fse.removeSync(dir);
    }
  })
}


function walkDir(dir, cb) {
  let files = fse.readdirSync(dir);

  cb(dir, files);

  files.forEach(file => {
    let _dir = path.join(dir, file);
    if (util.isDirectory(_dir)) {
      walkDir(_dir, cb);
    }
  })
}

module.exports = function(options) {
  config = Object.assign({}, DEFAULT_CONFIG, options);
  cleanComponents();
  cleanRes();

  // 放到最后
  cleanEmptyDir();
}