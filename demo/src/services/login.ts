/*****************************************************************************
文件名: login
作者: wowbox
日期: 2019-01-15
描述: 登录服务
******************************************************************************/

import { serify, BaseService, getService, wxp, Timer, LoggerFactory, action } from "../base/index";
import { StoreCenter } from "../store/index";
import { EVENT } from '../common/const/eventList';
import { ServiceCore } from './index';
import { HttpApi } from '../common/http/httpApi';
import { StorageKey } from "../common/const/storage";

const Logger = LoggerFactory.getLogger('LoginService');

const RELOGIN_TIME = 50;          // 重连初始时间50ms
const RELOGIN_TIME_STEP = 50;     // 50ms


@serify('login')
class LoginService extends BaseService<StoreCenter, ServiceCore> {
  private isLogining: boolean = false;  //是否登录中
  private reloginTimer = new Timer();
  private reloginTimeValue = RELOGIN_TIME;
  private oldToken = '';


  /**
   * 服务初始化事件
   */
  onStart() {
    this.oldToken = this.$storage.get(StorageKey.token);
    // TODO: 发起登录
    // this.login();
  }

  /**
   * 登录
   */
  public login() {
    Logger.info('login');
    if (!this.isLogining) {
      this.isLogining = true;
      if (this.oldToken) {
        this.tokenLogin()
      } else {
        this.wxLogin()
      }
    }
  }

  /**
   * 重新登录
   */
  @action.bound
  public reLogin() {
    Logger.info('reLogin 重新登录');
    this.isLogining = false;
    this.$storage.remove(StorageKey.token);
    this.oldToken = '';
    this.$store.token = '';
    this.$store.isLogin = false;
    this.reloginTimer.timeOut(() => {
      this.login();
    }, this.reloginTimeValue);
    this.reloginTimeValue += RELOGIN_TIME_STEP;
  }

  @action.bound
  public logout() {
    Logger.info("logout");

    this.$store.token = '';
    this.$store.isLogin = false;
    this.oldToken = '';
    this.$storage.remove(StorageKey.token);
  }

  public isLogin(): boolean {
    return this.$store.isLogin;
  }

  // token登录
  private tokenLogin() {
    Logger.info('tokenLogin')
    this.$service.http.post(HttpApi.TokenLogin, {
      token: this.oldToken
    }).then((resp: any) => {
      this.onLoginSuccess(resp);
    }).catch(() => {
      // 登录失败
      this.reLogin();
    });
  }

  private async wxLogin() {
    Logger.info('wxLogin');

    try {
      let code = (await wxp.login()).code;
      if (!code) {
        this.reLogin();
        return;
      }

      let resp = await this.$service.http.post<LoginBean>(HttpApi.WxLogin, {code});
      this.reloginTimer.clear();
      this.onLoginSuccess(resp);
    } catch (error) {
      Logger.error('wxLogin error {0}', error);
      this.reLogin();
    }
  }

  // 更新当前登录信息
  private onLoginSuccess(resp: LoginBean) {
    Logger.info('onLoginSuccess user: {0}', resp.user)
    this.isLogining = false;
    this.reloginTimeValue = RELOGIN_TIME;
    
    this.saveLoginInfo(resp);

    // 通知登录成功
    this.fireEvent(EVENT.HTTP_LOGIN_SUCCESS, resp);
  }

  @action.bound
  public saveLoginInfo(info: LoginBean) {
    this.$store.token = info.token;
    this.$store.isLogin = true;

    this.oldToken = info.token;
    this.$storage.set(StorageKey.token, info.token);
  }
}

export const login = getService('login') as LoginService