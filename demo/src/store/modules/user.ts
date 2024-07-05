/*****************************************************************************
文件名: user
作者: wowbox
日期: 2019-01-24
描述: user 服务的stroe
******************************************************************************/
import { BaseStore, observable } from "../../base/index";


export class UserStore extends BaseStore {
  @observable isAuthorization: boolean = false;
  @observable user: WechatMiniprogram.UserInfo | null = null;
  @observable canWithdrawTotal: number = 0;
}

export const userStore = new UserStore()