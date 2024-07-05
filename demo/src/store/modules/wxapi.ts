/*****************************************************************************
文件名: wxapi
作者: wowbox
日期: 2019-01-16
描述: wxapi 服务的stroe
******************************************************************************/
import { BaseStore, observable } from "../../base/index";

export class WxapiStore extends BaseStore {
  /** 状态栏高度px */
  @observable statusBarHeight: number = 0;
  /** 胶囊加上下margin高度px */
  @observable naviHeight: number = 0;
  /** 胶囊尺寸px */
  @observable menuRect: ClientRect | null = null;
  /** 
   * 设备像素比 
   * 
   * ```
   * rpx -> px: px = rpx / pixelRatio
   * px -> rpx: rpx = px * pixelRatio
   * ```
   */
  @observable pixelRatio: number = 0;
  /** 屏幕宽度px */
  @observable screenWidth: number = 0;
  /** 屏幕高度px */
  @observable screenHeight: number = 0;
  /** 窗口宽度px */
  @observable windowWidth: number = 0;
  /** 窗口高度px */
  @observable windowHeight: number = 0;
  /** 手机型号 */
  @observable model: string = '';
  /** devtools=IDE模拟器  ios=ios手机  android=安卓手机 */
  @observable platform: PlatFormType = PlatFormType.unknown;
  /** 微信版本号  eg. 6.6.3 */
  @observable wxVersion: string = '';
  /** 小程序基础库版本号  eg. 1.9.91 */
  @observable SDKVersion: string = '';
  /** 获取userInfo失败 */
  @observable getUserInfoFail: boolean = false;
  /** app在前台 */
  @observable appShow: boolean = false;
  /** 网络状态 取值：wifi、2g、3g、4g、unknown、none */
  @observable networkType: string = '';
  /** 网络状态 取值：wifi、2g、3g、4g、unknown、none */
  @observable indexAutoToUrl: string = '';
  /** 页面转发标题配置 格式：{"0#0":{stid,text}}*/
  @observable shareTextConfig: AnyObject = {};
  /** 是否是苹果 */
  @observable isIOS = false;
  /** 是否是全面屏 */
  @observable isFullScreen: boolean = false;
  /** 是否是pc or mac */
  @observable isPC = false;
  /** 是否有page-container组件 */
  @observable hasPageContainer: boolean = false;
}

export const wxapiStore = new WxapiStore()