/*******************************************
 * 常用封装
 * - 页面只有一个列表的情况
 * - wxml 参见 README
 ******************************************/

import { isFunction, isPromise } from "../../../base";

export interface DefaultPullView {
  /** 刷新数据 */
  onRefresh?: () => void;
  /** 获取更多 */
  onLoadMore?: () => void;
  /** 错误重试 */
  onRetry?: () => void;
  /** 获取第一次数据 */
  queryFirstData?: () => Promise<any>;
  queryMoreData?: () => Promise<any>;


  /////////////////////
  // 需要实现的接口方法
  /////////////////////
  /** 计算属性, 判断是否还有更多的数据 */
  isNomore?: () => boolean;
  isEmpty(): boolean;

  /** 第一次请求的服务方法 */
  getFistServiceQuery(): Promise<any>;
  /** 更多请求的服务方法 */
  getMoreServiceQuery(): Promise<any>;
}

export const SimpleDefaultPullView: AnyObject = {
  data: {
    isRefreshing: false,
    isLoading: false,
    isRetrying: false,
    isError: false,
    // isEmpty: false,
  },
  onRefresh() {
    this.queryFirstData();
  },
  onLoadMore() {
    this.queryMoreData();
  },
  onRetry() {
    this.queryFirstData();
  },
  queryFirstData() {
    if (!isFunction(this.getFistServiceQuery)) {
      resetStatus(this);
      return Promise.reject(new Error('未实现 getFistServiceQuery'));
    }

    let promise = this.getFistServiceQuery();
    if (!isPromise(promise)) {
      resetStatus(this);
      return Promise.reject(new Error('未实现 getFistServiceQuery'));
    }

    return promise.then(resp => {
      // @ts-ignore
      this.setDataSmart({
        // isEmpty: !!this.$store.activity.signActivityInfo && this.$store.activity.signActivityInfo.activitys.length === 0,
        isError: false
      })

      return Promise.resolve();
    }).catch(error => {
      // @ts-ignore
      this.setDataSmart({
        isError: true
      })
      return Promise.reject(error);
    }).finally(() => {
      resetStatus(this);
    })
  },
  queryMoreData() {
    if (!isFunction(this.getMoreServiceQuery)) {
      resetStatus(this);
      return Promise.reject(new Error('未实现 getMoreServiceQuery'));
    }

    let promise = this.getMoreServiceQuery();
    if (!isPromise(promise)) {
      resetStatus(this);
      return Promise.reject(new Error('未实现 getMoreServiceQuery'));
    }

    return promise.then(() => {
      return Promise.resolve();
    }).catch(error => {
      return Promise.reject(error);
    }).finally(() => {
      resetStatus(this);
    })
  }
}

function resetStatus(context: Context) {
  wx.hideLoading();
  context.setDataSmart({
    isRefreshing: false,
    isLoading: false,
    isRetrying: false
  })
}