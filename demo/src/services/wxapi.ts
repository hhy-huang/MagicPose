/*****************************************************************************
文件名: wxapi
作者: wowbox
日期: 2019-01-16
描述: 微信信息监听：低内存、新版本、systemInfo、网络状态
     * 注意：不要在这里封装ui相关的东西
******************************************************************************/

import { serify, BaseService, getService, wxp, LoggerFactory, action, runInAction, isString } from "../base/index";
import { Store, StoreCenter } from "../store/index";
import util from "../utils/util";
import { EVENT } from "../common/const/eventList";
import { config } from '../config';
import { ServiceCore } from "./index";
import { StorageKey } from "../common/const/storage";

const Logger = LoggerFactory.getLogger('WxapiService');

const MIN_WX_VERSION = '6.6.0';
const FULL_SCREEN_IPHONE = ["iPhone X", "iPhone 11", "iPhone 12"];

@serify('wxapi')
class WxapiService extends BaseService<StoreCenter, ServiceCore> {
  /**
   * 服务对外提供的数据
   */
  data = Store.wxapi

  /**
   * 服务初始化事件
   */
  onStart() {
    this.listenUpdate()
    this.listenMemory()
    this.initSystemInfo()

    this.onOnce(EVENT.HTTP_LOGIN_SUCCESS, this.initNetwork)
  }

  private listenUpdate() {
    if (!wx.getUpdateManager) {
      return
    }
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      Logger.debug(`是否有新版本: {0}`, res.hasUpdate);
    })

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: res => {
          if (res.confirm) {
            this.$storage.set(StorageKey.hasUpdate, true);
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            wx.getUpdateManager().applyUpdate();
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
  }

  private listenMemory() {
    wx.onMemoryWarning && wx.onMemoryWarning(() => {
      this.fireEvent(EVENT.MEMORY_WARNING)
    })
  }

  @action
  private initSystemInfo() {
    let systemInfo = wx.getSystemInfoSync();
    const platform = systemInfo.platform as PlatFormType;
    let pixelRatio = [PlatFormType.ios, PlatFormType.android].includes(platform) ? 750 / systemInfo.screenWidth : systemInfo.pixelRatio;
    

    /**
     * rpx 和 px 互转
     * rpx -> px：px = rpx / pixelRatio
     * px -> rpx: rpx = px * pixelRatio
     */

    Logger.info('APP VERSION: {0}', config.appVersion);
    Logger.info('Systeminfo {0}', systemInfo);

    if (wx.getMenuButtonBoundingClientRect) {
      this.data.menuRect = wx.getMenuButtonBoundingClientRect();
    }

    // api返回的pixelRatio非精确数值
    this.data.pixelRatio = pixelRatio;
    this.data.screenWidth = systemInfo.screenWidth;
    this.data.screenHeight = systemInfo.screenHeight;
    this.data.windowWidth = systemInfo.windowWidth;
    this.data.windowHeight = systemInfo.windowHeight;
    this.data.statusBarHeight = systemInfo.statusBarHeight;
    this.data.isIOS = systemInfo.system.toLowerCase().includes('ios');
    this.data.naviHeight = platform === PlatFormType.ios ? 40 : platform === PlatFormType.devtools ? 44 : 48;
    this.data.model = systemInfo.model;
    this.data.isFullScreen = this.isFullScreen(systemInfo.model);
    this.data.platform = platform;
    this.data.isPC = [PlatFormType.mac, PlatFormType.windows].includes(platform);
    this.data.wxVersion = systemInfo.version;
    this.data.SDKVersion = systemInfo.SDKVersion;
    this.data.hasPageContainer = util.compareVersion(systemInfo.SDKVersion, "2.16.0") >= 0;

    if (util.compareVersion(systemInfo.version, MIN_WX_VERSION) < 0) {
      wx.showModal({
        title: '微信版本过低',
        content: '可能无法使用本小程序，请升级微信',
        showCancel: false
      })
    }
  }

  private isFullScreen(model: string): boolean {
    if (!isString(model)) return false;
    
    for (const item of FULL_SCREEN_IPHONE) {
      if (model.includes(item)) {
        return true;
      }
    }

    return false;
  }

  private initNetwork() {
    if (wx.onNetworkStatusChange) {
      wx.onNetworkStatusChange(res => {
        runInAction(() => {
          this.data.networkType = res.networkType;
          if (!this.$store.isLogin) {
            this.$service.login.reLogin();
          }
        })
      })
    }

    wx.getNetworkType({
      success: res => {
        runInAction(() => {
          this.data.networkType = res.networkType;
        })
      }
    })
  }
}

export const wxapi = getService('wxapi') as WxapiService