/*****************************************************************************
文件名: counter
作者: wowbox
日期: 2021-01-19
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../base/index';
import { StoreCenter } from '../../store/index';
import { ServiceCore } from '../../services/index';

const Logger = LoggerFactory.getLogger("CounterComponent");

@comify()
export class CounterComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    number: {
      value: 0,
      type: Number
    }
  }

  // 组件的初始数据
  data: AnyObject = {

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
  * 引入外部样式类
  */
  externalClasses = [
  
  ]

  /**
   * 计算属性装饰器用法
   * - 函数名就是属性的名字，wxml: {{isLogin}}
   */
  @compute
  isLogin() {
    return this.$store.isLogin;
  }

  @ob('number')
  public onNumberChange(value: any, old: any) {
    Logger.info(`属性 number 从 {0} 更新到了 {1}`, old, value)
  }

  // 生命周期函数 create
  public onCreated() {

  }

  // 生命周期函数 ready
  public onReady() {
  }

  // 组件属性值有更新时会调用此函数，不需要在 properties 中设置 observer 函数
  public onPropUpdate(prop: string, newValue: any, oldValue: any) {
    // 建议使用 @ob 方式
  }

  /**
   * 自定义的函数，不需要放在 methods 中
   */
  public increase() {
    this.setDataSmart({number: this.data.number + 1})
  }

  public decrease() {
    this.setDataSmart({number: this.data.number - 1})
  }
}
