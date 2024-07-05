/*****************************************************************************
文件名: wxc-bubble-popup
作者: wowbox
日期: 2020-11-24
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, addUnit, toNumber, isString } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcBubblePopupComponent");

// 箭头大小
const ARROW_SIZE = 6;

@comify()
export class WxcBubblePopupComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 是否显示 */
    show: Boolean,
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

  // 组件的初始数据
  data: AnyObject = {
    offsetStyle: "",
  }

  @ob('offset')
  public onOffsetChange(value: any, old: any) {
    if (isString(value)) {
      let offset = value.split(',').map(v => toNumber(v));
      offset = offset.length === 2 ? offset : [0, 0];
      this.setDataSmart({offset})
    }

    wx.nextTick(() => {
      this.onPlacementChange(null, null);
    })
  }

  @ob('placement')
  public onPlacementChange(value: any, old: any) {
    const offset = this.data.offset as number[];
    if (!Array.isArray(offset) || offset.length !== 2) {
      return;
    }

    const placement: string = this.data.placement;
    let xoff = toNumber(offset[0]);
    let yoff = toNumber(offset[1]);
    let offsetStyle = '';

    switch (placement) {
      case 'top-start':
        offsetStyle = `left: ${addUnit(xoff)}; top: ${addUnit(-ARROW_SIZE + yoff)};`
        break;
      case 'top':
        offsetStyle = `left: calc(50% + ${addUnit(xoff)}); top: ${addUnit(-ARROW_SIZE + yoff)};`;
        break;
      case 'top-end':
        offsetStyle = `right: ${addUnit(-xoff)}; top: ${addUnit(-ARROW_SIZE + yoff)};`;
        break;
      case 'left-start':
        offsetStyle = `left: ${addUnit(-ARROW_SIZE + xoff)}; top: ${addUnit(yoff)};`
        break;
      case 'left':
        offsetStyle = `left: ${addUnit(-ARROW_SIZE + xoff)}; top: calc(50% + ${addUnit(yoff)});`
        break;
      case 'left-end':
        offsetStyle = `left: ${addUnit(-ARROW_SIZE + xoff)}; bottom: ${addUnit(-yoff)};`
        break;
      case 'right-start':
        offsetStyle = `right: ${addUnit(-ARROW_SIZE - xoff)}; top: ${addUnit(yoff)};`
        break;
      case 'right':
        offsetStyle = `right: ${addUnit(-ARROW_SIZE - xoff)}; top: calc(50% + ${addUnit(yoff)});`
        break;
      case 'right-end':
        offsetStyle = `right: ${addUnit(-ARROW_SIZE - xoff)}; bottom: ${addUnit(-yoff)};`
        break;
      case 'bottom-start':
        offsetStyle = `left: ${addUnit(xoff)}; bottom: ${addUnit(-ARROW_SIZE - yoff)};`
        break;
      case 'bottom':
        offsetStyle = `left: calc(50% + ${addUnit(xoff)}); bottom: ${addUnit(-ARROW_SIZE - yoff)};`
        break;
      case 'bottom-end':
        offsetStyle = `right: ${addUnit(-xoff)}; bottom: ${addUnit(-ARROW_SIZE - yoff)};`
        break;
      default:
        break;
    }
    
    this.setDataSmart({
      offsetStyle
    });
  }

  public onClose(e: Weapp.Event) {
    // @ts-ignore
    if (!this.data.show) {
      return;
    }

    this.setDataSmart({
      show: false
    })

    this.triggerEvent('close', e.detail);
  }

  public stop() {
    return false;
  }
}
