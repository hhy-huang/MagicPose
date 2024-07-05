## wxc-pullview
下拉/上拉刷新组件，支持empty、error(手动重试)、nomore等。

### Props
> 红色表示需要双向绑定属性

|属性|是否必须|说明|类型|默认值|
|---|:--:|---|:--:|:--:|
|refresherEnabled|否|是否支持下拉刷新|Boolean|true|
|loadmoreEnabled|否|是否支持加载更多|Boolean|true|
|<font color="red">isRefreshing</font>|是|是否正在刷新|Boolean|false|
|<font color="red">isLoading</font>|是|是否正在加载更多|Boolean|false|
|isNomore|是|是否没有更多了|Boolean|false|
|nomoreEnabled|否|是否显示更多|Boolean|true|
|<font color="red">isRetrying</font>|是|是否在重新加载|Boolean|false|
|loadmoreText|否|加载更多文案|String|正在加载...|
|nomoreText|否|没有更多文案|String|没有更多了|
|<font color="red">isEmpty</font>|是|是否为空白页|Boolean|false|
|<font color="red">isError</font>|是|是否refresh错误|Boolean|false|
|emptyText|否|空白页文案|String|没有数据|
|errorText|否|错误文案|String|网络请求失败|


### Events
|事件名|是否必须|说明|回调参数|
|---|:---:|---|---|
|refresh|是|下拉刷新|-|
|loadmore|是|上拉加载|-|
|retry|是|重试|-|

### 注意事项
首次请求数据时，使用`util.showLoading('加载中')`来显示loading

&nbsp;

## 示例

### 布局 wxml
一般情况直接复制即可
```xml
<wxc-pullview 
  isEmpty.sync="{{isEmpty}}"
  isError.sync="{{isError}}"
  isLoading.sync="{{isLoading}}"
  isRetrying.sync="{{isRetrying}}"
  isRefreshing.sync="{{isRefreshing}}"
  isNomore="{{isNomore}}"
  nomoreEnabled="{{nomoreEnabled}}"
  bind:refresh="onRefresh" 
  bind:loadmore="onLoadMore" 
  bind:retry="onRetry">

  ...
</wxc-pullview>
```

### 方式1：简易使用<font color="red">（推荐）</font>
mixin `SimpleDefaultPullView`, 并实现`DefaultPullView`接口
> 具体参见 defalut.ts

### 方式2：手动实现参考
```ts
// 组件的初始数据
data = {
  isRefreshing: false,  // 下拉刷新时自动设为true，手动设置为true会触发下拉刷新
  isLoading: false,     // 上拉加载时自动设为 true
  isRetrying: false,    // 点击“重试”自动设为 true
  isError: false,       // 首次请求失败，手动置为 true
  isEmpty: false,       // 首次请求数据为空, 手动置为 true
}

// 页面或组件事件
public onReady() {
  util.showLoading('加载中');
  this.queryClubFirst();
}

// bind:refresh
public onRefresh() {
  this.queryClubFirst();
}

// bind:loadmore
public onLoadMore() {
  this.queryClubMore();
}

// bind:retry
public onRetry() {
  this.queryClubFirst();
}

// 请求首页数据
public queryClubFirst() {
  return service.club.queryJoinedListFirst().then(resp => {
    this.setDataSmart({
      isEmpty: !!this.$store.club.clubs && this.$store.club.clubs.length === 0,
      isError: false
    })

    return Promise.resolve();
  }).catch(error => {
    this.setDataSmart({
      isError: true
    })
    return Promise.reject(error);
  }).finally(() => {
    wx.hideLoading();
    this.setDataSmart({
      isRefreshing: false,
      isLoading: false,
      isRetry: false
    })
  })
}

// 请求更多数据
public queryClubMore() {
  return service.club.queryJoinedListMore().then(() => {
    return Promise.resolve();
  }).catch(error => {
    return Promise.reject(error);
  }).finally(() => {
    wx.hideLoading();
    this.setDataSmart({
      isRefreshing: false,
      isLoading: false,
      isRetry: false
    })
  })
}
```