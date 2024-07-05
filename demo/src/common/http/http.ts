/********************************************
 * 基本的http请求封装
 * 注意: 
 * - 业务层使用http请直接使用service里面的
 * - 不要在这里添加业务相关代码。最多修改 RETRY_BLACK_LIST
 * 功能：
 * - 请求promise化
 * - 支持重试（2次）
 * - 支持abort中断请求
 ********************************************/
import { LoggerFactory } from '../../base';
import { config } from "../../config";
import { HttpApi } from './httpApi';


const Logger = LoggerFactory.getLogger('HttpRequest');
let baseUrl = config.debug ? config.httpUrlDebug : config.httpUrl;
const MAX_RETRY_TIME = 2;                                         // 重试次数
const RETRY_TIME_LIST = [50, 100, 200];                           // 重试的延迟时间
const RETRY_BLACK_LIST = [HttpApi.TokenLogin, HttpApi.WxLogin];   // 无需重试的接口

if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.substr(0, baseUrl.length-1);
}

export class HttpRequest {
  private retryTime = 0;
  private task?: WechatMiniprogram.RequestTask = undefined;

  /**
   * get 请求
   * @param url 
   * @param data 
   * @param token 
   * @param header 
   */
  public get(url: string, data: AnyObject, token: string, header?: AnyObject): Promise<ResponseInfo> {
    return this.request(url, data, 'GET', token, header);
  }

  /**
   * post 请求
   * @param url 
   * @param data 
   * @param token 
   * @param header 
   */
  public post(url: string, data: AnyObject | ArrayBuffer, token: string, header?: AnyObject): Promise<ResponseInfo> {
    return this.request(url, data, 'POST', token, header);
  }

  /**
   * 一般请求方法
   * @param url 
   * @param data 
   * @param method 
   * @param token 
   * @param header 
   */
  public request(url: string, data: AnyObject | ArrayBuffer, method: MethodType, token: string, header?: AnyObject): Promise<ResponseInfo> {
    return new Promise((resolve, reject) => {
      let success = (resp: ResponseInfo) => {
        resolve(resp);
      }

      let fail = (err: ErrorInfo) => {
        reject(err);
      }

      header = header || {
        token,
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }

      this.requestInternal(url, header, method, data, success, fail);
    });
  }

  /**
   * 中断请求
   */
  public abort() {
    this.task && this.task.abort();
  }


  private requestInternal(url: string, header: AnyObject, method: MethodType, data: AnyObject | ArrayBuffer, success: Function, fail: FailFunc, responseType: string = 'text') {
    Logger.debug('requestInternal url: {0} header: {1} method: {2}', url, header, method)

    let urlPath = url;
    let httpPatter = /^http/i;
    if (!httpPatter.test(url)) {
      url = url.startsWith('/') ? url : "/"+url;
      urlPath = baseUrl + url;
    }

    this.task = wx.request({
      url: urlPath,
      header,
      method,
      data,
      // @ts-ignore
      responseType,
      success: (resp: WechatMiniprogram.RequestSuccessCallbackResult) => {
        if ((resp.statusCode !== 200 || !resp.data) && this.retryTime < MAX_RETRY_TIME) {
          if (RETRY_BLACK_LIST.includes(url)) {
            fail({code: resp.statusCode, msg: resp.data ? String(resp.data) : "没有返回数据"})
          } else {
            setTimeout(() => {
              this.requestInternal(url, header, method, data, success, fail, responseType);
            }, RETRY_TIME_LIST[this.retryTime]);
            this.retryTime += 1;
          }
        } else if (resp.statusCode === 200) {
          success(resp.data)
        } else {
          fail({code: resp.statusCode, msg: String(resp.data)})
        }
      },
      fail: (err: WechatMiniprogram.GeneralCallbackResult) => {
        // 本地微信请求失败
        if (err.errMsg.indexOf('request:fail') !== -1 && this.retryTime < MAX_RETRY_TIME) {
          setTimeout(() => {
            this.requestInternal(url, header, method, data, success, fail, responseType);
          }, RETRY_TIME_LIST[this.retryTime]);
          this.retryTime += 1;
        } else {
          fail({code: -1, msg: err.errMsg});
        }
      }
    });
  }
}