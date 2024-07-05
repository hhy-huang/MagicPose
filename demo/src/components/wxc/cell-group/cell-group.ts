/*****************************************************************************
文件名: cell-group
作者: songgenqing
日期: 2021-06-01
描述: 给cell添加上下边框和title
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("CellGroupComponent");

@comify()
export class CellGroupComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    title: String,
    border: {
      type: Boolean,
      value: true,
    },
  }

  externalClasses = [
    "title-class"
  ]
}
