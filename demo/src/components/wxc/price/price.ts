/*****************************************************************************
文件名: price
作者: songgenqing
日期: 2021-04-27
描述: 价格显示
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, toInteger } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';
import util from '../../../utils/util';

const Logger = LoggerFactory.getLogger("PriceComponent");

@comify()
export class PriceComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 
     * 货币符号。默认为：pre 
     * @enum [{"value": "pre", "desc": "[缺省]￥，前面显示"}, {"value": "post", "desc": "元，后面显示"}, {"value": "none", "desc": "没有单位符号"}]
     */
    symbol: {
      type: String,
      value: 'pre'
    },
    /** 价格数值。单位：分 */
    value: {
      type: String,
      optionalTypes: [Number],
      value: ''
    },
    /**
     * 价格为0时显示的文案。缺省显示：免费
     * @enum [{"value": "", "desc": "0.00"}, {"value": "免费", "desc": "免费"}]
     */
    zeroValue: {
      type: String,
      value: '免费'
    },
    /** 
     * 人民币符号显示规则。缺省：同价格数字一致
     * @enum [{"value": "", "desc": "[缺省]空白，与价格数字一致"},{"value": "sub", "desc": "价格左下方"}, {"value": "sup", "desc": "价格左上方"}]
     */
    icon: {
      type: String,
      value: ''
    },
    /** 
     * 删除状态
     */
    del: Boolean,
    /** del 状态下文字颜色，只在del状态下有效，正常状态下文字颜色可继承父元素 */
    delColor: {
      type: String,
      value: '#999'
    },
    /**
     * 小数部分显示规则
     * @enum [{"value": "2", "desc": "[缺省]保留两位小数"}, {"value": "1", "desc": "保留1小数"}, {"value": "none", "desc": "只显示整数价格"}, {"value": "small", "desc": "小数字号缩小显示"}]
     */
    decimal: {
      type: String,
      value: '2'
    }
  }

  externalClasses = [
    "value-class",
    "zero-class"
  ]

  @ob('value', 'decimal', 'zeroValue')
  public onValueChange(news: any, old: any) {
    let value = toInteger(this.data.value);

    let price = util.getMoney(value);
    let decimalNum = undefined;

    switch (this.data.decimal) {
      case '1':
        price = util.getMoney(value, 1);
        break;
      case 'none':
        price = util.getMoney(value);
        price = String(toInteger(price));
        break;
      case 'small':
        let money = util.getMoney(value);
        price = String(toInteger(money));
        decimalNum = (money.split('.')[1] || '00').trim();
        break;
    }

    let data: AnyObject = {price};
    /** 价格为0时特殊处理 */
    if (value === 0 && this.data.zeroValue && this.data.value !== '') {
      data.value = '';
    }

    if (decimalNum !== undefined) {
      data.decimalNum = decimalNum;
    }

    // 这里不能使用setDataSmart，否则可能无法更改input的value。例如：例如现有的value是10，输入-10，处理后还是10。
    this.setData(data);
  }


  // 生命周期函数 ready
  public onReady() {
    this.onValueChange(null, null);
  }
}
