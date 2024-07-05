/*****************************************************************************
文件名: wxc-tag
作者: wowbox
日期: 2020-11-18
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, debounce } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';
import util from '../../../utils/util';

const Logger = LoggerFactory.getLogger("WxcTagComponent");

@comify()
export class WxcTagComponent extends BaseComponent<StoreCenter, ServiceCore> {

  private parent?: WechatMiniprogram.Component.TrivialInstance;

  relations = {
    '../tag-group/tag-group': {
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
    /** 是否可选 */
    checkable: Boolean,
    /** 是否禁用 */
    disabled: Boolean,
    /** 数据标识 缺省为title */
    value: null,
    /** 是否选择 */
    checked: Boolean,
    /** 是否display: block; */
    block: Boolean,
    /** 
     * 大小 可选值`large` `medium` 
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
    /** 标签文本 */
    text: String,
    /** 文本颜色  缺省 white*/
    textColor: String
  }

  data: IAnyObject = {
    viewStyle: ''
  }

  @ob('text')
  public onTextChange(value: any, old: any) {
    if (!this.data.value) {
      this.setDataSmart({
        value
      })
    }
  }

  @ob('checked', 'disabled', 'checkable')
  public onCheckedChange(newVal: any, oldVal: any) {
    if (this.data.checkable && this.data.disabled && this.data.checked) {
      this.setDataSmart({
        checked: false
      })
    }

    this.onStyleChange(null, null);
  }

  @ob('color', 'activeColor', 'plain', 'mark', 'textColor', 'value')
  public onStyleChange(value: any, old: any) {
    let plain = this.data.plain;
    let mark = this.data.mark;
    if (this.data.checkable) {
      plain = false;
      mark = false;
    }

    let viewStyle = this.getViewStyle();

    let data = {viewStyle};
    if (plain !== this.data.plain) {
      Object.assign(data, {plain});
    }
    if (mark !== this.data.mark) {
      Object.assign(data, {mark});
    }

    this.setDataSmart(data);
  }

  private getViewStyle() {
    let bgColor: string = this.data.color;
    let color: string = this.data.textColor;

    if (this.data.checkable) {
      if (this.data.disabled) {
        bgColor = '#ececec';
        color = '#999';
      } else {
        bgColor = this.data.checked ? (this.data.activeColor || '#F95B5B') : (this.data.color || '#ececec');
        color = this.data.checked ? 'white' : (this.data.textColor || '#333');
      }
    } else {
      if (this.data.color && !this.data.plain) {
        bgColor = this.data.color;
      }

      if (bgColor === 'random' && this.data.value) {
        bgColor = util.getRandomColor(this.data.value);
      }

      if (this.data.textColor || (this.data.color && !this.data.plain)) {
        color = this.data.textColor || this.data.color;
      }
    }

    let viewStyle = bgColor ? `background-color: ${bgColor};` : '';
    viewStyle = color ? `${viewStyle} color: ${color};` : viewStyle;

    return viewStyle;
  }

  public upadteStyle() {
    if (!this.parent) {
      return;
    }

    let { checkable, size, color, activeColor, plain, round, mark, textColor, value, block } = this.parent.data;
    let checked = value.includes(this.data.value);
    
    this.setDataSmart({
      checkable, size, color, activeColor, plain, round, mark, textColor, checked, block
    }, () => {
      this.onStyleChange(null, null);
    });
  }

  public onReady() {
    this.upadteStyle();
  }

  public onClick(e: WechatMiniprogram.CustomEvent) {
    if (this.parent && this.data.checkable && !this.data.disabled) {
      let max = this.parent.data.max;
      let checked = !this.data.checked;
      let count = this.parent.data.value.length;
      if (max === 1) {
        this.parent.clearAllChecked();
      } else {
        if (checked && max && count && count >= max) {
          wx.showToast({
            title: `最多只能选${max}个`,
            icon: 'none'
          });
          return;
        }
      }
      
      wx.nextTick(() => {
        this.data.checked = checked;
        let viewStyle = this.getViewStyle();
        this.setDataSmart({
          checked,
          viewStyle
        }, () => {
          if (this.parent) {
            this.parent.onValueChanged();
          }

          this.triggerEvent('select', {checked})
        })
      })
    }
  }
}
