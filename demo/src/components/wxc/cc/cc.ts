/*****************************************************************************
文件名: wxc-cc
作者: wowbox
日期: 2020-10-03
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcCcComponent");

@comify()
export class WxcCcComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {

  }

  // 组件的初始数据
  data = {

  }

  /**
   * 引入store数据
   */
  states = {
    
  }

  // 生命周期函数 create
  public onCreated() {

  }

  // 生命周期函数 ready
  public onReady() {

  }
}
