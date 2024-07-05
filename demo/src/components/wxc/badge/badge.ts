/*****************************************************************************
文件名: wxc-badge
作者: wowbox
日期: 2020-10-03
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcBadgeComponent");

@comify()
export class WxcBadgeComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    value: {
      type: Number,
      optionalTypes: [String],
      value: 0
    },
    max: {
      type: Number,
      optionalTypes: [String],
      value: 99
    },
    /**
     * 类型
     * @enum [{"value": "info", "desc": "[缺省]信息"}, {"value": "dot", "desc": "小红点"}]
     */
    type: {
      type: String,
      value: 'info'
    }
  }

  @compute
  platform() {
    return this.$store.wxapi.isIOS ? "ios" : "android"
  }

  public onAttached() {
    this.changeValue()
  }

  @ob('value')
  public onValueChange(value: any, old: any) {
    this.changeValue()
  }

  @ob('max')
  public onMaxChange(value: any, old: any) {
    this.changeValue()
  }

  /**
   * 自定义的函数，不需要放在 methods 中
   */
  private changeValue() {
    let max = parseInt(this.data.max, 0) || 99;
    let val = parseInt(this.data.value, 0) || 0;

    if (val > max && this.data.value !== `${max}+`) {
      this.setDataSmart({
        value: `${max}+`
      })
    }
  }
}