/*****************************************************************************
文件名: wxc-tooltip
作者: wowbox
日期: 2020-11-24
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcTooltipComponent");

@comify()
export class WxcTooltipComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 控制显示 */
    show: {
      type: Boolean,
      value: true
    },
    /** 提示内容 */
    content: {
      type: String,
      value: ''
    },
    /** 是否显示遮罩层 */
    mask: Boolean,
    /** 是否是圆角 */
    round: {
      type: Boolean,
      value: true
    },
    /**
     * 弹出位置
     * @enum [{"value": "top-start", "desc": ""}, {"value": "top", "desc": ""}, {"value": "top-end", "desc": ""}, {"value": "left-start", "desc": ""}, {"value": "left", "desc": ""}, {"value": "left-end", "desc": ""}, {"value": "right-start", "desc": ""}, {"value": "right", "desc": ""}, {"value": "right-end", "desc": ""}, {"value": "bottom-start", "desc": ""}, {"value": "bottom", "desc": ""}, {"value": "bottom-end", "desc": ""}]
     */
    placement: {
      type: String,
      value: 'bottom'
    },
    /**
     * 主题风格
     * @enum [{"value": "dark", "desc": "黑色背景"}, {"value": "light", "desc": "白色背景"}]
     */
    theme: {
      type: String,
      value: 'dark'
    },
    /** 文本区域宽度 */
    contentWidth: {
      type: String,
      value: '100'
    },
    /** 文本区域高度 */
    contentHeight: {
      type: String,
      value: 'auto'
    },
    /** 位置偏移 [x, y] 单位px*/
    offset: {
      type: Array,
      optionalTypes: [String],
      value: [0, 0]
    },
    /** 层级 */
    zIndex: {
      type: Number,
      value: 995
    }
  }

  externalClasses = [
    "content-class"
  ]

  public closeTooltip(e: Weapp.Event) {
    this.setDataSmart({
      show: false
    })

    this.triggerEvent('close', e.detail);
  }
}
