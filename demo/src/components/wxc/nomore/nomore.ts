/*****************************************************************************
文件名: wxc-nomore
作者: wowbox
日期: 2020-11-12
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcNomoreComponent");

@comify()
export class WxcNomoreComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
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
    /** 是否以圆点代替 "没有更多了" */
    isDot: {
      type: Boolean,
      value: false
    },
    /** isDot为false时生效 */
    text: {
      type: String,
      value: "没有更多了"
    }
  }

  // 组件的初始数据
  data = {
    dotText: "●"
  }
}
