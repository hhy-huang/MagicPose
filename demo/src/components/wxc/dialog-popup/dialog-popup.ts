/*****************************************************************************
文件名: wxc-dialog-popup
作者: wowbox
日期: 2020-12-17
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcDialogPopupComponent");

@comify()
export class WxcDialogPopupComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    show: Boolean,
    title: String,
  }

  externalClasses = [
    'title-class',
    'content-class'
  ]


  public none() {

  }

  public onClose() {
    this.setDataSmart({
      show: false
    });
    
    this.triggerEvent('close');
  }
}
