/*****************************************************************************
文件名: wxc-grid
作者: wowbox
日期: 2020-10-14
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcGridComponent");

@comify()
export class WxcGridComponent extends BaseComponent<StoreCenter, ServiceCore> {
  private children: WechatMiniprogram.Component.TrivialInstance[] = []

  relations = {
    '../grid-item/grid-item': {
      type: 'descendant',
      linked: function(child: WechatMiniprogram.Component.TrivialInstance) {
        // @ts-ignore
        this.children = this.children || []
        // @ts-ignore
        this.children.push(child);
      },
      unlinked: function(child: WechatMiniprogram.Component.TrivialInstance) {
        // @ts-ignore
        this.children = (this.children).filter((it) => it !== child);
      }
    } as WechatMiniprogram.Component.RelationOption
  }

  // 组件属性列表
  properties = {
    /** 是否将格子固定为正方形 默认 false */
    square: Boolean,
    /** 格子之间的间距，默认单位为px */
    gutter: {
      type: Number, 
      optionalTypes: [String],
      value: 0
    },
    /** 是否可点击 默认: false */
    clickable: Boolean,
    /** 列数 默认 4 */
    columnNum: {type: Number, value: 4 },
    /** 是否将格子内容居中显示 默认 true */
    center: {type: Boolean, value: true},
    /** 是否显示边框 默认 true */
    border: {type: Boolean, value: true},
    /**
     * 格子内容排列的方向，可选值为 horizontal, 缺省 vertical 
     * @enum [{"value": "horizontal"}, {"value": "vertical", "desc": "[缺省]"}]
     */
    direction: String,
    /** 图标大小，默认单位为px */
    iconSize: String,
  }

  // 组件的初始数据
  data = {
    viewStyle: '',
  }

  public onCreated() {
    // @ts-ignore
    this.isCreated = true;
  }

  // 生命周期函数 create
  public onAttached() {
    Logger.info('onAttached')
  }

  public onReady() {
    Logger.info('onReady')
  }

  public onDetached() {
    this.children = []
  }

  // 组件属性值有更新
  public onPropUpdate(prop: string, newValue: any, oldValue: any) {
    Logger.info('onPropUpdate {0}', prop)
    this.children && this.children.forEach((child: WechatMiniprogram.Component.TrivialInstance) => {
      child.updateStyle();
    });
  }
}
