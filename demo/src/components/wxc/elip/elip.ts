/*****************************************************************************
文件名: wxc-elip
作者: wowbox
日期: 2020-10-14
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcElipComponent");

@comify()
export class WxcElipComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    /** 行数 */
    line: {
      type: Number,
      value: 1
    },
    /** 内容 */
    text: String
  }

  @ob('line')
  public onLineChange(value: any, old: any) {
    // Logger.info('line => {0}', value)
  }

  public onReady() {
    // Logger.info('onReady')
  }
}
