/*****************************************************************************
文件名: drag
作者: songgenqing
日期: 2021-05-24
描述: 拖动排序
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, addUnit, isArray, Timer, debounce } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';
import util from '../../../utils/util';

const Logger = LoggerFactory.getLogger("DragComponent");
const SystemInfo = wx.getSystemInfoSync();

@comify()
export class DragComponent extends BaseComponent<StoreCenter, ServiceCore> {
  private pageMetaSupport = util.compareVersion(SystemInfo.SDKVersion, '2.9.0') >= 0;
  private rows = 0;
  private updateTimer = new Timer(true);

  // 组件属性列表
  properties = {
    /** 数据 */
    value: Array,
    /** 额外节点数据 */
    extraNodes: Array,
    /** 列数。缺省1 */
    columns: {type: Number, value: 1},
    /**  */
    topSize: {type: Number, value: 0},
    bottomSize: {type: Number, value: 0},
    /** 单项高度，不要求精确 */
    itemHeight: {type: Number, value: 100},
    /** 滚动顶部距离 */
    scrollTop: {type: Number, value: 0}
  }

  // 组件的初始数据
  data: AnyObject = {
    baseData: {},     // 传递给wxs的数据
    wrapStyle: '',    // item-wrap 样式
    list: [],         // 渲染数据列
    dragging: false,  // 是否监控move
  }

  @debounce()
  @ob('list')
  public onListChange(newVal: any, oldVal: any) {
    let list: any[] = this.data.list;
    let _list: any[] = [];
    list.forEach(v => {
      _list[v.sortKey] = v;
    })

    let value: any[] = _list.filter(v => !v.extraNode).map(item => item.data);

    this.setDataSmart({
      value
    })
  }

  public onReady() {
    this.init();
  }

  /////////////////////////////////
  // wxs 调用方法
  /////////////////////////////////

  public vibrate() {
    if (SystemInfo.platform !== "devtools") wx.vibrateShort({type: 'medium'});
  }

  public pageScroll(e: AnyObject) {
    if (this.pageMetaSupport) {
      this.triggerEvent("scroll", {
        scrollTop: e.scrollTop
      });
    } else {
      wx.pageScrollTo({
        scrollTop: e.scrollTop,
        duration: 300
      })
    }
  }

  public drag(e: AnyObject) {
    this.setDataSmart({
      dragging: e.dragging
    })
  }

  @debounce()
  public listChange(e: AnyObject) {
    // 这里不要使用setdata赋值
    this.data.list = e.list;
  }

  /** 拖动结束 */
  public sortend(e: AnyObject) {
    this.setDataSmart({
      list: e.list
    })
  }

  @debounce()
  public trigger(obj: AnyObject) {
    this.setDataSmart({
      value: obj.value
    })

    this.triggerEvent(obj.event, {value: obj.value})
  }

  /////////////////////////////////
  // 对外暴露方法
  /////////////////////////////////

  /**
   * 添加数据
   * @param data 
   */
  public addItem(data: any[] | any) {
    if (this.data.dragging) return;
      
    if (isArray(data)) {
      Object.assign(this.data.value, data);
    } else {
      this.data.value.push(data);
    }
    this.setDataSmart({
      value: this.data.value
    })

    this.updateTimer.timeOut(() => {
      this.init();
    }, 300);
  }

  /**
   * 删除数据
   * @param index 
   * @returns 
   */
  public deleteItem(index: number) {
    if (this.data.dragging) return;

    if (typeof index !== 'number' && index >= this.data.value.length || index < 0) {
      return;
    }

    this.data.value.splice(index, 1);

    this.setDataSmart({
      value: this.data.value
    })

    this.updateTimer.timeOut(() => {
      this.init();
    }, 300);
  }

  /////////////////////////////////
  // 内部方法
  /////////////////////////////////

  public itemClick(e: Weapp.Event) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.list[index] as AnyObject;

    this.triggerEvent('click', {
      key: item.realKey,
      data: item.data,
      extra: e.detail
    });
  }

  private initDom() {
    let baseData: AnyObject = {
      windowHeight: SystemInfo.windowHeight,
      realTopSize: this.data.topSize,
      realBottomSize: this.data.bottomSize,
      columns: this.data.columns,
      rows: this.rows
    }

    const query = this.createSelectorQuery();
    query.select('.item').boundingClientRect();
    query.select('.item-wrap').boundingClientRect();
    query.exec(res => {
      baseData.itemWidth = res[0].width;
      baseData.itemHeight = res[0].height;
      baseData.wrapLeft = res[1].left;
      baseData.wrapTop = res[1].top + this.data.scrollTop;
      this.setDataSmart({
        dragging: false,
        baseData,
        itemHeight: baseData.itemHeight,
        wrapStyle: `height: ${addUnit(this.rows * baseData.itemHeight)};`
      });
    });
  }

  public init() {
    this.setDataSmart({dragging: true});

    let delItem = (item: any, extraNode: any, dragId: string) => ({
      id: dragId,
      extraNode: extraNode,
      fixed: !!item.fixed,
      slot: item.slot,
      data: item
    });

    let {value, extraNodes} = this.data;
    let _list: any[] = [], _before: any[] = [], _after: any[] = [], destBefore: any[] = [], destAfter: any[] = [];

    let dragId = '';
    (extraNodes as any[]).forEach(item => {
      if (item.type === "before") {
        dragId = item.dragId || `before`;
        _before.push(delItem(item, true, dragId));
      } else if (item.type === "after") {
        dragId = item.dragId || `after`;
        _after.push(delItem(item, true, dragId));
      } else if (item.type === "destBefore") {
        dragId = item.dragId || `destBefore${item.destKey}`;
        destBefore.push(delItem(item, true, dragId));
      } else if (item.type === "destAfter") {
        dragId = item.dragId || `destAfter${item.destKey}`;
        destAfter.push(delItem(item, true, dragId));
      }
    });

    // 遍历数据源增加扩展项, 以用作排序使用
    value.forEach((item: any, index: number) => {
      destBefore.forEach((i) => {
        if (i.data.destKey === index) _list.push(i);
      });
      dragId = item.dragId || `item${index}`;
      _list.push(delItem(item, false, dragId));
      destAfter.forEach((i) => {
        if (i.data.destKey === index) _list.push(i);
      });
    });

    let i = 0, columns = this.data.columns;
    let list = (_before.concat(_list, _after) || []).map((item, index) => {
      item.realKey = item.extraNode ? -1 : i++; // 真实顺序
      item.sortKey = index; // 整体顺序
      item.tranX = `${(item.sortKey % columns) * 100}%`;
      item.tranY = `${Math.floor(item.sortKey / columns) * 100}%`;
      return item;
    });

    this.rows = Math.ceil(list.length / columns);

    this.setDataSmart({
      list,
      wrapStyle: `height: ${addUnit(this.rows * this.data.itemHeight)};`
    });

    if (list.length === 0) return;

    // 异步加载数据时候, 延迟执行 initDom 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
		setTimeout(() => this.initDom(), 0);
  }
}
