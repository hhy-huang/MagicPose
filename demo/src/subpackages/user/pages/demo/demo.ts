/*****************************************************************************
文件名: demo
作者: wowbox
日期: 2020-10-27
描述: 
******************************************************************************/
import { pagify, BasePage, wxp, compute, LoggerFactory } from '../../../../base/index';
import { ServiceCore } from '../../../../services';
import { StoreCenter } from '../../../../store/index';

const Logger = LoggerFactory.getLogger("DemoPage");

@pagify()
export class DemoPage extends BasePage<StoreCenter, ServiceCore> {
  data = {
    
  }

  /**
   * 引入store数据
   */
  states = {
    /**
    isLogin: true,    // wxml中 {{store.isLogin}}
    test: ['count']   // wxml中 {{store.test.count}}
    */
  }

  /**
   * 计算属性装饰器用法
   * - 函数名就是属性的名字，wxml: {{user}}
   * 
   * @param string 格式: {子模块名}.{数据项}
   * 
   */
  @compute
  user() {
    return this.$store.user.user;
  }

  async onLoad(options: IAnyObject) {
    Logger.info('{0}', await wxp.getUserInfo())
  }

  public onShareAppMessage(options: IShareAppMessageOption): ICustomShareContent {
    
    return {}
  }

  public onTabItemTap(item: IAnyObject) {
    Logger.info(item.index)
    Logger.info(item.pagePath)
    Logger.info(item.text)
  }
}
