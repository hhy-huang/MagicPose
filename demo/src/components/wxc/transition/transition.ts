/*****************************************************************************
文件名: transition
作者: songgenqing
日期: 2021-04-26
描述: 使元素从一种样式逐渐变化为另一种样式的效果。
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, isObject } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("TransitionComponent");
const getClassNames = (name: string) => ({
  enter: `wxc-${name}-enter wxc-${name}-enter-active enter-class enter-active-class`,
  'enter-to': `wxc-${name}-enter-to wxc-${name}-enter-active enter-to-class enter-active-class`,
  leave: `wxc-${name}-leave wxc-${name}-leave-active leave-class leave-active-class`,
  'leave-to': `wxc-${name}-leave-to wxc-${name}-leave-active leave-to-class leave-active-class`,
});

@comify()
export class TransitionComponent extends BaseComponent<StoreCenter, ServiceCore> {
  private status: "enter" | "leave" = "leave";
  private transitionEnded: boolean = true;

  // 组件属性列表
  properties = {
    /** 自定义样式 */
    customStyle: String,
    /** 是否展示组件 */
    show: {
      type: Boolean,
      value: false,
    },
    /** 动画时长，单位为毫秒 */
    duration: {
      type: null,
      value: 300,
    },
    /** 
     * 动画类型
     * @enum [{"value": "fade", "desc": "淡入"},{"value": "fade-up", "desc": "上滑淡入"},{"value": "fade-down", "desc": "下滑淡入"},{"value": "fade-left", "desc": "左滑淡入"},{"value": "fade-right", "desc": "右滑淡入"},{"value": "slide-up", "desc": "上滑进入"},{"value": "slide-down", "desc": "下滑进入"},{"value": "slide-left", "desc": "左滑进入"},{"value": "slide-right", "desc": "右滑进入"}]
     */
    name: {
      type: String,
      value: 'fade',
    },
  }

  // 组件的初始数据
  data: AnyObject = {
    type: '',
    inited: false,
    display: false,
  }

  /**
  * 引入外部样式类
  */
  externalClasses = [
    'enter-class',
    'enter-active-class',
    'enter-to-class',
    'leave-class',
    'leave-active-class',
    'leave-to-class',
  ]

  // 生命周期函数 ready
  public onReady() {
    if (this.data.show === true) {
      this.onShowChange(true, false);
    }
  }

  @ob('show')
  public onShowChange(value: any, old: any) {
    if (value === old) {
      return;
    }

    value ? this.enter() : this.leave();
  } 

  @ob('duration')
  public onDurationChange(value: any, old: any) {
    
  }

  private enter() {
    const { duration, name } = this.data;
    const classNames = getClassNames(name);
    const currentDuration = isObject(duration) ? duration.enter : duration;

    this.status = 'enter';
    this.triggerEvent('before-enter');

    this.requestAnimationFrame(() => {
      if (this.status !== 'enter') {
        return;
      }

      this.triggerEvent('enter');

      this.setDataSmart({
        inited: true,
        display: true,
        classes: classNames.enter,
        currentDuration,
      });

      this.requestAnimationFrame(() => {
        if (this.status !== 'enter') {
          return;
        }

        this.transitionEnded = false;
        this.setDataSmart({ classes: classNames['enter-to'] });
      });
    });
  }

  private leave() {
    if (!this.data.display) {
      return;
    }

    const { duration, name } = this.data;
    const classNames = getClassNames(name);
    const currentDuration = isObject(duration) ? duration.leave : duration;

    this.status = 'leave';
    this.triggerEvent('before-leave');

    this.requestAnimationFrame(() => {
      if (this.status !== 'leave') {
        return;
      }

      this.triggerEvent('leave');

      this.setDataSmart({
        classes: classNames.leave,
        currentDuration,
      });

      this.requestAnimationFrame(() => {
        if (this.status !== 'leave') {
          return;
        }

        this.transitionEnded = false;
        setTimeout(() => this.onTransitionEnd(), currentDuration);

        this.setDataSmart({ classes: classNames['leave-to'] });
      });
    });
  }

  private requestAnimationFrame(cb: () => void) {
    if (this.$store.wxapi.platform === 'devtools') {
      return setTimeout(() => {
        cb();
      }, 1000 / 30);
    }
  
    return wx
      .createSelectorQuery()
      .selectViewport()
      .boundingClientRect()
      .exec(() => {
        cb();
      });
  }

  public onTransitionEnd() {
    if (this.transitionEnded) {
      return;
    }

    this.transitionEnded = true;
    this.triggerEvent(`after-${this.status}`);

    const { show, display } = this.data;
    if (!show && display) {
      this.setDataSmart({ display: false });
    }
  }
}
