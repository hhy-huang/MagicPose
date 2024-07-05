/*****************************************************************************
 * 文件名: wxc-parser
 * @tutorial https://github.com/jin-yufeng/Parser
 * @version 20201029
 * @author JinYufeng
 * @listens MIT
 * @deprecated 富文本组件
 ******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, Timer } from '../../../base/index';
import { StoreCenter } from '../../../store/index';
import { ImageList } from './libs/image-list';
import { HtmlParser } from "./libs/html-parser";
import { service, ServiceCore } from '../../../services';

const Logger = LoggerFactory.getLogger("WxcParserComponent");
const cache: IAnyObject = {};

function hash(str: string) {
  let val = 5381;
  for (let i = str.length; i--;) {
    val += (val << 5) + str.charCodeAt(i);
  }

  return val;
}

@comify()
export class WxcParserComponent extends BaseComponent<StoreCenter, ServiceCore> {

  public imgList = new ImageList();
  public videoContexts: any[] = [];
  // paser-group (未引入)
  public group?: IAnyObject;
  public i?: number;

  private _in?: IAnyObject;
  private timer = new Timer(true);

  options = {
    pureDataPattern: /^[acdgtu]|W/
  }

  // 组件属性列表
  properties = {
    /** 要显示的html字符串 */
    html: String,
    /** 是否允许播放视频时自动暂停其他视频 缺省: true */
    autopause: {
      type: Boolean,
      value: true
    },
    /** 是否自动给 table 加一个滚动层（使表格可以单独滚动）缺省: false */
    autoscroll: Boolean,
    /** 是否自动将 title 标签的内容设置到页面标题 缺省: true */
    autosetTitle: {
      type: Boolean,
      value: true
    },
    /** 压缩等级，可以选择是否移除 id 和 class */
    compress: Number,
    /** 主域名，设置后将给链接自动拼接上主域名或协议名 */
    domain: String,
    /** 是否开启图片懒加载 缺省: false */
    lazyLoad: Boolean,
    /** 图片加载完成前的占位图 */
    loadingImg: String,
    /** 是否允许长按复制内容 缺省: false*/
    selectable: Boolean,
    /** 设置标签的默认样式 */
    tagStyle: Object,
    /** 是否使用渐显动画 缺省: false */
    showWithAnimation: Boolean,
    /** 是否使用页面内锚点 缺省: false  */
    useAnchor: Boolean,
    /** 是否使用缓存，设置后多次打开不用重复解析 缺省: false */
    useCache: Boolean
  }

  // 组件的初始数据
  data: IAnyObject = {
    nodes: [] 
  }


  @ob('html')
  public onHtmlChange(value: string, old: string) {
    Logger.info('onHtmlChange value: {0}', value)
    this.setContent(value);
  }

  public onDetached() {
    this.imgList.clear();
    this.timer.clear();
  }

  /** 锚点跳转 */
  public in(obj: IAnyObject) {
    if (obj.page && obj.selector && obj.scrollTop) {
      this._in = obj;
    }
  }

  public navigateTo(obj: IAnyObject) {
    if (!this.data.useAnchor) {
      return obj.fail && obj.fail('Anchor is disabled');
    }

    let selector = (this._in ? this._in.page : this).createSelectorQuery().select((this._in ? this._in.selector : '.top') + (obj.id ? '>>>#' + obj.id : '')).boundingClientRect();
    if (this._in) { 
      selector.select(this._in.selector).fields({
        rect: true,
        scrollOffset: true
      });
    } else {
      selector.selectViewport().scrollOffset();
    }

    selector.exec((res: any[]) => {
      if (!res[0]) {
        return this.group ? this.group.navigateTo(this.i, obj) : obj.fail && obj.fail('Label not found');
      }

      let scrollTop = res[1].scrollTop + res[0].top - (res[1].top || 0) + (obj.offset || 0);
      if (this._in) {
        let data: IAnyObject = {};
        data[this._in.scrollTop] = scrollTop;
        this._in.page.setDataSmart(data);
      } else {
        wx.pageScrollTo({
          scrollTop
        }) 
      }
      obj.success && obj.success();
    })
  }

  /** 获取文本 */
  public getText(ns: HTML_NODE[] = this.data.nodes) {
    let txt = '';
    for (let i = 0, n; n = ns[i++];) {
      if (n.type === 'text') {
        txt += n.text?.replace(/&nbsp;/g, '\u00A0').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      } else if (n.type === 'br') {
        txt += '\n';
      } else {
        // 块级标签前后加换行
        let br = n.name === 'p' || n.name === 'div' || n.name === 'tr' || n.name === 'li' || (n.name![0] === 'h' && n.name![1] > '0' && n.name![1] < '7');
        if (br && txt && txt[txt.length - 1] !== '\n') txt += '\n';
        if (n.children) txt += this.getText(n.children);
        if (br && txt[txt.length - 1] !== '\n') txt += '\n';
        else if (n.name === 'td' || n.name === 'th') txt += '\t';
      }
    }
    return txt;
  }

  /** 获取视频 context */
  public getVideoContext(id: number) {
    if (!id) {
      return this.videoContexts;
    }

    for (let i = this.videoContexts.length; i--;) { 
      if (this.videoContexts[i].id === id) {
        return this.videoContexts[i]; 
      }
    }
  }

  /** 渲染富文本 */
  public setContent(html: string, append?: IAnyObject) {
    let nodes; 
    // @ts-ignore
    let parser = new HtmlParser(html, this.data);
    // 缓存读取
    if (this.data.useCache) {
      let hashVal = hash(html);
      if (cache[hashVal]) {
        nodes = cache[hashVal];
      } else {
        cache[hashVal] = nodes = parser.parse();
      }
    } else {
      nodes = parser.parse();
    }

    this.triggerEvent('parse', nodes);

    let data: IAnyObject = {};
    if (append) {
      for (let i = this.data.nodes.length, j = nodes.length; j--;) {
        data[`nodes[${i + j}]`] = nodes[j];
      }
    } else {
      data.nodes = nodes;
    }
    
    if (this.data.showWithAnimation) {
      data.showAm = 'animation: show .5s';
    }

    this.setDataSmart(data, () => {
      this.updateMediaList();
      this.triggerEvent('load')
    });

    // 设置标题
    if (nodes.title && this.data.autosetTitle) {
      wx.setNavigationBarTitle({
        title: nodes.title
      })
    }

    let height = 0;
    this.timer.interval(() => {
      this.createSelectorQuery().select('.top').boundingClientRect(res => {
        if (!res) return;
        if (res.height === height) {
          this.triggerEvent('ready', res as IAnyObject)
          this.timer.clear();
        }
        height = res.height;
      }).exec();
    }, 350);
  }

  private updateMediaList() {
    this.imgList.clear();
    this.videoContexts = [];
    let ns = this.selectAllComponents('.top,.top>>>._node');
    for (let i = 0, n; n = ns[i++];) {
      n.setParser(this)
      for (let j = 0, item; item = n.data.nodes[j++];) {
        if (item.c) continue;
        // 获取图片
        if (item.name === 'img') {
          this.imgList.setItem(item.attrs.i, item.attrs['original-src'] || item.attrs.src);
        // image-grid
        } else if (item.name === 'img-grid') {
          if (!Array.isArray(item.attrs.source)) continue;
            
          for (let index = 0; index < item.attrs.source.length; index++) {
            const url = item.attrs.source[index];
            // @ts-ignore
            this.imgList.setItem((item.attrs.start+index).toString(), url);
          }
          // 音视频控制
        } else if (item.name === 'video' || item.name === 'audio') {
          let ctx: IAnyObject;
          if (item.name === 'video') {
            ctx = wx.createVideoContext(item.attrs.id, n);
          } else {
            ctx = n.selectComponent('#' + item.attrs.id);
          }

          if (ctx) {
            ctx.id = item.attrs.id;
            this.videoContexts.push(ctx);
          }
        }
      }
    }
  }
}
