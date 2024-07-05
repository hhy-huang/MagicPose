/*****************************************************************************
文件名: wxc-grid-item
作者: wowbox
日期: 2020-10-14
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, addUnit, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcGridItemComponent");

@comify()
export class WxcGridItemComponent extends BaseComponent<StoreCenter, ServiceCore> {

  private parent?: WechatMiniprogram.Component.TrivialInstance;

  relations = {
    '../grid/grid': {
      type: 'ancestor',
      linked: function(parent: WechatMiniprogram.Component.TrivialInstance) {
        // @ts-ignore
        this.parent = parent;
      },
      unlinked: function(parent: WechatMiniprogram.Component.TrivialInstance) {
        // @ts-ignore
        this.parent = undefined;
      }
    } as WechatMiniprogram.Component.RelationOption
  }

  // 组件属性列表
  properties = {
    /** 图标名称或图片链接, 如果设置了use-slot或者icon属性则不生效 */
    icon: String,
    /** 图标颜色, 如果设置了use-slot或者text属性则不生效 */
    iconColor: String,
    /** 回传给click事件的数据 */
    info: null,
    /** 文字 */
    text: String,
    /** 自定义宫格的所有内容 */
    useSlot: Boolean,
  }

  // 组件的初始数据
  data = {
    viewStyle: '',
  }

  /**
  * 引入外部样式类
  */
  externalClasses = ['content-class', 'icon-class', 'text-class']

  public onCreated() {
    Logger.info("onCreated");
  }

  // 生命周期函数 ready
  public onReady() {
    this.updateStyle();
  }

  // 组件属性值有更新时会调用此函数，不需要在 properties 中设置 observer 函数
  public onPropUpdate(prop: string, newValue: any, oldValue: any) {
    // 建议使用 @ob 方式
  }

  private updateStyle() {
    if (!this.parent) {
      return;
    }

    const { data, children } = this.parent;
    const {
      columnNum,
      border,
      square,
      gutter,
      clickable,
      center,
      direction,
      iconSize,
    } = data;

    const index = children.indexOf(this);
    const count = children.length;
    const isRightItem = (index+1) % columnNum === 0;
    const isLastLine = index >= (Math.ceil(count/columnNum)-1) * columnNum;
    const gutterValue = addUnit(gutter || 0);

    const styleWrapper = [];
    let width = `calc((100% + ${gutterValue}) / ${columnNum})`;

    if (square) {
      if (isLastLine) {
        let height = `calc((100% - 2*${gutterValue}) / ${columnNum})`;
        styleWrapper.push(`padding-top: ${height}`);
      } else {
        styleWrapper.push(`padding-top: ${width}`);
      }
    }

    if (isRightItem) {
      width = `calc((100% - 2 * ${gutterValue}) / ${columnNum})`;
    }

    styleWrapper.push(`width: ${width}`);

    if (gutter) {
      styleWrapper.push(`padding-right: ${gutterValue}`);

      if (index >= columnNum && !square) {
        styleWrapper.push(`margin-top: ${gutterValue}`);
      }
    }
    
    let contentStyle = '';

    if (square && gutter) {
      const gutterValue = addUnit(gutter);

      contentStyle = `
        right: ${isRightItem ? 0 : gutterValue};
        bottom: ${isLastLine ? 0 : gutterValue};
        height: auto;
      `;
    }

    this.setDataSmart({
      viewStyle: styleWrapper.join('; '),
      contentStyle,
      center,
      border,
      square,
      gutter,
      clickable,
      direction,
      iconSize,
    });
  }
  
  public onClick() {
    this.triggerEvent('click', {info: this.properties.info});
  }
}
