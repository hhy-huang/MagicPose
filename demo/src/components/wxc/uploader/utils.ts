// @ts-nocheck
import { isImageUrl, isPlainObject, isVideoUrl, isDef } from '../../../base';

export interface File {
  url: string; // 上传临时地址
  size?: number; // 上传大小
  name?: string;
  type: string; // 上传类型
  duration?: number; // 上传时间
  time?: number; // 消息文件时间
  isImage?: boolean;
  isVideo?: boolean;
}

export function pickExclude(obj: unknown, keys: string[]) {
  if (!isPlainObject(obj)) {
    return {};
  }

  return Object.keys(obj).reduce((prev, key) => {
    if (!keys.includes(key)) {
      // @ts-ignore
      prev[key] = obj[key];
    }

    return prev;
  }, {});
}

export function isImageFile(item: File): boolean {
  if (isDef(item.isImage)) {
    return !!item.isImage;
  }

  if (item.type) {
    return item.type === 'image';
  }

  if (item.url) {
    return isImageUrl(item.url);
  }

  return false;
}

export function isVideoFile(item: File): boolean {
  if (isDef(item.isVideo)) {
    return !!item.isVideo;
  }

  if (item.type) {
    return item.type === 'video';
  }

  if (item.url) {
    return isVideoUrl(item.url);
  }

  return false;
}

function formatImage(
  res: WechatMiniprogram.ChooseImageSuccessCallbackResult
): File[] {
  return res.tempFiles.map((item) => ({
    ...pickExclude(item, ['path']),
    type: 'image',
    url: item.path,
    thumb: item.path,
  }));
}

function formatVideo(
  res: WechatMiniprogram.ChooseVideoSuccessCallbackResult & Record<string, any>
) {
  return [
    {
      ...pickExclude(res, ['tempFilePath', 'thumbTempFilePath', 'errMsg']),
      type: 'video',
      url: res.tempFilePath,
      thumb: res.thumbTempFilePath,
    },
  ];
}

function formatMedia(res: WechatMiniprogram.ChooseMediaSuccessCallbackResult) {
  return res.tempFiles.map((item) => ({
    ...pickExclude(item, ['fileType', 'thumbTempFilePath', 'tempFilePath']),
    type: res.type,
    url: item.tempFilePath,
    thumb: res.type === 'video' ? item.thumbTempFilePath : item.tempFilePath,
  }));
}

function formatFile(
  res: WechatMiniprogram.ChooseMessageFileSuccessCallbackResult
) {
  return res.tempFiles.map((item) => ({
    ...pickExclude(item, ['path']),
    url: item.path,
  })) as File[];
}

export function chooseFile({
  accept,
  multiple,
  capture,
  compressed,
  maxDuration,
  sizeType,
  camera,
  maxCount,
}) {
  return new Promise<File | File[]>((resolve, reject) => {
    switch (accept) {
      case 'image':
        wx.chooseImage({
          count: multiple ? Math.min(maxCount, 9) : 1,
          sourceType: capture,
          sizeType,
          success: (res) => resolve(formatImage(res)),
          fail: reject,
        });
        break;
      case 'media':
        wx.chooseMedia({
          count: multiple ? Math.min(maxCount, 9) : 1,
          sourceType: capture,
          maxDuration,
          sizeType,
          camera,
          success: (res) => resolve(formatMedia(res)),
          fail: reject,
        });
        break;
      case 'video':
        wx.chooseVideo({
          sourceType: capture,
          compressed,
          maxDuration,
          camera,
          success: (res) => resolve(formatVideo(res)),
          fail: reject,
        });
        break;
      default:
        wx.chooseMessageFile({
          count: multiple ? maxCount : 1,
          type: accept,
          success: (res) => resolve(formatFile(res)),
          fail: reject,
        });
        break;
    }
  });
}
