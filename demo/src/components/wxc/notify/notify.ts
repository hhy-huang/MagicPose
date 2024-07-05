/*****************************************************************************
文件名: notify
作者: songgenqing
日期: 2021-04-26
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("NotifyComponent");

@comify()
export class NotifyComponent extends BaseComponent<StoreCenter, ServiceCore> {
  private timer = 0;

  // 组件属性列表
  properties = {
    /** 展示文案，支持通过\n换行 */
    message: String,
    /** 背景颜色 */
    background: String,
    /** 
     * 类型 缺省：danger
     * @enum [{"value": "info", "desc": "普通信息"},{"value": "success", "desc": "成功信息"},{"value": "warning", "desc": "警告信息"},{"value": "danger", "desc": "危险信息"}]
     */
    type: {
      type: String,
      value: 'danger',
    },
    /** 字体颜色 */
    color: {
      type: String,
      value: "#fff",
    },
    /** 展示时长(ms)，值为 0 时，notify 不会消失。缺省：3000 */
    duration: {
      type: Number,
      value: 3000,
    },
    /** z轴层级 */
    zIndex: {
      type: Number,
      value: 1000,
    },
    /** 是否留出顶部安全距离（状态栏高度）。缺省：true */
    safeAreaInsetTop: {
      type: Boolean,
      value: true,
    },
    /** 顶部距离 */
    top: null,
  }

  // 组件的初始数据
  data: AnyObject = {
    show: false
  }

  @compute
  statusBarHeight() {
    return this.$store.wxapi.statusBarHeight + this.$store.wxapi.naviHeight;
  }

  public show() {
    const { duration } = this.data;

    clearTimeout(this.timer);
    this.setDataSmart({ show: true }, () => {
      this.triggerEvent("open")
    });

    if (duration > 0 && duration !== Infinity) {
      this.timer = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  public hide() {
    clearTimeout(this.timer);
    this.setDataSmart({ show: false }, () => {
      this.triggerEvent("close");
    });
  }
}
