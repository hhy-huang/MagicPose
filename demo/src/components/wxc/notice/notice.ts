/*****************************************************************************
文件名: wxc-notice
作者: wowbox
日期: 2020-10-26
描述: 通知消息(顶部的消息条)
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcNoticeComponent");

@comify()
export class WxcNoticeComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 通告栏文案是否滚动。*/
    scroll: { type: Boolean, value: false },
    /** 是否显示通告栏。*/
    show: { type: Boolean, value: true },
    /** 通告栏文案。*/
    notice: { type: String, value: '' },
    /** 通告栏背景色。*/
    backgroundColor: { type: String, value: '#F95B5B' },
    /** 通告栏文案颜色。 */
    color: { type: String, value: '#fff' },
    /** 是否显示通告栏前面的 icon */
    showIcon: { type: Boolean, value: false },
    /** 通告栏前面的 icon 的颜色，配合 show-icon 使用 */
    iconColor: { type: String, value: '#fff' },
    /** 是否显示关闭按钮 */
    close: { type: Boolean, value: false },
    /** 通告栏关闭按钮前的遮罩层颜色，取背景颜色的 rgba 形式，a 的值为 0，配合关闭按钮一起使用 */ 
    bgRgba: { type: String, value: 'rgba(255, 85, 119, 0)' }
  }

  public onDismissNotice(event: Weapp.Event) {
    this.setDataSmart({
      show: false
    });

    let detail = event.detail;
    let option = {};
    this.triggerEvent('close', detail, option);
  }
}
