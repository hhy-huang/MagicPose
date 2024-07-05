/*****************************************************************************
文件名: wxc-cell
作者: wowbox
日期: 2020-10-03
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcCellComponent");

@comify()
export class WxcCellComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    /** 左侧标题 */
    title: {
      type: String, 
      optionalTypes: [Number],
      value: ''
    },
    /** 右侧内容 */
    value: {
      type: String, 
      optionalTypes: [Number],
      value: ''
    },
    /**
     * value 对齐方式
     * @enum [{"value": "right", "desc": "[缺省]右对齐"}, {"value": "left", "desc": "左对齐"}]
     */
    valueAlign: {
      type: String,
      value: 'right'
    },
    /** value占位 */
    placeholder: String,
    /** 左侧图片链接 */
    icon: String,
    /**
     * 单元格大小
     * @enum [{"value": "large", "desc": "大号"}, {"value": "normal", "desc": "普通"}]
     */
    size: String,
    /** 标题下方的描述信息 */
    label: String,
    /** 是否使内容垂直居中 缺省: false */
    center: Boolean,
    /** 是否展示右侧箭头并开启点击反馈 缺省: false */
    isLink: Boolean,
    /** 页面名称. 例如: index */
    url: String,
    /** 是否显示表单必填星号 缺省: false */
    required: Boolean,
    /** 是否开启点击反馈 缺省: false */
    clickable: Boolean,
    /** 标题宽度 */
    titleWidth: {type: String, value: "6em"},
    /** 自定义style */
    customStyle: String,
    /** 
     * 箭头方向，缺省为right
     * @enum [{"value": "left"}, {"value": "up"}, {"value": "down"}]
     */
    arrowDirection: String,
    /** 箭头颜色 */
    arrowColor: String,
    /** 是否使用 label slot. 缺省: false */
    useLabelSlot: Boolean,
    /** 是否显示下边框. 缺省: true */
    border: {
      type: Boolean,
      value: true,
    },
    /** 标题样式 */
    titleStyle: String,
  }

  /**
  * 引入外部样式类
  */
  externalClasses = [
    'title-class',
    'label-class',
    'value-class',
    'right-icon-class',
    'hover-class',
  ]

  /**
   * 自定义的函数，不需要放在 methods 中
   */
  public onClick(event: Weapp.Event) {
    super.onClick(event);

    wx.nextTick(() => {
      let url = this.data.url
      // @ts-ignore
      let page = url && this.app.$url[url]
      if (this.data.isLink && page) {
        page.go()
      }
    })
  }
}
