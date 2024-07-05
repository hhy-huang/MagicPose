/*****************************************************************************
文件名: wxc-tag-group
作者: wowbox
日期: 2020-11-18
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcTagGroupComponent");

@comify()
export class WxcTagGroupComponent extends BaseComponent<StoreCenter, ServiceCore> {
  private children: WechatMiniprogram.Component.TrivialInstance[] = []

  relations = {
    '../tag/tag': {
      type: 'descendant',
      linked: function(child: WechatMiniprogram.Component.TrivialInstance) {
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
    /** 选择的结果(也是默认的选择结果) 双向绑定 */
    value: Array,
    /** 可选的数量 缺省或0标识不限制 */
    max: Number,
    /** tag是否为block */
    block: Boolean,

    /** 是否可选 */
    checkable: Boolean,
    /** 
     * 大小 可选值`large` `medium` `small` 
     * @enum [{"value": "large"}, {"value": "medium"}, {"value": "small"}]
     */
    size: String,
    /** 标签颜色 */
    color: String,
    /** 标签选中颜色 */
    activeColor: String,
    /** 是否是空心样式 */
    plain: Boolean,
    /** 圆角样式 */
    round: Boolean,
    /** 是否为标记样式 */
    mark: Boolean,
    /** 文本颜色  缺省 white*/
    textColor: String
  }

  public onDetached() {
    this.children = []
  }

  @ob('value')
  public onValueChange(newVal: any, oldVal: any) {
    this.children.forEach((child: WechatMiniprogram.Component.TrivialInstance) => {
      child.upadteStyle();
    });
  }

  // 组件属性值有更新
  public onPropUpdate(prop: string, newValue: any, oldValue: any) {
    if (prop !== 'value') {
      this.children.forEach((child: WechatMiniprogram.Component.TrivialInstance) => {
        child.upadteStyle();
      });
    }
  }

  public clearAllChecked() {
    let value: any[] = [];
    this.data.value = [];
    this.setDataSmart({value});
  }

  public onValueChanged() {
    let value: any[] = [];
    this.children.forEach((child: WechatMiniprogram.Component.TrivialInstance) => {
      if (child.data.checked) {
        value.push(child.data.value)
      }
    })

    if (this.data.max && value.length > this.data.max) {
      Logger.error('onValueChanged 选择的的tag超过了允许的数量 count: {0} max: {1}', value.length, this.data.max)
      return;
    }

    this.setDataSmart({
      value
    })
  }
}
