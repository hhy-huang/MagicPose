import { appify, BaseApp, LoggerFactory, action } from './base';
import { config } from './config';
import { Store, StoreCenter } from './store/index';
import { service, ServiceCore } from './services/index'

const Logger = LoggerFactory.getLogger('App');

@appify(Store, service)
export default class extends BaseApp<StoreCenter, ServiceCore> {
  @action
  public onLaunch(options: WechatMiniprogram.App.LaunchShowOption) {
    this.setEnableDebug();              // 是否开启调试模式
    this.$store.launchOption = options;  // 保存启动参数

    Logger.info("onLaunch app launch options: {0}", options);
  }

  @action
  public onShow(options: WechatMiniprogram.App.LaunchShowOption) {
    this.$store.launchOption = options;  // 保存启动参数
    this.$store.wxapi.appShow = true;
  }

  @action
  public onHide() {
    this.$store.wxapi.appShow = false;
  }

  public onPageNotFound() {
    this.$home.reload();
  }

  private setEnableDebug() {
    if (config.isdev) {
      if (this.$storage.get('debug')) {
        config.debug = true;
      }

      if (config.debug) {
        wx.setEnableDebug({
          enableDebug: true
        });
      }
    }
  }
}