import { MobxPage } from '@we-app/core'
import { BaseStore } from './base_store'
import { BaseApp } from './base_app'
import { EVENT } from '../common/const/eventList';
import { BaseServiceCore } from './base_service_core';

export class BasePage<S extends BaseStore = BaseStore, V extends BaseServiceCore = BaseServiceCore, D = IAnyObject> extends MobxPage<D, S, BaseApp<S, V>, V> {
  
  public onGetUserInfo(e: Weapp.Event) {
    // @ts-ignore
    if (wx.getUserProfile) {
      if (e.detail.errMsg) {
        return;
      }
      
      // @ts-ignore
      wx.getUserProfile({
        desc: '完善用户资料',
        success: (res: any) => {
          this.fireEvent(EVENT.UPDATE_PROFILE, res.userInfo);
        },
        fail: (err: any) => {
          console.log("获取用户资料失败", err);
        }
      });
    } else {
      if (e.detail.errMsg === 'getUserInfo:ok') {
        let user = e.detail.userInfo;
        this.fireEvent(EVENT.UPDATE_PROFILE, user);
      }
    }
  }
}
