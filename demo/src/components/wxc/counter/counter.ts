/*****************************************************************************
文件名: counter
作者: songgenqing
日期: 2021-05-04
描述: 数字输入框
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, toInteger, debounce } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("CounterComponent");

@comify()
export class CounterComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 输入结果值 */
    value: {
      type: Number,
      optionalTypes: [String],
      value: 0
    },
    /** 按钮图标颜色 */
    color: {
      type: String,
      value: "#FF4949"
    },
    /** 组件宽度 */
    width: {
      type: Number,
      optionalTypes: [String],
      value: 95
    },
    /** 单次步长。缺省：1 */
    step: {
      type: Number,
      value: 1
    },
    /** 最大值 */
    max: Number,
    /** 最小值。缺省：0 */
    min: {
      type: Number,
      optionalTypes: [String],
      value: 0
    },
    /** 禁用 */
    disabled: Boolean,
    /** 禁用输入框 */
    disabledInput: Boolean
  }

  /**
  * 引入外部样式类
  */
  externalClasses = [
    "input-class"
  ]

  public onMinus(e: Weapp.Event) {
    let min = toInteger(this.data.min);
    let max = toInteger(this.data.max);
    let disabled = !!this.data.disabled;
    let value = toInteger(this.data.value);
    let step = Math.max(toInteger(this.data.step), 1);
    
    if (min >= value || disabled) {
      return;
    }

    this.setDataSmart({
      value: value - step
    });

    this.triggerEvent("change", {
      type: 'minus',
      value: value - step
    });
  }

  public onPlus(e: Weapp.Event) {
    let min = toInteger(this.data.min);
    let max = toInteger(this.data.max);
    let disabled = !!this.data.disabled;
    let value = toInteger(this.data.value);
    let step = Math.max(toInteger(this.data.step), 1);
    
    if (max && max <= value || disabled) {
      return;
    }

    this.setDataSmart({
      value: value + step
    });

    this.triggerEvent("change", {
      type: 'add',
      value: value + step
    });
  }

  @debounce()
  public onInput(e: Weapp.Event) {
    let min = toInteger(this.data.min);
    let max = toInteger(this.data.max);
    let value = toInteger(e.detail.value);
    let disabled = !!this.data.disabled;
    if (disabled) {
      this.setData({
        value: this.data.value
      })
      return;
    }

    value = (max && max < value) ? max : value;
    value = min > value ? min : value;

    this.setData({
      value
    })

    this.triggerEvent("change", {
      type: 'input',
      value: value
    })
  }

  public onBlur(e: Weapp.Event) {
    // @ts-ignore
    this.triggerEvent('blur', e);
  }
}
