/*****************************************************************************
文件名: wxc-navibar
作者: wowbox
日期: 2020-10-04
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, wxp } from '../../../base/index';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';

const Logger = LoggerFactory.getLogger("WxcNavibarComponent");

@comify()
export class WxcNavibarComponent extends BaseComponent<StoreCenter, ServiceCore> {
  properties =  {
    title: String,
    /** 背景，缺省是透明 */
    background: { type: String, value: 'white' },
    /** 文字颜色 */
    color: { type: String, value: "#333" },
    /** 是否显示返回 */
    back: { type: Boolean, value: true },
    /** 是否拦截返回 */
    interceptBack: {type: Boolean, value: false},
    /** 拦截文案 */
    interceptText: {
      type: String,
      value: '是否返回？'
    },
    /** 是否显示loading */
    loading: { type: Boolean, value: false },
    /** 是否支持显示隐藏动画 */
    animated: { type: Boolean, value: true },
    /** 是否显示 */
    show: { type: Boolean, value: true },
    /** 点击返回按钮要去到的页面 (通过 this.app.$url.xxxx 能找到页面, 会清空所有页面栈), 不传则按默认路径一层层返回 */
    backToPage: String, 
    /** 是否显示下划线 */
    line: {
      type: Boolean,
      value: true
    }
  }

  externalClasses = [
    "custom-back-backgroud"
  ]

  @compute
  statusBarHeight() {
    return this.$store.wxapi.statusBarHeight;
  }

  @compute
  naviHeight() {
    return this.$store.wxapi.naviHeight;
  }

  @compute
  ios() {
    return this.$store.wxapi.isIOS;
  }

  @ob('show')
  public onShowChange(value: any, old: any) {
    const animated = this.data.animated;
    let displayStyle = ''
    if (animated) {
      displayStyle = `opacity: ${value ? '1' : '0'};-webkit-transition:opacity 0.5s;transition:opacity 0.5s;`
    } else {
      displayStyle = `display: ${value ? '' : 'none'}`
    }
    this.setDataSmart({
      displayStyle
    })
  }

  public onAttached() {
    let rect = this.$store.wxapi.menuRect;
    if (!rect) return;

    let windowWidth = this.$store.wxapi.windowWidth;
    let routs = this.getPagesRouts();
    let hasBack = routs.length > 1;
    let indexPage = this.app.$home.url.substring(1);
    let hasHome = routs.indexOf(indexPage) === -1;
    let backContainer: string = '';
    let hasBackground = hasHome || this.data.background === 'transparent';

    let data = {
      innerPaddingRight: `padding-right: ${windowWidth - rect.left}px`,
      innerWidth: `width: ${rect.left}px`,
      leftWidth: `width: ${windowWidth - rect.left}px`,
      iconStyle: `width: ${rect.height}px;`,
    }

    if (this.data.back && hasBackground) {
      if (hasBack && hasHome) {
        backContainer = `height: ${rect.height}px; width: ${rect.width}px;`;
      } else {
        backContainer = `height: ${rect.height}px;`;
      }
    }

    this.setDataSmart({
      ...data,
      backContainer,
      hasBack,
      hasHome,
      hasBackground
    })
  }

  public back() {
    if (this.data.backToPage) {
      //@ts-ignore
      let page = this.app.$url[this.data.backToPage]      
      page && page.reload()
    } else {
      if (this.data.interceptBack) {
        wxp.showModal({
          title: '',
          content: this.data.interceptText
        }).then(res => {
          if (res.confirm) {
            this.app.$back();
          }
        })
      } else {
        this.app.$back();
      }
    }
  }

  public home() {
    this.app.$home.reload();
  }

  private getPagesRouts() {
    let pages = getCurrentPages();
    let routs: string[] = [];
    pages.forEach(item => {
      routs.push(item.route)
    })

    return routs;
  }
}
