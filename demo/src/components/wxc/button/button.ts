/*****************************************************************************
文件名: wxc-button
作者: wowbox
日期: 2020-10-17
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, addUnit } from '../../../base/index';
import { StoreCenter } from '../../../store/index';
import { openType } from "./mixin/open-type";
import { button } from "./mixin/default";
import util from '../../../utils/util';
import { ServiceCore } from '../../../services';

const Logger = LoggerFactory.getLogger("WxcButtonComponent");

@comify({mixins: [openType]})
export class WxcButtonComponent extends BaseComponent<StoreCenter, ServiceCore> {

  behaviors = [button]
  externalClasses = ['hover-class', 'loading-class', 'icon-class']

  // 组件属性列表
  properties = {
    /** 
     * 原生 button 标签的 type 属性 
     * @enum [{"value": "contact", "desc": "打开客服会话"}, {"value": "share", "desc": "触发用户转发"}, {"value": "getPhoneNumber", "desc": "获取用户手机号，可以从bindgetphonenumber回调中获取到用户信息"}, {"value": "getUserInfo", "desc": "获取用户信息，可以从bindgetuserinfo回调中获取到用户信息"}, {"value": "launchApp", "desc": "打开APP，可以通过app-parameter属性设定向APP传的参数"}, {"value": "openSetting", "desc": "打开授权设置页"}, {"value": "feedback", "desc": "打开“意见反馈”页面"}]
     */
    openType: String,
    /** 
     * 用于 form 组件 submit | reset 
     * @enum [{"value": "submit", "desc": "提交表单"}, {"value": "reset", "desc": "重置表单"}]
     */
    formType: String,
    /** 左侧图标名称或图片链接 */
    icon: String,
    /** icon大小 */
    iconSize: {type: String, optionalTypes: [Number],value: "1.2em"},
    /** 图标类名前缀，同 Icon 组件的 class-prefix 属性 */
    iconPrefix: {type: String,value: 'wxc-icon',},
    /** 是否是隐身, 配合open-type使用 */
    ghost: Boolean,
    /** 是否为朴素按钮 */
    plain: Boolean,
    /** 是否为块级元素 */
    block: Boolean,
    /** 是否为圆形按钮 */
    round: Boolean,
    /** 是否为方形按钮 */
    square: Boolean,
    /** 是否显示为加载状态 */
    loading: Boolean,
    /** 是否使用 0.5px 边框 */
    hairline: Boolean,
    /** 是否禁用按钮 */
    disabled: Boolean,
    /** 加载状态提示文字 */
    loadingText: String,
    /** 按钮自定义style */
    customStyle: String,
    /** 
     * 加载图标类型，可选值为 spinner 
     * @enum [{"value": "circular", "desc": "[缺省]"}, {"value": "spinner"}]
     */
    loadingType: {type: String, value: 'circular'},
    /** 
     * 按钮类型
     * 
     * @enum [{"value": "default", "desc": "默认 [白色]"},{"value": "primary", "desc": "主要 [主题色]"},{"value": "info", "desc": "信息 [蓝色]"},{"value": "warning", "desc": "警告 [黄色]"},{"value": "danger", "desc": "危险 [红色]"}]
     */
    type: {type: String,value: 'default'},
    /** 宽度 */
    width: String,
    /** 高度 */
    height: String,
    /** 圆角 */
    radius: String,
    /** 
     * 尺寸，可选值为 large small mini 
     * @enum [{"value": "normal", "desc": "[缺省]"}, {"value": "large"}, {"value": "small"}, {"value": "mini"}]
     */
    size: {type: String, value: 'normal'},
    /** 加载图标大小 */
    loadingSize: {type: String, optionalTypes: [Number], value: '20px'},
    /** 按钮颜色，支持传入 linear-gradient 渐变色 */
    color: String
  }

  // 组件的初始数据
  data: IAnyObject = {
    baseStyle: '',
  }

  @ob('color', 'width', 'height', 'radius')
  public onStyleChange(value: any, old: any) {
    let style = '';

    let {color, width, height, radius} = this.data;

    if (color) {
      style += `color: ${this.data.plain ? color : 'white'};`;

      if (!this.data.plain) {
        // Use background instead of backgroundColor to make linear-gradient work
        style += `background: ${color};`;
      }

      // hide border when color is linear-gradient
      if (color.indexOf('gradient') !== -1) {
        style += 'border: 0;';
      } else {
        style += `border-color: ${color};`;
      }
    }

    if (width) {
      style += `width: ${addUnit(width)};`;
    }

    if (height) {
      style += `height: ${addUnit(height)};`;
    }

    if (radius) {
      style += `border-radius: ${addUnit(radius)};`;
    }

    if (style !== this.data.baseStyle) {
      this.setDataSmart({ baseStyle: style });
    }
  }

  public onReady() {
    this.onStyleChange(null, null);
  }

  public onClick(event: WechatMiniprogram.CustomEvent) {
    if (!this.data.loading) {
      super.onClick(event);
    }
  }

  public noop(e: Weapp.Event) {
    // util.showToast('按钮已禁用')
  }
}
