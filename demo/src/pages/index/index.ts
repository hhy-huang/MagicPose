/*****************************************************************************
文件名: index
作者: wowbox
日期: 2021-01-19
描述: 
******************************************************************************/
import { pagify, BasePage, wxp, compute, LoggerFactory } from '../../base/index';
import { StoreCenter } from '../../store/index';
import { ServiceCore } from '../../services/index';
import util from '../../utils/util';

const Logger = LoggerFactory.getLogger("IndexPage");

@pagify()
export class IndexPage extends BasePage<StoreCenter, ServiceCore> {
  data = {
    count: 10,
    motto: '',
  }

  /**
   * 计算属性装饰器用法
   * - 函数名就是属性的名字，wxml: {{user}}
   */
  @compute
  user() {
    return this.$store.user.user;
  }

  public onLoad(options: IAnyObject) {
    
  }

  public onShareAppMessage(options: IShareAppMessageOption): ICustomShareContent {
    
    return {}
  }

  public onClickAvatarImage(e: Weapp.Event) {
    util.showNotify({
      message: "点击了头像",
      type: "info"
    })
  }

  public increase() {
    this.setDataSmart({count: this.data.count + 1})
  }
}
