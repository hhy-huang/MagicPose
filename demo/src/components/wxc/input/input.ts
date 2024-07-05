/*****************************************************************************
文件名: input
作者: songgenqing
日期: 2021-05-18
描述: 封装input
      - 双向绑定value
      - 取值区间设置
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, debounce, toInteger, toNumber, isNumber, isDef } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("InputComponent");

const DEFAULT_MAX_LENGTH = 140;

@comify()
export class InputComponent extends BaseComponent<StoreCenter, ServiceCore> {

  behaviors = ["wx://form-field"]

  // 组件属性列表
  properties = {
    /** 是否双向绑定value。缺省：true */
    dualBind: {type: Boolean, value: true},
    /** 最小值 number、digit、money 类型适用。*/
    minValue: {type: Number, value: NaN},
    /** 最大值 number、digit、money 类型适用。*/
    maxValue: {type: Number, value: NaN},
    /** 0值时显示什么 */
    zeroValue: String,
    /**
     * input 的类型
     * - money: 对应digit类型，保留2位小数
     * - phone: 对应number, 11位
     * - idcard: 对应idcard, 18位
     * 
     * @enum [{"value": "text", "desc": "[缺省]文本输入键盘"}, {"value": "number", "desc": "数字输入键盘"}, {"value": "idcard", "desc": "身份证输入键盘"}, {"value": "digit", "desc": "带小数点的数字键盘"}, {"value": "money", "desc": "价格，取2位小数。type=digit"}, {"value": "phone", "desc": "手机号，11位。type=number"}]
     */
    type: String,
    /** 输入框内容 */
    value: String,
    /** 自定义样式 */
    customStyle: String,
    /** 是否是密码类型 */
    password: Boolean,
    /** 输入框为空时占位符 */
    placeholder: String,
    /** 输入框placeholder样式 */
    placeholderStyle: String,
    /** 是否禁用 */
    disabled: Boolean,
    /** 最大输入长度，缺省140。-1表示不限制长度 */
    maxlength: {type: Number, value: 140},
    /** 指定光标与键盘的距离，取 input 距离底部的距离和 cursor-spacing 指定的距离的最小值作为光标与键盘的距离 */
    cursorSpacing: Number,
    /** (即将废弃，请直接使用 focus )自动聚焦，拉起键盘 */
    autoFocus: Boolean,
    /** 获取焦点 */
    focus: Boolean,
    /**
     * 设置键盘右下角按钮的文字，仅在type='text'时生效
     * @enum [{"value": "send", "desc": "右下角按钮为“发送”"}, {"value": "search", "desc": "右下角按钮为“搜索”"}, {"value": "next", "desc": "右下角按钮为“下一个”"}, {"value": "go", "desc": "右下角按钮为“前往”"}, {"value": "done", "desc": "右下角按钮为“完成”"}]
     */
    confirmType: {type: String, value: 'done'},
    /** 强制 input 处于同层状态，默认 focus 时 input 会切到非同层状态 (仅在 iOS 下生效) */
    alwaysEmbed: Boolean,
    /** 点击键盘右下角按钮时是否保持键盘不收起 */
    confirmHold: Boolean,
    /** 指定focus时的光标位置 */
    cursor: Number,
    /** 光标起始位置，自动聚集时有效，需与selection-end搭配使用 */
    selectionStart: {type: Number, vlaue: -1},
    /** 光标结束位置，自动聚集时有效，需与selection-start搭配使用 */
    selectionEnd: {type: Number, value: -1},
    /** 键盘弹起时，是否自动上推页面 */
    adjustPosition: {type: Boolean, value: true},
    /** focus时，点击页面的时候不收起键盘 */
    holdKeyboard: Boolean
  }

  data: AnyObject = {
    inputType: 'text',
  }
  /**
  * 引入外部样式类
  */
  externalClasses = [
    "placeholder-class"
  ]

  @ob('type')
  public onTypeChange(value: any, old: any) {
    let data: AnyObject = {
      inputType: value
    };

    if (value === 'idcard') {
      data.maxlength = 18;
    } else if (value === 'money') {
      data.inputType = 'digit';
    } else if (value === 'phone') {
      data.inputType = 'number';
      if (this.data.maxlength === DEFAULT_MAX_LENGTH) {
        data.maxlength = 11;
      }
    }

    this.setDataSmart(data);
  }

  @ob('minValue')
  public onMinvalueChange(value: any, old: any) {
    if (isDef(value) && typeof value !== 'number') {
      this.setDataSmart({
        minValue: toNumber(value)
      })
    }
  }

  @ob('maxValue')
  public onMaxvalueChange(value: any, old: any) {
    if (isDef(value) && typeof value !== 'number') {
      this.setDataSmart({
        maxValue: toNumber(value)
      })
    }
  }

  @debounce()
  public onInput(e: Weapp.Event) {
    let value = e.detail.value;
    let cursor = e.detail.cursor;

    Logger.info("onInput: {0}", e.detail);

    let type = this.data.type;
    let maxValue = this.data.maxValue;
    let minValue = this.data.minValue;

    // text、idcard、phone直接处理
    if (['', 'idcard', 'text', 'phone'].includes(type)) {
      // @ts-ignore
      if (String(this.$data.value) === value) {
        this.setData({value, cursor});
      } else {
        this.setDataSmart({value, cursor});
      }

      this.triggerEvent("input", e.detail);
      return;
    }

    // money、number、digit
    let tempValue = type === 'number' ? toInteger(value) : toNumber(value);
    let moneyValue = '';
    // money类型最多2位小数
    if (type === 'money') {
      moneyValue = this.getMoneyValue(value);
      tempValue = toNumber(moneyValue);
    }

    // 处理极值
    if (typeof minValue === 'number' && !isNaN(minValue)) {
      tempValue = tempValue < minValue ? minValue : tempValue;
    }
    if (typeof maxValue === 'number' && !isNaN(maxValue)) {
      tempValue = tempValue > maxValue ? maxValue : tempValue;
    }

    // money 保留小数
    if (type === 'money' && tempValue === toNumber(moneyValue)) {
      tempValue = moneyValue;
    }
    // digit 保留小数
    if (type === 'digit' && isNumber(value) && tempValue === toNumber(value)) {
      tempValue = value;
    }

    // 0值处理
    if (String(tempValue) === '0') {
      tempValue = this.data.zeroValue;
    }

    // @ts-ignore 这里特殊使用下 $data
    if (String(this.$data.value) === String(tempValue)) {
      this.setData({
        value: tempValue,
        cursor
      })
    } else {
      this.data.dualBind && this.setDataSmart({
        value: tempValue,
        cursor
      })
    }

    this.triggerEvent("input", {value});
  }

  /**
   * 获取money的显示值，最多保留2位小数
   * @param value 
   */
  private getMoneyValue(value: string) {
    if (value.includes('.')) {
      let temp = value.split('.');
      if (temp[1].length > 2) {
        return toNumber(value).toFixed(2)+"";
      }
    }

    return value;
  }

  public onFocus(e: Weapp.Event) {
    this.triggerEvent("focus", e.detail);
  }

  public onBlur(e: Weapp.Event) {
    this.triggerEvent("blur", e.detail);
  }

  public onConfirm(e: Weapp.Event) {
    this.triggerEvent("confirm", e.detail);
  }

  public onKeyboardHeightChange(e: Weapp.Event) {
    this.triggerEvent('keyboardheightchange', e.detail);
  }
}
