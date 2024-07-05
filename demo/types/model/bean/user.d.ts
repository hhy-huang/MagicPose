declare interface User {
  /** 用户id */
  userId: number;
  /** 昵称 */
  nickName: string;
  /** 头像地址 */
  avatar: string;
  /** 联系电话 */
  phone: string;
  /** 用户真实名称 */
  name: string;
  /** 身份证号码 */
  card: string;
  /** 待提现金额 */
  balance: number;
  /** 累计入账金额 */
  totalBalance: number;
  /** 是否订阅公众号消息 */
  subscription: boolean;
  /** 最后更新时间（长时间没更新的，需要前端尽快更新） */
  lastModified: string;
}

declare interface LoginBean {
  token: string;
  user: User;
}

declare interface SetProfileBean {
  /** 昵称 */
  nickName?: string;
  /** 头像url */
  avatar?: string;

  /** 用户真实名字 */
  name?: string;
  /** 联系电话 */
  phone?: string;
  /** 身份证号码 */
  card?: string;
}

/** 个人中心信息 */
declare interface UserPageInfo {
  /** 可提现金额 */
  canWithdrawTotal: number,
  /** 是否订阅公众号消息 */
  subscription: boolean,

  userId: number,
  nickName: string,
  avatar: string,
  phone: string,
  name: string,
  card: string,
  sex: Sex
}