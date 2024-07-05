/*****************************************************************************
文件名: textarea
作者: songgenqing
日期: 2021-05-21
描述: 对系统texterea的封装
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, debounce } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("TextareaComponent");

@comify()
export class TextareaComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 是否双向绑定value。缺省：true */
    dualBind: {type: Boolean, value: true},
    /** 是否有边框 */
    border: Boolean,
    /** 是否显示计数 */
    count: {type: Boolean, value: true},
    /** 自定义样式 */
    customStyle: String,
    /** 高度，缺省100px */
    height: {type: Number, optionalTypes: [String], value: 150},
    /** 输入框的内容 */
    value: String,
    /** 输入框为空时占位符 */
    placeholder: String,
    /** placholder颜色 */
    placeholderColor: {type: String, value: '#ccc'},
    /** 是否禁用 */
    disabled: Boolean,
    /** 最大输入长度，缺省140。-1表示不限制长度 */
    maxlength: {type: Number, value: 140},
    /** (即将废弃，请直接使用 focus )自动聚焦，拉起键盘 */
    autoFocus: Boolean,
    /** 获取焦点 */
    focus: Boolean,
    /** 是否自动增高，设置auto-height时，style.height不生效 */
    autoHeight: Boolean,
    /** 如果 textarea 是在一个 position:fixed 的区域，需要显示指定属性 fixed 为 true */
    fixed: Boolean,
    /** 指定光标与键盘的距离。取textarea距离底部的距离和cursor-spacing指定的距离的最小值作为光标与键盘的距离 */
    cursorSpacing: Number,
    /** 指定focus时的光标位置 */
    cursor: {type: Number, value: -1},
    /** 是否显示键盘上方带有”完成“按钮那一栏 */
    showConfirmBar: {type: Boolean, value: true},
    /** 光标起始位置，自动聚集时有效，需与selection-end搭配使用 */
    selectionStart: {type: Number, value: -1},
    /** 光标结束位置，自动聚集时有效，需与selection-start搭配使用 */
    selectionEnd: {type: Number, value: -1},
    /** 键盘弹起时，是否自动上推页面 */
    adjustPosition: {type: Boolean, value: true},
    /** focus时，点击页面的时候不收起键盘 */
    holdKeyboard: Boolean,
    /** 是否去掉 iOS 下的默认内边距 */
    disableDefaultPadding: Boolean,
    /**
     * 设置键盘右下角按钮的文字
     * @enum [{"value": "send", "desc": "右下角按钮为“发送”"}, {"value": "search", "desc": "右下角按钮为“搜索”"}, {"value": "next", "desc": "右下角按钮为“下一个”"}, {"value": "go", "desc": "右下角按钮为“前往”"}, {"value": "done", "desc": "右下角按钮为“完成”"}, {"value": "return", "desc": "右下角按钮为“换行”"}]
     */
    confirmtype: {type: String, value: 'return'},
    /** 点击键盘右下角按钮时是否保持键盘不收起 */
    confirmHold: Boolean,
  }

  // 组件的初始数据
  data: AnyObject = {
    /** 输入框placeholder样式 */
    placeholderStyle: '',
  }

  @ob('placeholderColor')
  public onPlaceholderColorChange(value: any, old: any) {
    let placeholderStyle = '';
    if (this.data.placeholderColor) {
      placeholderStyle = `color: ${this.data.placeholderColor};`
    }

    this.setDataSmart({placeholderStyle})
  }

  /**
  * 引入外部样式类
  */
  externalClasses = [
    /** textarea 控件class */
    "textarea-class",
    /** 一般不建议使用 */
    "placeholder-class"
  ]

  public onAttached() {
    this.onPlaceholderColorChange(null, null);
  }

  @debounce()
  public onTextAreaFocus(e: Weapp.Event) {
    this.setDataSmart({
      focus: true
    })

    this.triggerEvent('focus', e.detail);
  }

  @debounce()
  public onTextAreaBlur(e: Weapp.Event) {
    this.setDataSmart({
      focus: false
    })

    this.triggerEvent('blur', e.detail);
  }

  @debounce()
  public onDetailInput(e: Weapp.Event) {
    if (this.data.dualBind) {
      this.setDataSmart({
        value: e.detail.value,
        cursor: e.detail.cursor
      })
    }
    
    this.triggerEvent('input', e.detail);
  }

  public onLineChange(e: Weapp.Event) {
    this.triggerEvent('linechange', e.detail);
  }

  public onConfirm(e: Weapp.Event) {
    this.triggerEvent("confirm", e.detail);
  }

  public onKeyboardHeightChange(e: Weapp.Event) {
    this.triggerEvent('keyboardheightchange', e.detail);
  }
}
