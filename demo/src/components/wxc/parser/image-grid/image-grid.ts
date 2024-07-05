/*****************************************************************************
文件名: image-grid
作者: wowbox
日期: 2020-12-01
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory } from '../../../../base/index';
import { ServiceCore } from '../../../../services';
import { StoreCenter } from '../../../../store/index';
import util from '../../../../utils/util';

const Logger = LoggerFactory.getLogger("ImageGridComponent");

@comify()
export class ImageGridComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    imgs: Array,
    lazyLoad: Boolean,
    showNum: {
      type: Number,
      value: 3
    } 
  }

  // 组件的初始数据
  data = {
    source: [] as ImageSource[]
  }
  
  @ob('imgs')
  public onImgsChange(value: string[], old: any) {
    if (!Array.isArray(value)) return;

    let imgs, more;
    if (value.length > 3) {
      imgs = value.slice(0, 3);
      more = `+${value.length}`;
    } else {
      imgs = value;
      more = '';
    }

    let source = imgs.map(url => {
      return {url, thumb: util.getThumb(url, ThumbType['120x120'])}
    });

    this.setDataSmart({
      source,
      more
    });
  }

  public onImageClick(e: Weapp.Event) {
    let src = e.currentTarget.dataset.src;
    let index = this.data.source.indexOf(src);

    this.triggerEvent('click', {src, index});
  }
}
