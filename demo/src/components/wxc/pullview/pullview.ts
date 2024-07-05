/*****************************************************************************
文件名: wxc-pull-view
作者: wowbox
日期: 2020-11-16
描述: 下拉/上拉加载组件（包含emtpy、loading、loadmore、nomore）
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcPullViewComponent");

@comify()
export class WxcPullViewComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 是否支持下拉刷新 */
    refresherEnabled: {
      type: Boolean,
      value: true
    },
    /** 是否支持加载更多 */
    loadmoreEnabled: {
      type: Boolean,
      value: true
    },
    nomoreEnabled: {
      type: Boolean,
      value: true
    },
    /** 是否正在刷新 */
    isRefreshing: {
      type: Boolean,
      value: false
    },
    /**是否正在加载更多 */
    isLoading: {
      type: Boolean,
      value: false
    },
    /** 是否没有更多了 */
    isNomore: {
      type: Boolean,
      value: false
    },
    /** 是否在重新加载 */
    isRetrying: {
      type: Boolean,
      value: false
    },
    /** 加载更多文案 */
    loadmoreText: {
      type: String,
      value: "正在加载..."
    },
    /** 没有更多文案 */
    nomoreText: {
      type: String,
      value: "没有更多了"
    },
    /** 是否为空白页 */
    isEmpty: {
      type: Boolean,
      value: false
    },
    /** 是否refresh错误 */
    isError: {
      type: Boolean,
      value: false
    },
    /** 空白页文案 */
    emptyText: {
      type: String,
      value: "没有数据"
    },
    /** 错误文案 */
    errorText: {
      type: String,
      value: "网络请求失败"
    }
  }

  @ob('isError')
  public onIserrorChange(value: any, old: any) {
    if (value) {
      this.setDataSmart({
        isEmpty: false
      })
    }
  }

  @ob('isRefreshing')
  public onIsRefreshingChange(value: any, old: any) {
    if (value) {
      this.setDataSmart({
        isLoading: false,
        isRetrying: false
      })
    }
  }

  @ob('isLoading')
  public onIsloadingChange(value: any, old: any) {
    if (value) {
      this.setDataSmart({
        isRefreshing: false,
        isRetrying: false
      })
    }
  }

  @ob('isRetrying')
  public onIsretryingChange(value: any, old: any) {
    if (value) {
      this.setDataSmart({
        isRefreshing: false,
        isLoading: false
      })

      wx.showLoading({
        title: "加载中"
      })
    } else {
      wx.hideLoading();
    }
  }

  public onRefresh(e: Weapp.Event) {
    if (this.data.isRefreshing || this.data.isLoading || this.data.isRetrying) {
      return;
    }

    this.setDataSmart({
      isRefreshing: true
    })

    this.triggerEvent('refresh', e.detail);
  }

  public onLoadMore(e: Weapp.Event) {
    if (!this.data.loadmoreEnabled || this.data.isEmpty || this.data.isError || 
      this.data.isRefreshing || this.data.isLoading || this.data.isRetrying || this.data.isNomore) {
      return;
    }

    this.setDataSmart({
      isLoading: true
    })

    this.triggerEvent('loadmore', e.detail);
  }

  public onRetry(e: Weapp.Event) {
    if (this.data.isRefreshing || this.data.isLoading || this.data.isRetrying) {
      return;
    }

    this.setDataSmart({
      isRetrying: true
    })

    this.triggerEvent('retry', e.detail);
  }
}
