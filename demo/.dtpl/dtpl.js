// import * as _ from 'dot-template-types'
let path = require('path');
let fs = require('fs-extra');

const REQUIRES = {
  page: {
    "base/index": "{ pagify, BasePage, wxp, compute, ob, LoggerFactory }",
    "store/index": "{ StoreCenter }",
    "services/index": "{ ServiceCore }",
  },
  component: {
    "base/index": "{ comify, BaseComponent, compute, ob, LoggerFactory }",
    "store/index": "{ StoreCenter }",
    "services/index": "{ ServiceCore }",
  },
  service: {
    "base/index": "{ serify, BaseService, getService, LoggerFactory }",
    "store/index": "{ StoreCenter, Store }",
    "services/index": "{ ServiceCore }",
  },
  store: {
    "base/index": "{ BaseStore, observable }"
  }
}


module.exports = function (source) {

  function getImportInfo(target, reqs) {
    let regExp = (process.platform === 'win32') ? /^(.*)\\src/ : /^(.*)\/src/;
    let root = target.toPath.match(regExp)[0]
    let dir = path.dirname(target.toPath)
    let importInfo = "";
    Object.keys(reqs).forEach(key => {
      let rePath = path.relative(dir, path.resolve(root, key))
      if (!rePath.startsWith('.')) {
        rePath = './' + rePath;
      }
      importInfo += `import ${reqs[key]} from '${rePath}';\n` 
    })
  
    return importInfo
  }
  
  function filterContent(target, reqs) {
    // let ext = path.extname(target.toPath);
    if (target.toPath.endsWith('.ts')) {
      let info = getImportInfo(target, reqs)
      let content = target.content.replace('#IMPORT_INFO#', info)
      return {content}
    }
  
    return true;
  }

  function onInject(data, reqs) {
    setTimeout(()=>{
      let content = fs.readFileSync(data.filePath).toString();
      if (content.length === 0) {
        onInject(data, reqs)
        return;
      }

      // source.app.debug('inject: ' + content)
      let target = {toPath: data.filePath, content};
      let result = filterContent(target, reqs);
      if (typeof result === 'object') {
        // source.app.debug('inject: ' + JSON.stringify(result.content))
        fs.writeFileSync(data.filePath, result.content);
      }
    }, 50)
  }

  return {
    templates: [
      {
        // 当在 pages 目录下新建一个文件夹时，向这个文件夹内注入 .dtpl/page 下的文件
        // matches: 'src/**/pages/*',
        matches(minimatch, source) {
          if (source.isDirectory && 
            // 匹配
            minimatch(source.relativeFilePath, 'src/**/pages/**/!(component|components)') && 
            // 排除
            !minimatch(source.relativeFilePath, 'src/**/pages/**/component?(s)/*')) {
            return true;
          }

          return false;
        },
        name: './page/',
        filter(target) {
          return filterContent(target, REQUIRES.page);
        }
      },
      {
        // 当在 components 目录下新建一个文件夹时，向这个文件夹内注入 .dtpl/component 下的文件
        matches: ['src/**/component?(s)/**/*'],
        name: './component/',
        filter(target) {
          return filterContent(target, REQUIRES.component);
        }
      },
      {
        // 当在 services 目录下新建一个文件时，向这个文件夹内注入 .dtpl/service/service.ts.dtpl 的内容
        matches: 'src/services/**/*.ts',
        name: './service/service.ts.dtpl',
        inject(data) {
          onInject(data, REQUIRES.service)
        }
      },
      {
        // 当前store下的子模块
        matches: 'src/store/**/*.ts',
        name: './service/store.ts.dtpl',
        inject(data) {
          onInject(data, REQUIRES.store)
        }
      }
    ],
    globalData: {
      dollar: '$',
      style: 'less',
    }
  }
}