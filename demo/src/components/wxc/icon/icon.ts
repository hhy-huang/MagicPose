/*****************************************************************************
文件名: wxc-icon
作者: wowbox
日期: 2020-10-04
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcIconComponent");

@comify()
export class WxcIconComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    /** icon前缀 缺省wxc-icon */
    classPrefix: {type: String,value: 'wxc-icon'},
    /** icon名称 或 图片url */
    name: String,
    /** icon大小 缺省16px */
    size: {type: String,optionalTypes: [Number],value: '16'},
    /** icon颜色 */
    color: String,
    /** 自定义style */
    customStyle: String,
  }

  externalClasses = [
    'hover-class'
  ]

  @ob('name')
  public onNameChange(value: any, old: any) {
    this.setDataSmart({
      isImageName: value.indexOf('/') !== -1
    })
  }
}
