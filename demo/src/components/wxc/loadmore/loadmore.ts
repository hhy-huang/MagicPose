/*****************************************************************************
文件名: wxc-loadmore
作者: wowbox
日期: 2020-11-12
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcLoadmoreComponent");

@comify()
export class WxcLoadmoreComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 显示文本 */
    text: {
      type: String,
      value: "正在加载..."
    },
    /** 是否可见 */
    show: {
      type: Boolean,
      value: false
    },
    /** 文字颜色 */
    color: {
      type: String,
      value: "#999"
    },
    /** loading 样式 ：1,2,3 */
    index: {
      type: Number,
      value: 1
    },
    /** 
     * 颜色设置，只有index=3时生效：primary，red，orange，green 
     * @enum [{"value": "primary"}, {"value": "red"}, {"value": "orange"}, {"value": "green"}]
     */
    type: {
      type: String,
      value: ""
    }
  }
}
