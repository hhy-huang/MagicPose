/*****************************************************************************
文件名: switch
作者: songgenqing
日期: 2021-04-23
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("SwitchComponent");

@comify()
export class SwitchComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 标记为form组件
  behaviors = ["wx://form-field"]

  // 组件属性列表
  properties = {
    /** 开关是否选中。缺省: false */
    checked: null,
    /** 是否为加载状态。 缺省: false */
    loading: Boolean,
    /** 是否为禁用状态。缺省: false */
    disabled: Boolean,
    /** 打开时背景颜色 */
    activeColor: {
      type: String,
      value: '#F95B5B'
    },
    /** 关闭时背景颜色 */
    inactiveColor: {
      type: String,
      value: '#fff'
    },
    /** 开关尺寸。单位px */
    size: {
      type: String,
      value: '22',
    },
    /** 打开时的值。缺省: true */
    activeValue: {
      type: null,
      value: true,
    },
    /** 关闭时的值。缺省: false */
    inactiveValue: {
      type: null,
      value: false,
    },
  }

  // 组件的初始数据
  data: AnyObject = {

  }

  /**
  * 引入外部样式类
  */
  externalClasses = ["node-class"]

  public onClick(e: WechatMiniprogram.CustomEvent) {
    const { activeValue, inactiveValue, disabled, loading } = this.data;

    if (disabled || loading) {
      return;
    }

    const checked = this.data.checked === activeValue;
    const value = checked ? inactiveValue : activeValue;

    this.triggerEvent('change', value);
  }
}
