/*****************************************************************************
文件名: wxc-bottom-popup
作者: wowbox
日期: 2020-11-12
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, isNumber, toNumber } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';
import util from '../../../utils/util';

const Logger = LoggerFactory.getLogger("WxcBottomPopupComponent");
const systemInfo = wx.getSystemInfoSync();
const hasPageContainer = util.compareVersion(systemInfo.SDKVersion, "2.16.0") >= 0

@comify()
export class WxcBottomPopupComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 是否需要mask */
    mask: {
      type: Boolean,
      value: true
    },
    title: {
      type: String,
      value: ''
    },
    /** 是否可以手势滑动关闭 */
    enhance: Boolean,
    /** 控制显示 */
    show: {
      type: Boolean,
      value: false
    },
    /** 右上角菜单位 */
    hasMenuSlot: {
      type: Boolean,
      value: false
    },
    /** 背景颜色 */
    bgcolor: {
      type: String,
      value: "#fff"
    },
    /** 高度 px */
    height: {
      type: Number,
      value: 0
    }
  }

  data: AnyObject = {
    hasPageContainer
  }

  @ob('show')
  public onShowChange(value: any, old: any) {
    this.setDataSmart({
      visible: !!value
    });
  }

  @ob('height')
  public onHeightChange(value: any, old: any) {
    if (!isNumber(value)) {
      this.setDataSmart({
        height: toNumber(value)
      })
    }
  }

  public onClose() {
    if (!this.data.show) {
      return;
    }

    this.setDataSmart({
      visible: false
    });

    this.triggerEvent('close', {});

    setTimeout(() => {
      this.setDataSmart({
        show: false
      })
    })
  }

  public onEnhaceClose() {
    this.setDataSmart({
      visible: false
    })
    this.triggerEvent('close', {});
  }

  public onAfterLeave() {
    this.setDataSmart({
      show: false
    })
  }

  public forbid() { 

  }
}
