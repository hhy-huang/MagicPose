/*****************************************************************************
文件名: wxc-uploader
作者: wowbox
日期: 2020-12-05
描述: 
******************************************************************************/
import { comify, BaseComponent, compute, ob, LoggerFactory, isBoolean, isPromise, isArray, deepClone } from '../../../base/index';
import { service, ServiceCore } from '../../../services';
import { StoreCenter } from '../../../store/index';
import util from '../../../utils/util';
import { chooseImageProps, chooseVideoProps } from './shared';
import { isImageFile, isVideoFile, File, chooseFile } from './utils';

const Logger = LoggerFactory.getLogger("WxcUploaderComponent");

@comify()
export class WxcUploaderComponent extends BaseComponent<StoreCenter, ServiceCore> {

  // 组件属性列表
  properties = {
    /** 是否禁用文件上传 */
    disabled: Boolean,
    /** 是否开启图片多选，部分安卓机型不支持 */
    multiple: Boolean,
    /** 上传区域文字提示 */
    uploadText: String,
    /** 是否开启文件读取前事件 */
    useBeforeRead: Boolean,
    /**  */
    beforeRead: null,
    /** 预览图和上传区域的尺寸，默认单位为px 缺省80px */
    previewSize: {
      type: null,
      value: 80,
    },
    /** 标识符，可以在回调函数的第二项参数中获取 */
    name: {
      type: String,
      value: '',
    },
    /** 
     * 接受的文件类型, 可选值为all media image file video 缺省image 
     * 
     * @enum [{"value": "all"}, {"value": "image", "desc": "[缺省]"}, {"value": "media"}, {"value": "file"}, {"value": "video"}]
     */
    accept: {
      type: String,
      value: 'image',
    },
    /** 文件列表 {url, status: [upload]} status == upload 表示该url需要上传到服务器 */
    fileList: {
      type: Array,
      value: [],
    },
    /** 文件大小限制，单位为byte */
    maxSize: {
      type: Number,
      value: Number.MAX_VALUE,
    },
    /** 文件上传数量限制 缺省50 */
    maxCount: {
      type: Number,
      value: 50,
    },
    /** 是否展示删除按钮 缺省true */
    deletable: {
      type: Boolean,
      value: true,
    },
    /** 是否展示文件上传按钮 缺省true */
    showUpload: {
      type: Boolean,
      value: true,
    },
    /** 是否在上传完成后展示预览图 缺省 true */
    previewImage: {
      type: Boolean,
      value: true,
    },
    /** 是否在点击预览图后展示全屏图片预览 缺省 true */
    previewFullImage: {
      type: Boolean,
      value: true,
    },
    /** 图片显示样式 */
    imageFit: {
      type: String,
      value: 'scaleToFill',
    },
    /** 上传区域图标，可选值见 Icon 组件 */
    uploadIcon: {
      type: String,
      value: 'photograph',
    },
    ...chooseImageProps,
    ...chooseVideoProps
  }

  // 组件的初始数据
  data: IAnyObject = {
    lists: [],
    isInCount: true,
  }

  @ob('fileList')
  public onFilelistChange(value: any, old: any) {
    const { fileList = [], maxCount } = this.data;
    const lists = fileList.map((item: File) => ({
      ...item,
      isImage: isImageFile(item),
      isVideo: isVideoFile(item),
      // @ts-ignore
      deletable: isBoolean(item.deletable) ? item.deletable : true,
    }));

    this.setDataSmart({ lists, isInCount: lists.length < maxCount });

    // 传入的status === ’upload‘ 时上传图片
    this.uploadFile();
  }

  private getDetail(index?: number) {
    return {
      name: this.data.name,
      index: index ?? this.data.fileList.length,
    };
  }

  public startUpload() {
    const { maxCount, multiple, lists, disabled } = this.data;

    if (disabled) return;

    // @ts-ignore
    chooseFile({
      ...this.data,
      maxCount: maxCount - lists.length,
    })
      .then((res) => {
        // @ts-ignore
        this.onBeforeRead(multiple ? res : res[0]);
      })
      .catch((error) => {
        this.triggerEvent('error', error);
      });
  }

  private onBeforeRead(file: File) {
    const { beforeRead, useBeforeRead } = this.data;
    let res: boolean | Promise<void> = true;

    if (typeof beforeRead === 'function') {
      res = beforeRead(file, this.getDetail());
    }

    if (useBeforeRead) {
      res = new Promise<void>((resolve, reject) => {
        this.triggerEvent('before-read', {
          file,
          ...this.getDetail(),
          callback: (ok: boolean) => {
            ok ? resolve() : reject(new Error());
          },
        });
      });
    }

    if (!res) {
      return;
    }

    if (isPromise(res)) {
      res.then((data: any) => this.onAfterRead(data || file));
    } else {
      this.onAfterRead(file);
    }
  }

  private onAfterRead(file: File) {
    const { maxSize } = this.data;
    const oversize = Array.isArray(file)
      ? file.some((item) => item.size > maxSize)
      // @ts-ignore
      : file.size > maxSize;

    if (oversize) {
      this.triggerEvent('oversize', { file, ...this.getDetail() });
      return;
    }

    let files = isArray(file) ? file : [file];

    let start: number = this.data.fileList.length;
    let data: IAnyObject = {};
    files.forEach((item, index) => {
      data[`fileList[${start + index}]`] = {
        ...item,
        status: 'upload',
        message: '上传中'
      }
    })

    this.setDataSmart(data, () => {
      this.uploadFile();
    })
  }

  public deleteItem(event: Weapp.Event) {
    const { index } = event.currentTarget.dataset;

    let { fileList } = this.data;
    fileList.splice(index, 1);
    // 这里不使用setDataSmart
    this.setData({
      fileList
    }, () => {
      this.emitChange();
    })
  }

  public onPreviewImage(event: Weapp.Event) {
    if (!this.data.previewFullImage) return;

    const { index } = event.currentTarget.dataset;
    const { lists } = this.data as { lists: File[] };
    const item = lists[index];

    wx.previewImage({
      urls: lists.filter((item) => isImageFile(item)).map((item) => item.url),
      current: item.url,
      fail() {
        wx.showToast({ title: '预览图片失败', icon: 'none' });
      },
    });
  }

  public onPreviewVideo(event: Weapp.Event) {
    if (!this.data.previewFullImage) return;
    const { index } = event.currentTarget.dataset;
    const { lists } = this.data as { lists: File[] };

    wx.previewMedia({
      sources: lists
        .filter((item) => isVideoFile(item))
        .map((item) => ({
          ...item,
          type: 'video',
        })),
      current: index,
      fail() {
        wx.showToast({ title: '预览视频失败', icon: 'none' });
      },
    });
  }

  public onClickPreview(event: Weapp.Event) {
    const { index } = event.currentTarget.dataset;
    const item: File = this.data.lists[index];

    this.triggerEvent('click-preview', {
      ...item,
      ...this.getDetail(index),
    });
  }


  private emitChange() {
    this.triggerEvent('change', {
      name: this.data.name,
      fileList: this.data.fileList
    });
  }

  private uploadFile() {
    let count = 0; 
    let total = 0;

    this.data.fileList.forEach((item: IAnyObject, index: number) => {
      if (item.status !== 'upload') return;

      item.status = 'uploading'
      
      total++;

      service.http.uploadFile(item.url).then(resp => {
        let f = deepClone(this.data.fileList[index]);
        f.url = resp;
        f.thumb = util.getThumb(resp, ThumbType['120x120']);
        f.status = 'done';
        f.message = '';
        this.setDataSmart({
          [`fileList[${index}]`]: f
        });
      }).catch(error => {
        Logger.error('uploadFile index: {0} error: {1}', index, error);
        let f = deepClone(this.data.fileList[index]);
        f.status = 'failed';
        f.message = '上传失败';
        this.setDataSmart({
          [`fileList[${index}]`]: f
        });
      }).finally(() => {
        wx.nextTick(() => {
          if (++count === total) {
            this.emitChange();
          }
        })
      });
    });
  }
}
