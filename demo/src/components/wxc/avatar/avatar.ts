/*****************************************************************************
文件名: wxc-avatar
作者: wowbox
日期: 2020-10-03
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcAvatarComponent");

@comify()
export class WxcAvatarComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 图片资源地址 */
    src: {
      type: String,
      value: ''
    },
    /** 是否是圆形 */
    round: { type: Boolean, value: true },
    /** 圆角矩形的弧度. 单位px */
    radius: {
      type: Number,
      value: 3
    },
    /** 消息数，显示在头像右上角 */
    count: {
      type: Number,
      value: 0
    },
    /** 边框大小 缺省单位: px */
    borderSize: {type: Number, value: 0},
    /** 边框颜色 缺省: white */
    borderColor: {type: String, value: 'white'}
  }
}
