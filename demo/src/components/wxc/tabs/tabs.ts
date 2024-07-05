/*****************************************************************************
文件名: wxc-tabs
作者: wowbox
日期: 2020-10-04
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcTabsComponent");

@comify()
export class WxcTabsComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    /** 数据项格式为 `{title}` */
    items: {type: Array, value: []},
    /** 下划线颜色（分割线） */
    underLineColor: {type: String, value: '#eee'},
    /** 选中选项卡下划线颜色 */
    tabUnderlineColor: {type: String, value: '#008261'},
    /** 选中选项卡字体颜色 */
    tabActiveTextColor: {type: String, value: '#008261'},
    /** 未选中选项卡字体颜色 */
    tabInactiveTextColor: {type: String, value: '#000000'},
    /** 选项卡背景颜色 */
    tabBackgroundColor: {type: String, value: '#ffffff'},
    /** 当前激活tab */
    activeTab: {type: Number, value: 0},
    /** 内容区域切换时长 */
    duration: {type: Number, value: 500},
  }

  externalClasses = [
    /** tab选项卡区样式, 例如让选项卡占满屏幕等 */
    "content-class",
    /** 选项卡样式 */
    "tab-class", 
    /** 选中选项卡样式 */
    "active-tab-class",
    /** 内容区域swiper的样式 */
    "swiper-class",
  ]

  // 组件的初始数据
  data: AnyObject = {
    currentView: 0
  }

  // 生命周期函数 create
  public onCreated() {

  }

  // 生命周期函数 ready
  public onReady() {
    
  }

  @ob('activeTab')
  public onActivetabChange(value: any, old: any) {
    const len = this.data.items.length;
    if (len === 0) {
      return;
    }

    let currentView = value - 1;
    if (currentView < 0) {
      currentView = 0;
    }

    if (currentView > len - 1) {
      currentView = len - 1;
    }

    this.setDataSmart({
      currentView
    });
  }

  public onTabClick(e: AnyObject) {
    const index = e.currentTarget.dataset.index;

    this.setDataSmart({activeTab: index});
    this.triggerEvent('tabclick', {index});
  }

  public onSwiperChange(e: AnyObject) {
    const index = e.detail.current;
    this.setDataSmart({activeTab: index});
    this.triggerEvent('change', {index});
  }
}
