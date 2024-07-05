/*****************************************************************************
文件名: wxc-flex
作者: wowbox
日期: 2020-10-03
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcFlexComponent");

@comify()
export class WxcFlexComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    /**
     * 主轴方向。取值范围:
     *
     * @enum [{"value": "left", "desc": "[缺省]水平正序"}, {"value": "right", "desc": "水平倒序"}, {"value": "top", "desc": "垂直正序"}, {"value": "bottom", "desc": "垂直倒序"}]
     */
    dir: {
      type: String,
      value: 'left'
    },
    /**
     * 主轴对齐方式
     * 
     * @enum [{"value": "start", "desc": "[缺省]启点排列"}, {"value": "end", "desc": "终点排列"}, {"value": "between", "desc": "两端对齐"}, {"value": "center", "desc": "居中对齐"}, {"value": "around", "desc": "等间分布"}]
     */
    main: {
      type: String,
      value: 'start'
    },
    /**
     * 交叉轴对齐方式
     * @enum [{"value": "stretch", "desc": "[缺省]拉伸铺满"}, {"value": "start", "desc": "启点排列"}, {"value": "end", "desc": "终点排列"}, {"value": "center", "desc": "居中对齐"}, {"value": "baseline", "desc": "基线对齐"}]
     */
    cross: {
      type: String,
      value: 'stretch'
    },
    /**
     * 换行设置
     * 
     * @enum [{"value": "nowrap", "desc": "[缺省]不换行"}, {"value": "wrap", "desc": "正序换行"}, {"value": "reverse", "desc": "倒序换行"}]
     */
    wrap: {
      type: String,
      value: 'nowrap'
    },
    /** 高度设置为auto */
    autoHeight: Boolean,
    /** 高度设置为auto */
    autoWidth: Boolean,
  }

  // 组件的初始数据
  data = {

  }

  public onClick(event: AnyObject) {
    let detail = event.detail;
    let option = {};
    this.triggerEvent('click', detail, option);
  }
}
