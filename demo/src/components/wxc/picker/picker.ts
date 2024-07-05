/*****************************************************************************
文件名: picker
作者: songgenqing
日期: 2021-05-10
描述: 自带的picker无法在电脑端使用。shit~~~~~~~~~~~~
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, isPlainObject, isArray, isFunction, isEmptyArray } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("PickerComponent");

@comify()
export class PickerComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 是否联动 */
    linked: Boolean,
    /** picker数据源 */
    listData: {
      type: Array,
      value: []
    },
    /** picker的默认选择 */
    default: {
      type: Array,
      value: []
    },
    /** 当listData的item是由对象组成的数组时，key指定显示项；或者当picker='link'时，供显示的key */
    key: {
      type: String,
      value: 'name'
    },
    /** 显示/隐藏 */
    show: {
      type: Boolean,
      value: false
    },
    /** 标题 */
    title: {
      type: String,
      value: ''
    },
    /** 设置蒙层的样式（详见picker-view） view */
    maskStyle: String,
    /** 设置选择器中间选中框的样式（详见picker-view） view */
    indicatorStyle: String
  }

  // 组件的初始数据
  data: AnyObject = {
    columnsData: [],
    value: [],
    /** 返回值 */
    backData: [],
    visible: false,
    /** 是否使用key。如果传入的数据item是对象，就需要制定显示的key */
    isUseKey: false,
  }

  /** 是否还在滚动中 */
  private scrollEnd = true;
  /** 上一次value数组 */
  private lastValue: any[] = [];
  /** 是否是首次打开 */
  private isFirstOpen = true;
  private onlyKey = '';
  /** 上次设置的缺省选项 */
  private lastDefaultData = undefined;
  /** 上次设置的数据源 */
  private lastListData = undefined;

  @ob('listData')
  public onListdataChange(value: any, old: any) {
    if (isEmptyArray(value) || this.isSameData()) return

    this.saveLastData()

    this.setDefault()
  }

  @ob('default')
  public onDefaultChange(value: any, old: any) {
    if (isEmptyArray(value) || this.isSameData()) return

    this.saveLastData()
    this.setDefault()
  }

  @ob('show')
  public onShowChange(value: any, old: any) {
    if (value) {
      this.openPicker()
    } else {
      this.setDataSmart({
        visible: false
      })
    }
  }

  public onClose() {
    this.closePicker(() => {
      this.triggerEvent('close')
    })
  }

  public onConfirm() {
    if (!this.scrollEnd) return
    const backData = this.getBackDataFromValue();
    this.setDataSmart({
      backData
    })
    
    this.closePicker(() => {
      this.triggerEvent('change', {
        value: backData
      })
    })
  }

  public onBindChange(e: Weapp.Event) {
    let val: any[] = e.detail.value.slice();

    if (this.data.linked) {
      // 重新计算value(子级索引重置为0)
      var column = this.getChangedColumn(val, this.lastValue)
      if (column > -1) {
        let i = 1
        while (val[column + i] !== undefined) {
          val[column + i] = 0
          i++
        }
      }

      // 根据新的value获取columndata
      var tempArray: any[] = []
      if (val.length > 1) {
        val.reduce((t, c, i) => {
          const v = t[c].children
          isArray(v) && tempArray.push(this.getColumnData(v))
          return v
        }, this.data.listData)
      }

      var columnsData = [this.data.columnsData[0], ...tempArray]

      this.lastValue = val
      this.setDataSmart({
        columnsData,
        value: val
      })
    } else {
      let column = this.getChangedColumn(val, this.lastValue);
      this.lastValue = val

      if (column !== -1) {
        this.triggerEvent('columnchange', {
          value: this.lastValue[column],
          column
        })
      }
    }
  }

  private getChangedColumn(newVal: any, oldVal: any) {
    if (isArray(newVal) && isArray(oldVal) && newVal.length === oldVal.length) {
      for (let i = 0, len = newVal.length; i < len; i++) {
        if (newVal[i] !== oldVal[i]) {
          return i
        }
      }
    }
    return -1;
  }

  public onBindpickend() {
    this.scrollEnd = true
  }

  public onBindpickstart() {
    this.scrollEnd = false
  }

  private openPicker() {
    if (!this.isFirstOpen) {
      if (!isEmptyArray(this.lastListData)) {
        this.setDefault(this.computedBackData(this.data.backData))
      }
    }
    this.isFirstOpen = false
    this.setDataSmart({
      visible: true
    })
  }

  /**
   * 关闭picker
   * @param cb 关闭时的回调方法
   */
  private closePicker(cb?: Function) {
    this.setDataSmart({
      visible: false
    })

    setTimeout(() => {
      this.setDataSmart({
        show: false
      });

      isFunction(cb) && cb();
    }, 300)
  }

  /**
   * 该获列的数据（去掉children项）
   * @param arr 列元数据
   * @returns 
   */
  private getColumnData(arr: any[]) {
    return arr.map(v => {
      const temp: AnyObject = {}
      for (const k in v) {
        k !== 'children' && (temp[k] = v[k])
      }
      return temp
    })
  }

  /**
   * 级联菜单根据ids获取索引(缺省项)
   * @param listData 数据源
   * @param idArr id列表 [{name: '1'}, {name: '2'}, {name: '3'}]
   * @param key   key值 如name就是key
   * @param arr   返回的索引值列表
   * @returns 
   */
  private getIndexByIdOfObject(listData: any[], idArr: any[], key: any, arr: any[]) {
    if (!Array.isArray(listData)) return
    if (arr.length === idArr.length) return;

    for (let i = 0, len = listData.length; i < len; i++) {
      if (listData[i][key] === idArr[arr.length][key]) {
        arr.push(i)
        this.getIndexByIdOfObject(listData[i].children, idArr, key, arr)
        break;
      }
    }
  }

  private setDefault(inBackData?: any) {
    let listData: any[] = this.data.listData;
    let defaultData = this.data.default;

    if (inBackData) {
      defaultData = inBackData
    }
    let backData = []

    if (this.data.linked) {
      var columnsData = []
      // 如果有默认值
      if (Array.isArray(defaultData) && defaultData.length > 0 && defaultData.every((v, i) => isPlainObject(v))) {
        const key = this.onlyKey = Object.keys(defaultData[0])[0]

        const arr: any[] = []

        this.getIndexByIdOfObject(listData, defaultData, key, arr)

        defaultData = arr
        let ii = 0
        do {
          columnsData.push(this.getColumnData(listData))
          listData = listData[defaultData[ii]].children
          ii++
        } while (listData)
        backData = columnsData.map((v, i) => v[defaultData[i]])
        // 如果没有默认值
      } else {
        this.onlyKey = this.data.key || 'name'
        do {
          columnsData.push(this.getColumnData(listData))
          listData = listData[0].children
        } while (listData)
        backData = columnsData.map((v) => v[0])
      }

      this.lastValue = defaultData.slice()

      this.setDataSmart({
        isUseKey: true,
        columnsData,
        backData
      })
      setTimeout(() => {
        this.setDataSmart({
          value: defaultData
        })
      }, 0)
    } else {
      // 数据项为对象，需要key
      if (isPlainObject(listData[0][0])) {
        this.setDataSmart({
          isUseKey: true
        })
      }

      if (Array.isArray(defaultData) && defaultData.length > 0) {
        backData = listData.map((v, i) => v[defaultData[i]])
        this.lastValue = defaultData.slice()
      } else {
        backData = listData.map((v) => v[0])
        this.lastValue = listData.map(v => 0)
      }

      this.setDataSmart({
        columnsData: listData,
        backData: backData,
        value: defaultData
      })
    }
  }

  /** 计算选取的值 */
  private computedBackData(backData: any[]) {
    if (this.data.linked) {
      const t = backData.map((v, i) => {
        const o = {} as AnyObject
        o[this.onlyKey] = v[this.onlyKey]
        return o
      })

      return t
    } else {
      // @ts-ignore
      return backData.map((v, i) => this.data.listData[i].findIndex((vv, ii) => this.compareObj(v, vv)))
    }
  }

  private compareObj(o1: any, o2: any) {
    const { key } = this.data
    if (typeof o1 !== 'object') {
      return o1 === o2
    } else {
      return o1[key] === o2[key]
    }
  }

  /**
   * 获取返回值
   * @returns 
   */
  private getBackDataFromValue() {
    let temp = []
    const val = this.lastValue;
    const columnsData: any[] = this.data.columnsData;
    if (isArray(val) && val.length > 0) {
      temp = columnsData.reduce((t, v, i) => {
        return t.concat(v[val[i]])
      }, [])
    } else {
      temp = columnsData.map((v, i) => v[0])
    }
    return temp
  }

  /** 是否是相同的数据 */
  private isSameData() { // 完全相等返回true
    return this.lastDefaultData === this.data.default && this.lastListData === this.data.listData
  }

  /** 保存上次的数据 */
  private saveLastData() {
    this.lastDefaultData = this.data.default
    this.lastListData = this.data.listData
  }
}
