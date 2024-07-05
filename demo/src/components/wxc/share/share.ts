/*****************************************************************************
文件名: wxc-share
作者: wowbox
日期: 2020-12-16
描述: 分享弹窗-绘制海报
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, wxp } from '../../../base/index';
import { EVENT } from '../../../common/const/eventList';
import { ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';
import util from '../../../utils/util';

const Logger = LoggerFactory.getLogger("WxcShareComponent");

@comify()
export class WxcShareComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 是否显示 */
    show: Boolean,
    /** 分享信息 */
    shareInfo: Object,
    /** 活动id */
    activityId: Number
  }

  // 组件的初始数据
  data: AnyObject = {
    isSaveShown: false,
    img: ''
  }

  @ob('show')
  public onShowChange(value: any, old: any) {
    if (value) {
      this.setDataSmart({
        template: {}
      })
    }
  }

  public onShareToFriends() {
    this.setDataSmart({
      show: false,
      isSaveShown: false
    })
  }

  public onSaveSharePicture() {
    this.setDataSmart({
      show: false,
      isSaveShown: false
    })
    this.startPaint();
  }

  private startPaint() {
    util.showLoading('绘制中', true);
    this.setDataSmart({
      // @ts-ignore
      template: this.data.shareInfo
    })
  }

  public onPreProcess(e: Weapp.Event) {

  }

  public onImgOK(e: Weapp.Event) {
    wx.hideLoading();
    this.setDataSmart({
      img: e.detail.path,
      isSaveShown: true
    });
  }

  public noop() {

  }

  public handleClickMask() {
    this.setDataSmart({
      isSaveShown: false
    })
  }

  public async onSaveToAlbum() {
    if (!await this.checkPermission()) {
      return;
    }

    util.showLoading('正在保存海报图片', true);
    
    wxp.saveImageToPhotosAlbum({
      filePath: this.data.img
    }).then((res) => {
      util.showToast('已保存到相册');
      // 分享到朋友圈
      if (this.data.activityId) {
        this.fireEvent(EVENT.SHARE_TO_MOMENTS, this.data.activityId)
      }
    }).catch(() => {
      util.showToast('保存失败');
    }).finally(() => {
      wx.hideLoading();
      this.handleClickMask();
    })
  }

  private async checkPermission() {
    let res = await wxp.getSetting();
    let hasPermission = res.authSetting['scope.writePhotosAlbum'];
    if (typeof hasPermission === 'boolean' && !hasPermission) {
      wxp.showModal({
        title: "授权提示",
        content: "生成分享海报需要开启相册访问权限",
        cancelText: "去开启"
      }).then(res => {
        if (res.confirm) {
          wx.openSetting();
        }
      })
      return false;
    }

    return true;
  }
}