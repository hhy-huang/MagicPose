/*****************************************************************************
文件名: trees
作者: JinYufeng
日期: 2020-11-28
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, wxp } from '../../../../base/index';
import { ServiceCore } from '../../../../services';
import { StoreCenter } from '../../../../store/index';
import { config } from "../libs/config";
import { WxcParserComponent } from '../parser';
const errorImg = config.errorImg;

const Logger = LoggerFactory.getLogger("TreesComponent");

@comify()
export class TreesComponent extends BaseComponent<StoreCenter, ServiceCore> {

  private parser?: WxcParserComponent;

  // 组件属性列表
  properties = {
    nodes: Array,
    /** 是否开启图片懒加载 */
    lazyLoad: Boolean,
    loading: String
  }

  // 组件的初始数据
  data: IAnyObject = {
    canIUse: !!wx.chooseMessageFile,
    placeholder: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='225'/>",
    ctrl: []
  }

  public setParser(parser: WxcParserComponent) {
    this.parser = parser
  }

  /** 复制pre代码 */
  public copyCode(e: Weapp.Event) {
    wxp.showActionSheet({itemList: ['复制代码']}).then(resp => {
      wx.setClipboardData({
        data: e.target.dataset.content
      })
    }).catch(error => {
      Logger.info("onCallOwner error: {0}", error)
    })
  }

  /** 视频播放事件 */
  public play(e: Weapp.Event) {
    if (!this.parser) return;

    this.parser.group?.pause(this.parser.i);
    if (this.parser.videoContexts.length > 1 && this.parser.data.autopause) {
      for (let i = this.parser.videoContexts.length; i--;) {
        if (this.parser.videoContexts[i].id !== e.currentTarget.id) { 
          this.parser.videoContexts[i].pause(); 
        } 
      } 
    }
  }

  /** 图片事件 */
  public imgtap(e: Weapp.Event) {
    if (!this.parser) return;

    let attrs = e.currentTarget.dataset.attrs;
    if (!attrs.ignore) {
      let preview = true;
      this.parser.triggerEvent('imgtap', {
        id: e.currentTarget.id,
        src: attrs.src,
        ignore: () => {
          preview = false;
          return false;
        }
      })

      if (preview) {
        if (this.parser.group) {
          return this.parser.group.preview(this.parser.i, attrs.i);
        }

        let urls = this.parser.imgList.urls;
        let current = urls[attrs.i] ? urls[attrs.i] : (urls = [attrs.src], attrs.src);
        wx.previewImage({
          current,
          urls
        })
      }
    }
  }

  public imageGridTap(e: Weapp.Event) {
    if (!this.parser) return;

    let attrs = e.currentTarget.dataset.attrs;
    let {index, src} = e.detail;
    if (!attrs.ignore) {
      let preview = true;
      this.parser.triggerEvent('imgtap', {
        id: e.currentTarget.id,
        src: src,
        ignore: () => {
          preview = false;
          return false;
        }
      })

      if (preview) {
        if (this.parser.group) {
          return this.parser.group.preview(this.parser.i, attrs.start+index);
        }

        let urls = this.parser.imgList.urls;
        let current = urls[attrs.start+index];
        wx.previewImage({
          current,
          urls
        })
      }
    }
  }

  public loadImg(e: Weapp.Event) {
    let i = e.target.dataset.i;
    if (this.data.lazyLoad && !this.data.ctrl[i]) {
      this.setDataSmart({
        [`ctrl[${i}]`]: 1
      }) 
    } else if (this.data.loading && this.data.ctrl[i] !== 2) {
      this.setDataSmart({
        [`ctrl[${i}]`]: 2
      }) 
    }
  }

  /** 链接点击事件 */
  public linkpress(e: Weapp.Event) {
    if (!this.parser) return;

    let jump = true;
    let attrs = e.currentTarget.dataset.attrs;
    attrs.ignore = () => {
      jump = false;
      return false;
    }
    this.parser.triggerEvent('linkpress', attrs);
    if (jump) {
      if (attrs['app-id']) {
        wx.navigateToMiniProgram({
          appId: attrs['app-id'],
          path: attrs.path
        }) 
      } else if (attrs.href) {
        if (attrs.href[0] === '#') {
          this.parser.navigateTo({
            id: attrs.href.substring(1)
          }) 
        } else if (attrs.href.indexOf('http') === 0 || attrs.href.indexOf('//') === 0) {
          wx.setClipboardData({
            data: attrs.href,
            success: () =>
              wx.showToast({
                title: '链接已复制'
              })
          }) 
        } else {
          wx.navigateTo({
            url: attrs.href,
            fail() {
              wx.switchTab({
                url: attrs.href,
              })
            }
          }) 
        }
      }
    }
  }

  /** 错误事件 */
  public handleError(e: Weapp.Event) {
    let source = e.target.dataset.source;
    let i = e.target.dataset.i;
    let node = this.data.nodes[i];
    if (source === 'video' || source === 'audio') {
      // 加载其他 source
      let index = (node.i || 0) + 1;
      if (index < node.attrs.source.length) {
        return this.setDataSmart({
          [`nodes[${i}].i`]: index
        })
      }
    } else if (source === 'img' && errorImg) {
      this.parser?.imgList.setItem(e.target.dataset.index, String(errorImg));
      this.setDataSmart({
        [`nodes[${i}].attrs.src`]: errorImg
      })
    }

    this.parser?.triggerEvent('error', {
      source,
      target: e.target,
      errMsg: e.detail.errMsg
    })
  }

  /** 加载视频项 */
  public loadVideo(e: Weapp.Event) {
    this.setDataSmart({
      [`nodes[${e.target.dataset.i}].attrs.autoplay`]: true
    })
  }
}
