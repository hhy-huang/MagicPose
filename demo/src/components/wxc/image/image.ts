/*****************************************************************************
文件名: wxc-img
作者: wowbox
日期: 2020-10-09
描述: 主要为图片增加 error placeholder。在图片链接错误时，有缺省的图片，而不是空白
******************************************************************************/
import { comify, BaseComponent, compute, ob, isDef, addUnit, LoggerFactory, isString } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcImgComponent");

const FIT_MODE_MAP = {
  none: 'center',
  fill: 'scaleToFill',
  cover: 'aspectFill',
  contain: 'aspectFit',
  widthFix: 'widthFix',
  heightFix: 'heightFix',
};

@comify()
export class WxcImgComponent extends BaseComponent<StoreCenter, ServiceCore> {
  // 组件属性列表
  properties = {
    /** 图片链接 */
    src: String,
    /** 是否为圆形 */
    round: Boolean,
    /** 宽度 默认单位px */
    width: null,
    /** 高度 默认单位px */
    height: null,
    /** 圆角大小 默认单位px */
    radius: null,
    /** backgroud 颜色 */
    backgroudColor: {
      type: String,
      value: "#ddd"
    },
    /** 是否懒加载 */
    lazyLoad: Boolean,
    /** 是否开启长按图片显示识别小程序码菜单 */
    showMenuByLongpress: Boolean,
    /**
     * 图片填充模式
     * 
     * @enum [{"value": "fill", "desc": "[缺省]`scaleToFill` 拉伸图片，使图片填满元素"},{"value": "none", "desc": "`center` 保持图片原有尺寸"}, {"value": "cover", "desc": "`aspectFill` 保持宽高缩放图片，使图片的短边能完全显示出来，裁剪长边"},{"value": "contain", "desc": "`aspectFit` 保持宽高缩放图片，使图片的长边能完全显示出来"}, {"value": "widthFix", "desc": "widthFix` 缩放模式，宽度不变，高度自动变化，保持原图宽高比不变"},{"value": "heightFix", "desc": "`heightFix` 缩放模式，高度不变，宽度自动变化，保持原图宽高比不变"}]
     */
    fit: {type: String, value: 'fill'},
    /** 用户自定义style */
    customStyle: String,
    /** 错误加载图片(本地图片) */
    placeholder: {type: String, value: '/res/placeholder.png'},
    /** 边框大小 缺省单位: px */
    borderSize: {type: Number, value: 0},
    /** 边框颜色 缺省: white */
    borderColor: {type: String, value: 'white'}
  }

  // 组件的初始数据
  data: AnyObject = {
    viewStyle: '',
    isError: false,
    border: ''
  }

  @ob('fit')
  public onFitChange(value: any, old: any) {
    if (value in FIT_MODE_MAP) {
      this.setDataSmart({
        // @ts-ignore
        mode: FIT_MODE_MAP[value],
      })
    }
  }
  
  @ob('radius', 'width', 'height')
  public onStyleChange(value?: any, old?: any) {
    const {width, height, radius, round} = this.data;
    let style = '';

    if (isDef(width)) {
      style += `width: ${addUnit(width)};`;
    }

    if (isDef(height)) {
      style += `height: ${addUnit(height)};`;
    }

    if (!round && isDef(radius)) {
      style += `overflow: hidden; border-radius: ${addUnit(radius)};`
    }

    this.setDataSmart({
      viewStyle: style
    })
  }

  @ob('borderColor', 'boderSize')
  public onBoderChange(value?: any, old?: any) {
    let {borderSize, borderColor} = this.data;

    if (isDef(borderSize) && isDef(borderColor)) {
      this.setDataSmart({
        border: `border-width: ${addUnit(borderSize)}; border-color: ${borderColor}; border-style: solid;`
      })
    } else {
      this.setDataSmart({
        border: ''
      })
    }
  }

  @ob('src')
  public onSrcChange(value: any, old: any) {
    this.updateSrc();
  }

  @ob('placeholder')
  public onPlaceholderChange(value: any, old: any) {
    if (!isString(this.data.placeholder) || this.data.placeholder.startsWith('http')) {
      this.setDataSmart({
        placeholder: '/res/placeholder.png'
      }, () => {
        this.updateSrc();
      })
    }
  }

  private updateSrc() {
    const src = this.data.src;
    if (isString(src) && (src.startsWith("http") || src.startsWith("/res/"))
      // 错误情况不处理
      && !(this.data.isError && src === this.data.placeholder)) {

      this.setDataSmart({
        isError: false
      })
    } else {
      if (src !== this.data.placeholder || !this.data.isError) {
        this.setDataSmart({
          src: this.data.placeholder,
          isError: true
        });
      }
    }
  }

  public onLoadError(event: AnyObject) {
    this.setDataSmart({
      src: this.data.placeholder,
      isError: true
    });
  }

  public onReady() {
    this.onFitChange(this.data.fit, '');
    this.onStyleChange()
    this.onBoderChange();
  }
}
