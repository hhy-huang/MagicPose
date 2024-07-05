/*****************************************************************************
文件名: wxc-loading
作者: wowbox
日期: 2020-10-17
描述: Loading 加载
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcLoadingComponent");

@comify()
export class WxcLoadingComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 颜色 默认#c9c9c9 */
    color: {
      type: String,
      value: '#c9c9c9'
    },
    /** 是否垂直排列图标和文字内容 默认false */
    vertical: Boolean,
    /** 
     * 类型，可选值为 spinner 默认: circular 
     * @enum [{"value": "circular", "desc": "[缺省]"}, {"value": "spinner"}]
     */
    type: {
      type: String,
      value: 'circular'
    },
    /** 加载图标大小，默认20px */
    size: {
      type: String,
      value: '20'
    },
    /** 文字大小，默认14px */
    textSize: {
      type: String,
      value: '14'
    }
  }

  // 组件的初始数据
  data = {
    array12: Array.from({ length: 12 }),
  }
}
