/********************************************
 * 封装上传请求
 * 功能：
 * - 请求promise化
 ********************************************/

import { wxp, isFunction } from '../../base/index';
import { config } from '../../config'

export function uploadFile(path: string, token: string): Promise<string> {
  let url = '';
  if (isFunction(config.uploadUrl)) {
    url = config.uploadUrl(path);
  } else {
    url = config.uploadUrl;
  }

  return new Promise((resolve, reject) => {
    wxp.uploadFile({
      url,
      name: 'file',
      filePath: path,
      header: {
        token,
        'content-type': 'multipart/form-data'
      },
      formData: {
        _key: 'key_10'
      }
    }).then(resp => {
      let message = '上传文件失败';
      if (resp.statusCode == 200) {
        let data = JSON.parse(resp.data);
        if (data.status === 0 && data.data && data.data.url) {
          return resolve(data.data.url);
        } else {
          message = data.message;
        }
      }

      reject(new Error(message));
    }).catch(error => {
      reject(error)
    })
  })
}