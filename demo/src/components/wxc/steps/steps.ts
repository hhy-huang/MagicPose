/*****************************************************************************
文件名: wxc-steps
作者: wowbox
日期: 2020-12-03
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcStepsComponent");

@comify()
export class WxcStepsComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** ['1', '2'] */
    steps: Array,
    /** 活跃的步骤index */
    active: Number,
  }

}
