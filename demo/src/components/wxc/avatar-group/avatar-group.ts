/*****************************************************************************
文件名: wxc-avatar-group
作者: wowbox
日期: 2020-11-14
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcAvatarGroupComponent");

@comify()
export class WxcAvatarGroupComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /**
     * 头像列表
     * [string, string, string]
     */
    avatars: Array,
    /** 头像大小 */
    size: {
      type: Number,
      value: 40
    },
    /** 边框尺寸 */
    borderSize: {
      type: Number,
      value: 0
    },
    /** 边框颜色 */
    borderColor: {
      type: String,
      value: 'white'
    }
  }
}
