/*****************************************************************************
文件名: eventList
作者: wowbox
日期: 2019-01-16
描述: 将事件统一放到这里了来
******************************************************************************/
import { EVENT_BASE_NAMES } from '../../base/index';


const EVENT_COMMON = {
  // ===================
  // 基本服务或工具事件
  // ===================
  /**
   * 内存告警 （wxapi service）
   */
  MEMORY_WARNING: '',



  // ===================
  // 跟项目相关事件
  // - 会随着项目而变动的事件
  // ===================


  /** 用户http登录成功 */
  HTTP_LOGIN_SUCCESS: '',
  /** 用户http登录失败 */
  HTTP_LOGIN_FAIL: '',
  /** 其他地方登陆踢掉 */
  KICKED_OUT: '',

  // 更新用户资料
  UPDATE_PROFILE: '',
  
  // 分享活动
  SHARE_TO_CHAT: '',
  SHARE_TO_MOMENTS: ''
}


// 把key转化为value
for (const key in EVENT_COMMON) {
  //@ts-ignore
  EVENT_COMMON[key] = key;
}

export const EVENT = {...EVENT_COMMON, ...EVENT_BASE_NAMES}