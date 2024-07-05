/*****************************************************************************
文件名: user
作者: 
日期: 2019-10-28
描述: 用户信息
******************************************************************************/

import { serify, BaseService, getService, wxp, LoggerFactory, action, runInAction } from "../base/index";
import { Store, StoreCenter } from "../store/index";
import { ServiceCore } from './index';
import { HttpApi } from '../common/http/httpApi';
import { EVENT } from '../common/const/eventList';

const Logger = LoggerFactory.getLogger("UserService");

@serify('user')
class UserService extends BaseService<StoreCenter, ServiceCore> {
  /**
   * 服务对外提供的数据
   */
  data = Store.user

  /**
   * 服务初始化事件
   */
  public onStart() {
    this.onEvent(EVENT.HTTP_LOGIN_SUCCESS, this.setUserInfo);
    this.onEvent(EVENT.UPDATE_PROFILE, this.updateUserProfile);
  }

  @action.bound
  private setUserInfo(loginInfo: LoginBean) {
    // TODO: this.data.user = loginInfo.user;

    this.data.isAuthorization = !!loginInfo.user.nickName;
  }

  /**
   * 设置用户资料
   * @param profile {WechatMiniprogram.UserInfo}
   */
  public async updateUserProfile(profile: WechatMiniprogram.UserInfo): Promise<any> {
    Logger.info('updateUserInfo')

    // TODO: 设置用户资料
    this.$store.user.user = profile;
    
    // try {
    //   await service.http.post(HttpApi.SetProfile, profile);

    //   Object.assign(this.data.user, profile);      
    // } catch (error) {
    //   Logger.error('updateUserInfo error => {0}', error)
    //   return Promise.reject(error);
    // }
  }
}

export const user = getService('user') as UserService