
## 项目结构

### 项目
|项目|描述|
|---|---|
|src|项目源代码目录|
|scripts|构建脚本|
|config|配置文件目录(各种平台的配置)|
|types|项目类型定义|
|min.config.cjson|项目配置文件|

### SRC目录
|模块|描述|原则|
|---|---|---|
|**base**|基础框架|仅base开头源文件可放公共业务代码|
|**common**|通用模块|会根据业务定制，但结构不会变|
|utils|工具类|业务相关的工具函数|
|wxs|wxs工具|wxml使用的工具函数|
|components|通用组件|只属于单个page的, 放到该page目录下|
|pages|页面|业务页面代码|
|service|服务|业务服务代码|
|store|全局状态|配合service提供全局状态|

&nbsp;
### TYPES目录
|模块|描述|原则|
|---|---|---|
|**frame**|框架申明|不要放业务申明|
|**model**|业务申明|业务部分，如`bean`、`enum`|


&nbsp;
## 注意事项
### 1、VS插件
- <font color='red'>[必须] </font>`Dot Template`：快速创建page、component等，可以自己设置模板。请查看`.dtpl`文件夹中的帮助文件了解更多。
- 如何使用老宋的扩展和配置：
  1、首先安装`wowbox.gitee-sync`扩展(请查看扩展文档)；
  2、填入共享的`gist id`：
  ```js
   // 共享配置
   "gist id": "3e705a2h9ywlvq4srndci11",
  ```
  3、点击右下角齿轮 => 命令面板 （或者Ctrl+Shift+P）
  3、输入`download setting`，点击下载配置

### 2、页面路由
- 构建时page会自动注入app.json和base_app.ts。缺省主包`src/pages`，分包`src/subpackages`。可以在`gulpfile.js`中通过`injectInfo`的参数修改（min.config.json配置文件中配置）。
- app.$url 包含所有的页面的信息，直接调用相应页面的`go`方法即可跳转，不用去关心是不是tab，如果需要redirectTo跳转可调用`redirect`方法。

### 3、组件属性双向绑定
组件属性在wxml中使用`.sync`来进行双向绑定，支持多级（例如：`show.sync="{{a.b.c}}"`）。组件中增量更新方式也会正确的触发双向绑定。

其中`show.sync` 或 `visible.sync` 含义如下：
- **show**: 无需再使用`wx:if`即可隐藏和显示组件（通常有动画）。
- **visible**：需要使用`wx:if`来显示和隐藏组件。

|组件|属性|描述|
|--|--|--|
|wxc-cropper|visible|需要使用wx:if来控制组件的可见性 [帮助文档](./src/components/wxc-cropper/README.md)|
|wxc-bottom-popup|show|直接隐藏和显示组件|
|wxc-actionsheet|show|直接隐藏和显示组件|
|wxc-nomore|show|-|
|wxc-loadmore|show|-|
|wxc-pullview|*|[帮助文档](./src/components/wxc-pullview/README.md)

### 4、watch & computed
Vue中可以使用`watch`和`computed`来响应`data`中的数据变化。框架通过将`data` mobx化来更好的实现了`watch`和`computed`。和`store`一样，使用`@compute`来处理。

mobx化data方法：`@comify({observe: true})`或`@pagify({observe: true})`

```ts
// @comify({observe: true}) 组件
@pagify({observe: true})
export default class XXXXPage {
  data = {
    name: '',
    age: 10,
  }

 /**
  * watch
  * 只要返回 undefined 即可
  * / 
  @compute
  watchName() {
    console.log(this.data.name);
  }

  /**
   * computed
   * 返回非 undefined 值，即可在data中添加与方法名同名的属性
   * /
  @compute
  person() {
    return `name: ${this.data.name} age: ${this.data.age}`;
  }

  ...
}
```

### 5、数据存储
`page`、`component`、 `service`、`app` 均已经混入相应属性。直接使用即可。

|属性名|描述|
|---|---|
|$storage|本地数据存储（localstorage）|
|$session|临时数据存储（内存中）|

### 6、小程序构造器
|构造器|传值方式|解读|
|:---:|---|---|
|**App**|引用|参数对象不会进行深拷贝。`store`、`$session`、`$storage`等全局对象可以直接在构造时赋值|
|**Page**|深拷贝|不能在参数对象中直接赋值`store`等全局对象。每个页面都是一个deepclone的副本|
|**Component**|深拷贝|不能在参数对象中直接赋值`store`等全局对象。每个组件都是一个deepclone的副本|

&nbsp;


## 创建提示
### 创建组件
- 通用或公用组件放到`components`目录下。页面拆分的组件，直接放到页面目录的`components`目录中。
- 组件的属性更新，推荐使用@ob装饰器。不推荐统一在onPropUpdate方法里处理。
- 使用`states`引入`store`数据, wxml中通过{{store.模块名.xxx}}输出store的数据

### 创建页面
- 主包目录为`pages`，分包目录为`subpackages`
  ```js
  // 主包目录结构图
  pages
  ├┈index
  ┆  ├┈components
  ┆  ┆   └┈ 页面组件
  ┆  └┈addons
  ┆      └┈ 页面插件
  ├┈edit
  └┈other

  // 分包目录结构图
  subpackages
  ├┈user
  ┆  └┈pages
  ┆     ├┈index
  ┆     ├┈edit
  ┆     └┈....
  └┈other
     └┈pages
        ├┈index
        ├┈edit
        └┈....    
  ```
- 通过`states`引入`store`数据, wxml通过{{store.模块名.xxx}}输出store的数据


### 创建服务
- 在service目录下新建xxxx.ts文件，会自动根据模板创建服务。
- 服务继承自BaseService，已混入事件，通过onEvent和fireEvent来监听和发送事件。
- 服务是全局的，需要在service/index.ts里导入相关服务，并在startService里调用start来启动服务。

### 创建store
- 在store目录下新建xxxx.ts文件，会自动根据模板创建store。
- store继承自BaseStore，用于存储全局交互数据。
- 用@observable声明store里的变量，可观察变量值的改变。
- store也是全局的，在store/index.ts里导入store子模块。