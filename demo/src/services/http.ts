/*****************************************************************************
文件名: http
作者: wowbox
日期: 2019-01-21
描述: http服务
******************************************************************************/

import { serify, BaseService, getService, LoggerFactory } from "../base/index";
import { StoreCenter } from "../store/index";
import { HttpRequest } from '../common/http/http';
import { EVENT } from '../common/const/eventList';
import { HttpApi } from '../common/http/httpApi';
import { ServiceCore } from './index';
import { uploadFile } from '../common/http/upload';
import { StorageKey } from "../common/const/storage";

const Logger = LoggerFactory.getLogger('HttpService');

const WhiteList: string[] = [
  // 不需要token的接口（除登录外）
]

/** 最大同时请求数 */
const MAX_REQUEST = 10;

@serify('http')
class HttpService extends BaseService<StoreCenter, ServiceCore> {
  /** 等待请求队列 */
  private waitQueue: HttpRequestItem[] = [];
  /** 当前请求数 */
  private runningCount = 0;

  /**
   * 服务初始化事件
   */
  onStart() {
    this.onEvent(EVENT.HTTP_LOGIN_SUCCESS, () => {
      this.next();
    });
  }
  
  /**
   * get 请求
   * @param url {string}
   * @param data {AnyObject} 缺省 {}
   */
  public get<T>(url: string, data: AnyObject = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requstInernal("GET", url, data, (resp: T) => {
        resolve(resp)
      }, (err: ErrorInfo) => {
        reject(err)
      })
    })
  }

  /**
   * post 请求
   * @param url 
   * @param data 
   */
  public post<T>(url: string, data: AnyObject = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requstInernal("POST", url, data, (resp: T) => {
        resolve(resp)
      }, (err: ErrorInfo) => {
        reject(err)
      })
    })
  }

  /**
   * 上传文件
   * @param path 
   */
  public uploadFile(path: string): Promise<string> {
    return uploadFile(path, this.$store.token);
  }

  // 执行队列里面的请求
  private next() {
    if (this.$store.isLogin) {
      while (this.waitQueue.length && this.runningCount < MAX_REQUEST) {
        let item = this.waitQueue.shift();
        this.requstInernal(item!.method, item!.path, item!.data, item!.success, item!.fail)
      }
    }
  }

  private requstInernal(method: MethodType, path: string, data: AnyObject, success?: Function, fail?: FailFunc) {
    let token: string = '';
    if (path === HttpApi.TokenLogin) {
      token = this.$storage.get(StorageKey.token);
      if (!token) {
        return fail && fail({code: -1, msg: "登录失败！token为空"})
      }
    } else if (path === HttpApi.WxLogin) {
      token = '';
    } else if (this.$store.token) {
      token = this.$store.token;
    } else if (WhiteList.indexOf(path) === -1) {
      this.waitQueue.push({path, method, data, success, fail});
      return;
    }

    if (this.runningCount > MAX_REQUEST) {
      this.waitQueue.push({path, method, data, success, fail});
      return;
    }

    this.runningCount++;
    let promise = new HttpRequest().request(path, data, method, token)
    promise.then((resp: ResponseInfo) => {
      if (resp.status === 0) {
        success && success(resp.data);
      } else if (resp.status === 101) {
        // token 过期, 需要重新获取token
        this.$service.login.reLogin();
        if (path !== HttpApi.TokenLogin && path !== HttpApi.WxLogin) {
          this.waitQueue.push({path, method, data, success, fail});
        }
      } else {
        let err = {code: Number(resp.status), msg: resp.error}
        Logger.error('requstInernal path: {0} error: {1}', path, err);
        fail && fail(err)
      }
    }).catch((err: ErrorInfo) => {
      Logger.error('requstInernal path: {0} error: {1}', path, err);
      fail && fail(err);
    }).finally(() => {
      this.runningCount = Math.max(0, --this.runningCount);
      this.next();
    })
  }
}

export const http = getService('http') as HttpService
