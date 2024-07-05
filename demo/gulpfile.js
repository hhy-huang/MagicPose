const gulp = require("gulp")
const ts = require("gulp-typescript")
const fse = require('fs-extra')
const JSON5 = require('json5')
const path = require('path')
const tsProject = ts.createProject("tsconfig.json")
const sourcemaps = require('gulp-sourcemaps')
const watch = require('gulp-watch')
const changed = require('gulp-cached')
const plumber = require('gulp-plumber')
const parseCjson = require('./scripts/gulp/cjson-loader.js')
const parseWXML = require('./scripts/gulp/wxml-loader')
const fixPath = require('./scripts/gulp/fixpath-loader')
const npmLoader = require('./scripts/gulp/npm-loader/npm-loader')
const inject = require('./scripts/gulp/injector')
const cleanDeps = require('./scripts/gulp/clean-dependence')
const util = require('./scripts/util')
const rename = require('gulp-rename')
const less = require('./scripts/gulp/less-loader')
const rt = require('./scripts/gulp/runtime/fix')
const runtime = rt.runtime
const fixRuntime = rt.fixRuntime


const ROOT_PATH = process.cwd()

const ts_list = [
  './src/**/*.ts',
  './src/**/*.js',
  '!./src/node_modules/**',
]

const res_list = [
  '!./src/node_modules/**',
  './src/**/*.png',
  './src/**/*.svg',
  './src/**/*.jpg',
  './src/**/*.gif',
  './src/**/*.ico',
  './src/**/*.wxss',
  './src/**/*.wxs',
  './src/**/*.json',
  // './src/**/*.js'
]

let config = {};

async function initCofnig(plat) {
  // 获取配置
  let configPath = path.join(ROOT_PATH, 'min.config.cjson');
  if (!fse.existsSync(configPath)) {
    console.log('项目配置文件 min.config.cjson 不存在');
    return false;
  }

  try {
    let content = fse.readFileSync(configPath).toString();
    let minConfig = JSON5.parse(content);

    if (!content || !minConfig || !minConfig.config) {
        return false;
    }

    if (plat) {
      content = content.replace(/#.*#/, `#${plat}#`)
      await fse.writeFile(configPath, content)
    } else {
      plat = minConfig.config.replace(/#/g, "");
    }

    for (const key in minConfig) {
      let item = minConfig[key];
      if (key === 'platform') {
        if (item[plat]) {
          config = Object.assign(config, item[plat])
        }
      } else {
        config[key] = item;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

// 初始化配置项
async function init(plat) {
  const rest = await initCofnig(plat);
  if (!rest) return;

  // 写入appId
  if (config.appId) {
    let projectPath = path.join(ROOT_PATH, 'src', 'project.config.json');
    if (fse.existsSync(projectPath)) {
      let content = fse.readJSONSync(projectPath);
      content.appid = config.appId;
      fse.writeJSONSync(projectPath, content, {
        spaces: 2
      })
    }
  }

  // 复制config文件
  if (config.config) {
    let srcPath = path.join(ROOT_PATH, 'config', `${config.config}`);
    if (fse.existsSync(srcPath)) {
      let destPath = path.join(ROOT_PATH, 'src', 'config.ts');
      let content = fse.readFileSync(srcPath).toString();
      content = content.replace('$APP_VERSION', config.appVer);
      fse.writeFileSync(destPath, content);
    }
  }

  // 清空dist目录
  let distPath = path.join(ROOT_PATH, 'dist');
  if (fse.existsSync(distPath)) {
    fse.emptyDirSync(distPath)
  }

  // 注入path
  let injectConfig = (config && config.compiler && config.compiler['inject']) ? config.compiler['inject'] : {}
  inject.injectInfo(injectConfig);

  // 复制 npm 组件
  npmLoader.copyNpmComponents();
}

gulp.task('init', async function (done) {
  await init('mp-weixin');
  done();
})

gulp.task('init-dev', async function (done) {
  await init('mp-weixin-dev');
  done();
})

// 编译 typescript 文件
gulp.task("compile", function () {
  let npmConfig = config && config.compiler && config.compiler['npm-loader'] ? config.compiler['npm-loader'] : {}

  return gulp.src(ts_list)
    .pipe(plumber())
    // .pipe(alias({
    //     configuration: tsProject.config
    // }))
    // .pipe(esbuild.pipedGulpEsbuild({
    //     platform: 'node'
    // }))
    .pipe(tsProject())
    .js
    .pipe(fixPath())
    .pipe(npmLoader.loader(npmConfig))
    // .pipe(uglyfy())
    .pipe(gulp.dest("./dist"));
});

gulp.task("compile-dev", function () {
  let npmConfig = config && config.compiler && config.compiler['npm-loader'] ? config.compiler['npm-loader'] : {}

  return gulp.src(ts_list)
    .pipe(plumber())
    // .pipe(alias({
    //     configuration: tsProject.config
    // }))
    // .pipe(esbuild.pipedGulpEsbuild({
    //     platform: 'node',
    //     tsconfig: 'tsconfig.json'
    // }))
    .pipe(tsProject())
    .js
    .pipe(fixPath())
    .pipe(npmLoader.loader(npmConfig))
    .pipe(gulp.dest("./dist"));
});

// 转换 cjson >> json
gulp.task("cjson", () => {
  return gulp.src([
      '!./src/node_modules/**',
      './src/**/*.cjson'
    ])
    .pipe(plumber())
    .pipe(parseCjson())
    .pipe(gulp.dest('./dist'));
})

// 支持组件数据的双向绑定 wxml 处理
gulp.task("wxml", () => {
  return gulp.src([
      '!./src/node_modules/**',
      './src/**/*.wxml'
    ])
    .pipe(plumber())
    .pipe(parseWXML())
    .pipe(gulp.dest('./dist'))
})

gulp.task('less', () => {
  return gulp.src([
      './src/**/*.less',
      '!./src/node_modules/**',
    ])
    .pipe(plumber())
    .pipe(less())
    // .pipe(cssnano({
    //     reduceIdents: false,
    //     autoprefixer: false,
    //     zindex: false,
    //     mergeIdents: false
    // }))
    .pipe(gulp.dest('dist'))
})

// 转移资源文件
gulp.task('res', () => {
  return gulp.src(res_list)
    .pipe(gulp.dest('./dist'));
});

// 观察资源文件
gulp.task('watch-res', () => {
  return watch(res_list)
    .pipe(gulp.dest('./dist'));
});

// 监控ts
gulp.task('watch-ts', async () => {
  await initCofnig();
  let injectConfig = (config && config.compiler && config.compiler['inject']) ? config.compiler['inject'] : {}
  return watch(ts_list, {
      readDelay: 100
    })
    .on('add', (path) => {
      console.log('addFile', path)

      if (util.isPagePath(path)) {
        inject.injectInfo(injectConfig);
      }

      onTsChanged();
    }).on('change', (path) => {
      console.log('changeFile', path)
      onTsChanged();
    }).on('unlink', (p) => {
      let destPath = p.replace(`${path.sep}src${path.sep}`, `${path.sep}dist${path.sep}`).replace(/\.ts$/, '.js')

      console.log('delFile', p)

      if (util.isPagePath(destPath)) {
        inject.injectInfo(injectConfig);
      }

      fse.unlinkSync(destPath);
    })
})

function onTsChanged() {
  initCofnig();
  let npmConfig = config && config.compiler && config.compiler['npm-loader'] ? config.compiler['npm-loader'] : {}
  let project = ts.createProject("tsconfig.json")
  gulp.src(ts_list)
    .pipe(changed('./dist'))
    .pipe(plumber())
    .pipe(project())
    .js
    .pipe(fixPath())
    .pipe(npmLoader.loader(npmConfig))
    // .pipe(uglyfy())
    .pipe(runtime())
    .pipe(gulp.dest('./dist'))
}

// 监控wxml
gulp.task('watch-wxml', () => {
  return watch([
      './src/**/*.wxml',
      '!./src/node_modules/**',
    ])
    .pipe(plumber())
    .pipe(parseWXML())
    .pipe(gulp.dest('./dist'))
})

gulp.task('watch-less', () => {
  return watch([
      './src/**/*.less',
      '!./src/node_modules/**',
    ])
    .pipe(plumber())
    .pipe(less())
    .on('error', () => {})
    .pipe(gulp.dest('dist'))
})

// 监控cjson
gulp.task('watch-cjson', () => {
  return watch([
      './src/**/*.cjson',
      '!./src/node_modules/**',
    ])
    .pipe(plumber())
    .pipe(parseCjson())
    .pipe(gulp.dest('./dist'));
})

// 清理掉多余的依赖项(组件)
gulp.task('clean-deps', (done) => {
  cleanDeps();
  done();
})

// 修复runtime
gulp.task('runtime', (done) => {
  fixRuntime();
  done();
})


gulp.task('watch', gulp.parallel('watch-ts', 'watch-res', 'watch-wxml', 'watch-cjson', 'watch-less'));

gulp.task('build', gulp.series("init", gulp.parallel('wxml', 'cjson', 'res', 'less'), 'compile', 'runtime', 'clean-deps'));

gulp.task('builddev', gulp.series("init-dev", gulp.parallel('wxml', 'cjson', 'res', 'less'), 'compile-dev', 'runtime'));
