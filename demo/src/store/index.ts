import { BaseStore, observable } from "../base/index";

import { wxapiStore } from "./modules/wxapi";
import { userStore } from "./modules/user";

/**
 * 注意：
 *  小程序 setData({key: value}) 中，如果 value 为 undefined，小程序会报错（主要 undefined 时，小程序不会更新原来存储在 key 中的值）
 *  而 start 中的值会被注入到 page 的 data 中，所以不要有 undefined
 *
 *  另外，函数相关的 ts 定义都存储在 wx.[同名函数] 的 namespace 中，如下面的 ParamPropSuccessParamPropUserInfo
 */
export class StoreCenter extends BaseStore {
  /** 是否已登录 */
  @observable isLogin: boolean = false;
  /** token */
  @observable token: string = '';
  /** 启动时的场景参数 */
  @observable launchOption: WechatMiniprogram.App.LaunchShowOption | null = null;
  
  /**
   * 添加子模块的store
   * 
   * - 将服务中的data放到store中来处理，这样vs code能很好的支持智能提示
   */
  wxapi = wxapiStore;
  user = userStore;

  
}

/**
 * 全局store
 * 
 * - 小程序启动时, 可能 getApp 无法获取到实例, 所以有些时机不能用 app.store。
 */
export const Store = new StoreCenter();