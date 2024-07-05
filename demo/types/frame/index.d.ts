/// <reference path="component.d.ts" />
/// <reference path="http.d.ts" />
/// <reference path="umeng.d.ts" />
/// <reference path="weapp.d.ts" />


// declare type IAnyObject = Record<string, any>

// declare type IPropsType = {
//   [key: string]: any[] | boolean
// }

// declare type Context = {
//   [key: string]: any;
// }

declare type IShareAppMessageOption = WechatMiniprogram.Page.IShareAppMessageOption
declare type ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent | void

declare interface FormatTimeOption {
  /** 显示毫秒 */
  second?: boolean,
  /** 显示年 */
  year?: boolean,
}

declare interface ThrottleOptions {
  /** 第一次首先执行 */
  leading?: boolean;
  /** 最后一次执行 */
  trailing?: boolean;
}

//////////////////////////////////////
// 通用
/////////////////////////////////////
declare interface ImageSource {
  url: string;
  thumb: string;
}