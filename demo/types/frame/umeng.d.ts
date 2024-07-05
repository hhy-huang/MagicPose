declare interface InitParams {
  /**
   * @description
   * APP_KEY distributed by the Umeng<https://www.umeng.com/>
   */
  appKey: string;
  /**
   * @description
   * Whether or not to use openid for statistics, if this is false, the user statistics will be used by "Umeng" + random ID
   */
  useOpenid?: boolean;
  /**
   * @description If you need to get openid from the Umeng backend, please go to the Umeng backend to set the miniprogram's appId and secret
   */
  autoGetOpenid?: boolean;
  /**
   * @description debug mode
   */
  debug?: boolean;
  uploadUserInfo?: boolean;
}

declare type EventOptions =  string | {
  [key: string]: string | number
}

// declare namespace wx {
  
//   /**
//    * 友盟
//    */
//   namespace uma {
//     function init(_: InitParams): void;
//     function setOpenid(openid: string): void;
//     function setUserid(userId: string, provider?: any): void;
//     function setUnionid(unionid: string): void;
//     function trackEvent(event: string, options?: EventOptions): void;
//   }
// }