/*****************************************************************************
文件名: wxc-empty
作者: wowbox
日期: 2020-10-05
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcEmptyComponent");

const PRESETS = ['error', 'search', 'default', 'network'];

@comify()
export class WxcEmptyComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    /** 描述文字 */
    desc: { 
      type: String, 
      value: "没有数据" 
    },
    /** 
     * 图片 default error search network 或者自定义  
     * @enum [{"value": "default", "desc": "[缺省]"}, {"value": "error"}, {"value": "search"}, {"value": "network"}]
     */
    image: { 
      type: String, 
      value: 'default' 
    },
  }

  @ob('image')
  public onImageChange(value: any, old: any) {
    if (PRESETS.indexOf(value) !== -1) {
      this.setDataSmart({
        imageUrl: `https://ali.img.cdn.iduoliao.cn/outdoor/res/empty-image-${value}.png`
      })
    } else {
      this.setDataSmart({ 
        imageUrl: value
      });
    }
  }

  public onAttached() {
    this.onImageChange(this.data.image, null);
  }
}
