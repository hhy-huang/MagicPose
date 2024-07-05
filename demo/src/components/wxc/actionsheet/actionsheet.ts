/*****************************************************************************
文件名: wxc-actionsheet
作者: wowbox
日期: 2020-11-02
描述: 使用技巧：使用双向数据绑定来控制显示或者隐藏ActionSheet 
     <wxc-actionsheet show.sync="{{showActionSheet}}" .../>
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcActionsheetComponent");

@comify()
export class WxcActionsheetComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 点击遮罩 是否可关闭 */
    maskClosable: {
      type: Boolean,
      value: true
    },
    /** 显示操作菜单 */
    show: {
      type: Boolean,
      value: false
    },
    /** 额外信息，会在itemClick时回传 */
    extra: null,
    /** 菜单按钮数组，自定义文本颜色，红色参考色：#e53a37 */
    itemList: {
      type: Array,
      value: [{
        text: "确定",
        color: "#1a1a1a"
      }]
    },
    /** 提示文字 */
    tips: {
      type: String,
      value: ""
    },
    /** 提示文字颜色 */
    color: {
      type: String,
      value: "#9a9a9a"
    },
    /** 提示文字大小 */
    size: {
      type: Number,
      value: 13
    },
    /** 是否需要取消按钮 */
    isCancel: {
      type: Boolean,
      value: true
    }
  }

  // 组件的初始数据
  data: AnyObject = {

  }

  @ob('show')
  public onShowChange(value: any, old: any) {
    this.setDataSmart({
      visible: !!value
    })
  }

  public handleClickMask() {
    if (!this.data.maskClosable) {
      return;
    }

    this.handleClickCancel();
  }

  public handleClickItem(e: Weapp.Event) {
    if (!this.data.show) {
      return;
    }

    this.setDataSmart({ visible: false });

    let index = e.currentTarget.dataset.index;

    this.triggerEvent('itemclick', {
      index,
      text: this.data.itemList[index].text,
      extra: this.data.extra
    });

    setTimeout(() => {
      this.setDataSmart({show: false});
    }, 300)
  }

  public handleClickCancel() {
    this.setDataSmart({ visible: false })
    this.triggerEvent('cancel');

    setTimeout(() => {
      this.setDataSmart({show: false});
    }, 300)
  }
}
