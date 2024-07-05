/*****************************************************************************
文件名: wxc-fold-text
作者: wowbox
日期: 2020-11-23
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcFoldTextComponent");

@comify()
export class WxcFoldTextComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 原始文本 */
    text: String,
    /** 折叠阈值 缺省56 */
    maxLength: {
      type: Number,
      value: 56
    },
    /** 折叠阈值 缺省3 */
    maxLine: {type: Number, value: 3},
    /** 收起 */
    foldText: {
      type: String,
      value: '收起'
    },
    /** 查看全部 */
    unfoldText: {
      type: String,
      value: '查看全部'
    }
  }

  // 组件的初始数据
  data: AnyObject = {
    info: '',
    isNeedFold: false,
    isFold: true,
  }

  /**
  * 引入外部样式类
  */
  externalClasses = [
    'custom-fold-class'
  ]

  @ob('text')
  public onTextChange(value: any, old: any) {
    this.updateFold();
  }


  // 生命周期函数 ready
  public onReady() {
    this.updateFold();
  }

  /**
   * 自定义的函数，不需要放在 methods 中
   */
  public updateFold(reverse: boolean = false) {
    let isFold = !!this.data.isFold;
    isFold = reverse ? !isFold : isFold;
    let info: string = this.data.text ?? '';
    
    let isNeedLengthFold = info.length > 56;
    let isNeedLineFold = false;

    if (isNeedLengthFold && isFold) {
      info = info.slice(0, 56);
    }

    let temp = info.split(/[\n]/)
    if (temp.length > 3) {
      temp = temp.slice(0, 3);
      isNeedLineFold = true;
    } else {
      isNeedLineFold = false;
    }

    info = isFold ? temp.join('\n') : info;
    let isNeedFold = isNeedLineFold || isNeedLengthFold;
    
    if (isNeedFold && isFold) {
      info += '…';
    }

    this.setDataSmart({
      isFold,
      info,
      isNeedFold
    })
  }

  public onFold(e: Weapp.Event) {
    this.updateFold(true);
  }
}
